import { MyContext } from "../context";
import { prepareObjectForLogs } from "../logger";
import {randomHex, validateURL} from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export const DEFAULT_DMPTOOL_MEMBER_ROLE_URL = 'https://dmptool.org/contributor_roles/';
export class MemberRole extends MySqlModel {
  public displayOrder: number;
  public uri: string;
  public label: string;
  public description?: string;
  public isDefault: boolean

  public static tableName = 'memberRoles';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.id = options.id;
    this.displayOrder = options.displayOrder;
    this.uri = options.uri;
    this.label = options.label;
    this.description = options.description;
    this.isDefault = options.isDefault ?? false;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!validateURL(this.uri)) this.addError('uri', 'URL is not valid');
    if (!this.displayOrder || this.displayOrder < 0) this.addError('displayOrder', 'Display order must be a positive number');
    if (!this.label) this.addError('label', 'Label can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Return the default role
  static async defaultRole(context: MyContext, reference = 'MemberRole.defaultRole'): Promise<MemberRole> {
    const sql = `SELECT * FROM ${MemberRole.tableName} WHERE isDefault = 1`;
    const results = await MemberRole.query(context, sql, [], reference);
    return Array.isArray(results) ? new MemberRole(results[0]) : null;
  }

  // Add an association for a MemberRole with a ProjectMember
  async addToProjectMember(context: MyContext, projectMemberId: number): Promise<boolean> {
    const reference = 'MemberRole.addToProjectMember';
    let sql = `INSERT INTO projectMemberRoles (memberRoleId, projectMemberId, createdById, `;
    sql += 'modifiedById) VALUES (?, ?, ?, ?)';
    const userId = context.token?.id?.toString();
    const vals = [this.id?.toString(), projectMemberId?.toString(), userId, userId];
    const results = await MemberRole.query(context, sql, vals, reference);

    if (!results) {
      const payload = { researchDomainId: this.id, projectMemberId };
      const msg = 'Unable to add the member role to the project member';
      context.logger.error(prepareObjectForLogs(payload), `${reference} - ${msg}`);
      return false;
    }
    return true;
  }

  // Add an association for a MemberRole with a PlanMember
  async addToPlanMember(context: MyContext, planMemberId: number): Promise<boolean> {
    const reference = 'MemberRole.addToPlanMember';
    let sql = `INSERT INTO planMemberRoles (memberRoleId, planMemberId, createdById, `;
    sql += 'modifiedById) VALUES (?, ?, ?, ?)';
    const userId = context.token?.id?.toString();
    const vals = [this.id?.toString(), planMemberId?.toString(), userId, userId];
    const results = await MemberRole.query(context, sql, vals, reference);

    if (!results) {
      const payload = { researchDomainId: this.id, planMemberId };
      const msg = 'Unable to add the member role to the plan member';
      context.logger.error(prepareObjectForLogs(payload), `${reference} - ${msg}`);
      return false;
    }
    return true;
  }

  // Remove an association of a MemberRole from a ProjectMember
  async removeFromProjectMember(context: MyContext, projectMemberId: number): Promise<boolean> {
    const reference = 'MemberRole.removeFromProjectMember';
    const sql = 'DELETE FROM projectMemberRoles WHERE memberRoleId = ? AND projectMemberId = ?';
    const vals = [this.id?.toString(), projectMemberId?.toString()];
    const results = await MemberRole.query(context, sql, vals, reference);

    if (!results) {
      const payload = { memberRoleId: this.id, projectMemberId };
      const msg = 'Unable to remove the member role from the project member';
      context.logger.error(prepareObjectForLogs(payload), `${reference} - ${msg}`);
      return false;
    }
    return true;
  }

  // Remove an association of a MemberRole from a PlanMember
  async removeFromPlanMember(context: MyContext, planMemberId: number): Promise<boolean> {
    const reference = 'MemberRole.removeFromPlanMember';
    const sql = `DELETE FROM planMemberRoles WHERE memberRoleId = ? AND planMemberId = ?`;
    const vals = [this.id?.toString(), planMemberId?.toString()];
    const results = await MemberRole.query(context, sql, vals, reference);

    if (!results) {
      const payload = { memberRoleId: this.id, planMemberId };
      const msg = 'Unable to remove the member role from the plan member';
      context.logger.error(prepareObjectForLogs(payload), `${reference} - ${msg}`);
      return false;
    }
    return true;
  }

  //Create a new MemberRole
  async create(context: MyContext): Promise<MemberRole> {
    const reference = 'MemberRole.create';

    // If no URI is present, then use the DMPTool's default URI
    if (!this.uri) {
      this.uri = `${DEFAULT_DMPTOOL_MEMBER_ROLE_URL}${randomHex(6)}`;
    }

    // First make sure the record is valid
    if (await this.isValid()) {
      const current = await MemberRole.findByURL(reference, context, this.uri);

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'MemberRole already exists');
      } else {
        // Save the record and then fetch it
        const newId = await MemberRole.insert(
          context,
          MemberRole.tableName,
          this,
          reference
        );
        return await MemberRole.findById(reference, context, newId);
      }
    }
    // Otherwise return as-is with all the errors
    return new MemberRole(this);
  }

  //Update an existing MemberRole
  async update(context: MyContext, noTouch = false): Promise<MemberRole> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        await MemberRole.update(
          context,
          MemberRole.tableName,
          this,
          'MemberRole.update',
          [],
          noTouch
        );
        return await MemberRole.findById('MemberRole.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'MemberRole has never been saved');
    }
    return new MemberRole(this);
  }

  //Delete the MemberRole
  async delete(context: MyContext): Promise<MemberRole> {
    if (this.id) {
      const deleted = await MemberRole.findById('MemberRole.delete', context, this.id);

      const successfullyDeleted = await MemberRole.delete(
        context,
        MemberRole.tableName,
        this.id,
        'MemberRole.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Return all the member roles
  static async all(reference: string, context: MyContext): Promise<MemberRole[]> {
    const sql = `SELECT * FROM ${MemberRole.tableName} ORDER BY label`;
    const results = await MemberRole.query(context, sql, [], reference);
    return Array.isArray(results) ? results.map((entry) => new MemberRole(entry)) : [];
  }

  // Fetch a member role by its id
  static async findById(reference: string, context: MyContext, memberRoleById: number): Promise<MemberRole> {
    const sql = `SELECT * FROM ${MemberRole.tableName} WHERE id = ?`;
    const results = await MemberRole.query(context, sql, [memberRoleById?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new MemberRole(results[0]) : null;
  }

  // Fetch a member role by its URL
  static async findByURL(reference: string, context: MyContext, memberRoleByURL: string): Promise<MemberRole> {
    const sql = `SELECT * FROM ${MemberRole.tableName} WHERE uri = ?`;
    const results = await MemberRole.query(context, sql, [memberRoleByURL], reference);
    return Array.isArray(results) && results.length > 0 ? new MemberRole(results[0]) : null;
  }

  // Fetch all the MemberRoles associated with a ProjectMember
  static async findByProjectMemberId(reference: string, context: MyContext, projectMemberId: number): Promise<MemberRole[]> {
    const sql = `SELECT mr.* FROM ${MemberRole.tableName} mr INNER JOIN projectMemberRoles pmr ON pmr.memberRoleId = mr.id`;
    const whereClause = 'WHERE pmr.projectMemberId = ?';
    const vals = [projectMemberId?.toString()];
    const results = await MemberRole.query(context, `${sql} ${whereClause}`, vals, reference);
    return Array.isArray(results) ? results.map((entry) => new MemberRole(entry)) : [];
  }

  // Fetch all the MemberRoles associated with a ProjectMember
  static async findByPlanMemberId(reference: string, context: MyContext, planMemberId: number): Promise<MemberRole[]> {
    const sql = `SELECT mr.* FROM ${MemberRole.tableName} mr INNER JOIN planMemberRoles pmr ON pmr.memberRoleId = mr.id`;
    const whereClause = 'WHERE pmr.planMemberId = ?';
    const vals = [planMemberId?.toString()];
    const results = await MemberRole.query(context, `${sql} ${whereClause}`, vals, reference);
    return Array.isArray(results) ? results.map((entry) => new MemberRole(entry)) : [];
  }
};

import { MyContext } from "../context";
import { formatLogMessage } from "../logger";
import { validateURL } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export class ContributorRole extends MySqlModel {
  public displayOrder: number;
  public uri: string;
  public label: string;
  public description?: string;

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.id = options.id;
    this.displayOrder = options.displayOrder;
    this.uri = options.uri;
    this.label = options.label;
    this.description = options.description;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!validateURL(this.uri)) this.addError('uri', 'URL is not valid');
    if (!this.displayOrder || this.displayOrder < 0) this.addError('displayOrder', 'Display order must be a positive number');
    if (!this.label) this.addError('label', 'Label can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Add an association for a ContributorRole with a ProjectContributor
  async addToProjectContributor(context: MyContext, projectContributorId: number): Promise<boolean> {
    const reference = 'ContributorRole.addToProjectContributor';
    let sql = 'INSERT INTO projectContributorRoles (contributorRoleId, projectContributorId, createdById, ';
    sql += 'modifiedById) VALUES (?, ?, ?, ?)';
    const userId = context.token?.id?.toString();
    const vals = [this.id?.toString(), projectContributorId?.toString(), userId, userId];
    const results = await ContributorRole.query(context, sql, vals, reference);

    if (!results) {
      const payload = { researchDomainId: this.id, projectContributorId };
      const msg = 'Unable to add the contributor role to the project contributor';
      formatLogMessage(context).error(payload, `${reference} - ${msg}`);
      return false;
    }
    return true;
  }

  // Remove an association of a ContributorRole from a ProjectContributor
  async removeFromProjectContributor(context: MyContext, projectContributorId: number): Promise<boolean> {
    const reference = 'ContributorRole.removeFromProjectContributor';
    const sql = 'DELETE FROM projectContributorRoles WHERE contributorRoleId = ? AND projectContributorId = ?';
    const vals = [this.id?.toString(), projectContributorId?.toString()];
    const results = await ContributorRole.query(context, sql, vals, reference);

    if (!results) {
      const payload = { contributorRoleId: this.id, projectContributorId };
      const msg = 'Unable to remove the contributor role from the project contributor';
      formatLogMessage(context).error(payload, `${reference} - ${msg}`);
      return false;
    }
    return true;
  }

  // Return all of the contributor roles
  static async all(reference: string, context: MyContext): Promise<ContributorRole[]> {
    const sql = 'SELECT * FROM contributorRoles ORDER BY label';
    const results = await ContributorRole.query(context, sql, [], reference);
    return Array.isArray(results) ? results : [];
  }

  // Fetch a contributor role by it's id
  static async findById(
    reference: string,
    context: MyContext,
    contributorRoleById: number
  ): Promise<ContributorRole> {
    const sql = 'SELECT * FROM contributorRoles WHERE id = ?';
    const results = await ContributorRole.query(context, sql, [contributorRoleById?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new ContributorRole(results[0]) : null;
  }

  // Fetch a contributor role by it's URL
  static async findByURL(
    reference: string,
    context: MyContext,
    contributorRoleByURL: string
  ): Promise<ContributorRole> {
    const sql = 'SELECT * FROM contributorRoles WHERE url = ?';
    const results = await ContributorRole.query(context, sql, [contributorRoleByURL], reference);
    return Array.isArray(results) && results.length > 0 ? new ContributorRole(results[0]) : null;
  }

  // Fetch all of the ContributorRoles associated with a ProjectContributor
  static async findByProjectContributorId(
    reference: string,
    context: MyContext,
    projectContributorId: number
  ): Promise<ContributorRole[]> {
    const sql = 'SELECT cr.* FROM projectContributorRoles pcr INNER JOIN contributorRoles cr ON pcr.contributorRoleId = cr.id';
    const whereClause = 'WHERE pcr.projectContributorId = ?';
    const vals = [projectContributorId?.toString()];
    const results = await ContributorRole.query(context, `${sql} ${whereClause}`, vals, reference);
    return Array.isArray(results) ? results : [];
  }
};

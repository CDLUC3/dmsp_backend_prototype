import { MyContext } from "../context";
import { validateOrcid } from "../resolvers/scalars/orcid";
import { capitalizeFirstLetter, stripIdentifierBaseURL, validateEmail } from "../utils/helpers";
import { ContributorRole } from "./ContributorRole";
import { MySqlModel } from "./MySqlModel";

export class ProjectContributor extends MySqlModel {
  public projectId: number;
  public affiliationId?: string;
  public givenName?: string;
  public surName?: string;
  public orcid?: string;
  public email?: string;
  public contributorRoles: ContributorRole[];

  private tableName = 'projectContributors';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.id = options.id;
    this.projectId = options.projectId;
    this.affiliationId = options.affiliationId;
    this.givenName = options.givenName;
    this.surName = options.surName;
    this.orcid = options.orcid;
    this.email = options.email;
    this.contributorRoles = options.contributorRoles;
  }

  // Ensure data integrity
  async prepForSave(context: MyContext, reference: string): Promise<void> {
    this.email = this.email?.trim()?.replace('%40', '@');
    this.givenName = capitalizeFirstLetter(this.givenName);
    this.surName = capitalizeFirstLetter(this.surName);
    this.orcid = stripIdentifierBaseURL(this.orcid);

    // Ensure that contributorRoles is always an array
    if (!Array.isArray(this.contributorRoles)) {
      this.contributorRoles = [await ContributorRole.defaultRole(context, reference)]
    }
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.projectId) this.addError('projectId', 'Project can\'t be blank');

    if (!this.surName && !this.email && !this.orcid) {
      this.addError('general', 'You must specify at least one name, ORCID or email');
    }
    if (this.orcid && this.orcid.trim().length > 0){
      try {
        validateOrcid(this.orcid);
      } catch(err) {
        this.addError('orcid', err.message);
      }
    }
    if (this.email && this.email.trim().length > 0 && !validateEmail(this.email)) {
      this.addError('email', 'Invalid email format');
    }

    return Object.keys(this.errors).length === 0;
  }

  //Create a new ProjectContributor
  async create(context: MyContext, projectId: number ): Promise<ProjectContributor> {
    const reference = 'ProjectContributor.create';

    // First make sure the record is valid
    if (await this.isValid()) {
      let current: ProjectContributor;

      // Then try to find an existing entry for each of the identifiers
      if (this.orcid) {
        current = await ProjectContributor.findByProjectAndORCID(reference, context, projectId, this.orcid);
      }
      if (!current) {
        current = await ProjectContributor.findByProjectAndEmail(reference, context, projectId, this.email);
      }
      if (!current) {
        current = await ProjectContributor.findByProjectAndName(
          reference,
          context,
          projectId,
          this.givenName,
          this.surName
        );
      }

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'Project already has an entry for this contributor');
      } else {
        this.prepForSave(context, reference);

        // Save the record and then fetch it
        const newId = await ProjectContributor.insert(
          context,
          this.tableName,
          this,
          reference,
          ['contributorRoles']
        );
        const response = await ProjectContributor.findById(reference, context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return new ProjectContributor(this);
  }

  //Update an existing Contributor
  async update(context: MyContext, noTouch = false): Promise<ProjectContributor> {
    const reference = 'ProjectContributor.update';
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        this.prepForSave(context, reference);

        await ProjectContributor.update(
          context,
          this.tableName,
          this,
          reference,
          ['contributorRoles'],
          noTouch
        );
        return await ProjectContributor.findById(reference, context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', `${reference} has never been saved`);
    }
    return new ProjectContributor(this);
  }

  //Delete ProjectContributor
  async delete(context: MyContext): Promise<ProjectContributor> {
    if (this.id) {
      const deleted = await ProjectContributor.findById('ProjectContributor.delete', context, this.id);

      const successfullyDeleted = await ProjectContributor.delete(
        context,
        this.tableName,
        this.id,
        'ProjectContributor.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Return all of the contributors for the Project
  static async findByProjectId(reference: string, context: MyContext, projectId: number): Promise<ProjectContributor[]> {
    const sql = `SELECT * FROM projectContributors WHERE projectId = ? ORDER BY surName, givenName`;
    const results = await ProjectContributor.query(context, sql, [projectId?.toString()], reference);
    return Array.isArray(results) ? results.map((item) => new ProjectContributor(item)) : [];
  }

  // Return all of the contributors for the Project
  static async findByAffiliation(reference: string, context: MyContext, affiliationId: string): Promise<ProjectContributor[]> {
    const sql = `SELECT * FROM projectContributors WHERE affiliationId = ? ORDER BY surName, givenName`;
    const results = await ProjectContributor.query(context, sql, [affiliationId], reference);
    return Array.isArray(results) ? results.map((item) => new ProjectContributor(item)) : [];
  }

  // Fetch a contributor by it's id
  static async findById(reference: string, context: MyContext, projectContributorId: number): Promise<ProjectContributor> {
    const sql = `SELECT * FROM projectContributors WHERE id = ?`;
    const results = await ProjectContributor.query(context, sql, [projectContributorId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectContributor(results[0]) : null;
  }

  // Fetch a contributor by it's project and email
  static async findByProjectAndEmail(
    reference: string,
    context: MyContext,
    projectId: number,
    email: string
  ): Promise<ProjectContributor> {
    const sql = `SELECT * FROM projectContributors WHERE projectId = ? AND email = ?`;
    const results = await ProjectContributor.query(context, sql, [projectId?.toString(), email], reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectContributor(results[0]) : null;
  }

  // Fetch a contributor by it's Project and ORCID
  static async findByProjectAndORCID(
    reference: string,
    context: MyContext,
    projectId: number,
    orcid: string
  ): Promise<ProjectContributor> {
    const sql = `SELECT * FROM projectContributors WHERE projectId = ? AND orcid = ?`;
    const results = await ProjectContributor.query(context, sql, [projectId?.toString(), orcid], reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectContributor(results[0]) : null;
  }

  // Fetch a contributor by it's project and name
  static async findByProjectAndName(
    reference: string,
    context: MyContext,
    projectId: number,
    givenName: string,
    surName: string
  ): Promise<ProjectContributor> {
    const sql = `SELECT * FROM projectContributors WHERE projectId = ? AND LOWER(givenName) = ? AND LOWER(surName) = ?`;
    const vals = [projectId?.toString(), givenName?.trim()?.toLowerCase(), surName?.trim()?.toLowerCase()];
    const results = await ProjectContributor.query(context, sql, vals, reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectContributor(results[0]) : null;
  }

  // Fetch a contributor by it's project and name or ORCID or email
  static async findByProjectAndNameOrORCIDOrEmail(
    reference: string,
    context: MyContext,
    projectId: number,
    givenName: string,
    surName: string,
    orcid: string,
    email: string
  ): Promise<ProjectContributor> {
    let sql = 'SELECT * FROM projectContributors';
    sql += ' WHERE projectId = ? AND (LOWER(givenName) = ? AND LOWER(surName) = ?) OR (orcid = ?) OR (email = ?)';
    sql += ' ORDER BY orcid DESC, email DESC, surName, givenName';
    const vals = [projectId?.toString(), givenName?.trim()?.toLowerCase(), surName?.trim()?.toLowerCase(), orcid, email];
    const results = await ProjectContributor.query(context, sql, vals, reference);
    // We've sorted by ORCID and the email descending so grab the first match
    return Array.isArray(results) && results.length > 0 ? new ProjectContributor(results[0]) : null;
  }
};

// Represents a contributor to a DMP
export class PlanContributor extends MySqlModel {
  public planId: number;
  public projectContributorId: number;
  public isPrimaryContact: boolean;
  public contributorRoleIds: number[];

  private static tableName = 'planContributors';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.planId = options.planId;
    this.projectContributorId = options.projectContributorId;
    this.isPrimaryContact = options.isPrimaryContact ?? false;
    this.contributorRoleIds = options.contributorRoleIds ?? [];
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.planId) this.addError('planId', 'Plan can\'t be blank');
    if (!this.projectContributorId) this.addError('projectContributorId', 'Project contributor can\'t be blank');

    if (!Array.isArray(this.contributorRoleIds) || this.contributorRoleIds.length === 0) {
      this.addError('contributorRoleIds', 'You must specify at least one role');
    }

    return Object.keys(this.errors).length === 0;
  }

  //Create a new PlanContributor
  async create(context: MyContext): Promise<PlanContributor> {
    const reference = 'PlanContributor.create';

    // First make sure the record is valid
    if (await this.isValid()) {
      const current = await PlanContributor.findByPlanAndProjectContributor(
        reference,
        context,
        this.planId,
        this.projectContributorId
      );

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'Plan already has an entry for this contributor');
      } else {
        // Save the record and then fetch it
        const newId = await PlanContributor.insert(
          context,
          PlanContributor.tableName,
          this,
          reference,
          ['contributorRoleIds']
        );
        const response = await PlanContributor.findById(reference, context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return new PlanContributor(this);
  }

  //Update an existing Contributor
  async update(context: MyContext, noTouch = false): Promise<PlanContributor> {
    if (await this.isValid()) {
      if (this.id) {
        await PlanContributor.update(
          context,
          PlanContributor.tableName,
          this,
          'PlanContributor.update',
          ['contributorRoleIds'],
          noTouch
        );
        return await PlanContributor.findById('PlanContributor.update', context, this.id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'PlanContributor has never been saved');
    }
    return new PlanContributor(this);
  }

  //Delete PlanContributor
  async delete(context: MyContext): Promise<PlanContributor> {
    if (this.id) {
      const deleted = await PlanContributor.findById('PlanContributor.delete', context, this.id);

      const successfullyDeleted = await PlanContributor.delete(
        context,
        PlanContributor.tableName,
        this.id,
        'PlanContributor.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Find the project contributor by its id
  static async findById(reference: string, context: MyContext, id: number): Promise<PlanContributor> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const results = await PlanContributor.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new PlanContributor(results[0]) : null;
  }

  // Fetch a contributor by the PLan and ProjectContributor
  static async findByPlanAndProjectContributor(
    reference: string,
    context: MyContext,
    planId: number,
    projectContributorId: number
  ): Promise<PlanContributor> {
    const sql = `SELECT * FROM ${this.tableName} WHERE planId = ? AND projectContributorId = ?`;
    const results = await PlanContributor.query(context, sql, [planId?.toString(), projectContributorId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new PlanContributor(results[0]) : null;
  }

  // Fetch a contributor by it's projectContributor id
  static async findByProjectContributorId(
    reference: string,
    context: MyContext,
    planContributorId: number
  ): Promise<PlanContributor> {
    const sql = `SELECT * FROM ${this.tableName} WHERE projectContributorId = ?`;
    const results = await PlanContributor.query(context, sql, [planContributorId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new PlanContributor(results[0]) : null;
  }

  // Fetch all of the contributors for a plan
  static async findByPlanId(reference: string, context: MyContext, planId: number): Promise<PlanContributor[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE planId = ? ORDER BY isPrimaryContact DESC`;
    const results = await PlanContributor.query(context, sql, [planId?.toString()], reference);
    return Array.isArray(results) ? results.map((item) => new PlanContributor(item)) : [];
  }
}

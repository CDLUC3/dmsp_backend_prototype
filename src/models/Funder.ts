import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

export enum ProjectFunderStatus {
  PLANNED = 'PLANNED', // The project has not yet applied for the grant
  GRANTED = 'GRANTED', // The project received the grant funding
  DENIED = 'DENIED', // The project did not receive the grant funding
}

export class ProjectFunder extends MySqlModel {
  public projectId: number;
  public affiliationId: string;
  public status: ProjectFunderStatus;
  public funderProjectNumber?: string;
  public grantId?: string;
  public funderOpportunityNumber?: string;

  private tableName = 'projectFunders';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.id = options.id;
    this.projectId = options.projectId;
    this.affiliationId = options.affiliationId;
    this.status = options.status ?? ProjectFunderStatus.PLANNED;
    this.funderOpportunityNumber = options.funderOpportunityNumber;
    this.funderProjectNumber = options.funderProjectNumber;
    this.grantId = options.grantId;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.projectId) this.addError('projectId', 'Project can\'t be blank');
    if (!this.affiliationId) this.addError('affiliationId', 'Affiliation can\'t be blank');
    if (!this.status) this.addError('status', 'Funding status can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  //Create a new ProjectFunder
  async create(context: MyContext, projectId: number): Promise<ProjectFunder> {
    const reference = 'ProjectFunder.create';

    // First make sure the record is valid
    if (await this.isValid()) {
      const current = await ProjectFunder.findByProjectAndAffiliation(
        reference,
        context,
        projectId,
        this.affiliationId
      );

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'Project already has an entry for this funder');
      } else {
        // Save the record and then fetch it
        const newId = await ProjectFunder.insert(context, this.tableName, this, reference);
        const response = await ProjectFunder.findById(reference, context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return new ProjectFunder(this);
  }

  //Update an existing ProjectFunder
  async update(context: MyContext, noTouch = false): Promise<ProjectFunder> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        await ProjectFunder.update(context, this.tableName, this, 'ProjectFunder.update', [], noTouch);
        return await ProjectFunder.findById('ProjectFunder.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'ProjectFunder has never been saved');
    }
    return new ProjectFunder(this);
  }

  //Delete the ProjectFunder
  async delete(context: MyContext): Promise<ProjectFunder> {
    if (this.id) {
      const deleted = await ProjectFunder.findById('ProjectFunder.delete', context, this.id);

      const successfullyDeleted = await ProjectFunder.delete(
        context,
        this.tableName,
        this.id,
        'ProjectFunder.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Return all of the projectFunders for the Project
  static async findByProjectId(reference: string, context: MyContext, projectId: number): Promise<ProjectFunder[]> {
    const sql = `SELECT * FROM projectFunders WHERE projectId = ? ORDER BY created DESC`;
    const results = await ProjectFunder.query(context, sql, [projectId?.toString()], reference);
    return Array.isArray(results) ? results.map((item) => new ProjectFunder(item)) : [];
  }

  // Return all of the projectFunders for the Affiliation
  static async findByAffiliation(reference: string, context: MyContext, affiliationId: string): Promise<ProjectFunder[]> {
    const sql = `SELECT * FROM projectFunders WHERE affiliationId = ? ORDER BY created DESC`;
    const results = await ProjectFunder.query(context, sql, [affiliationId], reference);
    return Array.isArray(results) ? results.map((item) => new ProjectFunder(item)) : [];
  }

  // Return the ProjectFunder by its project and affiliation
  static async findByProjectAndAffiliation(
    reference: string,
    context: MyContext,
    projectId: number,
    affiliationId: string,
  ): Promise<ProjectFunder> {
    const sql = `SELECT * FROM projectFunders WHERE projectId = ? AND affiliationId = ?`;
    const results = await ProjectFunder.query(context, sql, [projectId?.toString(), affiliationId], reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectFunder(results[0]) : null;
  }

  // Fetch a ProjectFunder by it's id
  static async findById(reference: string, context: MyContext, projectFunderId: number): Promise<ProjectFunder> {
    const sql = `SELECT * FROM projectFunders WHERE id = ?`;
    const results = await ProjectFunder.query(context, sql, [projectFunderId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectFunder(results[0]) : null;
  }
};

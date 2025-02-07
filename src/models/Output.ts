import { MyContext } from "../context";
import { validateDate } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export enum OutputAccessLevel {
  UNRESTRICTED = 'UNRESTRICTED', // Access to the output will be public/open
  CONTROLLED = 'CONTROLLED', // Access requests must be reviewed and then permitted
  OTHER = 'OTHER', // Any other type of access level
}

export class ProjectOutput extends MySqlModel {
  public projectId: number;
  public outputTypeId: number;
  public title: string;
  public description?: string;
  public mayContainSensitiveInformation: boolean;
  public mayContainPII?: boolean;
  public initialAccessLevel: OutputAccessLevel;
  public initialLicenseId?: number;
  public anticipatedReleaseDate?: string;

  private tableName = 'projectOutputs';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.id = options.id;
    this.projectId = options.projectId;
    this.outputTypeId = options.outputTypeId;
    this.title = options.title;
    this.description = options.description;
    this.mayContainSensitiveInformation = options.mayContainSensitiveInformation ?? false;
    this.mayContainPII = options.mayContainPII ?? false;
    this.initialAccessLevel = options.initialAccessLevel ?? OutputAccessLevel.UNRESTRICTED;
    this.initialLicenseId = options.initialLicenseId;
    this.anticipatedReleaseDate = options.anticipatedReleaseDate;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.projectId) this.addError('projectId', 'Project can\'t be blank');
    if (!this.outputTypeId) this.addError('outputTypeId', 'Output type can\'t be blank');
    if (!this.title) this.addError('title', 'Title can\'t be blank');

    if (this.anticipatedReleaseDate) {
      const releaseIsValid = validateDate(this.anticipatedReleaseDate);
      if (!releaseIsValid) this.addError('anticipatedReleaseDate', 'Anticipated release date must be a valid date');
    }

    return Object.keys(this.errors).length === 0;
  }

  // Ensure data integrity
  prepForSave(): void {
    // Remove leading/trailing blank spaces
    this.title = this.title?.trim();
    this.description = this.description?.trim();
  }

  //Create a new ProjectOutput
  async create(context: MyContext, projectId: number): Promise<ProjectOutput> {
    const reference = 'ProjectOutput.create';

    // First make sure the record is valid
    if (await this.isValid()) {
      const current = await ProjectOutput.findByProjectAndTitle(
        reference,
        context,
        projectId,
        this.title
      );

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'Project already has an entry for this output');
      } else {
        // Save the record and then fetch it
        const newId = await ProjectOutput.insert(context, this.tableName, this, reference);
        const response = await ProjectOutput.findById(reference, context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  //Update an existing ProjectOutput
  async update(context: MyContext, noTouch = false): Promise<ProjectOutput> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        await ProjectOutput.update(context, this.tableName, this, 'ProjectOutput.update', [], noTouch);
        return await ProjectOutput.findById('ProjectOutput.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'ProjectOutput has never been saved');
    }
    return this;
  }

  //Delete the ProjectOutput
  async delete(context: MyContext): Promise<ProjectOutput> {
    if (this.id) {
      const deleted = await ProjectOutput.findById('ProjectOutput.delete', context, this.id);

      const successfullyDeleted = await ProjectOutput.delete(
        context,
        this.tableName,
        this.id,
        'ProjectOutput.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Return all of the projectOutputs for the Project
  static async findByProjectId(reference: string, context: MyContext, projectId: number): Promise<ProjectOutput[]> {
    const sql = `SELECT * FROM projectOutputs WHERE projectId = ? ORDER BY created DESC`;
    const results = await ProjectOutput.query(context, sql, [projectId?.toString()], reference);
    return Array.isArray(results) ? results.map((item) => new ProjectOutput(item)) : [];
  }

  // Return the ProjectOutput by its project and affiliation
  static async findByProjectAndTitle(
    reference: string,
    context: MyContext,
    projectId: number,
    title: string,
  ): Promise<ProjectOutput> {
    const sql = `SELECT * FROM projectOutputs WHERE projectId = ? AND LOWER(title) = ?`;
    const vals = [projectId?.toString(), title?.toString()?.trim()];
    const results = await ProjectOutput.query(context, sql, vals, reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectOutput(results[0]) : null;
  }

  // Fetch a ProjectOutput by it's id
  static async findById(reference: string, context: MyContext, projectFunderId: number): Promise<ProjectOutput> {
    const sql = `SELECT * FROM projectOutputs WHERE id = ?`;
    const results = await ProjectOutput.query(context, sql, [projectFunderId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectOutput(results[0]) : null;
  }
};

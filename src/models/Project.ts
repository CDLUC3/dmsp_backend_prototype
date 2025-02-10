import { MyContext } from "../context";
import { validateDate } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export class Project extends MySqlModel {
  public title: string;
  public abstractText?: string;
  public startDate?: string;
  public endDate?: string;
  public researchDomainId?: number;
  public isTestProject: boolean;

  private tableName = 'projects';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.id = options.id;
    this.title = options.title;
    this.abstractText = options.abstractText;
    this.startDate = options.startDate;
    this.endDate = options.endDate;
    this.researchDomainId = options.researchDomainId;
    this.isTestProject = options.isTestProject ?? false;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.title) this.addError('title', 'Title can\'t be blank');

    if (this.startDate) {
      const startIsValid = validateDate(this.startDate);
      if (!startIsValid) this.addError('startDate', 'Start date must be a valid date');
    }
    if (this.endDate) {
      const endIsValid = validateDate(this.endDate);
      if (!endIsValid) {
        this.addError('endDate', 'End date must be a valid date');
      } else {
        // Make sure start date comes before the end date
        if (this.startDate && this.endDate && this.endDate <= this.startDate) {
          this.addError('endDate', 'End date must come after the start date');
        }
      }
    }
    return Object.keys(this.errors).length === 0;
  }

  // Ensure data integrity
  prepForSave(): void {
    // Remove leading/trailing blank spaces
    this.title = this.title?.trim();
    this.abstractText = this.abstractText?.trim();
  }

  //Create a new Project
  async create(context: MyContext): Promise<Project> {
    const reference = 'Project.create';

    // First make sure the record is valid
    if (await this.isValid()) {
      const current = await Project.findByOwnerAndTitle(
        reference,
        context,
        this.title,
        context.token.id
      );

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'Project already exists');
      } else {
        this.prepForSave();

        // Save the record and then fetch it
        const newId = await Project.insert(context, this.tableName, this, reference);
        const response = await Project.findById(reference, context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return new Project(this);
  }

  //Update an existing Project
  async update(context: MyContext, noTouch = false): Promise<Project> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        this.prepForSave();

        await Project.update(context, this.tableName, this, 'Project.update', [], noTouch);
        return await Project.findById('Project.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'Project has never been saved');
    }
    return new Project(this);
  }

  //Delete the Project
  async delete(context: MyContext): Promise<Project> {
    if (this.id) {
      const deleted = await Project.findById('Project.delete', context, this.id);

      const successfullyDeleted = await Project.delete(
        context,
        this.tableName,
        this.id,
        'Project.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Return all of projects for the User
  static async findByUserId(reference: string, context: MyContext, userId: number): Promise<Project[]> {
    const sql = 'SELECT * FROM projects WHERE createdById = ? ORDER BY created DESC';
    const results = await Project.query(context, sql, [userId?.toString()], reference);
    return Array.isArray(results) ? results.map((item) => new Project(item)) : [];
  }

  // Return all of the projects for the Affiliation
  static async findByAffiliation(reference: string, context: MyContext, affiliationId: string): Promise<Project[]> {
    const sql = 'SELECT projects.* FROM projects INNER JOIN users ON projects.createdById = users.id';
    const whereClause = 'WHERE users.affiliationId = ? ORDER BY created DESC';
    const results = await Project.query(context, `${sql} ${whereClause}`, [affiliationId], reference);
    return Array.isArray(results) ? results.map((item) => new Project(item)) : [];
  }

  static async findByOwnerAndTitle(reference: string, context: MyContext, title: string, userId: number): Promise<Project> {
    const sql = 'SELECT * FROM projects WHERE createdById = ? AND LOWER(title) LIKE ?';
    const searchTerm = (title ?? '');
    const vals = [userId?.toString(), `%${searchTerm?.toLowerCase()?.trim()}%`]
    const results = await Project.query(context, sql, vals, reference);
    return Array.isArray(results) && results.length > 0 ? new Project(results[0]) : null;
  }

  // Fetch a Project by it's id
  static async findById(reference: string, context: MyContext, projectFunderId: number): Promise<Project> {
    const sql = 'SELECT * FROM projects WHERE id = ?';
    const results = await Project.query(context, sql, [projectFunderId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new Project(results[0]) : null;
  }
};

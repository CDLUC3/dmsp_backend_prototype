import { MyContext } from "../context";
import { TemplateCollaborator } from "./Collaborator";
import { MySqlModel } from "./MySqlModel";

export enum TemplateVisibility {
  PRIVATE = 'PRIVATE', // Template is only available to Researchers that belong to the same affiliation
  PUBLIC = 'PUBLIC', // Template is available to everyone creating a DMP
}

// A Template for creating a DMP
export class Template extends MySqlModel {
  public sourceTemplateId?: number;
  public name: string;
  public description?: string;
  public ownerId?: string;
  public visibility: TemplateVisibility;
  public currentVersion?: string;
  public isDirty: boolean;
  public bestPractice: boolean;

  private tableName = 'templates';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.name = options.name;
    this.ownerId = options.ownerId;
    this.description = options.description;
    this.sourceTemplateId = options.sourceTemplateId
    this.visibility = options.visibility || TemplateVisibility.PRIVATE;
    this.currentVersion = options.currentVersion || '';
    this.isDirty = options.isDirty || true;
    this.bestPractice = options.bestPractice || false;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (this.ownerId === null) {
      this.errors.push('Owner can\'t be blank');
    }
    if (!this.name) {
      this.errors.push('Name can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  // Save the current record
  async create(context: MyContext): Promise<Template> {
    // First make sure the record is valid
    if (await this.isValid()) {
      const current = await Template.findByNameAndOwnerId(
        'TemplateCollaborator.create',
        context,
        this.name,
      );

      // Then make sure it doesn't already exist
      if (current) {
        this.errors.push('Template with this name already exists');
      } else {
        // Save the record and then fetch it
        const newId = await Template.insert(context, this.tableName, this, 'Template.create');
        return await Template.findById('Template.create', context, newId);
      }
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  // Save the changes made to the template
  async update(context: MyContext, noTouch = false): Promise<Template> {
    const id = this.id;

    // First make sure the record is valid
    if (await this.isValid()) {
      if (id) {
        // if the template is versioned then set the isDirty flag
        if (this.currentVersion && !noTouch) {
          this.isDirty = true;
        }

        /*When calling 'update' in the mySqlModel, the query returns an object that looks something like this:
        {
          fieldCount: 0,
          affectedRows: 1,
          insertId: 0,
          info: 'Rows matched: 1  Changed: 1  Warnings: 0',
          serverStatus: 2,
          warningStatus: 0,
          changedRows: 1
        }
        So, we have to make a call to findById to get the updated data to return to user
        */
        await Template.update(context, this.tableName, this, 'Template.update', [], noTouch);
        return await Template.findById('Template.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.errors.push('Template has never been saved');
    }
    return this;
  }

  // Archive this record
  async delete(context: MyContext): Promise<boolean> {
    if (this.id) {
      // Associated TemplateCollaborators and VersionedTemplates will be deletd automatically by MySQL
      const result = await Template.delete(context, this.tableName, this.id, 'Template.delete');
      if (result) {
        return true;
      }
    }
    return false;
  }

  // Return the specified Template
  static async findById(reference: string, context: MyContext, templateId: number): Promise<Template> {
    const sql = 'SELECT * FROM templates WHERE id = ?';
    const results = await Template.query(context, sql, [templateId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Look for the template by it's name and owner
  static async findByNameAndOwnerId(
    reference: string,
    context: MyContext,
    name: string
  ): Promise<Template> {
    const sql = 'SELECT * FROM templates WHERE LOWER(name) = ? AND ownerId = ?';
    const vals = [name.toLowerCase(), context.token?.affiliationId];
    const results = await Template.query(context, sql, vals, reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Find all of the templates associated with the context's User's affiliation
  static async findByUser(reference: string, context: MyContext): Promise<Template[]> {
    const sql = 'SELECT * FROM templates WHERE ownerId = ? ORDER BY modified DESC';
    const templates = await Template.query(context, sql, [context.token?.affiliationId], reference);

    // Also look for any templates that the current user has been invited to collaborate on
    const sharedTemplates = await TemplateCollaborator.findByEmail(
      'Template.findByUser',
      context,
      context.token?.email
    );
    return [...templates, ...sharedTemplates];
  }
}

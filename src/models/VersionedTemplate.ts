import { TemplateVisibility } from "./Template";
import { MySqlModel } from './MySqlModel';
import { MyContext } from '../context';

export enum TemplateVersionType {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

// A Snapshot/Version of a Template
export class VersionedTemplate extends MySqlModel {
  public templateId: number;
  public version: string;
  public versionedById: number;

  public name: string;
  public description?: string;
  public ownerId: string;

  public versionType: TemplateVersionType;
  public comment?: string;
  public active: boolean;

  public visibility: TemplateVisibility;
  public bestPractice: boolean;

  private tableName = 'versionedTemplates';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.templateId = options.templateId;
    this.version = options.version;
    this.versionedById = options.versionedById;

    this.name = options.name;
    this.ownerId = options.ownerId;
    this.description = options.description;

    this.versionType = options.versionType || TemplateVersionType.DRAFT;
    this.comment = options.comment || '';
    this.active = options.active || false;

    this.visibility = options.visibility || TemplateVisibility.PRIVATE;
    this.bestPractice = options.bestPractice || false;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.templateId) {
      this.errors.push('Template can\'t be blank');
    }
    if (!this.ownerId) {
      this.errors.push('Owner can\'t be blank');
    }
    if (!this.versionedById) {
      this.errors.push('Versioned by can\'t be blank');
    }
    if (!this.name) {
      this.errors.push('Name can\'t be blank');
    }
    if (!this.version) {
      this.errors.push('Version can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  // Save the current record
  async create(context: MyContext): Promise<VersionedTemplate> {
    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      const newId = await VersionedTemplate.insert(context, this.tableName, this, 'VersionedTemplate.create');
      return await VersionedTemplate.findVersionedTemplateById('VersionedTemplate.create', context, newId);
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  // Save the changes made to the VersionedTemplate
  async update(context: MyContext): Promise<VersionedTemplate> {
    // First make sure the record is valid
    if (await this.isValid()) {
      if (this.id) {
        const result = await VersionedTemplate.update(context, this.tableName, this, 'VersionedTemplate.update');
        return result as VersionedTemplate;
      }
      // This template has never been saved before so we cannot update it!
      this.errors.push('VersionedTemplate has never been saved');
    }
    return this;
  }

  // Return all of the versions for the specified Template
  static async findByTemplateId(reference: string, context: MyContext, templateId: number): Promise<VersionedTemplate[]> {
    const sql = 'SELECT * FROM versionedTemplates WHERE templateId = ? ORDER BY version DESC';
    return await VersionedTemplate.query(context, sql, [templateId.toString()], reference);
  }

  // Search all of the Published versions for the specified term
  static async search(reference: string, context: MyContext, term: string): Promise<VersionedTemplate[]> {
    const sql = `SELECT * FROM versionedTemplates \
                 WHERE name LIKE ? AND active = 1 AND versionType = ? \
                 ORDER BY name ASC`;
    const vals = [`%${term}%`, TemplateVersionType.PUBLISHED];
    return await VersionedTemplate.query(context, sql, vals, reference);
  }

  // Return the specified version
  static async findVersionedTemplateById(
    reference: string,
    context: MyContext,
    versionedTemplateId: number
  ): Promise<VersionedTemplate> {
    const sql = 'SELECT * FROM versionedTemplates WHERE id = ?';
    const results = await VersionedTemplate.query(context, sql, [versionedTemplateId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
}

import { Visibility } from "./Template";
import { MySqlModel } from './MySqlModel';
import { MyContext } from '../context';

export enum VersionType {
  Draft = 'Draft',
  Published = 'Published',
}

// A Snapshot/Version of a Template
export class VersionedTemplate extends MySqlModel {
  public id: number;
  public templateId: number;
  public version: string;
  public versionedById: number;

  public name: string;
  public ownerId: string;

  public versionType: VersionType;
  public comment: string;
  public active: boolean;

  public visibility: Visibility;
  public bestPractice: boolean;

  public created: string;
  public createdById: number;
  public modified: string;
  public modifiedById: number;

  constructor(options){
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.templateId = options.templateId;
    this.version = options.version;
    this.versionedById = options.versionedById;

    this.name = options.name;
    this.ownerId = options.ownerId;

    this.versionType = options.versionType || VersionType.Draft;
    this.comment = options.comment || '';
    this.active = options.active || false;

    this.visibility = options.visibility || Visibility.Private;
    this.bestPractice = options.bestPractice || false;
  }

  // Return all of the versions for the specified Template
  static async findByTemplateId(reference: string, context: MyContext, templateId: number) {
    const sql = 'SELECT * FROM versionedTemplates WHERE templateId = ? ORDER BY version DESC';
    return await VersionedTemplate.query(context, sql, [templateId.toString()], reference);
  }

  // Return all of the Published versions that are marked as "Best Practice"
  static async bestPractice(reference: string, context: MyContext) {
    const sql = 'SELECT * FROM versionedTemplates WHERE bestPractice = 1 AND active = 1 ORDER BY name ASC';
    return await VersionedTemplate.query(context, sql, [], reference);
  }

  // Search all of the Published versions for the specified term
  static async search(reference: string, context: MyContext, term: string) {
    const sql = `SELECT * FROM versionedTemplates \
                 WHERE name LIKE ? AND active = 1 AND versionType = ? \
                 ORDER BY name ASC`;
    return await VersionedTemplate.query(context, sql, [`%${term}%`, 'Published'], reference);
  }

  // Return the specified version
  static async findPublishedTemplateById(reference: string, context: MyContext, versionedTemplateId: number) {
    const sql = 'SELECT * FROM versionedTemplates WHERE id = ?';
    const results = await VersionedTemplate.query(context, sql, [versionedTemplateId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
}

import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

export enum Visibility {
  Private = 'Private', // Template is only available to Researchers that belong to the same affiliation
  Public = 'Public', // Template is available to everyone creating a DMP
}

// A Template for creating a DMP
export class Template extends MySqlModel {
  public id: number;
  public name: string;
  public ownerId: string;
  public createdById: number;
  public modifiedById: number;
  public visibility: Visibility = Visibility.Private;
  public currentVersion: string;
  public isDirty: boolean;
  public bestPractice: boolean;

  public created: string;
  public modified: string;

  public errors: string[];

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.name = options.name;
    this.ownerId = options.ownerId;
    this.visibility = options.visibility || Visibility.Private;
    this.currentVersion = options.currentVersion || '';
    this.isDirty = options.isDirty || true;
    this.bestPractice = options.bestPractice || false;

    this.errors = [];
  }

  // Return the specified Template
  static async findById(reference: string, context: MyContext, templateId: number) {
    // TODO: Update this to include the User's affiliation once its in the context
    const sql = 'SELECT * FROM templates WHERE id = ?';
    const results = await Template.query(context, sql, [templateId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Find all of the templates associated with the context's User's affiliation
  static async findByUser(reference: string, context: MyContext) {
    // TODO: Swap this hard-coded version out once we have the User in the context
    const sql = `SELECT * FROM templates \
                 WHERE ownerId = \'https://ror.org/01cwqze88\' \
                 ORDER BY modified DESC`;
    // return await Template.mysqlQuery(context, sql, [context.user?.affiliationId], reference);
    return await Template.query(context, sql, [], reference);
  }
}

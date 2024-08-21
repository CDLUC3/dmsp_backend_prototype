import { MyContext } from "../context";
import { isSuperAdmin } from "../services/authService";
import { JWTToken } from "../services/tokenService";
import { MySqlModel } from "./MySqlModel";

export enum Visibility {
  Private = 'Private', // Template is only available to Researchers that belong to the same affiliation
  Public = 'Public', // Template is available to everyone creating a DMP
}

// A Template for creating a DMP
export class Template extends MySqlModel {
  public sourceTemplateId?: number;
  public name: string;
  public description?: string;
  public ownerId?: string;
  public visibility: Visibility;
  public currentVersion?: string;
  public isDirty: boolean;
  public bestPractice: boolean;

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.name = options.name;
    this.ownerId = options.ownerId;
    this.description = options.description;
    this.sourceTemplateId = options.sourceTemplateId
    this.visibility = options.visibility || Visibility.Private;
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

  // Make a copy of the current Template
  clone(newCreatedById: number, newOwnerId: string): Template {
    return new Template({
      name: `Copy of ${this.name}`,
      description: this.description,
      ownerId: newOwnerId,
      createdById: newCreatedById,
    })
  }

  // Verify that the current user has the same affiliationId as the template or they are SUPERADMIN
  static isAuthorized(token: JWTToken, template: Template): boolean {
    return isSuperAdmin(token) && token.affiliationId === template.ownerId;
  }

  // Return the specified Template
  static async findById(reference: string, context: MyContext, templateId: number): Promise<Template> {
    // TODO: Update this to include the User's affiliation once its in the context
    const sql = 'SELECT * FROM templates WHERE id = ?';
    const results = await Template.query(context, sql, [templateId.toString()], reference);
    return results[0];
  }

  // Find all of the templates associated with the context's User's affiliation
  static async findByUser(reference: string, context: MyContext): Promise<Template[]> {
    // TODO: Swap this hard-coded version out once we have the User in the context
    const sql = 'SELECT * FROM templates WHERE ownerId = \'https://ror.org/01cwqze88\' ORDER BY modified DESC';
    // return await Template.mysqlQuery(context, sql, [context.user?.affiliationId], reference);
    return await Template.query(context, sql, [], reference);
  }
}

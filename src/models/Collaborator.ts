import { MyContext } from '../context';
import { validateEmail } from '../utils/helpers';
import { MySqlModel } from './MySqlModel';

// An abstract class that represents a User who has been invited to Collaborate on another
// entity (e.g. Template or Plan)
export class Collaborator extends MySqlModel {
  public errors: string[];

  constructor(
    public email: string,
    public invitedById: number,
    public createdById?: number,
    public modifiedById?: number,
    public userId?: number,

    public id?: number,
    public created: string = new Date().toUTCString(),
    public modified: string = new Date().toUTCString(),
  ){
    super(createdById, id, created, modified, modifiedById);

    this.errors = [];
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    super.isValid();

    if (!validateEmail(this.email)) {
      this.errors.push('Email can\'t be blank');
    }
    if (!this.invitedById) {
      this.errors.push('Invited by can\'t be blank');
    }
    return this.errors.length <= 0;
  }
}

export class TemplateCollaborator extends Collaborator {
  public id: number;
  public email: string;
  public invitedById: number;
  public createdById?: number;
  public modifiedById?: number;
  public userId?: number;

  public templateId: number;
  public created: string;
  public modified: string;

  public errors: string[];

  constructor(options) {
    super(options.email, options.invitedById, options.createdById, options.modifiedById,
      options.userId, options.id, options.created, options.modified);

    this.templateId = options.templateId || null;
    this.errors = [];
  }

  // Verify that the templateId is present
  async isValid(): Promise<boolean> {
    super.isValid()

    if (this.templateId === null) {
      this.errors.push('Template can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  // Get all of the collaborators for the specified Template
  static async findByTemplateId(
    reference: string,
    context: MyContext,
    templateId: number
  ): Promise<TemplateCollaborator[] | null> {
    const sql = 'SELECT * FROM templateCollaborators WHERE templateId = ? ORDER BY email ASC';
    return await TemplateCollaborator.query(context, sql, [templateId.toString()], reference);
  }
}

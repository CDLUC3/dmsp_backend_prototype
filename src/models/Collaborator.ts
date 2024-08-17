import { MyContext } from '../context';
import { validateEmail } from '../utils/helpers';
import { MySqlModel } from './MySqlModel';

// An abstract class that represents a User who has been invited to Collaborate on another
// entity (e.g. Template or Plan)
export class Collaborator extends MySqlModel {
  public email: string;
  public invitedById: number;
  public userId: number;

  constructor(options){
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.email = options.email;
    this.invitedById = options.invitedById;
    this.userId = options.userId || null;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!validateEmail(this.email)) {
      this.errors.push('Email can\'t be blank');
    }
    if (!this.invitedById) {
      this.errors.push('Invited by can\'t be blank');
    }
    return this.errors.length <= 0;
  }
}

// An individual that belongs to another affiliation that has been invited to work on a Template
export class TemplateCollaborator extends Collaborator {
  public templateId: number;

  constructor(options) {
    super(options);

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
  ): Promise<TemplateCollaborator[]> {
    const sql = 'SELECT * FROM templateCollaborators WHERE templateId = ? ORDER BY email ASC';
    return await TemplateCollaborator.query(context, sql, [templateId.toString()], reference);
  }
}

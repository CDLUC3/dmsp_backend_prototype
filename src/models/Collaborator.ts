import { MyContext } from '../context';
import { sendTemplateCollaborationEmail } from '../services/emailService';
import { validateEmail } from '../utils/helpers';
import { MySqlModel } from './MySqlModel';
import { Template } from './Template';
import { User } from './User';

// An abstract class that represents a User who has been invited to Collaborate on another
// entity (e.g. Template or Plan)
export class Collaborator extends MySqlModel {
  public email: string;
  public invitedById: number;
  public userId: number;

  constructor(options) {
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

  private tableName = 'templateCollaborators';

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

  // Save the current record
  async create(context: MyContext): Promise<TemplateCollaborator> {
    const reference = 'TemplateCollaborator.create';
    // First make sure the record is valid
    if (await this.isValid()) {
      const currentCollaborator = await TemplateCollaborator.findByTemplateIdAndEmail(
        reference,
        context,
        this.templateId,
        this.email,
      );

      if (currentCollaborator) {
        this.errors.push('Collaborator has already been added');
      } else {
        // Verify that the template we want to attach the collaborator to exists!
        const templateExists = await Template.exists(
          context,
          'templates',
          this.templateId,
          reference
        );

        if (!templateExists) {
          this.errors.push('Template does not exist');
        } else {
          // See if the user already has an account, if so grab their id
          const user = await User.findByEmail(reference, context, this.email);
          this.userId = user?.id;

          // Set the inviter's Id to the current user
          this.invitedById = context.token?.id;

          // Save the record and then fetch it
          const newId = await TemplateCollaborator.insert(context, this.tableName, this, reference);
          if (newId) {
            const inviter = await User.findById(reference, context, this.invitedById);
            const template = await Template.findById(reference, context, this.templateId);
            // Send out the invitation notification (no async here, can happen in the background)
            await sendTemplateCollaborationEmail(context, template.name, inviter.getName(), this.email, this.userId);

            return await TemplateCollaborator.findByTemplateIdAndEmail(
              reference,
              context,
              this.templateId,
              this.email,
            );
          }
          return null;
        }
      }
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  // Update the record
  async update(context: MyContext): Promise<TemplateCollaborator> {
    // First make sure the record is valid
    if (await this.isValid()) {
      if (this.id) {
        // Verify that the template we want to attach the collaborator to exists!
        const templateExists = await Template.exists(
          context,
          'templates',
          this.templateId,
          'TemplateCollaborator.update'
        );

        if (!templateExists) {
          this.errors.push('Template does not exist');
        } else {
          const result = await TemplateCollaborator.update(context, this.tableName, this, 'TemplateCollaborator.update');
          return result as TemplateCollaborator;
        }
      } else {
        this.errors.push('Collaborator has never been saved before');
      }
    }
    return this;
  }

  // Remove this record
  async delete(context: MyContext): Promise<boolean> {
    if (this.id) {
      const result = await TemplateCollaborator.delete(context, this.tableName, this.id, 'TemplateCollaborator.delete');
      if (result) {
        return true;
      }
    }
    return false;
  }

  // Get all of the collaborators for the specified Template
  static async findByTemplateId(
    reference: string,
    context: MyContext,
    templateId: number
  ): Promise<TemplateCollaborator[]> {
    const sql = 'SELECT * FROM templateCollaborators WHERE templateId = ? ORDER BY email ASC';
    return await TemplateCollaborator.query(context, sql, [templateId?.toString()], reference);
  }

  // Get the specified TemplateCollaborator
  static async findById(
    reference: string,
    context: MyContext,
    id: number,
  ): Promise<TemplateCollaborator> {
    const sql = 'SELECT * FROM templateCollaborators WHERE id = ?';
    const results = await TemplateCollaborator.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  static async findByInvitedById(
    reference: string,
    context: MyContext,
    invitedById: number,
  ): Promise<TemplateCollaborator[]> {
    const sql = 'SELECT * FROM templateCollaborators WHERE invitedById = ?';
    return await TemplateCollaborator.query(context, sql, [invitedById?.toString()], reference);
  }

  // Get all of the TemplateCollaborator records for the specified email
  static async findByEmail(
    reference: string,
    context: MyContext,
    email: string,
  ): Promise<TemplateCollaborator[]> {
    const sql = 'SELECT * FROM templateCollaborators WHERE email = ?';
    return await TemplateCollaborator.query(context, sql, [email], reference);
  }

  // Get the specified TemplateCollaborator
  static async findByTemplateIdAndEmail(
    reference: string,
    context: MyContext,
    templateId: number,
    email: string,
  ): Promise<TemplateCollaborator> {
    const sql = 'SELECT * FROM templateCollaborators WHERE templateId = ? AND email = ?';
    const vals = [templateId?.toString(), email];
    const results = await TemplateCollaborator.query(context, sql, vals, reference);
    return Array.isArray(results) && results.length > 0 ? new TemplateCollaborator(results[0]) : null;
  }
}

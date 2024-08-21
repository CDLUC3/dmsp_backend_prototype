import { MyContext } from '../context';
import { validateEmail } from '../utils/helpers';
import { MySqlModel } from './MySqlModel';
import { User } from './User';

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

  // Save the current record
  async save(context: MyContext): Promise<TemplateCollaborator> {
    // First make sure the record is valid
    if (await this.isValid()) {
      // Verify that the template we want to attach the collaborator to exists!
      const templateExists = await MySqlModel.exists(context, 'templates', this.templateId, 'TemplateCollaborator.save');
      if (!templateExists) {
        this.errors.push('Template does not exist');
      } else {
        // Get the id for the person doing the save
        const saverId = context.token.id;

        // See if the user already has an account, if so grab their id
        const user = await User.findByEmail('TemplateCollaborator.save', context, this.email);
        this.userId = user?.id;

        // Make sure the entry doesn't already exist!
        const existing = await TemplateCollaborator.findByTemplateIdAndEmail(
          'TemplateCollaborator.save',
          context,
          this.templateId,
          this.email,
        );
        if (existing) {
          const sql = `UPDATE templateCollaborators \
                       SET userId = ?, modifiedById = ?, modified = ? \
                       WHERE id = ?`;
          const vals = [this.userId.toString(), saverId.toString(), new Date().toUTCString(), existing.id.toString()];
        } else {


          const sql = `INSERT INTO templateCollaborators \
                        (templateId, email, invitedById, userId, createdById, modifiedById) \
                      VALUES (?, ?, ?, ?, ?, ?)`;

          const invitedById = this.invitedById.toString();
          const vals = [
            this.templateId.toString(), this.email, invitedById, this.userId?.toString(), invitedById, invitedById
          ];

          // Save the record, set this object's id and then return the instance
          const saved = await TemplateCollaborator.query(context, sql, vals, 'TemplateCollaborator.save');
          if (Array.isArray(saved) && saved[0]?.insertId) {
            return await TemplateCollaborator.findById('TemplateCollaborator.save', context, saved[0]?.insertId);
          } else {
            this.errors.push('Internal server error. Save failed');
          }
        }
      }
    }
    // Otherwise return as-is with all the errors
    return this;
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

  static async findById(
    reference: string,
    context: MyContext,
    id: number,
  ): Promise<TemplateCollaborator> {
    const sql = 'SELECT * FROM templateCollaborators WHERE id = ?';
    const results = await TemplateCollaborator.query(context, sql, [id.toString()], reference);
    return results[0];
  }

  // Get the specified TemplateCollaborator
  static async findByTemplateIdAndEmail(
    reference: string,
    context: MyContext,
    templateId: number,
    email: string,
  ): Promise<TemplateCollaborator> {
    const sql = 'SELECT * FROM templateCollaborators WHERE templateId = ? AND email = ?';
    const vals = [templateId.toString(), email];
    const results = await TemplateCollaborator.query(context, sql, vals, reference);
    return results[0];
  }
}

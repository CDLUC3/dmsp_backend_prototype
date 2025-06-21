import { MyContext } from '../context';
import { sendProjectCollaborationEmail, sendTemplateCollaborationEmail } from '../services/emailService';
import { isNullOrUndefined, validateEmail, valueIsEmpty } from '../utils/helpers';
import { MySqlModel } from './MySqlModel';
import { Project } from './Project';
import { Template } from './Template';
import { User } from './User';

// An abstract class that represents a User who has been invited to Collaborate on another
// entity (e.g. Template or Plan)
export class Collaborator extends MySqlModel {
  public email: string;
  public invitedById: number;
  public userId: number;

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.email = options.email;
    this.invitedById = options.invitedById;
    this.userId = options.userId ?? null;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!validateEmail(this.email)) {
      this.addError('email', 'Email can\'t be blank');
    }
    if (!this.invitedById) {
      this.addError('invitedById', 'Invited by can\'t be blank');
    }
    return Object.keys(this.errors).length === 0;
  }
}

// An individual that belongs to another affiliation that has been invited to work on a Template
export class TemplateCollaborator extends Collaborator {
  public templateId: number;

  public static tableName = 'templateCollaborators';

  constructor(options) {
    super(options);

    this.templateId = options.templateId ?? null;
  }

  // Verify that the templateId is present
  async isValid(): Promise<boolean> {
    super.isValid()

    if (this.templateId === null) this.addError('templateId', 'Template Id can\'t be blank');

    return Object.keys(this.errors).length === 0;
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
        currentCollaborator.addError('general', 'Collaborator has already been added');
        return currentCollaborator
      } else {
        // See if the user already has an account, if so grab their id
        const user = await User.findByEmail(reference, context, this.email);
        this.userId = user?.id;

        // Set the inviter's Id to the current user
        this.invitedById = context.token?.id;

        // Save the record and then fetch it
        const newId = await TemplateCollaborator.insert(
          context,
          TemplateCollaborator.tableName,
          this,
          reference
        );
        if (newId) {
          const inviter = await User.findById(reference, context, this.invitedById);
          const template = await Template.findById(reference, context, this.templateId);

          // Send out the invitation notification (no async here, can happen in the background)
          await sendTemplateCollaborationEmail(context, template.name, inviter.getName(), this.email, this.userId)

          return await TemplateCollaborator.findById(reference, context, newId);
        }
      }
    }

    // Otherwise return as-is with all the errors
    return new TemplateCollaborator(this);
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
          this.addError('general', 'Template does not exist');
        } else {
          const result = await TemplateCollaborator.update(
            context,
            TemplateCollaborator.tableName,
            this,
            'TemplateCollaborator.update'
          );
          if (!result) {
            this.addError('general', 'Unable to update the collaborator');
          }
          if (!this.hasErrors()) {
            return await TemplateCollaborator.findById('TemplateCollaborator.update', context, this.id);
          }
        }
      } else {
        this.addError('general', 'TemplateCollaborator has never been saved');
      }
    }
    return new TemplateCollaborator(this);
  }

  // Remove this record
  async delete(context: MyContext): Promise<TemplateCollaborator> {
    const existing = await TemplateCollaborator.findById('TemplateCollaborator.delete', context, this.id);

    if (existing) {
      const result = await TemplateCollaborator.delete(
        context,
        TemplateCollaborator.tableName,
        this.id,
        'TemplateCollaborator.delete'
      );
      if (!result) {
        existing.addError('general', 'Unable to delete the collaborator');
      }
      return new TemplateCollaborator(existing);
    }
    return null;
  }

  // Get all of the collaborators for the specified Template
  static async findByTemplateId(
    reference: string,
    context: MyContext,
    templateId: number
  ): Promise<TemplateCollaborator[]> {
    const sql = `SELECT * FROM ${TemplateCollaborator.tableName} WHERE templateId = ? ORDER BY email ASC`;
    const results = await TemplateCollaborator.query(context, sql, [templateId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new TemplateCollaborator(entry)) : [];
  }

  // Get the specified TemplateCollaborator
  static async findById(
    reference: string,
    context: MyContext,
    id: number,
  ): Promise<TemplateCollaborator> {
    const sql = `SELECT * FROM ${TemplateCollaborator.tableName} WHERE id = ?`;
    const results = await TemplateCollaborator.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new TemplateCollaborator(results[0]) : null;
  }

  static async findByInvitedById(
    reference: string,
    context: MyContext,
    invitedById: number,
  ): Promise<TemplateCollaborator[]> {
    const sql = `SELECT * FROM ${TemplateCollaborator.tableName} WHERE invitedById = ?`;
    const results = await TemplateCollaborator.query(context, sql, [invitedById?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new TemplateCollaborator(entry)) : [];
  }

  // Get all of the TemplateCollaborator records for the specified email
  static async findByEmail(
    reference: string,
    context: MyContext,
    email: string,
  ): Promise<TemplateCollaborator[]> {
    const sql = `SELECT * FROM ${TemplateCollaborator.tableName} WHERE email = ?`;
    const results = await TemplateCollaborator.query(context, sql, [email], reference);
    return Array.isArray(results) ? results.map((entry) => new TemplateCollaborator(entry)) : [];
  }

  // Get the specified TemplateCollaborator
  static async findByTemplateIdAndEmail(
    reference: string,
    context: MyContext,
    templateId: number,
    email: string,
  ): Promise<TemplateCollaborator> {
    const sql = `SELECT * FROM ${TemplateCollaborator.tableName} WHERE templateId = ? AND email = ?`;
    const vals = [templateId?.toString(), email];
    const results = await TemplateCollaborator.query(context, sql, vals, reference);
    return Array.isArray(results) && results.length > 0 ? new TemplateCollaborator(results[0]) : null;
  }
}

// The type of access the collaborator can have on a Project
export enum ProjectCollaboratorAccessLevel {
  // Can do everything on a Project or Plan
  OWN = 'OWN',
  // Can edit a Project's and Plan's info (except publish, mark as complete, and change access levels)
  EDIT = 'EDIT',
  // Can comment on a Plan's answers
  COMMENT = 'COMMENT',
}

// An individual that has permission to work on a Project and it's plans
export class ProjectCollaborator extends Collaborator {
  public projectId: number;
  public accessLevel: ProjectCollaboratorAccessLevel;

  public static tableName = 'projectCollaborators';

  constructor(options) {
    super(options);

    this.projectId = options.projectId ?? null;
    this.accessLevel = options.accessLevel ?? ProjectCollaboratorAccessLevel.COMMENT;
  }

  // Verify that the projectId is present
  async isValid(): Promise<boolean> {
    super.isValid()

    if (isNullOrUndefined(this.projectId)) this.addError('projectId', 'Project Id can\'t be blank');
    if (valueIsEmpty(this.accessLevel)) this.addError('accessLevel', 'Access Level can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Save the current record
  async create(context: MyContext): Promise<ProjectCollaborator> {
    const reference = 'ProjectCollaborator.create';
    // First make sure the record is valid
    if (await this.isValid()) {
      const currentCollaborator = await ProjectCollaborator.findByProjectIdAndEmail(
        reference,
        context,
        this.projectId,
        this.email,
      );

      if (currentCollaborator) {
        currentCollaborator.addError('general', 'Collaborator has already been added');
        return currentCollaborator
      } else {
        // See if the user already has an account, if so grab their id
        const user = await User.findByEmail(reference, context, this.email);
        this.userId = user?.id;

        // Set the inviter's Id to the current user
        this.invitedById = context.token?.id;

        // Save the record and then fetch it
        const newId = await ProjectCollaborator.insert(
          context,
          ProjectCollaborator.tableName,
          this,
          reference
        );
        if (newId) {
          const inviter = await User.findById(reference, context, this.invitedById);
          const project = await Project.findById(reference, context, this.projectId);

          // Send out the invitation notification (no async here, can happen in the background)
          await sendProjectCollaborationEmail(context, project.title, inviter.getName(), this.email, this.userId)

          return await ProjectCollaborator.findById(reference, context, newId);
        }
      }
    }
    // Otherwise return as-is with all the errors
    return new ProjectCollaborator(this);
  }

  // Update the record
  async update(context: MyContext): Promise<ProjectCollaborator> {
    // First make sure the record is valid
    if (await this.isValid()) {
      if (this.id) {
        // Verify that the project we want to attach the collaborator to exists!
        const projectExists = await Project.exists(
          context,
          'projects',
          this.projectId,
          'ProjectCollaborator.update'
        );

        if (!projectExists) {
          this.addError('general', 'Project does not exist');
        } else {
          const result = await ProjectCollaborator.update(
            context,
            ProjectCollaborator.tableName,
            this,
            'ProjectCollaborator.update'
          );
          if (!result) {
            this.addError('general', 'Unable to update the collaborator');
          }
          if (!this.hasErrors()) {
            return await ProjectCollaborator.findById('ProjectCollaborator.update', context, this.id);
          }
        }
      } else {
        this.addError('general', 'ProjectCollaborator has never been saved');
      }
    }
    return new ProjectCollaborator(this);
  }

  // Remove this record
  async delete(context: MyContext): Promise<ProjectCollaborator> {
    const existing = await ProjectCollaborator.findById('ProjectCollaborator.delete', context, this.id);

    if (existing) {
      const result = await ProjectCollaborator.delete(
        context,
        ProjectCollaborator.tableName,
        this.id,
        'ProjectCollaborator.delete'
      );
      if (!result) {
        existing.addError('general', 'Unable to delete the collaborator');
      }
      return new ProjectCollaborator(existing);
    }
    return null;
  }

  // Get all of the collaborators for the specified Project
  static async findByProjectId(
    reference: string,
    context: MyContext,
    projectId: number
  ): Promise<ProjectCollaborator[]> {
    const sql = `SELECT * FROM ${ProjectCollaborator.tableName} WHERE projectId = ? ORDER BY email ASC`;
    const results = await ProjectCollaborator.query(context, sql, [projectId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new ProjectCollaborator(entry)) : [];
  }

  // Get the specified ProjectCollaborator
  static async findById(
    reference: string,
    context: MyContext,
    id: number,
  ): Promise<ProjectCollaborator> {
    const sql = `SELECT * FROM ${ProjectCollaborator.tableName} WHERE id = ?`;
    const results = await ProjectCollaborator.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectCollaborator(results[0]) : null;
  }

  static async findByInvitedById(
    reference: string,
    context: MyContext,
    invitedById: number,
  ): Promise<ProjectCollaborator[]> {
    const sql = `SELECT * FROM ${ProjectCollaborator.tableName} WHERE invitedById = ?`;
    const results = await ProjectCollaborator.query(context, sql, [invitedById?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new ProjectCollaborator(entry)) : [];
  }

  // Get all of the ProjectCollaborator records for the specified email
  static async findByEmail(
    reference: string,
    context: MyContext,
    email: string,
  ): Promise<ProjectCollaborator[]> {
    const sql = `SELECT * FROM ${ProjectCollaborator.tableName} WHERE email = ?`;
    const results = await ProjectCollaborator.query(context, sql, [email], reference);
    return Array.isArray(results) ? results.map((entry) => new ProjectCollaborator(entry)) : [];
  }

  // Get the specified ProjectCollaborator
  static async findByProjectIdAndEmail(
    reference: string,
    context: MyContext,
    projectId: number,
    email: string,
  ): Promise<ProjectCollaborator> {
    const sql = `SELECT * FROM ${ProjectCollaborator.tableName} WHERE projectId = ? AND email = ?`;
    const vals = [projectId?.toString(), email];
    const results = await ProjectCollaborator.query(context, sql, vals, reference);
    return Array.isArray(results) && results.length > 0 ? new ProjectCollaborator(results[0]) : null;
  }
}

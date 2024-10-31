import { MyContext } from "../context";
import { sendEmailConfirmationNotification } from "../services/emailService";
import { TemplateCollaborator } from "./Collaborator";
import { MySqlModel } from "./MySqlModel";

// Reepresents one of the user's email addresses
export class UserEmail extends MySqlModel {
  public userId: number;
  public email: string;
  public isPrimary: boolean;
  public isConfirmed: boolean;

  private tableName = 'userEmails';

  // Initialize a new User
  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.userId = options.userId;
    this.email = options.email;
    this.isPrimary = options.isPrimary || false;
    this.isConfirmed = options.isConfirmed || false;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (this.userId === null) {
      this.errors.push('User can\'t be blank');
    }
    if (!this.email) {
      this.errors.push('Email can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  // Confirm the user owns the email
  static async confirmEmail(context: MyContext, userId: number, email: string): Promise<UserEmail> {
    const ref = 'UserEmail.confirmEmail';
    // Fetch all of the existing records with the current email
    const userEmail = await UserEmail.findByUserIdAndEmail(ref, context, userId, email);

    if (userEmail) {
      // Fetch all of the other instances of this email
      const allEmails = await UserEmail.findByEmail(ref, context, email);
      const otherEmails = allEmails.filter((entry) => { return entry.userId !== userId });

      // If the email has already been confirmed by another account set an error message
      if (otherEmails && otherEmails.find((other) => { return other.isConfirmed; })) {
        userEmail.errors.push('Email has already been confirmed');
        return userEmail;

      } else {
        // Update the confirmed flag
        userEmail.isConfirmed = true;
        const updated = await userEmail.update(context);

        // Claim any invitations to collaborate on a Template by assigning the userId
        const tmpltCollabs = await TemplateCollaborator.findByEmail(ref, context, email);
        for (const collab of tmpltCollabs) {
          collab.userId = userId;
          await collab.update(context);
        }

        // Remove any other instances of the email that are out there for other users
        for (const other of otherEmails) {
          await other.delete(context);
        }

        return updated;
      }
    }
    return null;
  }

  // Save the current record
  async create(context: MyContext): Promise<UserEmail> {
    const ref = 'UserEmail.create';
    // First make sure the record is valid
    if (await this.isValid()) {
      // Fetch all of the existing records with the current email
      const entries = await UserEmail.findByEmail(ref, context, this.email);

      // First make sure it's not already attached to this user account
      const existing = entries.find((entry) => { return entry.userId === this.userId; });
      if (existing) {
        this.errors.push('Email is already associated with this account');
      }

      // Then make sure it hasn't already been claimed/confirmed by another user account
      const confirmed = entries.find((entry) => { return entry.isConfirmed; });
      if (confirmed) {
        this.errors.push('Email has already been confirmed by another account');
      }

      if (this.errors.length <= 0){
        // Save the record and then fetch it
        const newId = await UserEmail.insert(context, this.tableName, this, ref);
        const created = await UserEmail.findById(ref, context, newId);

        if (created) {
          // Send out an email confirmation notification. No async, can happen in background
          sendEmailConfirmationNotification(created.email);
        }
        return created;
      }
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  // Save the changes made to the UserEmail
  async update(context: MyContext): Promise<UserEmail> {
    if (this.id) {
      // First make sure the record is valid
      if (await this.isValid()) {
        // Only allow this if the existing record or the update has been confirmed/verified
        const existing = await UserEmail.findById('UserEmail.update', context, this.id);
        if (existing && !existing.isConfirmed && !this.isConfirmed) {
          this.errors.push('Email has not yet been confirmed');
        }

        if (this.errors.length === 0) {
          await UserEmail.update(context, this.tableName, this, 'UserEmail.update');
          return await UserEmail.findById('UserEmail.update', context, this.id);
        }
      }
    } else {
      this.errors.push('Email has not been created yet');
    }

    return this;
  }

  //Delete this UserEmail
  async delete(context: MyContext): Promise<UserEmail> {
    if (this.id) {
      const deleted = await UserEmail.findById('UserEmail.delete', context, this.id);

      if (deleted) {
        const success = await UserEmail.delete(context, this.tableName, this.id, 'UserEmail.delete');
        if (success) {
          return deleted;
        }
      }
      return null;
    } else {
      this.errors.push('Email has not been created yet');
    }
    return this;
  }

  // Return the specified UserEmail
  static async findById(reference: string, context: MyContext, id: number): Promise<UserEmail> {
    const sql = 'SELECT * FROM userEmails WHERE id = ?';
    const results = await UserEmail.query(context, sql, [id.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Return the specified UserEmail by UserId and Email
  static async findByUserIdAndEmail(
    reference: string,
    context: MyContext,
    userId: number,
    email: string
  ): Promise<UserEmail> {
    const sql = 'SELECT * FROM userEmails WHERE userId = ? AND email = ?';
    const results = await UserEmail.query(context, sql, [userId.toString(), email], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Return the emails for the specified user
  static async findByUserId(
    reference: string,
    context: MyContext,
    userId: number
  ): Promise<UserEmail[]> {
    const sql = 'SELECT * FROM userEmails WHERE userId = ?';
    const results = await UserEmail.query(context, sql, [userId.toString()], reference);
    return Array.isArray(results) ? results : [];
  }

  // Return the specified UserEmail
  static async findByEmail(
    reference: string,
    context: MyContext,
    email: string
  ): Promise<UserEmail[]> {
    const sql = 'SELECT * FROM userEmails WHERE email = ?';
    const results = await UserEmail.query(context, sql, [email], reference);
    return Array.isArray(results) ? results : [];
  }
}
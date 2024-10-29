import { MyContext } from "../context";
import { sendEmail } from "../services/emailService";
import { MySqlModel } from "./MySqlModel";

// Reepresents one of the user's email addresses
export class UserEmail extends MySqlModel {
  public userId: number;
  public email: string;
  public primary: boolean;
  public confirmed: boolean;

  private tableName = 'userEmails';

  // Initialize a new User
  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.userId = options.userId;
    this.email = options.email;
    this.primary = options.primary || false;
    this.confirmed = options.confirmed || false;
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
      // Update the confirmed flag
      userEmail.confirmed = true;
      const updated = await userEmail.update(context);

      // TODO: We will want to look for any open invitations for the email being confirmed,
      //       and then convert them into Collaborator records
      return updated;
    }
    return userEmail;
  }

  // Save the current record
  async create(context: MyContext): Promise<UserEmail> {
    const ref = 'UserEmail.create';
    // First make sure the record is valid
    if (await this.isValid()) {
      // Fetch all of the existing records with the current email
      const existing = await UserEmail.findByEmail(ref, context, this.email);
      const confirmed = existing.find((entry) => { return entry.confirmed; });
      if (confirmed) {
        this.errors.push('Email has already been claimed by another account');
      }

      const current = await UserEmail.findByUserIdAndEmail(ref, context, this.userId, this.email);
      // Then make sure it doesn't already exist
      if (current) {
        this.errors.push('Email is already associated with this account');
      }

      if (this.errors.length <= 0){
        // Save the record and then fetch it
        const newId = await UserEmail.insert(context, this.tableName, this, ref);
        const created = await UserEmail.findById(ref, context, newId);

        if (created) {
          // TODO: Store the automated email in a table so we can eventually have a UI page for
          //       SuperAdmins to update them.
          //       Load the appropriate message and send it out
          sendEmail(created.email, 'Please confirm your email address', 'Confirmation message');
        }
        return created;
      }
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  // Save the changes made to the UserEmail
  async update(context: MyContext): Promise<UserEmail> {
    const id = this.id;

    // First make sure the record is valid
    if (await this.isValid()) {
      if (id) {
        // Only allow this if the existing record or the update has been confirmed/verified
        const existing = await UserEmail.findById('UserEmail.update', context, this.id);
        if (!existing.confirmed && !this.confirmed) {
          this.errors.push('Email has not yet been confirmed');
        }

        /*When calling 'update' in the mySqlModel, the query returns an object that looks something like this:
        {
          fieldCount: 0,
          affectedRows: 1,
          insertId: 0,
          info: 'Rows matched: 1  Changed: 1  Warnings: 0',
          serverStatus: 2,
          warningStatus: 0,
          changedRows: 1
        }
        So, we have to make a call to findById to get the updated data to return to user
        */
        await UserEmail.update(context, this.tableName, this, 'UserEmail.update');
        return await UserEmail.findById('UserEmail.update', context, this.id);
      }
      // This template has never been saved before so we cannot update it!
      this.errors.push('User email has never been saved');
    }
    return this;
  }

  //Delete this UserEmail
  async delete(context: MyContext): Promise<UserEmail> {
    if (this.id) {
      const deleted = await UserEmail.findById('UserEmail.delete', context, this.id);

      const success = await UserEmail.delete(context, this.tableName, this.id, 'UserEmail.delete');
      if (success) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
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
    const sql = 'SELECT * FROM userEmails WHERE userId = ? AND confirmed = 1';
    const results = await UserEmail.query(context, sql, [userId.toString()], reference);
    return Array.isArray(results) ? results : [];
  }

  // Return the specified UserEmail
  static async findByEmail(
    reference: string,
    context: MyContext,
    email: string
  ): Promise<UserEmail[]> {
    const sql = 'SELECT * FROM userEmails WHERE email = ? AND confirmed = 1';
    const results = await UserEmail.query(context, sql, [email], reference);
    return Array.isArray(results) ? results : [];
  }
}
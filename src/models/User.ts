import bcrypt from 'bcryptjs';
import {capitalizeFirstLetter, formatORCID, getCurrentDate, validateEmail} from '../utils/helpers';
import { buildContext } from '../context';
import { logger, formatLogMessage } from '../logger';
import { MySqlModel } from './MySqlModel';
import { MyContext } from '../context';
import { generalConfig } from '../config/generalConfig';
import { defaultLanguageId, supportedLanguages } from './Language';
import { UserEmail } from './UserEmail';


export enum UserRole {
  RESEARCHER = 'RESEARCHER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export enum LogInType {
  PASSWORD = 'PASSWORD',
  SSO = 'SSO',
}

export class User extends MySqlModel {
  public email: string;
  public password: string;
  public role: UserRole;
  public givenName?: string;
  public surName?: string;
  public affiliationId: string;
  public acceptedTerms: boolean;
  public orcid?: string;
  public ssoId?: string;
  public languageId: string;

  public last_sign_in?: string;
  public last_sign_in_via?: LogInType;
  public failed_sign_in_attemps?: number;

  public notify_on_comment_added?: boolean;
  public notify_on_template_shared?: boolean;
  public notify_on_feedback_complete?: boolean;
  public notify_on_plan_shared?: boolean;
  public notify_on_plan_visibility_change?: boolean;

  public locked?: boolean;
  public active?: boolean;

  public tableName = 'users';

  // Initialize a new User
  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.email = options.email;
    this.password = options.password;
    this.role = options.role;
    this.givenName = options.givenName;
    this.surName = options.surName;
    this.orcid = options.orcid;
    this.ssoId = options.ssoId;
    this.affiliationId = options.affiliationId;
    this.acceptedTerms = options.acceptedTerms;
    this.languageId = options.languageId ?? defaultLanguageId;
    this.failed_sign_in_attemps = options.failed_sign_in_attemps ?? 0;
    this.locked = options.locked ?? false;
    this.active = options.active ?? true;
    this.notify_on_comment_added = options.notify_on_comment_added ?? true;
    this.notify_on_template_shared = options.notify_on_template_shared ?? true;
    this.notify_on_feedback_complete = options.notify_on_feedback_complete ?? true;
    this.notify_on_plan_shared = options.notify_on_plan_shared ?? true;
    this.notify_on_plan_visibility_change = options.notify_on_plan_visibility_change ?? true;

    this.prepForSave();
  }


  // Ensure data integrity
  prepForSave() {
    this.email = this.email?.trim()?.replace('%40', '@');
    this.role = this.role ?? UserRole.RESEARCHER;
    this.givenName = capitalizeFirstLetter(this.givenName);
    this.surName = capitalizeFirstLetter(this.surName);
    // Set the languageId to the default if it is not a supported language
    if (!supportedLanguages.map((l) => l.id).includes(this.languageId)){
      this.languageId = defaultLanguageId;
    }
    this.orcid = this.orcid? formatORCID(this.orcid) : null;
  }

  // Verify that the email does not already exist and that the required fields have values
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!validateEmail(this.email)) this.addError('email', 'Invalid email address');
    if (!this.password) this.addError('password', 'Password is required');
    if (!this.role) this.addError('role', 'Role can\'t be blank');
    if (this.orcid && formatORCID(this.orcid) === null) this.addError('orcid', 'Invalid ORCID');

    return Object.keys(this.errors).length === 0;
  }

  // Validate the password format
  validatePassword(): boolean {
    const specialCharsRegex = /[`!@#$%^&*_+\-=?~\s]/;
    // eslint-disable-next-line no-useless-escape
    const badSpecialCharsRegex = /[\(\)\{\}\[\]\|\\:;"'<>\,\.\/]/

    // Test the string against the regular expression
    if (
      this.password?.length >= 8 &&
      /[A-Z]/.test(this.password) &&
      /[a-z]/.test(this.password) &&
      /\d/.test(this.password) &&
      specialCharsRegex.test(this.password) &&
      !badSpecialCharsRegex.test(this.password)
    ) {
      return true;
    }
    this.addError('password', `Invalid password format.
        Passwords must be greater than 8 characters, and contain at least
        one number,
        one upper case letter,
        one lower case letter, and
        one of the following special character (\`, !, @, #, $, %, ^, &, *, -, _, =, +, ?, ~)`);
    return false;
  }

  // Helper function to return the user's full name
  getName(): string {
    return [this.givenName, this.surName].join(' ').trim();
  }

  // Hashes the user's password
  async hashPassword(password): Promise<string> {
    const salt = await bcrypt.genSalt(generalConfig.bcryptSaltRounds);
    return await bcrypt.hash(password, salt);
  }

  // Find the User by their email for an Auth check (includes the password)
  static async authCheck(
    reference: string,
    context: MyContext,
    email: string,
    password: string,
  ): Promise<number> {
    const sql = 'SELECT id, email, password FROM users WHERE email = ?';
    const users = await User.query(context, sql, [email], reference);

    // If the user was found, check the password
    if (Array.isArray(users) && users.length > 0) {
      // TODO: Add logic to lock the account after too many failures

      // Otherwise check the password
      if (users[0] && await bcrypt.compare(password, users[0].password)) {
        formatLogMessage(context).debug(`Successful authCheck for ${email}`);
        return users[0].id;
      }
    }

    formatLogMessage(context).debug(`Failed authCheck for ${email}`);
    return null;
  }

  // Find the User by their Id
  static async findById(reference: string, context: MyContext, userId: number): Promise<User> {
    const sql = 'SELECT * FROM users WHERE id = ?';

    const results = await User.query(context, sql, [userId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new User(results[0]) : null;
  }

  // Find the User by their email address
  static async findByEmail(reference: string, context: MyContext, email: string): Promise<User> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await User.query(context, sql, [email], reference);
    return Array.isArray(results) && results.length > 0 ? new User(results[0]) : null;
  }

  static async findByAffiliationId(reference: string, context: MyContext, affiliationId: string): Promise<User[]> {
    const sql = 'SELECT * FROM users WHERE affiliationId = ? ORDER BY created DESC';
    const results = await User.query(context, sql, [affiliationId], reference);
    return Array.isArray(results) ? results.map((item) => new User(item)) : [];
  }

  // Update the last_login fields
  async recordLogIn(context: MyContext, loginType: LogInType): Promise<boolean> {
    if (this.id) {
      this.last_sign_in = getCurrentDate();
      this.last_sign_in_via = loginType;

      if (await User.update(context, this.tableName, this, 'User.recordLogIn', ['password'], true)) {
        return true;
      }
    }
    // This recordSignIn could not update the record for some reason
    formatLogMessage(context).error(null, `recordSignIn failed for user ${this.id}`);
    return false;
  }

  // Login making sure that the passwords match
  async login(context: MyContext): Promise<User> {
    this.prepForSave();

    if (!validateEmail(this.email) || !this.validatePassword()) {
      return null;
    }

    try {
      const userId = await User.authCheck('User.login', context, this.email, this.password);
      formatLogMessage(context)?.debug({ userId }, 'User.login:');
      if (userId) {
        const existing = await User.findById('User.login', context, userId);

        // Update the User's last_sign_in fields
        if (await new User(existing).recordLogIn(context, LogInType.PASSWORD)) {
          // return existing;
          return existing;
        }
      }
      return null;
    } catch (err) {
      formatLogMessage(context).error({ err, email: this.email }, 'Error logging in User');
      return null;
    }
  }

  // Register the User if the data is valid
  async register(context: MyContext): Promise<User> {
    this.prepForSave();
    await this.isValid();

    // Make sure the account does not already exist
    const existing = await User.findByEmail('User.register', context, this.email);
    if (existing) {
      this.addError('general', 'Account already exists');
    }

    // Validate the password
    this.validatePassword()

    // Ensure that the user has accepted the terms and conditions
    if (this.acceptedTerms !== true) {
      this.addError('acceptedTerms', 'You must accept the terms and conditions');
    }

    if (Object.keys(this.errors).length === 0) {
      const passwordHash = await this.hashPassword(this.password);
      this.password = passwordHash

      try {
        const sql = `INSERT INTO users \
                      (email, password, role, givenName, surName, affiliationId, acceptedTerms) \
                     VALUES(?, ?, ?, ?, ?, ?, ?)`;
        const vals = [this.email, this.password, this.role, this.givenName, this.surName, this.affiliationId, this.acceptedTerms];
        const context = buildContext(logger);
        formatLogMessage(context)?.debug({ email: this.email }, 'User.register');
        const result = await User.query(context, sql, vals, 'User.register');

        if (!Array.isArray(result) || !result[0].insertId) {
          this.addError('general', 'Unable to register your account');
          return this;
        }
        formatLogMessage(context).debug(
          { email: this.email, userId: result[0].insertId }, 'User was created'
        );

        // Fetch the new record
        const user = await User.findById('User.register', context, result[0].insertId);

        // Update the user's createdById and modifiedById to indicate themselves
        const sqlUpdate = `UPDATE users SET createdById = ?, modifiedById = ? WHERE id = ?`;
        const valsUpdate = [user.id.toString(), user.id.toString(), user.id.toString()];
        await User.query(context, sqlUpdate, valsUpdate, 'User.register');

        // Add the email to the UserEmail table and send out a 'please confirm' email
        const userEmail = new UserEmail({ userId: user.id, email: user.email, isPrimary: true });
        if (!await userEmail.create(context)){
          // If we couldn't add the UserEmail record, log the error but let them continue
          formatLogMessage(context).error({ email: userEmail }, 'User.register - unable to add UserEmail!');
        }

        // Remove the password! No need to expose that to the caller
        user.password = null;
        return user;
      } catch (err) {
        formatLogMessage(context)?.error({ err, email: this.email }, 'Error creating User');
        return null;
      }
    } else {
      formatLogMessage(context)?.debug({ email: this.email, errors: this.errors }, 'Invalid user');
      return this;
    }
  }

  // Save the changes made to the User
  async update(context: MyContext): Promise<User> {
    if (await this.isValid()) {
      if (this.id) {
        const original = await User.findById('User.update', context, this.id);
        // If the user changed their affiliationId
        if (original.affiliationId !== this.affiliationId) {
          // If the user is an ADMIN then demote them to RESEARCHER
          if (this.role === UserRole.ADMIN) {
            const msg = `User.update Admin changed affiliation so their role must change to Researcher`;
            formatLogMessage(context).info({ userId: this.id, email: this.email }, msg);
            this.role = UserRole.RESEARCHER;
          }

          // Their ssoId will no longer be applicable (unless they are SUPERADMIN)
          if (this.role !== UserRole.SUPERADMIN) {
            this.ssoId = null;
          }
        }

        // Don't allow password changes here
        await User.update(context, this.tableName, this, 'User.update', ['password']);
        return await User.findById('User.update', context, this.id);
      }
      // This user has never been saved before so we cannot update it!
      this.addError('general', 'User has never been saved');
    }
    return new User(this);
  }

  // Function to update the user's password
  async updatePassword(
    context: MyContext,
    oldPassword: string,
    newPassword: string
  ): Promise<User> {
    const ref = 'User.updatePassword';
    // First make sure the current password is valid
    const validPassword = await User.authCheck(ref, context, this.email, oldPassword);
    if (validPassword) {
      this.password = newPassword;
      if (this.validatePassword()) {
        this.password = await this.hashPassword(newPassword);

        const updated = await User.update(context, this.tableName, this, 'User.updatePassword');
        if (updated) {
          return await User.findById('updatePassword resolver', context, this.id);
        }
      }
      // The new password was invalid, so return the object with errors
      return new User(this);
    }
    return null;
  }
}

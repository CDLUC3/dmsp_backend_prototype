import bcrypt from 'bcryptjs';
import {capitalizeFirstLetter, formatORCID, getCurrentDate, isNullOrUndefined, validateEmail} from '../utils/helpers';
import { buildContext } from '../context';
import { logger, prepareObjectForLogs } from '../logger';
import { MySqlModel } from './MySqlModel';
import { MyContext } from '../context';
import { generalConfig } from '../config/generalConfig';
import { defaultLanguageId, supportedLanguages } from './Language';
import { UserEmail } from './UserEmail';
import { PaginatedQueryResults, PaginationOptions, PaginationOptionsForCursors, PaginationOptionsForOffsets, PaginationType } from '../types/general';

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
  // public email: string;  // TODO: Remove this line once all references to email are removed
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
  public failed_sign_in_attempts?: number;

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

    // this.email = options.email; // TODO: Remove this line once all references to email are removed
    this.password = options.password;
    this.role = options.role;
    this.givenName = options.givenName;
    this.surName = options.surName;
    this.orcid = options.orcid;
    this.ssoId = options.ssoId;
    this.affiliationId = options.affiliationId;
    this.acceptedTerms = options.acceptedTerms;
    this.languageId = options.languageId ?? defaultLanguageId;
    this.failed_sign_in_attempts = options.failed_sign_in_attempts ?? 0;
    this.locked = options.locked ?? false;
    this.active = options.active ?? true;
    this.notify_on_comment_added = options.notify_on_comment_added ?? true;
    this.notify_on_template_shared = options.notify_on_template_shared ?? true;
    this.notify_on_feedback_complete = options.notify_on_feedback_complete ?? true;
    this.notify_on_plan_shared = options.notify_on_plan_shared ?? true;
    this.notify_on_plan_visibility_change = options.notify_on_plan_visibility_change ?? true;

    this.prepForSave();
  }

  // Async getter for primary email
  public async getEmail(context: MyContext): Promise<string | null> {
    const primaryEmail = await UserEmail.findPrimaryByUserId('User.getEmail', context, this.id);
    return primaryEmail ? primaryEmail.email : null;
  }


  // Ensure data integrity
  prepForSave() {
    // this.email = this.email?.trim()?.replace('%40', '@'); // TODO: Remove this line once all references to email are removed
    // I think is is already independently checked in UserEmail to fit the format of an email address
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

    // TODO: We probably don't want to validate the email here.  It is in a separate table
    // and validates there.  If we require an email to save the User then we have
    // a problem since the user needs to be created so we have the primary id for the
    // foreign key in the UserEmail table.

    // if (!validateEmail(email)) this.addError('email', 'Invalid email address');
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
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(generalConfig.bcryptSaltRounds);
    return await bcrypt.hash(password, salt);
  }

  // Find the User by their email for an Auth check (includes the password)
  static async authCheck(
    reference: string,
    context: MyContext,
    email: string,
    password: string,
  ): Promise<number | null> {
    const userEmails = await UserEmail.findByEmail(reference, context, email);

    const userEmail = userEmails[0];

    if (!userEmail || (!userEmail.isPrimary && !userEmail.isConfirmed)) {
      context.logger.debug(`No primary or confirmed UserEmail found for ${email}`);
      return null;
    }

    const user = await User.findById(reference, context, userEmail.userId);

    // If the user was found, check the password
    // TODO: Add logic to lock the account after too many failures

      // Otherwise check the password
      if (user && await bcrypt.compare(password, user.password)) {
        context.logger.debug(`Successful authCheck for ${email}`);
        return user.id;
      }

    context.logger.debug(`Failed authCheck for ${email}`);
    return null;
  }

  // Find the User by their id
  static async findById(reference: string, context: MyContext, userId: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';

    const results = await User.query(context, sql, [userId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new User(results[0]) : null;
  }

  // Find the User by their email address
  static async findByEmail(reference: string, context: MyContext, email: string): Promise<User | null> {
    const emails = await UserEmail.findByEmail(reference, context, email);
    if (!emails || emails.length === 0) return null;

    return await User.findById(reference, context, emails[0].userId);
  }

  // Return all the Users associated with the specified affiliationId that match the search term
  static async findByAffiliationId(
    reference: string,
    context: MyContext,
    affiliationId: string,
    term: string,
    options: PaginationOptions = User.getDefaultPaginationOptions(),
  ): Promise<PaginatedQueryResults<User>> {
    const whereFilters = ['u.affiliationId = ?'];
    const values = [affiliationId];

    // Handle the incoming search term
    const searchTerm = (term ?? '').toLowerCase().trim();
    if (searchTerm) {
      whereFilters.push(`(
        (LOWER(u.givenName) LIKE ? OR
        LOWER(u.surName) LIKE ? OR
        LOWER(ue.email) LIKE ? OR
        LOWER(u.orcid) LIKE ?))`);
      values.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Join users with user_emails
    const sqlStatement = `
    SELECT u.* FROM users u
    LEFT JOIN userEmails ue ON u.id = ue.userId AND ue.isPrimary = 1
  `;

    // Determine the type of pagination being used
    let opts;
    if (options.type === PaginationType.OFFSET) {
      opts = {
        ...options,
        // Specify the fields available for sorting
        availableSortFields: ['u.surName', 'u.givenName', 'u.created', 'ue.email', 'u.orcid'],
      } as PaginationOptionsForOffsets;
    } else {
      opts = {
        ...options,
        // Specify the field we want to use for the cursor (should typically match the sort field)
        cursorField: 'CONCAT(ue.email, u.id)',
      } as PaginationOptionsForCursors;
    }

    // Set the default sort field and order if none was provided
    if (isNullOrUndefined(opts.sortField)) opts.sortField = 'u.created';
    if (isNullOrUndefined(opts.sortDir)) opts.sortDir = 'DESC';

    // Specify the field we want to use for the count
    opts.countField = 'u.id';

    const response: PaginatedQueryResults<User> = await User.queryWithPagination(
      context,
      sqlStatement,
      whereFilters,
      '',
      values,
      opts,
      reference,
    );

    context.logger.debug(prepareObjectForLogs({ options, response }), reference);
    return response;
  }

  static async search(
    reference: string,
    context: MyContext,
    term: string,
    options: PaginationOptions = User.getDefaultPaginationOptions(),
  ): Promise<PaginatedQueryResults<User>> {
    const whereFilters = [];
    const values = [];

    // Handle the incoming search term
    const searchTerm = (term ?? '').toLowerCase().trim();
    if (searchTerm) {
      whereFilters.push(`(
        LOWER(u.givenName) LIKE ? OR
        LOWER(u.surName) LIKE ? OR
        LOWER(ue.email) LIKE ? OR
        LOWER(u.orcid) LIKE ? OR
        LOWER(a.searchName) LIKE ?)`);
      values.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Determine the type of pagination being used
    let opts;
    if (options.type === PaginationType.OFFSET) {
      opts = {
        ...options,
        // Specify the fields available for sorting
        availableSortFields: ['u.surName', 'u.givenName', 'u.created', 'u.email', 'u.orcid'],
      } as PaginationOptionsForOffsets;
    } else {
      opts = {
        ...options,
        // Specify the field we want to use for the cursor (should typically match the sort field)
        cursorField: 'CONCAT(u.email, u.id)',
      } as PaginationOptionsForCursors;
    }

    // Set the default sort field and order if none was provided
    if (isNullOrUndefined(opts.sortField)) opts.sortField = 'u.created';
    if (isNullOrUndefined(opts.sortDir)) opts.sortDir = 'DESC';

    // Specify the field we want to use for the count
    opts.countField = 'u.id';

    // Join users with user_emails
    const sqlStatement = `
    SELECT u.* FROM users u
                      LEFT JOIN affiliations a ON u.affiliationId = a.uri
                      LEFT JOIN userEmails ue ON u.id = ue.userId AND ue.isPrimary = 1
  `;

    const response: PaginatedQueryResults<User> = await User.queryWithPagination(
      context,
      sqlStatement,
      whereFilters,
      '',
      values,
      opts,
      reference,
    )

    context.logger.debug(prepareObjectForLogs({ options, response }), reference);
    return response;
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
    context.logger.error(`recordSignIn failed for user ${this.id}`);
    return false;
  }

  // Login making sure that the passwords match
  async login(context: MyContext, email: string): Promise<User> {
    this.prepForSave();

    // Validate the email and password
    if (!validateEmail(email) || !this.validatePassword()) {
      return null;
    }

    try {
      const userId = await User.authCheck('User.login', context, email, this.password);
      context.logger.debug(prepareObjectForLogs({ userId }), 'User.login');
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
      context.logger.error(prepareObjectForLogs({ err, email: email }), 'Error logging in User');
      return null;
    }
  }

  // Register the User if the data is valid
  async register(context: MyContext, email: string): Promise<User> {
    this.prepForSave();
    // We must save the email after the user is created so that we can add the
    // foreign key to the UserEmail table that is generated by the User, but we
    // could still check the format in here.

    if (!validateEmail(email)) {
      this.addError('email', 'Invalid email address');
    }

    // Make sure the account does not already exist
    const existing = await UserEmail.findByEmail('User.register', context, email);
    if (Array.isArray(existing) && existing.length > 0) {
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
        // TODO: this needs different logic for the email insertion
        const sql = `INSERT INTO users \
                      (password, role, givenName, surName, affiliationId, acceptedTerms) \
                     VALUES(?, ?, ?, ?, ?, ?)`;
        const vals = [this.password, this.role, this.givenName, this.surName, this.affiliationId, this.acceptedTerms];
        const context = buildContext(logger);
        context.logger.debug(prepareObjectForLogs({ email: email }), 'User.register');
        const result = await User.query(context, sql, vals, 'User.register');

        if (!Array.isArray(result) || !result[0].insertId) {
          this.addError('general', 'Unable to register your account');
          return this;
        }
        context.logger.debug(
          prepareObjectForLogs({ email: email, userId: result[0].insertId }),
          'User was created'
        );

        // Fetch the new record
        const user = await User.findById('User.register', context, result[0].insertId);

        // Update the user's createdById and modifiedById to indicate themselves
        const sqlUpdate = `UPDATE users SET createdById = ?, modifiedById = ? WHERE id = ?`;
        const valsUpdate = [user.id.toString(), user.id.toString(), user.id.toString()];
        await User.query(context, sqlUpdate, valsUpdate, 'User.register');

        // Add the email to the UserEmail table and send out a 'please confirm' email
        const userEmail = new UserEmail({ userId: user.id, email: email, isPrimary: true });
        if (!await userEmail.create(context)){
          context.logger.error(prepareObjectForLogs({ userEmail }), 'user.register - unable to add UserEmail');
        }

        return user;
      } catch (err) {
        context.logger.error(prepareObjectForLogs({ err, email: email }), 'Error creating User');
        return null;
      }
    } else {
      context.logger.debug(prepareObjectForLogs({ email: email, errors: this.errors }), 'Invalid user');
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
            context.logger.info(prepareObjectForLogs({ userId: this.id }), msg);
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
    newPassword: string,
    email: string
  ): Promise<User> {
    const ref = 'User.updatePassword';
    // First make sure the current password is valid

    const validPassword = await User.authCheck(ref, context, email, oldPassword);
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

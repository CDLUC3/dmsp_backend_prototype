import bcrypt from 'bcryptjs';
import { capitalizeFirstLetter, validateEmail, validateURL } from '../utils/helpers';
import { buildContext } from '../context';
import { logger, formatLogMessage } from '../logger';
import { MySqlModel } from './MySqlModel';
import { MyContext } from '../context';
import { generalConfig } from '../config/generalConfig';
import { defaultLanguageId, supportedLanguages } from './Language';

export enum UserRole {
  RESEARCHER = 'RESEARCHER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export class User extends MySqlModel {
  public email: string;
  public password: string;
  public role: UserRole;
  public givenName?: string;
  public surName?: string;
  // TODO: Make this required once we build out the signup page
  public affiliationId?: string;
  public acceptedTerms: boolean;
  public orcid?: string;
  public languageId: string;

  // Initialize a new User
  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.email = options.email;
    this.password = options.password;
    this.role = options.role;
    this.givenName = options.givenName;
    this.surName = options.surName;
    this.orcid = options.orcid;
    // TODO: Remove this hard-coded UCOP default once we build out the signup page
    this.affiliationId = options.affiliationId || 'https://ror.org/00dmfq477';
    this.acceptedTerms = options.acceptedTerms;
    this.languageId = options.languageId || defaultLanguageId;

    this.cleanup();
  }

  // Ensure data integrity
  cleanup() {
    this.email = this.email?.trim()?.replace('%40', '@');
    this.role = this.role || UserRole.RESEARCHER;
    this.givenName = capitalizeFirstLetter(this.givenName);
    this.surName = capitalizeFirstLetter(this.surName);
    // Set the languageId to the default if it is not a supported language
    if (!supportedLanguages.map((l) => l.id).includes(this.languageId)){
      this.languageId = defaultLanguageId;
    }
  }

  // Verify that the email does not already exist and that the required fields have values
  async isValid(): Promise<boolean> {
    await super.isValid();

    // check if email is already taken
    const context = buildContext(logger);
    const existing = await User.findByEmail('User.isValid', context, this.email);

    if (existing) {
      this.errors.push('Email address already in use');
    } else {
      if (!validateEmail(this.email)) {
        this.errors.push('Invalid email address');
      }
      if (!this.password) {
        this.errors.push('Password is required');
      } else {
        this.validatePassword();
      }
      if (!validateURL(this.affiliationId)) {
        this.errors.push('Affiliation can\'t be blank');
      }
      if (!this.role) {
        this.errors.push('Role can\'t be blank');
      }
    }
    return this.errors.length <= 0;
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
    this.errors.push(`Invalid password format.
        Passwords must be greater than 8 characters, and contain at least
        one number,
        one upper case letter,
        one lower case letter, and
        one of the following special character (\`, !, @, #, $, %, ^, &, *, -, _, =, +, ?, ~)`);
    return false;
  }

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
        formatLogMessage(context.logger).debug(`Successful authCheck for ${email}`);
        return users[0].id;
      }
    }

    formatLogMessage(context.logger).debug(`Failed authCheck for ${email}`);
    return null;
  }

  // Find the User by their Id
  static async findById(reference: string, context: MyContext, userId: number): Promise<User> {
    const sql = 'SELECT id, email, givenName, surName, role, affiliationId, acceptedTerms, languageId, created, modified \
                 FROM users WHERE id = ?';
    const results = await User.query(context, sql, [userId.toString()], reference);
    return results[0];
  }

  // Find the User by their email address
  static async findByEmail(reference: string, context: MyContext, email: string): Promise<User> {
    const sql = 'SELECT id, email, givenName, surName, role, affiliationId, acceptedTerms, languageId, created, modified \
                 FROM users WHERE email = ?';
    const results = await User.query(context, sql, [email], reference);
    return results[0];
  }

  static async findByAffiliationId(reference: string, context: MyContext, affiliationId: string): Promise<User[]> {
    const sql = 'SELECT id, givenName, surName, email, role, affiliationId, acceptedTerms, languageId, created, modified \
                 FROM users WHERE affiliationId = ? ORDER BY created DESC';
    return await User.query(context, sql, [affiliationId], reference);
  }

  // Login making sure that the passwords match
  async login(): Promise<User> {
    this.cleanup();

    if (!validateEmail(this.email) || !this.validatePassword()) {
      return null;
    }

    try {
      const context = buildContext(logger);
      formatLogMessage(logger)?.debug(`User.login: ${this.email}`);
      const userId = await User.authCheck('User.login', context, this.email, this.password);

      if (userId) {
        return await User.findById('User.login', context, userId) || null;
      }
      return null;
    } catch (err) {
      formatLogMessage(logger).error(`Error logging in User: ${this.email} - ${err.message}`);
      return null;
    }
  }

  // Register the User if the data is valid
  async register(): Promise<User> {
    this.cleanup();
    await this.isValid();

    if (this.errors.length === 0) {
      const passwordHash = await this.hashPassword(this.password);
      this.password = passwordHash

      try {
        const sql = `INSERT INTO users \
                      (email, password, role, givenName, surName, affiliationId, acceptedTerms) \
                     VALUES(?, ?, ?, ?, ?, ?, ?)`;
        const vals = [this.email, this.password, this.role, this.givenName, this.surName, this.affiliationId, this.acceptedTerms];
        const context = buildContext(logger);
        formatLogMessage(logger)?.debug(`User.register: ${this.email}`);
        const result = await User.query(context, sql, vals, 'User.register');

        if (!Array.isArray(result) || !result[0].insertId) {
          this.errors.push('Unable to register your account.');
          return this;
        }
        formatLogMessage(logger).debug(`User was created: ${this.email}, id: ${result[0].insertId}`);

        // Fetch the new record and blank out the password when returning so as not to expose it
        const user = await User.findById('User.register', context, result[0].insertId);
        // Remove the password! No need to expose that to the caller
        user.password = null;

        return user;
      } catch (err) {
        formatLogMessage(logger)?.error(`Error creating User: ${this.email} - ${err.message}`);
        return null;
      }
    } else {
      formatLogMessage(logger)?.debug(`Invalid user: ${this.email}`);
      return this;
    }
  }
}

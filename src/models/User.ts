import bcrypt from 'bcryptjs';
import { MySQLDataSource } from '../datasources/mySQLDataSource';
import { capitalizeFirstLetter, validateEmail, validateURL } from '../utils/helpers';
import { buildContext } from '../context';
import { Falsey } from 'oauth2-server';
import { logger, formatLogMessage } from '../logger';
import { MySqlModel } from './MySqlModel';
import { MyContext } from '../context';

export enum UserRole {
  Researcher = 'Researcher',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
}
export class User extends MySqlModel {
  public email: string;
  public password: string;
  public role: UserRole;
  public givenName?: string;
  public surName?: string;
  public affiliationId: string;
  public orcid?: string;

  // Initialize a new User
  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.id = options.id;
    this.email = options.email;
    this.password = options.password;
    this.role = options.role;
    this.givenName = options.givenName;
    this.surName = options.surName;
    this.orcid = options.orcid;
    this.affiliationId = options.affiliationId;
    this.errors = [];

    this.cleanup();
  }

  // Ensure data integrity
  cleanup() {
    this.email = this.email?.trim()?.replace('%40', '@');
    this.role = this.role || UserRole.Researcher;
    this.givenName = capitalizeFirstLetter(this.givenName);
    this.surName = capitalizeFirstLetter(this.surName);
  }

  // Verify that the email does not already exist and that the required fields have values
  async isValid(): Promise<boolean> {
    super.isValid();

    // check if email is already taken
    const context = await buildContext(logger);
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
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Find the User by their Id
  static async findById(reference: string, context: MyContext, userId: number): Promise<User | null> {
    const sql = 'SELECT id, email, givenName, surName, role, affiliationId, created, modified \
                 password FROM users WHERE id = ?';
    const results = await User.query(context, sql, [userId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Find the User by their email address
  static async findByEmail(reference: string, context: MyContext, email: string): Promise<User | null> {
    const sql = 'SELECT id, email, givenName, surName, role, affiliationId, created, modified \
                 FROM users WHERE email = ?';
    const results = await User.query(context, sql, [email], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  static async findByAffiliationId(reference: string, context: MyContext, affiliationId: string): Promise<User[] | null> {
    const sql = 'SELECT id, givenName, surName, email, role, affiliationId, created, modified \
                 FROM users WHERE affiliationId = ? ORDER BY created DESC';
    return await User.query(context, sql, [affiliationId], reference);
  }

  // Login making sure that the passwords match
  async login(): Promise<User | Falsey> {
    this.cleanup();
    const email = this.email || '';

    if (!validateEmail(email) || !this.validatePassword()) {
      return null;
    }

    try {
      formatLogMessage(logger)?.debug(`User.login: ${this.email}`);
      const context = await buildContext(logger);
      const user = await User.findByEmail('User.login', context, email) || null;
      if (user && await bcrypt.compare(this.password, user?.password)) {
        return user;
      }
      return null;
    } catch (err) {
      formatLogMessage(logger).error(`Error logging in User: ${this.email} - ${err.message}`);
      return null;
    }
  }

  // Register the User if the data is valid
  async register(): Promise<User | Falsey> {
    this.cleanup();
    await this.isValid();

    if (this.errors.length === 0) {
      const passwordHash = await this.hashPassword(this.password);
      this.password = passwordHash

      const mysql = MySQLDataSource.getInstance();
      const sql = 'INSERT INTO users (email, password, role, givenName, surName) VALUES(?,?,?,?,?)';
      formatLogMessage(logger)?.debug(`User.register: ${this.email}`);
      try {
        const vals = [this.email, this.password, this.role, this.givenName, this.surName]
        const result = await mysql.query(sql, vals);

        logger.debug(`User was created: ${this.email}, id: ${result.insertId}`);
        const context = await buildContext(logger);
        const user = await User.findById('User.register', context, result.insertId);
        // Blank out the password when returning so as not to expose it
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

import bcrypt from 'bcryptjs';
import { MySQLDataSource } from '../datasources/mySQLDataSource';
import { capitalizeFirstLetter, validateEmail } from '../utils/helpers';
import { Falsey } from 'oauth2-server';
import { logger, formatLogMessage } from '../logger';

export enum UserRole {
  Researcher = 'Researcher',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
}

export class User {
  // NOTE: If you are copying this model as the basis for a new one, the inclusion of
  //       the MySQLDataSource is unusual here. Normally the datasources are passed
  //       through by the Apollo server context to a resolver. The resolver performs
  //       necessary queries NOT the model.
  //
  //       Since Users are also involved with our non-GraphQL endpoints, we need to bring
  //       the datasource in here so we can query for sign in/up tasks.
  private mysql: MySQLDataSource;

  public id?: number;
  public email: string;
  public password: string;
  public role: UserRole;
  public givenName?: string;
  public surName?: string;
  public affiliationId: string;
  public orcid?: string;
  public created: string;
  public modified: string;
  public errors: string[];

  // Initialize a new User
  constructor(options) {
    this.mysql = MySQLDataSource.getInstance();
    this.id = options.id;
    this.email = options.email;
    this.password = options.password;
    this.role = options.role;
    this.givenName = options.givenName;
    this.surName = options.surName;
    this.orcid = options.orcid;
    this.affiliationId = options.affiliationId;
    this.created = options.created || new Date().toUTCString();
    this.modified = options.modified || new Date().toUTCString();
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
  async validateNewUser(): Promise<boolean> {
    // check if email is already taken
    const existing = await User.findByEmail(this.email);

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
    }

    return this.errors.length === 0;
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
  static async findById(userId: string): Promise<User> {
    const mysql = MySQLDataSource.getInstance();
    const sql = 'SELECT id, email, givenName, surName, role, affiliationId, created, modified \
                 FROM users WHERE id = ?';
    formatLogMessage(logger)?.debug(`User.findById: ${userId}`);
    try {
      const [rows] = await mysql.query(sql, [userId]);
      return rows?.id ? new User(rows) : null;
    } catch (err) {
      formatLogMessage(logger, { err })?.error(`Error trying to find User by id ${userId}`);
      throw err;
    }
  }

  // Find the User by their email address
  static async findByEmail(email: string): Promise<User | null> {
    const mysql = MySQLDataSource.getInstance();
    const sql = 'SELECT id, email, givenName, surName, role, affiliationId, created, modified \
                from users where email = ?';

    formatLogMessage(logger)?.debug(`User.findByEmail: ${email}`);
    try {
      const [rows] = await mysql.query(sql, [email]);
      return rows?.id ? new User(rows) : null;
    } catch (err) {
      formatLogMessage(logger, { err })?.error(`Error trying to find User by email: ${email}`);
      throw err;
    }
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
      const user = await User.findByEmail(email) || null;
      if (user && await bcrypt.compare(this.password, user?.password)) {
        return user;
      }
      return null;
    } catch (err) {
      formatLogMessage(logger, { err })?.error(`Error logging in User: ${this.email}`);
      return null;
    }
  }

  // Register the User if the data is valid
  async register(): Promise<User | Falsey> {
    this.cleanup();
    await this.validateNewUser();

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
        return await User.findById(result.insertId);
      } catch (err) {
        formatLogMessage(logger, { err })?.error(`Error creating User: ${this.email}`);
        return null;
      }
    } else {
      formatLogMessage(logger)?.debug(`Invalid user: ${this.email}`);
      return this;
    }
  }
}

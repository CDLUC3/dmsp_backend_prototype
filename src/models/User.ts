import bcrypt from 'bcryptjs';
import { MySQLDataSource } from '../datasources/mySQLDataSource';
import { capitalizeFirstLetter, validateEmail } from '../utils/helpers';
import { Falsey } from 'oauth2-server';

// TODO: Is this the right place to create our Pool?
// const mysql = new MysqlDataSource({ config: mysqlConfig });

export enum UserRole {
  Researcher = 'RESEARCHER',
  Admin = 'ADMIN',
  Super = 'SUPER_ADMIN',
}

export class User {
  private mysql: MySQLDataSource;

  public id?: number;
  public email: string;
  public password: string;
  public role: UserRole;
  public givenName?: string;
  public surName?: string;
  public orcid?: string;
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
    this.errors = [];

    this.cleanup();
  }

  // Ensure data integrity
  cleanup() {
    this.email = this.email?.trim();
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
      if (!this.role) { // This will never happen because of the default role assigned in cleanup()
        this.errors.push('Invalid role');
      }
      if (!validateEmail(this.email)) {
        this.errors.push('Invalid email address');
      }
      if (!this.password) {
        this.errors.push('Password is required');
      }

      this.validatePassword();
    }

    return this.errors.length === 0;
  }

  // Validate the password format
  validatePassword(): boolean {
    console.log("***STARTING VALIDATE PASSWORD")
    const specialCharsRegex = /[`!@#$%^&*_+\-=?~\s]/;
    const badSpecialCharsRegex = /[\(\)\{\}\[\]\|\\:;"'<>,\.\/]/

    // Test the string against the regular expression
    if (
      this.password.length >= 8 &&
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
    return true;
  }

  // Find the User by their Id
  static async findById(userId: string): Promise<User | Falsey> {
    const mysql = MySQLDataSource.getInstance();
    const sql = 'SELECT * FROM users WHERE id = ?';
    try {
      const [rows] = await mysql.query(sql, [userId]);
      return rows.length === 0 ? null : new User(rows[0]);
    } catch (err) {
      console.error('Error trying to find User by id');
      throw err;
    }
  }

  // Find the User by their email address
  static async findByEmail(email: string): Promise<User | Falsey> {
    const mysql = MySQLDataSource.getInstance();
    const sql = 'SELECT * from users where email = ?';
    try {
      const [rows] = await mysql.query(sql, [email]);
      return rows?.length === 0 ? null : new User(rows[0]);
    } catch (err) {
      console.log('Error trying to find User by email');
      throw err;
    }
  }

  // Login making sure that the passwords match
  async login(): Promise<User | Falsey> {
    this.cleanup();
    const email = this.email || '';
    if (!validateEmail(email) || !this.validatePassword()) {
      console.log(`Invalid login credentials email: ${email}`);
      throw new Error('Invalid email and or password!');
    }

    try {
      const user = await User.findByEmail(email);
      if (user && bcrypt.compareSync(this.password, user.password)) {
        return user;
      }
      return null;
    } catch (err) {
      console.error(`Error logging in User: ${this.email}`);
      throw err;
    }
  }

  // Register the User if the data is valid
  async register(): Promise<User | Falsey> {
    this.cleanup();
    this.validateNewUser();

    if (this.errors.length === 0) {
      const salt = bcrypt.genSaltSync(10);
      this.password = bcrypt.hashSync(this.password, salt);

      const sql = 'INSERT INTO users (email, password, role, givenName, surName) VALUES(?,?,?,?,?)';
      const vals = [this.email, this.password, this.role, this.givenName, this.surName]
      try {
        const result = await this.mysql.query(sql, vals);
        console.log(`User was created: ${this.email}, id: ${result.insertId}`);
        return await User.findById(result.insertId);
      } catch (err) {
        console.log(`Error creating User: ${this.email}`, err)
        throw err;
      }
    } else {
      console.log(`Invalid user: ${this.email}`);
      throw new Error(this.errors.join(', '))
    }
  }
}

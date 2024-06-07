import bcrypt from 'bcryptjs';
import { mysqlConfig } from '../config/mysqlConfig';
import { MysqlDataSource } from '../datasources/mysqlDB';
import { validateEmail } from '../helpers';
import { generalConfig } from '../config/generalConfig';

// TODO: Is this the right place to create our Pool?
const mysql = new MysqlDataSource({ config: mysqlConfig });

export enum UserRole {
  Researcher = 'RESEARCHER',
  Admin = 'ADMIN',
  Super = 'SUPER_ADMIN',
}

export class User {
  public id?: number;
  public email: string;
  public password: string;
  public role: UserRole;
  public givenName?: string;
  public surName?: string;
  public errors: string[];

  // Initialize a new User
  constructor(options) {
    this.id = options.id;
    this.email = options.email;
    this.password = options.password;
    this.role = options.role;
    this.givenName = options.givenName;
    this.surName = options.surName;
    this.errors = [];
    this.cleanup();
  }

  // Ensure data integrity
  cleanup() {
    this.email = this.email.toLowerCase().trim();
    this.role = this.role || UserRole.Researcher;
    this.givenName = this.givenName?.trim();
    this.surName = this.surName?.trim();
  }

  // Verify that the email does not already exist and that the required fields have values
  async validate(): Promise<boolean> {
    // check if email is already taken
    const existing = await User.findByEmail(this.email);
    if (existing) {
      this.errors.push('Email address already in use');
      return false;
    } else if (!this.role) {
      this.errors.push('Invalid role');
      return false;
    } else if (!validateEmail(this.email)) {
      this.errors.push('Invalid email address');
      return false;
    } else if (!this.password) {
      this.errors.push('Password is required');
      return false;
    }
    return true;
  }

  // Find the User by their Id
  static async findById(userId: string): Promise<User | null> {
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
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * from users where email = ?';
    try {
      const [rows] = await mysql.query(sql, [email]);
      return rows.length === 0 ? null : new User(rows[0]);
    } catch (err) {
      console.error('Error trying to find User by email');
      throw err;
    }
  }

  // Login making sure that the passwords match
  async login(): Promise<boolean> {
    this.cleanup();
    const email = this.email || '';
    try {
      const user = await User.findByEmail(email);
      if (user && bcrypt.compareSync(this.password, user.password)) {
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Error logging in User: ${this.email}`);
      throw err;
    }
  }

  // Register the User if the data is valid
  async register(): Promise<boolean> {
    this.cleanup();
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, generalConfig.salt);

    const sql = 'INSERT INTO users (email, password, role, givenName, surName) VALUES(?,?,?,?,?)';
    const vals = [this.email, this.password, this.role, this.givenName, this.surName]
    try {
      if (this.validate()) {
        const [result] = await mysql.query(sql, vals);
        console.log(`User was created: ${this.email}, id: ${result.insertId}`);
        return true;
      }
      return false;
    } catch (err) {
      console.log(`Error creating User: ${this.email}`, err)
      throw err;
    }
  }


}

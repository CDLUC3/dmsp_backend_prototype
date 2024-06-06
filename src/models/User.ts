import bcrypt from 'bcryptjs';
import { createConnection } from '../db';

// TODO: UPdate this to use the datasource defined and the connection pool

interface UserData {
  email?: string;
  password?: string;

  givenName?: string;
  surName?: string;
}

class User {
  data: UserData;
  errors: string[];

  constructor(data: UserData) {
    this.data = data;
    this.errors = [];
  }

  cleanup() {
    this.data = {
      email: this.data.email.trim().toLowerCase(),
      password: this.data.password
    }
  }

  validate() {
    // check if username is already taken

  }

  async login(): Promise<boolean> {
    this.cleanup();
    const connection = await createConnection();
    const query = 'SELECT * from users where email = ?';
    const email = this.data.email || '';
    try {
      const [rows] = await connection.query(query, [email]);

      if (rows && bcrypt.compareSync(this.data.password, rows[0].password)) {
        this.data = rows[0];
        console.log("Its a match")
      } else {
        throw new Error("Login did not work. Try again")
      }
      return rows[0];
    } catch (err) {
      console.error('Please try again later');
      throw err;
    } finally {
      await connection.end();
    }
  }

  async register(): Promise<boolean> {
    this.cleanup();
    let salt = bcrypt.genSaltSync(10);
    this.data.password = bcrypt.hashSync(this.data.password, salt);

    const connection = await createConnection();
    const query = 'INSERT INTO users (email, password) VALUES(?,?)';
    const email = this.data.email || '';
    const password = this.data.password || '';


    try {
      const [result] = await connection.query(query, [email, password]);
      console.log('User data was inserted: ', (result as any).insertId)
      return true;
    } catch (err) {
      console.log('Error inserting user data: ', err)
      throw err;
    } finally {
      await connection.end();
    }
  }
}

export default User;
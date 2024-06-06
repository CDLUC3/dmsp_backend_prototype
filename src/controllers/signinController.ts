import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../services/tokenService';

import { mysqlConfig } from '../config/mysqlConfig';
import { MysqlDataSource } from '../datasources/mysqlDB';

const mysql = new MysqlDataSource({ config: mysqlConfig });

export const signinController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // TODO: Consider moving this to the User model
    const [users] = await mysql.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = new User(users[0]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.data.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

import { Request, Response } from 'express';
import { logger, formatLogMessage } from '../logger';
import { User } from '../models/User';
import { generateToken } from '../services/tokenService';

export const signinController = async (req: Request, res: Response) => {
  let user = new User(req.body);
  try {
    user = await user.login() || null;

    if (user) {
      const token = generateToken(user);
      if (token) {
        res.status(200).json({ success: true, token });
      } else {
        throw new Error('Login failed');
      }

    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    formatLogMessage(logger, { err }).error('Signin error')
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

import { Request, Response } from 'express';
import { logger, formatLogMessage } from '../logger';
import { User } from '../models/User';
import { generateToken } from '../services/tokenService';

export const signupController = async (req: Request, res: Response) => {
  let user: User = new User(req.body);
  try {
    user = await user.register() || null;

    if (user) {
      if (user.errors?.length >= 1) {
        res.status(400).json({ success: false, message: user.errors?.join('| ') });
      } else {
        const token = generateToken(user);

        if (token) {
          res.status(200).json({ success: true, token });
        } else {
          throw new Error('Signup failed');
        }
      }
    } else {
      res.status(500).json({ success: false, message: 'Unable to create the account at this time.' });
    }
  } catch (err) {
    formatLogMessage(logger, { msg: `Signup error. userId: ${user.id}, error: ${err?.message}` });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

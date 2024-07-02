import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../services/tokenService';

export const signinController = async (req: Request, res: Response) => {
  let user = new User(req.body);
  try {
    user = await user.login() || null;

console.log(user)

    if (user) {
      const token = generateToken(user);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.log('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

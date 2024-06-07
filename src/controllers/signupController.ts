import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../services/tokenService';

export const signupController = async (req: Request, res: Response) => {
  const user = new User(req.body);
  try {
    const success = await user.register();
    if (success) {
      const token = generateToken(user);
      res.json({ success: true, token })
    }
    res.status(400).json({ success: false, message: user.errors.join(', ') });
  } catch (err) {
    console.log('Signup error:', err)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
};

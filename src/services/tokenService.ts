import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// TODO: Define a JWT_SECRET env variable

// Generate a JWT Token for the given User
export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.data.id, email: user.data.email, role: user.data.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );
};

// Verify the incoming JWT
export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

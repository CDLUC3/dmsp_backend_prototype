import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { generalConfig } from '../config/generalConfig';

// Generate a JWT Token for the given User
export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role.toString },
    generalConfig.jwtSecret as string,
    { expiresIn: '1h' }
  );
};

// Verify the incoming JWT
export const verifyToken = (token: string): any => {
  return jwt.verify(token, generalConfig.jwtSecret as string);
};

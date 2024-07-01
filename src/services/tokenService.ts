import jwt, { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'pino';
import { formatLogMessage } from '../logger';
import { User } from '../models/User';
import { generalConfig } from '../config/generalConfig';
import { UserRole } from '../types';

export interface JWTToken extends JwtPayload {
  id: number,
  email: string,
  givenName: string,
  surName: string,
  role: string,
}

// Generate a JWT Token for the given User
export const generateToken = (user: User): string => {
  if (generalConfig.jwtSecret && user && user.id && user.email) {
    const payload: JWTToken = {
      id: user.id,
      email: user.email,
      givenName: user.givenName,
      surName: user.surName,
      role: user.role.toString() || UserRole.Researcher,
    }
    return jwt.sign(payload, generalConfig.jwtSecret as string, { expiresIn: generalConfig.jwtTtl });
  }
  return null;
};

// Verify the incoming JWT
export const verifyToken = (token: string, logger: Logger): JWTToken => {
  try {
    return jwt.verify(token, generalConfig.jwtSecret as string) as JWTToken;
  } catch(err) {
    if (logger) {
      formatLogMessage(logger, { err });
    }
    return null;
  }
};

import jwt, { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'pino';
import { formatLogMessage } from '../logger';
import { User } from '../models/User';
import { generalConfig } from '../config/generalConfig';

export interface JWTToken extends JwtPayload {
  id: number,
  role: string,
}

// Generate a JWT Token for the given User
export const generateToken = (user: User): string => {
  const payload: JWTToken = {
    id: user.id,
    email: user.email,
    role: user.role.toString()
  }
  return jwt.sign(payload, generalConfig.jwtSecret as string, { expiresIn: generalConfig.jwtTtl });
};

// Verify the incoming JWT
export const verifyToken = (token: string, logger: Logger): JWTToken => {
  try {
    return jwt.verify(token, generalConfig.jwtSecret as string) as JWTToken;
  } catch(err) {
    formatLogMessage(logger, { err });
  }
};

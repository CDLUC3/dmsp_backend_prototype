import jwt, { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'pino';
import { formatLogMessage, logger } from '../logger';
import { User } from '../models/User';
import { generalConfig } from '../config/generalConfig';
import { UserRole } from '../models/User';
import { AuthenticationError, DEFAULT_AUNAUTHORIZED_MESSAGE } from '../utils/graphQLErrors';

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
      affiliationId: user.affiliationId,
      role: user.role.toString() || UserRole.RESEARCHER,
    }
    try {
      return jwt.sign(payload, generalConfig.jwtSecret as string, { expiresIn: generalConfig.jwtTtl });
    } catch(err) {
      formatLogMessage(logger).error(err, `generateToken error - ${err.message}`);
    }
  }
  return null;
};

// Verify the incoming JWT
export const verifyToken = (token: string, logger: Logger): JWTToken => {
  try {
    return jwt.verify(token, generalConfig.jwtSecret as string) as JWTToken;
  } catch(err) {
    if (logger) {
      formatLogMessage(logger).error(err, `verifyToken error - ${err.message}`);
    }
    //return null;
    throw AuthenticationError(`${DEFAULT_AUNAUTHORIZED_MESSAGE} - ${err.message}`);
  }
};

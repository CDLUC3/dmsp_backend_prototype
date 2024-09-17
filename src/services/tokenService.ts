import jwt, { JwtPayload } from 'jsonwebtoken';
import { Response, Request } from "express";
import { logger, formatLogMessage } from '../logger';
import { User } from '../models/User';
import { generalConfig } from '../config/generalConfig';
import { UserRole } from '../models/User';
import { AuthenticationError, DEFAULT_INTERNAL_SERVER_MESSAGE, DEFAULT_UNAUTHORIZED_MESSAGE, InternalServerError } from '../utils/graphQLErrors';
import { Cache } from '../datasources/cache';
import { MyContext } from '../context';

export interface JWTAccessToken extends JwtPayload {
  id: number,
  email: string,
  givenName: string,
  surName: string,
  role: string,
  jti: string,
}

export interface JWTRefreshToken extends JwtPayload {
  id: number,
}

// Extracts the tokens from the HTTP headers
export const tokensFromHeaders = (req: Request): { accessToken: string, refreshToken: string } => {
  if (req?.headers) {
    const authHeader = req.headers?.authorization || null;
    const accessToken = authHeader !== null ? authHeader.split(' ')[1] : null;
    const refreshToken = req.headers['x-refresh-token']?.toString() || null;

    return { accessToken, refreshToken };
  }
  return { accessToken: null, refreshToken: null };
}

// Helper function to set a secure HTTP-only cookie
export const setTokenCookie = (res: Response, name: string, value: string, maxAge?: number): void => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'strict',
    maxAge: maxAge || generalConfig.jwtTTL,
    path: '/' // Ensure the cookie is accessible for your entire app
  });
};

// Generate an access token for the User
const generateAccessToken = (jti: string, user: User): string => {
  try {
    const payload: JWTAccessToken = {
      id: user.id,
      email: user.email,
      givenName: user.givenName,
      surName: user.surName,
      affiliationId: user.affiliationId,
      role: user.role.toString() || UserRole.RESEARCHER,
      jti,
    };

    return jwt.sign(payload, generalConfig.jwtSecret as string, { expiresIn: generalConfig.jwtTTL });
  } catch(err) {
    if (logger) {
      formatLogMessage(logger).error(err, `generateAccessToken error - ${err.message}`);
    }
    throw AuthenticationError(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${err.message}`);
  }
}

// Generate a refresh token for the User and add it to the Cache.
const generateRefreshToken = async (cache: Cache, jti: string, userId: number): Promise<string> => {
  try {
    const payload: JWTRefreshToken = { id: userId };

    const token = jwt.sign(payload, generalConfig.jwtRefreshSecret as string, { expiresIn: generalConfig.jwtRefreshTTL });
    // Add the refresh token to the Cache
    cache.adapter.set(`dmspr-${jti}`, token, { ttl: generalConfig.jwtRefreshTTL })
    return token;
  } catch(err) {
    if (logger) {
      formatLogMessage(logger).error(err, `generateRefreshToken error - ${err.message}`);
    }
    throw AuthenticationError(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${err.message}`);
  }
}

// Generate an Access Token and a Refresh Token
export const generateTokens = async (cache: Cache, user: User): Promise<{ accessToken: string; refreshToken: string }> => {
  if (generalConfig.jwtSecret && generalConfig.jwtRefreshSecret && user && user.id && user.email) {
    try {
      // Generate a unique id for the JWT
      const jti = new Date().getTime().toString();
      // Generate an Access Token
      const accessToken = generateAccessToken(jti, user);
      // Generate a Refresh Token
      const refreshToken = await generateRefreshToken(cache, jti, user.id);

      return { accessToken, refreshToken };
    } catch(err) {
      formatLogMessage(logger).error(err, 'generateTokens - unable to generate tokens');
    }
  }
  return { accessToken: null, refreshToken: null };
};

// Verify an Access Token
export const verifyAccessToken = (accessToken: string): JWTAccessToken => {
  try {
    return jwt.verify(accessToken, generalConfig.jwtSecret as string) as JWTAccessToken;
  } catch(err) {
    if (logger) {
      formatLogMessage(logger).error(err, `verifyAccessToken error - ${err.message}`);
    }
    throw AuthenticationError(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${err.message}`);
  }
};

// Verify a Refresh Token
const verifyRefreshToken = (refreshToken: string): JWTRefreshToken => {
  try {
    return jwt.verify(refreshToken, generalConfig.jwtRefreshSecret) as JWTRefreshToken;
  } catch(err) {
    if (logger) {
      formatLogMessage(logger).error(err, `verifyRefreshToken error - ${err.message}`);
    }
    throw AuthenticationError(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${err.message}`);
  }
};

// See if the access token is in the black list of revoked tokens
export const isRevokedCallback = async (_req: Express.Request, token?: jwt.Jwt): Promise<boolean> => {
  if (token && token.payload && typeof token.payload === 'object') {
    // Fetch the unique JTI from the token
    const jti = (token.payload as JwtPayload).jti;
    const cache = Cache.getInstance();

    if (jti) {
      try {
        // See if the JTI is in the black list
        const result = await cache.adapter.get(`dmspbl-${jti}`);
        if (result) {
          return true;
        }
      } catch(err) {
        formatLogMessage(logger).error(err, 'isRevokedCallback - unable to fetch token from cache');
      }
    }
  }
  return false;
};

// Refresh the Access and Refresh Tokens
export const refreshTokens = async (
  cache: Cache,
  context: MyContext,
  originalRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    // Verify the refresh token
    const verified = verifyRefreshToken(originalRefreshToken);

    // Make sure the user still exists
    if (verified?.id) {
      // TODO: We can eventually add some checks here to see if the account if locked or deactivated
      const user = await User.findById('refreshTokens', context, verified.id);
      if (user) {
        return generateTokens(cache, user);
      }
    }
    // Otherwise the tokens were invalid or something else went wrong!
    return { accessToken: null, refreshToken: null };
  } catch (err) {
    if (logger) {
      formatLogMessage(logger).error(err, `refreshTokens error - ${err.message}`);
    }
    throw AuthenticationError(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${err.message}`);
  }
};

// Invalidate the Refresh Token (e.g., on logout or token rotation)
export const revokeRefreshToken = async (cache: Cache, jti: string): Promise<boolean> => {
  try {
    return await cache.adapter.delete(`dmspr-${jti}`);
  } catch(err) {
    formatLogMessage(logger).error(err, `revokeRefreshToken unable to delete token from cache - ${err.message}`);
    throw InternalServerError(`${DEFAULT_INTERNAL_SERVER_MESSAGE} - ${err.message}`);
  }
};

export const revokeAccessToken = async (cache: Cache, jti: string): Promise<boolean> => {
  try {
    await cache.adapter.set(`dmspbl-${jti}`, '', { ttl: generalConfig.jwtTTL });
    return true;
  } catch(err) {
    formatLogMessage(logger).error(err, `revokeAccessToken unable to add token to black list - ${err.message}`);
    throw InternalServerError(`${DEFAULT_INTERNAL_SERVER_MESSAGE} - ${err.message}`);
  }
}

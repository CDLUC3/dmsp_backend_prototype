import jwt, { JwtPayload } from 'jsonwebtoken';
import { Response } from "express";
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
}

export interface JWTRefreshToken extends JwtPayload {
  id: number,
}

// Helper function to set secure cookies
export const setTokenCookie = (res: Response, name: string, value: string, maxAge?: number): void => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'strict',
    maxAge: maxAge || Number.parseInt(process.env.JWT_TTL),
    path: '/' // Ensure the cookie is accessible for your entire app
  });
};

// Generate an access token for the User
const generateAccessToken = (user: User): string => {
  try {
    const payload: JWTAccessToken = {
      id: user.id,
      email: user.email,
      givenName: user.givenName,
      surName: user.surName,
      affiliationId: user.affiliationId,
      role: user.role.toString() || UserRole.RESEARCHER,
    };

    return jwt.sign(payload, generalConfig.jwtSecret as string, { expiresIn: generalConfig.jwtTTL });
  } catch(err) {
    if (logger) {
      formatLogMessage(logger).error(err, `generateAccessToken error - ${err.message}`);
    }
    throw AuthenticationError(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${err.message}`);
  }
}

// Generate a refresh token for the User and add it to the Cache
const generateRefreshToken = async (cache: Cache, user: User): Promise<string> => {
  try {
    const payload: JWTRefreshToken = { id: user.id };

    const token = jwt.sign(payload, generalConfig.jwtRefreshSecret as string, { expiresIn: generalConfig.jwtRefreshTTL });
    // Add the refresh token to the Cache
    cache.adapter.set(`dmspr-${user.id}`, token, { ttl: generalConfig.jwtRefreshTTL })
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
      // Generate an Access Token
      const accessToken = generateAccessToken(user);
      // Generate a Refresh Token
      const refreshToken = await generateRefreshToken(cache, user);

      return { accessToken, refreshToken };
    } catch(err) {
      return { accessToken: null, refreshToken: null };
    }
  }
};

// Verify an Access Token
export const verifyAccessToken = async (cache: Cache, accessToken: string): Promise<JWTAccessToken> => {
  try {
    const verified = jwt.verify(accessToken, generalConfig.jwtSecret as string) as JWTAccessToken;

    if(verified) {
      // Check to make sure that the access token was added to the black list
      const blackListed = cache.adapter.get(`dmspbl-${accessToken}`);
      if (!blackListed) {
        return verified;
      }
      formatLogMessage(logger).warn({ message: `verifyAccessToken black listed token attempt - ${accessToken}` });
    }
    return null;
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
    return jwt.verify(refreshToken, generalConfig.jwtRefreshSecret as string) as JWTRefreshToken;
  } catch(err) {
    if (logger) {
      formatLogMessage(logger).error(err, `verifyRefreshToken error - ${err.message}`);
    }
    throw AuthenticationError(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${err.message}`);
  }
};

// Refresh the Access and Refresh Tokens
export const refreshTokens = async (
  cache: Cache,
  context: MyContext,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    // Verify the refresh token
    const originalRefreshToken = verifyRefreshToken(refreshToken);

    // Make sure the user ids match up
    if (originalRefreshToken?.id) {
      const user = await User.findById('refreshTokens', context, originalRefreshToken.id);
      if (user) {
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = await generateRefreshToken(cache, user);

        if (newAccessToken && newRefreshToken) {
          return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
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
export const revokeRefreshToken = async (cache: Cache, userId: number): Promise<boolean> => {
  try {
    return await cache.adapter.delete(`dmspr-${userId}`);
  } catch(err) {
    formatLogMessage(logger).error(err, `revokeRefreshToken unable to delete token from cache - ${err.message}`);
    throw InternalServerError(`${DEFAULT_INTERNAL_SERVER_MESSAGE} - ${err.message}`);
  }
};

export const revokeAccessToken = async (cache: Cache, accessToken: string): Promise<boolean> => {
  try {
    await cache.adapter.set(`dmspbl-${accessToken}`, accessToken, { ttl: generalConfig.jwtTTL });
    return true;
  } catch(err) {
    formatLogMessage(logger).error(err, `revokeAccessToken unable to add token to black list - ${err.message}`);
    throw InternalServerError(`${DEFAULT_INTERNAL_SERVER_MESSAGE} - ${err.message}`);
  }
}

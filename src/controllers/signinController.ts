import { Request, Response } from 'express';
import { logger, formatLogMessage } from '../logger';
import { User } from '../models/User';
import { generateTokens, setTokenCookie } from '../services/tokenService';
import { Cache } from '../datasources/cache';
import { generalConfig } from '../config/generalConfig';

export const signinController = async (req: Request, res: Response) => {
  let user = new User(req.body);
  try {
    user = await user.login() || null;

    if (user) {
      const cache = Cache.getInstance();
      const { accessToken, refreshToken } = await generateTokens(cache, user);

      if (accessToken && refreshToken) {
        // Set the tokens as HTTP only cookies
        setTokenCookie(res, 'dmspt', accessToken, generalConfig.jwtTTL);
        setTokenCookie(res, 'dmspr', refreshToken, generalConfig.jwtRefreshTTL);

        res.status(200).json({ success: true });
      } else {
        throw new Error('Login failed');
      }

    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    formatLogMessage(logger, { err }).error('Signin error')
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

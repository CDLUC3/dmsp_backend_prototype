import { Request, Response } from 'express';
import { logger, formatLogMessage } from '../logger';
import { User } from '../models/User';
import { generateAuthTokens, setTokenCookie } from '../services/tokenService';
import { Cache } from '../datasources/cache';
import { generalConfig } from '../config/generalConfig';

export const signinController = async (req: Request, res: Response) => {
  const userIn = new User(req.body);
  try {
    const user = await userIn.login() || null;

    if (user) {
      const cache = Cache.getInstance();
      const { accessToken, refreshToken } = await generateAuthTokens(cache, user);

      if (accessToken && refreshToken) {
        // Set the tokens as HTTP only cookies
        setTokenCookie(res, 'dmspt', accessToken, generalConfig.jwtTTL);
        setTokenCookie(res, 'dmspr', refreshToken, generalConfig.jwtRefreshTTL);

        res.status(200).json({ success: true, message: 'ok' });
      } else {
        res.status(500).json({ success: false, message: 'Unable to sign in at this time' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    formatLogMessage(logger).error(err, 'Signin error')
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

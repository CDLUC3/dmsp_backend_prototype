import { Request, Response } from 'express';
import { logger, formatLogMessage } from '../logger';
import { User } from '../models/User';
import { generateAuthTokens, setTokenCookie } from '../services/tokenService';
import { Cache } from '../datasources/cache';
import { generalConfig } from '../config/generalConfig';

export const signupController = async (req: Request, res: Response) => {
  let user: User = new User(req.body);
  try {
    user = await user.register() || null;

    if (user) {
      if (user.errors?.length >= 1) {
        res.status(400).json({ success: false, message: user.errors?.join(' | ') });
      } else {
        const cache = Cache.getInstance();
        const { accessToken, refreshToken} = await generateAuthTokens(cache, user);

        if (accessToken && refreshToken) {
          // Set the tokens as HTTP only cookies
          setTokenCookie(res, 'dmspt', accessToken, generalConfig.jwtTTL);
          setTokenCookie(res, 'dmspr', refreshToken, generalConfig.jwtRefreshTTL);

          res.status(200).json({ success: true, message: 'ok' });
        }
      }
    }
    res.status(500).json({ success: false, message: 'Unable to create the account at this time.' });
  } catch (err) {
    formatLogMessage(logger, { msg: `Signup error. userId: ${user.id}, error: ${err?.message}` });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

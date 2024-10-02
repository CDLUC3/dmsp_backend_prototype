import { Request } from 'express-jwt';
import { Response } from 'express';
import { Cache } from "../datasources/cache";
import { revokeAccessToken, revokeRefreshToken, verifyAccessToken } from '../services/tokenService';
import { formatLogMessage, logger } from '../logger';

export const signoutController = async (req: Request, res: Response) => {
  try {
    // For some reason req.auth is `undefined` here even though authMiddleware is called.
    // It's in req.cookies though :/
    const accessToken = req.cookies?.dmspt;

    if (accessToken) {
      const token = verifyAccessToken(accessToken);

      // Clear the old cookies from the response
      res.clearCookie('dmspt');
      res.clearCookie('dmspr');

      if (token && token.jti) {
        const cache = Cache.getInstance();
        // Delete the refresh token from the cache
        if (await revokeRefreshToken(cache, token.jti)) {
          // Add the access token to the black list so that token is immediately invalidated
          await revokeAccessToken(cache, token.jti);
          res.status(200).json({});
        } else {
          res.status(500).json({ success: true, message: 'Unable to sign out at this time' });
        }
      } else {
        res.status(200).json({});
      }
    } else {
      res.status(200).json({});
    }
  } catch (err) {
    formatLogMessage(logger).error(err, 'Signout error!');
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

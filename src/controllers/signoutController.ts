import { Request } from 'express-jwt';
import { Response } from 'express';
import { Cache } from "../datasources/cache";
import { revokeAccessToken, revokeRefreshToken } from '../services/tokenService';
import { formatLogMessage, logger } from '../logger';

export const signoutController = async (req: Request, res: Response) => {
  try {
    if (req.auth) {
      const cache = Cache.getInstance();

      // Delete the refresh token from the cache
      if (await revokeRefreshToken(cache, req.auth.jti)) {
        // Add the access token to the black list so that token is immediately invalidated
        await revokeAccessToken(cache, req.headers?.authorization?.split(" ")[1]);

        // Clear the old cookies from the response
        res.clearCookie('dmspt');
        res.clearCookie('dmspr');
        res.status(200).json({ success: true, message: 'ok' });
      }
    }
    res.status(400).json({ success: false, message: 'Unable to sign out at this time.'})
  } catch (err) {
    formatLogMessage(logger).error(err, 'Signout error!');
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

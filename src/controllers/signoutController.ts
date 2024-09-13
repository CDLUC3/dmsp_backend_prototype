import { Request, Response } from 'express';
import { Cache } from "../datasources/cache";
import { revokeAccessToken, revokeRefreshToken, verifyAccessToken } from '../services/tokenService';
import { formatLogMessage, logger } from '../logger';

export const signoutController = async (req: Request, res: Response) => {
  try {
    // Get the refresh token from the request body or cookies
    const accessToken = req.cookies.dmspt;

    if (accessToken) {
      const cache = Cache.getInstance();
      const jwt = await verifyAccessToken(cache, accessToken);

      if (jwt) {
        // Delete the refresh token from the cache
        if (await revokeRefreshToken(cache, jwt.jti)) {
          // Add the access token to the black list so that token is immediately invalidated
          await revokeAccessToken(cache, accessToken);
          res.status(200).json({ success: true, message: 'ok' });
        }
      }
    }
    res.status(400).json({ success: false, message: 'Unable to sign out at this time.'})
  } catch (err) {
    formatLogMessage(logger).error(err, 'Signout error!');
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

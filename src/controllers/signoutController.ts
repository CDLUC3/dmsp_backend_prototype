import { Request, Response } from 'express';
import { Cache } from "../datasources/cache";
import { JWTAccessToken, revokeAccessToken, revokeRefreshToken, tokensFromHeaders, verifyAccessToken } from '../services/tokenService';
import { formatLogMessage, logger } from '../logger';

export const signoutController = async (req: Request, res: Response) => {
  try {
    // Get the refresh token from the request body or cookies
    const { accessToken } = tokensFromHeaders(req);

    if (accessToken) {
      const cache = Cache.getInstance();
      const decodedToken: JWTAccessToken = accessToken ? verifyAccessToken(accessToken) : null;

      // Delete the refresh token from the cache
      if (decodedToken && await revokeRefreshToken(cache, decodedToken.jti)) {
        // Add the access token to the black list so that token is immediately invalidated
        await revokeAccessToken(cache, accessToken);

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

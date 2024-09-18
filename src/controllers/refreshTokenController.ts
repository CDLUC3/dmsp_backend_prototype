import { Response } from 'express';
import { Request } from 'express-jwt';
import { Cache } from "../datasources/cache";
import { refreshAuthTokens, setTokenCookie } from '../services/tokenService';
import { generalConfig } from '../config/generalConfig';
import { buildContext } from '../context';
import { logger } from '../logger';

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const originalRefreshToken = req.cookies?.dmspr?.toString();

    if (!originalRefreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token required!' });
    }

    const cache = Cache.getInstance();
    const context = buildContext(logger, cache);
    const { accessToken, refreshToken } = await refreshAuthTokens(cache, context, originalRefreshToken);

    // If it successfully regenerated an access token
    if (accessToken) {
      // Set the tokens as HTTP only cookies
      setTokenCookie(res, 'dmspt', accessToken, generalConfig.jwtTTL);
      setTokenCookie(res, 'dmspr', refreshToken, generalConfig.jwtRefreshTTL);

      // Send the new access token to the client
      res.status(200).json({ success: true, message: 'ok' });
    }
    res.status(400).json({ success: false, message: 'Unable to refresh the access token at this time!' });
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

import { Request, Response } from 'express';
import { Cache } from "../datasources/cache";
import { refreshTokens, setTokenCookie, tokensFromHeaders } from '../services/tokenService';
import { generalConfig } from '../config/generalConfig';
import { buildContext } from '../context';
import { logger } from '../logger';

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    // Get the tokens from the request body or cookies
    const originalTokens = tokensFromHeaders(req);

    if (!originalTokens.refreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token required!' });
    }

    const cache = Cache.getInstance();
    const context = buildContext(logger, cache);
    const { accessToken, refreshToken } = await refreshTokens(cache, context, originalTokens.refreshToken);

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

import { Request, Response } from 'express';
import { Cache } from "../datasources/cache";
import { refreshTokens, setTokenCookie } from '../services/tokenService';
import { AuthenticationError } from '../utils/graphQLErrors';
import { generalConfig } from '../config/generalConfig';
import { buildContext } from '../context';
import { logger } from '../logger';

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    // Get the tokens from the request body or cookies
    const oldAccessToken = req.cookies.dmspt;
    const oldRefreshToken = req.cookies.dmspr;

    if (!oldRefreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token required!' });
    }

    const cache = Cache.getInstance();
    const context = buildContext(logger, cache, oldAccessToken);
    const { accessToken, refreshToken } = await refreshTokens(cache, context, oldRefreshToken);

    // If it successfully regenerated an access token
    if (accessToken) {
      // Set the tokens as HTTP only cookies
      setTokenCookie(res, 'dmspt', accessToken, generalConfig.jwtTTL);
      setTokenCookie(res, 'dmspr', refreshToken, generalConfig.jwtTTL);

      // Send the new access token to the client
      res.status(200).json({ success: true });
    }
    res.status(400).json({ success: false, message: 'Unable to refresh the access token at this time!' });
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

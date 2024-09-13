import { Request, Response } from 'express';
import { Cache } from "../datasources/cache";
import { refreshTokens, setTokenCookie } from '../services/tokenService';
import { AuthenticationError } from '../utils/graphQLErrors';
import { generalConfig } from '../config/generalConfig';

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    // Get the refresh token from the request body or cookies
    const oldAccessToken = req.body.accessToken || req.cookies.dmspt;
    const oldRefreshToken = req.body.refreshToken || req.cookies.dmspr;

    if (!oldAccessToken || !oldRefreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token required!' });
    }

    // Use your refreshAccessToken function to get a new access token
    const cache = Cache.getInstance();
    const { accessToken, refreshToken } = await refreshTokens(cache, oldAccessToken, oldRefreshToken);

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
    if (error instanceof AuthenticationError) {

    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}

import { Request, Response } from 'express';
import { exchangeAuthCodeForToken } from '../services/authService';
import oauthConfig from '../config/oauthConfig';

export const tokenEndpoint = async (req: Request, res: Response) => {
  const { grant_type, code, redirect_uri, client_id, client_secret } = req.body;

  if (
    client_id !== process.env.CLIENT_ID ||
    client_secret !== process.env.CLIENT_SECRET ||
    redirect_uri !== process.env.REDIRECT_URI
  ) {
    return res.status(400).json({ error: 'Invalid client credentials or redirect_uri' });
  }

  try {
    const { accessToken, refreshToken } = await exchangeAuthCodeForToken(code);
    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: oauthConfig.accessTokenLifetime
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid authorization code' });
  }
};

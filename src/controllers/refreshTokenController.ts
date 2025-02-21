import { Response } from 'express';
import { Request } from 'express-jwt';
import { Cache } from "../datasources/cache";
import { refreshAccessToken, setTokenCookie } from '../services/tokenService';
import { buildContext } from '../context';
import { formatLogMessage, logger } from '../logger';

export const refreshTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.dmspr?.toString();

  if (refreshToken) {
    const cache = Cache.getInstance();
    const context = await buildContext(logger, cache);

    try {
      const newAccessToken = await refreshAccessToken(context, refreshToken);

      if (newAccessToken) {
        // Set the new access token
        setTokenCookie(res, 'dmspt', newAccessToken);
        setTokenCookie(res, 'dmspr', refreshToken);

        // Send the new access token to the client
        res.status(200).json({ success: true, message: 'ok' });
      } else {
        res.status(401).json({ success: false, message: 'Refresh token has expired' });
      }
    } catch (err) {
      formatLogMessage(context)?.error(err, 'refreshTokenController error');
      res.status(401).json({ success: false, message: 'Server error: unable to refresh tokens at this time' });
    }
  } else {
    res.status(401).json({ success: false, message: 'No refresh token available' });
  }
}

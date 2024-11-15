// Healthcheck endpoint for our load balancer.
// Be sure to call this BEFORE defining CORS settings since our AWS load

import { Response } from "express";
import { formatLogMessage, logger } from "../logger";
import { Request } from "express-jwt";
import { JWTAccessToken, verifyAccessToken } from "../services/tokenService";
import { isSuperAdmin } from "../services/authService";
import { sendTestEmailNotification } from "../services/emailService";

// balancer does not allow us to define headers!
export const emailTestController = async (req: Request, res: Response) => {
  try {
    // For some reason req.auth is `undefined` here even though authMiddleware is called.
    // It's in req.cookies though :/
    const accessToken = req.cookies?.dmspt;

    if (accessToken) {
      const token = verifyAccessToken(accessToken);

      // Only allow this for Super Admins!
      if (token && token.jti && isSuperAdmin(token as JWTAccessToken)) {
        sendTestEmailNotification();
        res.status(200).json({ message: 'Successfully sent test email message to the helpdesk address.' });
      }
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (err) {
    formatLogMessage(logger).error(err, 'Email Test error!');
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
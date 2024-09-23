import { expressjwt } from "express-jwt";
import { generalConfig } from "../config/generalConfig";
import { isRevokedCallback } from "../services/tokenService";

export const authMiddleware = expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret: generalConfig.jwtSecret.toString(),

  // Fetch the access token from the cookie
  getToken: function fromCookie(req) { return req.cookies?.dmspt?.toString(); },
  // Function to check if the access token has been revoked
  isRevoked: isRevokedCallback,
});

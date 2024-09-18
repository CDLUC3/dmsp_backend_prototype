import { expressjwt } from "express-jwt";
import { generalConfig } from "../config/generalConfig";
import { isRevokedCallback } from "../services/tokenService";

export const authMiddleware = expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret: generalConfig.jwtSecret as string,

  // Fetch the access token from the cookie
  getToken: function fromHeader(req) { return req.cookies.dmspt; },
  // Function to check if the access token has been revoked
  isRevoked: isRevokedCallback,
});

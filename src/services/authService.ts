import { UserRole } from "../models/User";
import { JWTAccessToken } from "./tokenService";

// Verify that we have a token
export const isAuthorized = (token: JWTAccessToken): boolean => {
    if(token?.id) {
      return true;
    }
    return false;
}

// An Admin has one of the Admin roles as well as an affiliation id.
export const isAdmin = (token: JWTAccessToken): boolean => {
  return isAuthorized(token)
    && [UserRole.ADMIN.toString(), UserRole.SUPERADMIN.toString()].includes(token?.role)
    && token?.affiliationId;
}

// A SuperAdmin has the SuperAdmin role.
export const isSuperAdmin = (token: JWTAccessToken): boolean => {
  return isAuthorized(token) && token?.role === UserRole.SUPERADMIN;
}

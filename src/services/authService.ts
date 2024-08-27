import { UserRole } from "../models/User";
import { JWTToken } from "./tokenService";

// Verify that we have a token
export const isAuthorized = (token: JWTToken): boolean => {
    if(token && token?.id) {
      return true;
    }
    return false;
}

// An Admin has one of the Admin roles as well as an affiliation id.
export const isAdmin = (token: JWTToken): boolean => {
  return isAuthorized(token)
    && [UserRole.ADMIN.toString(), UserRole.SUPERADMIN.toString()].includes(token?.role)
    && token?.affiliationId;
}

// A SuperAdmin has the SuperAdmin role.
export const isSuperAdmin = (token: JWTToken): boolean => {
  return isAuthorized(token) && token?.role === UserRole.SUPERADMIN;
}

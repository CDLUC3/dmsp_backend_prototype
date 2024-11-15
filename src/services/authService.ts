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
  if(isAuthorized(token) && token.affiliationId) {
    return [UserRole.ADMIN.toString(), UserRole.SUPERADMIN.toString()].includes(token?.role);
  }
  return false;
}

// A SuperAdmin has the SuperAdmin role.
export const isSuperAdmin = (token: JWTAccessToken): boolean => {

console.log(`has id? ${token?.id}, Role: ${token?.role}`);

  return isAuthorized(token) && token?.role === UserRole.SUPERADMIN;
}

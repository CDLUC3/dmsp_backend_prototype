import { AuthorizationCode, AuthorizationCodeModel } from 'oauth2-server';

// import { OAuthClient } from './OAuthClient';
// import { AuthCOde } from './AuthCode';
// import { AuthToken } from './AuthToken';
// import { User } from '../User';

// Authorization Code OAuth2 Flow
export const AuthorizationCodeFlow: AuthorizationCodeModel = {
  // FROM BaseModel
  // -------------------------------
  generateAccessToken: async function(client, user, scope) {
    // Create a token
    return await 'token!';
  },

  getClient: async function(clientId, clientSecret) {
    return null;
  },

  saveToken: async function(token, client, user) {
    // Save the token
    return await null;
  },

  // FROM RequestAuthenticationModel
  // -------------------------------
  getAccessToken: async function(accessToken) {
    return await null;
  },

  verifyScope: async function(token, scope) {
    return await false;
  },

  // FROM AuthorizationCodeModel
  // -------------------------------
  generateRefreshToken: async function(client, user, scope) {
    // Create a refresh token
    return await 'refreshed!';
  },

  generateAuthorizationCode: async function(client, user, scope) {
    // Create a new Code
    return await 'New Code';
  },

  getAuthorizationCode: async function(authorizationCode) {
    // Get the Code from the data store
    return await null;
  },

  saveAuthorizationCode: async function(code, client, user) {
    // Save the authorization code
    return await null;
  },

  revokeAuthorizationCode: async function(code) {
    // Revoke the User's authorization code
    return await false;
  },

  validateScope: async function(client, user, scope) {
    // Validate that the client has access to the requested scope
    return await false;
  },

  /*
  // For some reason it tells me this isn't defined on the type even though it is
  validateRedirectUri: async function(redirect_uri, client) {
    return await false;
  },
  */
};

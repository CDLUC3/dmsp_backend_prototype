import {
  AuthorizationCode,
  AuthorizationCodeModel,
  // Client,
  ClientCredentialsModel,
  Token,
} from 'oauth2-server'

import { User } from './User';

// TODO: Need to define a Client, User, Token, AuthorizationCode that implement the above

class Client {
  private id: string;
  private redirectUris: string[];
  private grants: any[];
  private clientId: string;
  private clientSecret: string;

  constructor(args) {
    this.id = args?.id;
    this.clientId = args.clientId;
    this.clientSecret = args.clientSecret;
    this.redirectUris = args?.redirectUris || [];
    this.grants = args?.grants || [];
  }
}

const today = new Date();

/*
const OAuth2Code: AuthorizationCode = {
  authorizationCode: 'ertg245gt42g45g4',
  expiresAt: new Date(today.setMonth(today.getMonth() + 1)),
  redirectUri: '',
  scope: ['read'],
  client: Client;
  user: User;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  [key: string]: any;
}

const OAuth2Token: Token = {
  accessToken: string;
  accessTokenExpiresAt?: Date | undefined;
  refreshToken?: string | undefined;
  refreshTokenExpiresAt?: Date | undefined;
  scope?: string[] | undefined;
  client: Client;
  user: User;
  [key: string]: any;
}

const OAuth2RefreshToken: RefreshToken = {
  refreshToken: string;
  refreshTokenExpiresAt?: Date | undefined;
  scope?: string[] | undefined;
  client: Client;
  user: User;
  [key: string]: any;
}
*/

// Authorization Code OAuth2 Flow
export const AuthCodeModel: AuthorizationCodeModel = {
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

// Client Credentials OAuth2 Flow
export const ClientCredsModel: ClientCredentialsModel = {
  generateAccessToken: async function(client, user, scope) {
    // Generate the new token
    return await 'generated token';
  },

  getAccessToken: async function(accessToken) {
    return await false;
  },

  getClient: async function(clientId, clientSecret) {
    // Get the client
    return await false;
  },

  getUserFromClient: async function(client) {
    // Fetch the User's data
    return await false;
  },

  saveToken: async function(token, client, user) {
    // Save the token
    return await false;
  },

  verifyScope: async function(token, scope) {
    return await false;
  },

  validateScope: async function(user, client, scope) {
    // Validate that the client has access to the requested scope
    return await 'validated scope';
  },
}

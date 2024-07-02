import { Request, Response } from 'express';
import { Request as OAuth2Request, Response as OAuth2Response } from '@node-oauth/oauth2-server';
import OAuth2Server from '@node-oauth/oauth2-server';
import { logger, formatLogMessage } from '../logger';
import { OAuthClient } from '../models/OAuthClient';
import { OAuthCode } from '../models/OAuthCode';
import { OAuthRefreshToken } from '../models/OAuthRefreshToken';
import { OAuthToken } from '../models/OAuthToken';
import { User } from '../models/User';
import { AuthorizationCode, Client, Token } from 'oauth2-server'

const model = {
  // Fetch the OAuth2 client from the DB
  getClient: async function(clientId: string, clientSecret: string) {
    return await OAuthClient.findOne(clientId, clientSecret);
  },

  // Fetch the authorization code from the DB
  getAuthorizationCode: async function(authorizationCode: string) {
    return await OAuthCode.findOne(authorizationCode);
  },

  // Save the authorization code in the DB
  saveAuthorizationCode: async function(code: AuthorizationCode, client: Client, user: User) {
    try {
      code.client = client;
      code.user = user;
      return await code.save();
    } catch(err) {
      formatLogMessage(logger, { err }).error('Error oauthServer.saveAuthorizationCode')
      return null;
    }
  },

  // Set the expiry date on the authorization code to the current time
  revokeAuthorizationCode: async function(code: AuthorizationCode) {
    try {
      return await code.revoke();
    } catch(err) {
      formatLogMessage(logger, { err }).error('Error oauthServer.revokeAuthorizationCode')
      return null;
    }
  },

  // Verify that the scope requested is allowed by the access token
  verifyScope: async function(token: Token, scope: string | string[]) {
    const scopeArray: string[] = Array.isArray(scope) ? scope : [scope];
    return await scopeArray.every((item) => token.scope.includes(item));
  },

  // Verify that the User has authorized the scope for the OAuth2 client
  validateScope: async function(user: User, client: Client, scope: string[]) {
    const token = await OAuthToken.findByClientUser(client, user);
    return scope.every((item) => token.scope.includes(item));
  },

  // Fetch the access token from the DB
  getAccessToken: async function(accessToken: string) {
    try {
      return await OAuthToken.findOne(accessToken);
    } catch(err) {
      formatLogMessage(logger, { err }).error('Error oauthServer.getAccessToken')
      return null;
    }
  },

  // Save the access token in the DB
  saveToken: async function(token: Token, client: Client, user: User) {
    try {
      token.client = client;
      token.user = user;
      return await token.save();
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error oauthServer.saveToken')
      return null;
    }
  },

  // Set the expiry date on the access token to the current time
  revokeToken: async function(token: Token) {
    try {
      return await token.revoke();
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error oauthServer.revokeToken')
      return null;
    }
  },

  // Fetch the refresh token from the DB
  getRefreshToken: async function(refreshToken: string) {
    return await OAuthRefreshToken.findOne(refreshToken);
  },
};

export function castRequest(req: Request): OAuth2Request {
  return new OAuth2Request({
    headers: req.headers,
    method: req.method,
    query: req.query,
    body: req.body,
  });
}

export function castResponse(res: Response): OAuth2Response {
  return new OAuth2Response({
    headers: res.getHeaders(),
    //body: res.get('Content-Type') === 'application/json' ? res['body'] : undefined,
    status: res.statusCode,
    redirect: res.get('Location'),
  });
}

export const oauthServer = new OAuth2Server({
  model,
  allowBearerTokensInQueryString: true,
});

import { ClientCredentialsModel } from 'oauth2-server'

// import { OAuthClient } from './OauthClient';
// import { User } from '../User';

// Client Credentials OAuth2 Flow
export const ClientCredentialsFlow: ClientCredentialsModel = {
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

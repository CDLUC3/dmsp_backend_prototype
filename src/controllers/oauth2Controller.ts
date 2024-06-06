import { OAuth2Server }  from '@node-oauth/oauth2-server';

import { AuthorizationCodeFlow } from '../models/oauth2/AuthorizationCodeFlow';
import { ClientCredentialsFlow } from '../models/oauth2/ClientCredentialsFlow';

// Initialize the OAuth2 server
const oauth2Server = new OAuth2Server({
  model: {
    AuthorizationCodeFlow,
    ClientCredentialsFlow,
  },
  useErrorHandler: false,
  continueMiddleware: false,
});

// TODO: Remove ALL of the circuit breakers below

export async function authenticate(req, res) {
  // Setting this short circuit here to prevent this running for now
  const shortCircuit = null;
  if (shortCircuit) {
    try {
      const token = await oauth2Server.authenticate(req, res);
      // Set the token in the response header?
    } catch(err) {
      console.log(`OAuth2 authenticate error: ${err.message}`);
    }
  }
};

export async function token(req, res) {
  // Setting this short circuit here to prevent this running for now
  const shortCircuit = null;
  if (shortCircuit) {
    try {
      const token = await oauth2Server.token(req, res);
      // Set the token in the response header?
    } catch(err) {
      console.log(`OAuth2 token error: ${err.message}`);
    }
  }
};

export async function authorize(req, res) {
  // Setting this short circuit here to prevent this running for now
  const shortCircuit = null;
  if (shortCircuit) {
    try {
      const token = await oauth2Server.authorize(req, res);
      // Set the token in the response header?
    } catch(err) {
      console.log(`OAuth2 authorize error: ${err.message}`);
    }
  }
};

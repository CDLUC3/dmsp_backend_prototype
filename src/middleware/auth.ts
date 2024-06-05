import { OAuth2Server, ServerOptions }  from '@node-oauth/oauth2-server';
// import { AuthorizationCodeModel, ClientCredentialsModel } from 'oauth2-server'

import {
  AuthCodeModel as AuthorizationCodeModel,
  ClientCredsModel as ClientCredentialsModel
} from '../models/Oauth';


const options: ServerOptions = {
  // model: {
  //   AuthorizationCodeModel,
  //   ClientCredentialsModel,
  // },
  model: AuthorizationCodeModel,
  useErrorHandler: false,
  continueMiddleware: false,
}

export function initOAuthServer(app): void {
  // Initialize the OAuth2 server
  const oauth2Server = new OAuth2Server(options);

  // OAuth2 authentication endpoint for Code and ClientCredential flows
  app.get('/authenticate', (request, response) => oauth2Server.authenticate(request, response));

  // OAuth2 endpoint to exchange an authorized Code for a Token
  app.get('/token', (request, response) => oauth2Server.token(request, response));

  // OAuth2 authorization check to
  app.use('/', (request, response) => oauth2Server.authorize(request, response));
}

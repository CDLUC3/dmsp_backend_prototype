import { Client } from 'oauth2-server';

/*
 * Contents of Client type:
 *
 * id: string;
 * redirectUris: string[];
 * grants: any[];
 * clientId: string;
 * clientSecret: string;
 */

class OAuthClient {
  data: Client;
  errors: string[];

  constructor(data: Client) {
    this.data = data;
    this.errors = [];
  }
}

export default OAuthClient;

import { Token } from 'oauth2-server';

/*
 * Contents of Token type:
 *
 * accessToken: string;
 * accessTokenExpiresAt?: Date | undefined;
 * refreshToken?: string | undefined;
 * refreshTokenExpiresAt?: Date | undefined;
 * scope?: string[] | undefined;
 * client: Client;
 * user: User;
 * [key: string]: any;
 */

class AuthToken {
  data: Token;
  errors: string[];

  constructor(data: Token) {
    this.data = data;
    this.errors = [];
  }
}

export default AuthToken;

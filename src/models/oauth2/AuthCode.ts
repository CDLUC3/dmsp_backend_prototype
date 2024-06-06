import { AuthorizationCode } from 'oauth2-server';

/*
 * Contents of AuthorizationCode type:
 *
 * authorizationCode: 'ertg245gt42g45g4',
 * expiresAt: new Date(today.setMonth(today.getMonth() + 1)),
 * redirectUri: '',
 * scope: ['read'],
 * client: Client;
 * user: User;
 * codeChallenge?: string;
 * codeChallengeMethod?: string;
 * [key: string]: any;
 */


class AuthCode {
  data: AuthorizationCode;
  errors: string[];

  constructor(data: AuthorizationCode) {
    this.data = data;
    this.errors = [];
  }
}

export default AuthCode;

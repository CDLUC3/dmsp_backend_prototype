import { AuthorizationCode } from 'oauth2-server';
import { v4 as uuidv4 } from 'uuid';
import { oauthConfig } from '../config/oauthConfig';
import { stringToArray } from '../utils/helpers';
import { OAuthClient } from './OAuthClient';
import { OAuthToken } from './OAuthToken'
import { User } from '../models/User';
import { MySQLDataSource } from '../datasources/mySQLDataSource';
import { logger } from '../logger';

export class OAuthCode implements AuthorizationCode {
  private mysql: MySQLDataSource;

  public authorizationCode: string;
  public expiresAt: Date | undefined;
  public redirectUri: string;
  public scope: string | string[];
  public client: OAuthClient;
  public user: User;
  public codeChallenge?: string | undefined;
  public codeChallengeMethod?: string | undefined;
  public errors: string[];

  // Initialize a new authorization code
  constructor(options) {
    this.mysql = MySQLDataSource.getInstance();

    this.authorizationCode = options.authorizationCode;
    this.expiresAt = options.expiresAt;
    this.redirectUri = options.redirectUri;
    this.scope = stringToArray(options.scope, ',');
    this.client = options.client;
    this.user = options.user;
    this.codeChallenge = options.codeChallenge;
    this.codeChallengeMethod = options.codeChallengeMethod;
    this.errors = [];
  }

  // Locate the authorization code by its id
  static async findOne(authorizationCode: string): Promise<OAuthCode | null> {
    try {
      const mysql = MySQLDataSource.getInstance();
      const [rows] = await mysql.query('SELECT * FROM oauthCodes WHERE code = ?', [authorizationCode]);
      if (rows.length === 0) {
        return null;
      }
      const row = (rows as any[])[0];
      const client = await OAuthClient.findById(row.clientId);
      const user = await User.findById(row.userId);
      if (!client || !user) {
        return null;
      }
      return new OAuthCode({
        ...OAuthToken._SqlFieldsToProperties(row),
        client: await OAuthClient.findById(row.clientId),
        user: await User.findById(row.userId),
      });

    } catch(err) {
      logger.error('Unable to fetch AuthorizationCode from OAuthCodes');
      throw(err);
    }
  }

  // Validate the authorization code and issue an access token
  static async exchangeCodeForToken(authorizationCode: string): Promise<OAuthToken | null> {
    const authCode = await OAuthCode.findOne(authorizationCode)

    if(authCode.validate()) {
      const accessToken = new OAuthToken({ client: authCode.client, user: authCode.user });
      if (accessToken) {
        // TODO: We will want to modify the TTL based on the grant type
        accessToken.save();
        return accessToken;
      }
      return null;
    }
    throw new Error('Invalid authorization code');
  }

  // Ensure data integrity
  cleanup(): void {
    this.authorizationCode = this.authorizationCode || this.generateAuthorizationCode();
    this.expiresAt = this.expiresAt || this.generateExpiryDate();
    this.redirectUri = this.redirectUri || 'http://localhost:3000';
    this.scope = this.scope || ['read'];
  }

  // Generate the token TTL
  generateExpiryDate(): Date {
    const currentDate = new Date();
    return new Date(currentDate.getTime() + oauthConfig.authorizationCodeLifetime * 1000);
  }

  // Generate a new unique authorization code
  generateAuthorizationCode(): string {
    return uuidv4();
  }

  // Ensure that the authorization code has not expired
  async validate(): Promise<boolean> {
    if (this.authorizationCode) {
      // Make sure it still exists in the database! and the payload matches (not tampered with)
      const existing = await OAuthCode.findOne(this.authorizationCode);
      if (existing && existing === this) {
        // Make sure it is not expired
        const currentDate = new Date();
        return this.expiresAt > currentDate;
      }
      return false;
    }
    return false;
  }

  // Save the authorization code to the DB
  async save(): Promise<boolean> {
    this.cleanup();

    const sql = `
      INSERT INTO oauthCodes
        (code, expiresAt, redirectUri, scope, userId, clientId, codeChallenge, codeChallengeMethod)
      VALUES (?, ?, ?)
    `;
    const vals = [
      this.authorizationCode,
      this.expiresAt.toISOString(),
      this.redirectUri,
      stringToArray(this.scope, ',').join(', '),
      this.client.id.toString(),
      this.user.id.toString(),
      this.codeChallenge,
      this.codeChallengeMethod,
    ];

    try {
      const [result] = await this.mysql.query(sql, vals);
      if (result[0]) {
        logger.debug(`Authorization code created: User: ${this.user.id}, Code: ${result.insertId}`);
        return true;
      }
      return false;
    } catch(err) {
      logger.error('Error creating OAuthCode: ', err)
      throw err;
    }
  }

  // Set the authorization code expiry to now
  async revoke(): Promise<boolean> {
    const currentDate = new Date();
    const sql = `UPDATE oauthCodes SET expiresAt = ?, modified = ? WHERE code = ?`;
    const vals = [currentDate.toISOString(), currentDate.toISOString(), this.authorizationCode];
    try {
      const [result] = await this.mysql.query(sql, vals);
      // TODO: Fix this Type issue, we should able to define one here
      logger.debug(`Authorization code was revoked: ${this.authorizationCode}`);
      return true;
    } catch (err) {
      logger.error('Error revoking OAuthCode: ', err)
      throw err;
    }
  }

  // Convert the DB fields to properties of this call (except client and user)
  static _SqlFieldsToProperties(row) {
    const scopeArray = typeof row.scope === 'string' ? row.scope.split(' ') : row.scope;
    return {
      authorizationCode: row.code,
      expiresAt: new Date(row.expiresAt),
      redirectUri: row.redirectUri,
      scope: scopeArray,
      codeChallenge: row.codeChallenge,
      codeChallengeMethod: row.codeChallengeMethod,
    }
  }
}

import { Client, Token } from 'oauth2-server';
import { v4 as uuidv4 } from 'uuid';
import { OAuthClient } from './OAuthClient';
import { OAuthRefreshToken } from './OAuthRefreshToken';
import { User } from './User';
import { oauthConfig } from '../config/oauthConfig';
import { stringToArray } from '../utils/helpers';
import { buildContext } from '../context';
import { generateToken } from '../services/tokenService';
import { MySQLDataSource } from '../datasources/mySQLDataSource';
import { logger, formatLogMessage } from '../logger';

export class OAuthToken implements Token {
  private mysql: MySQLDataSource;

  public accessToken: string;
  public accessTokenExpiresAt?: Date | undefined;
  public refreshToken?: string | undefined;
  public refreshTokenExpiresAt?: Date | undefined;
  public scope?: string[];
  public client: OAuthClient;
  public user: User;
  public errors: string[];

  // Initialize a new access token
  constructor(options) {
    this.mysql = MySQLDataSource.getInstance();

    this.accessToken = options.accessToken;
    this.accessTokenExpiresAt = options.accessToken;
    this.refreshToken = options.refreshToken;
    this.refreshTokenExpiresAt = options.refreshTokenExpiresAt;
    this.scope = options.scope || [];
    this.client = options.client;
    this.user = options.user;
    this.errors = [];
  }

  // Locate and access token by its id
  static async findOne(accessToken: string): Promise<OAuthToken | null> {
    try {
      const mysql = MySQLDataSource.getInstance();
      const [rows] = await mysql.query('SELECT * FROM oauthTokens WHERE code = ?', [accessToken]);
      if (rows.length === 0) {
        return null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = (rows as any[])[0];
      const client = await OAuthClient.findById(row.clientId);
      const context = buildContext(logger);
      const user = await User.findById('OAuthToken.findOne', context, row.userId);
      if (!client || !user) {
        return null;
      }
      return new OAuthToken({
        ...OAuthToken._SqlFieldsToProperties(row),
        client,
        user,
      });
    } catch(err) {
      formatLogMessage(logger, { err })
        .error(`Unable to fetch AccessToken from OAuthToken by token: ${accessToken}`);
      throw(err);
    }
  }

  // Locate an access token by the Client and User
  static async findByClientUser(client: Client, user: User): Promise<OAuthToken | null> {
    try {
      const mysql = MySQLDataSource.getInstance();
      const sql = 'SELECT * FROM oauthTokens WHERE clientId = ? AND userId = ?'
      const [rows] = await mysql.query(sql, [client.id, user.id.toString()]);
      if (rows.length === 0) {
        return null;
      }
      return new OAuthToken({
        ...OAuthToken._SqlFieldsToProperties(rows[0]),
        client: client,
        user,
      });
    } catch(err) {
      formatLogMessage(logger, { err })
        .error(`Unable to fetch AccessToken from OAuthToken for client: ${client.id}, user: ${user.id}`);
      throw(err);
    }
  }

  // Ensure data integrity
  async cleanup(): Promise<void> {
    this.accessToken = this.accessToken || generateToken(this.user);
    this.accessTokenExpiresAt = this.accessTokenExpiresAt || this.generateExpiryDate();
    this.refreshToken = this.refreshToken || await this.generateRefreshToken();
    this.refreshTokenExpiresAt = this.refreshTokenExpiresAt || this.generateExpiryDate(false);
    this.scope = stringToArray(this.scope, ',', ['read']);
  }

  // Generate the token
  async generateRefreshToken(): Promise<string> {
    const refreshToken = await new OAuthRefreshToken({
      refreshToken: uuidv4(),
      client: this.client,
      user: this.user,
    });
    return refreshToken.refreshToken;
  }

  // Generate the TTL Expiry date
  generateExpiryDate(forAccessToken = true): Date {
    const currentDate = new Date();
    const ttlSeconds = forAccessToken ? oauthConfig.accessTokenLifetime : oauthConfig.refreshTokenLifetime;
    return new Date(currentDate.getTime() + ttlSeconds * 1000);
  }

  // Make sure the token has not been revoked and that it has not expired
  async validate(): Promise<boolean> {
    if (this.accessToken) {
      // Make sure it still exists in the database! and the payload matches (not tampered with)
      const existing = await OAuthToken.findOne(this.accessToken);
      if (existing && existing === this) {
        // Make sure it is not expired
        const currentDate = new Date();
        return this.accessTokenExpiresAt > currentDate;
      }
      return false;
    }
    return false;
  }

  // Save the Token to the DB
  async save(): Promise<boolean> {
    this.cleanup();

    const sql = `
      INSERT INTO oauthTokens
        (token, expiresAt, refreshToken, refreshTokenExpiresAt, scope, clientId, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const vals = [
      this.accessToken,
      this.accessTokenExpiresAt.toISOString(),
      this.refreshToken,
      this.refreshTokenExpiresAt.toISOString(),
      stringToArray(this.scope, ',').join(', '),
      this.client.id.toString(),
      this.user.id.toString()
    ]
    try {
      await this.mysql.query(sql, vals);
      formatLogMessage(logger)
        .debug(`OAuthToken was created: User: ${this.user.id}, token: ${this.accessToken}`);
      return true;
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error saving OAuthToken');
      throw err;
    }
  }

  // Set the Expiry for the token to now
  async revoke(): Promise<boolean> {
    const currentDate = new Date();
    const sql = `
      UPDATE oauthTokens SET expiresAt = ?, refreshToken = NULL, refreshTokenExpiresAt = NULL
      WHERE token = ?
    `;
    const vals = [currentDate.toISOString(), this.accessToken];
    try {
      await this.mysql.query(sql, vals);
      formatLogMessage(logger).debug(`Access token was revoked: ${this.accessToken}`);
      return true;
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error revoking OAuthToken');
      throw err;
    }
  }

  // Convert the DB fields to properties of this call (except client and user)
  static _SqlFieldsToProperties(row) {
    const scopeArray = typeof row.scope === 'string' ? row.scope.split(' ') : row.scope;
    return {
      accessToken: row.token,
      accessTokenExpiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
      refreshToken: row.refreshToken,
      refreshTokenExpiresAt: row.refreshTokenExpiresAt ? new Date(row.refreshTokenExpiresAt) : null,
      scope: scopeArray,
    }
  }
}

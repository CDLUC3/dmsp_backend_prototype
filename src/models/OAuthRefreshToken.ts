import { RefreshToken } from 'oauth2-server';
import { v4 as uuidv4 } from 'uuid';
import { OAuthClient } from './OAuthClient';
import { User } from './User';
import { oauthConfig } from '../config/oauthConfig';
import { MySQLDataSource } from '../datasources/mySQLDataSource';
import { logger, formatLogMessage } from '../logger';
import { buildContext } from '../utils/helpers';

export class OAuthRefreshToken implements RefreshToken {
  private mysql: MySQLDataSource;

  public refreshToken: string | undefined;
  public refreshTokenExpiresAt?: Date | undefined;
  public client: OAuthClient;
  public user: User;
  public errors: string[];

  // Initialize a new refresh token
  constructor(options) {
    this.mysql = MySQLDataSource.getInstance();

    this.refreshToken = options.refreshToken;
    this.refreshTokenExpiresAt = options.refreshTokenExpiresAt;
    this.client = options.client;
    this.user = options.user;
    this.errors = [];
  }

  // Locate and refresh token by its id
  static async findOne(refreshToken: string): Promise<OAuthRefreshToken | null> {
    try {
      const mysql = MySQLDataSource.getInstance();
      const [rows] = await mysql.query('SELECT * FROM oauthRefreshTokens WHERE token = ?', [refreshToken]);
      if (rows.length === 0) {
        return null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = (rows as any[])[0];
      const client = await OAuthClient.findById(row.clientId);
      const user = await User.findById('OAuthRefreshToken.findOne', buildContext(logger), row.userId);
      if (!client || !user) {
        return null;
      }
      return new OAuthRefreshToken({
        ...OAuthRefreshToken._SqlFieldsToProperties(row),
        client: await OAuthClient.findById(row.clientId),
        user: await User.findById('OAuthRefreshToken.findOne', buildContext(logger), row.userId),
      });
    } catch(err) {
      formatLogMessage(logger, { err })
        .error(`Unable to fetch RefreshToken from OAuthRefreshToken by token: ${refreshToken}`);
      throw(err);
    }
  }

  // Ensure data integrity
  cleanup(): void {
    this.refreshToken = this.refreshToken || this.generateRefreshToken();
    this.refreshTokenExpiresAt = this.refreshTokenExpiresAt || this.generateExpiryDate(false);
  }

  // Generate the token
  generateRefreshToken(): string {
    return uuidv4();
  }

  // Generate the TTL Expiry date
  generateExpiryDate(forAccessToken = true): Date {
    const currentDate = new Date();
    const ttlSeconds = forAccessToken ? oauthConfig.accessTokenLifetime : oauthConfig.refreshTokenLifetime;
    return new Date(currentDate.getTime() + ttlSeconds * 1000);
  }

  // Make sure the token has not been revoked and that it has not expired
  async validate(): Promise<boolean> {
    if (this.refreshToken) {
      // Make sure it still exists in the database! and the payload matches (not tampered with)
      const existing = await OAuthRefreshToken.findOne(this.refreshToken);
      if (existing && existing === this) {
        // Make sure it is not expired
        const currentDate = new Date();
        return this.refreshTokenExpiresAt > currentDate;
      }
      return false;
    }
    return false;
  }

  // Save the Token to the DB
  async save(): Promise<boolean> {
    this.cleanup();

    const sql = `INSERT INTO oauthRefreshTokens (token, expiresAt, clientId, userId) VALUES (?, ?, ?, ?)`;
    const vals = [
      this.refreshToken,
      this.refreshTokenExpiresAt.toISOString(),
      this.client.id.toString(),
      this.user.id.toString()
    ]
    try {
      await this.mysql.query(sql, vals);
      // TODO: Fix this Type issue, we should able to define one here);
      formatLogMessage(logger)
        .debug(`OAuthRefreshToken was created: User: ${this.user.id}, token: ${this.refreshToken}`);
      return true;
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error saving OAuthRefreshToken');
      throw err;
    }
  }

  // Set the Expiry for the token to now
  async revoke(): Promise<boolean> {
    const currentDate = new Date();
    const sql = `
      UPDATE oauthRefreshTokens SET refreshTokenExpiresAt = ?, modified = ?
      WHERE token = ?
    `;
    const vals = [currentDate.toISOString(), currentDate.toISOString(), this.refreshToken];
    try {
      await this.mysql.query(sql, vals);
      // TODO: Fix this Type issue, we should able to define one here
      formatLogMessage(logger).debug(`Refresh token was revoked: ${this.refreshToken}`);
      return true;
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error revoking OAuthRefreshToken');
      throw err;
    }
  }

  // Convert the DB fields to properties of this call (except client and user)
  static _SqlFieldsToProperties(row) {
    return {
      refreshToken: row.refreshToken,
      refreshTokenExpiresAt: new Date(row.refreshTokenExpiresAt),
    }
  }
}

import { Client, Token } from 'oauth2-server';
import { v4 as uuidv4 } from 'uuid';
import { OAuthClient } from './OAuthClient';
import { OAuthRefreshToken } from './OAuthRefreshToken';
import { User } from './User';
import { oauthConfig } from '../config/oauthConfig';
import { stringToArray } from '../helpers';
import { generateToken } from '../services/tokenService';
import { mysqlConfig } from '../config/mysqlConfig';
import { MysqlDataSource } from '../datasources/mysqlDB';

// TODO: Is this the right place to create our Pool?
const mysql = new MysqlDataSource({ config: mysqlConfig });

export class OAuthToken implements Token {
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
      const [rows] = await mysql.query('SELECT * FROM oauthTokens WHERE code = ?', [accessToken]);
      if (rows.length === 0) {
        return null;
      }
      const row = (rows as any[])[0];
      const client = await OAuthClient.findById(row.clientId);
      const user = await User.findById(row.userId);
      if (!client || !user) {
        return null;
      }
      return new OAuthToken({
        ...OAuthToken._SqlFieldsToProperties(row),
        client: await OAuthClient.findById(row.clientId),
        user: await User.findById(row.userId),
      });
    } catch(err) {
      console.log(`Unable to fetch AccessToken from OAuthToken by token: ${accessToken}`);
      throw(err);
    }
  }

  // Locate an access token by the Client and User
  static async findByClientUser(client: Client, user: User): Promise<OAuthToken | null> {
    try {
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
      console.log(`Unable to fetch AccessToken from OAuthToken for client: ${client.id}, user: ${user.id}`);
      throw(err);
    }
  }

  // Ensure data integrity
  async cleanup(): Promise<void> {
    this.accessToken = this.accessToken || generateToken(this.user);
    this.accessTokenExpiresAt = this.accessTokenExpiresAt || this.generateExpiryDate();
    this.refreshToken = this.refreshToken || await this.generateRefreshToken();
    this.refreshTokenExpiresAt = this.refreshTokenExpiresAt || this.generateExpiryDate(false);
    this.scope = stringToArray(this.scope, ['read']);
    this.client = this.client;
    this.user = this.user;
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
      stringToArray(this.scope).join(', '),
      this.client.id.toString(),
      this.user.id.toString()
    ]
    try {
      const [result] = await mysql.query(sql, vals);
      // TODO: Fix this Type issue, we should able to define one here
      console.log(`OAuthToken was created: User: ${this.user.id}, token: ${this.accessToken}`);
      return true;
    } catch (err) {
      console.log('Error creating OAuthToken: ', err)
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
      const [result] = await mysql.query(sql, vals);
      // TODO: Fix this Type issue, we should able to define one here
      console.log(`Access token was revoked: ${this.accessToken}`);
      return true;
    } catch (err) {
      console.log('Error revoking OAuthToken: ', err)
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

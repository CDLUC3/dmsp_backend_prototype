import { Client } from 'oauth2-server';
import { v6 as uuidv6 } from 'uuid';
import uuidRandom from 'uuid-random';
import { stringToArray } from '../utils/helpers';
import { User } from './User';
import { MySQLDataSource } from '../datasources/mySQLDataSource';
import { logger, formatLogMessage } from '../logger';

export class OAuthClient implements Client {
  private mysql: MySQLDataSource;

  public id: string;
  public name: string;
  public redirectUris: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public grants: any[];
  public clientId: string;
  public clientSecret: string;
  public user: User;
  public errors: string[];

  // Initialize a new client
  constructor(options) {
    this.mysql = MySQLDataSource.getInstance();

    this.id = options.id;
    this.name = options.name;
    this.redirectUris = stringToArray(options.redirectUris, ',') || [];
    this.grants = stringToArray(options.grants, ',') || [];
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.user = options.user;
    this.errors = [];
  }

  // Find the OAuth2 Client by it's Client ID and Secret
  static async findOne(clientId: string, clientSecret: string): Promise<OAuthClient | null> {
    const mysql = MySQLDataSource.getInstance();
    const sql = 'SELECT * FROM oauthClients WHERE clientId = ? AND clientSecret = ?';
    try {
      const [rows] = await mysql.query(sql, [clientId, clientSecret]);
      const user = await User.findById(rows[0].userId);

      return rows.length === 0 ? null : new OAuthClient({
        ...OAuthClient._SqlFieldsToProperties(rows[0]),
        user: user,
      });
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error trying to find OAuthClient by id');
      throw err;
    }
  }

  // Find the OAuth2 Client by it's id
  static async findById(oauthClientId: string): Promise<OAuthClient | null> {
    const mysql = MySQLDataSource.getInstance();
    const sql = 'SELECT * FROM oauthClients WHERE id = ?';
    try {
      const [rows] = await mysql.query(sql, [oauthClientId]);
      const user = await User.findById(rows[0].userId);

      return rows.length === 0 ? null : new OAuthClient({
        ...OAuthClient._SqlFieldsToProperties(rows[0]),
        user: user,
      });
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error trying to find OAuthClient by id');
      throw err;
    }
  }

  // Function to help ensure data integrity
  cleanup(): void {
    this.name = this.name?.toLowerCase();
    this.redirectUris = this.redirectUris || [];
    this.grants = this.grants || [];
    this.clientId = this.clientId || this.generateClientId();
    this.clientSecret = this.clientSecret || this.generateClientSecret();
  }

  // Generate a random ClientId
  generateClientId(): string {
    return uuidv6(256);
  }

  // Generate a random ClientSecret
  generateClientSecret(): string {
    return uuidRandom();
  }

  // Register/Save a new OAuthClient
  async save(): Promise<boolean> {
    this.cleanup();

    let sql = `
      INSERT INTO oauthClients (name, redirectUris, grants, clientId, clientSecret, userId)
      VALUES(?,?,?,?,?,?)
    `;
    const vals = [
      this.name,
      this.redirectUris?.join(', '),
      this.grants?.join(', '),
      this.clientId,
      this.clientSecret,
      this.user?.id?.toString(),
    ];

    // If the OAuthClient already has an id then update it instead
    if (this.id) {
      vals.push(this.id);
      vals.push(new Date().toISOString());
      sql = `
        UPDATE oauthClients
        SET name = ?, redirectUris = ?, grants = ?, clientId = ?, clientSecret = ?, userId = ?, modified = ?
        WHERE id = ?
      `;
    }

    try {
      const [result] = await this.mysql.query(sql, vals);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.id = (result as any).insertId;
      formatLogMessage(logger).debug(`OAuth Client was saved: ${result.insertId}`);
      return true;
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error saving OAuthClient');
      throw err;
    }
  }

  // Register/Save a new OAuthClient
  async delete(): Promise<boolean> {
    try {
      await this.mysql.query(`DELETE FROM oauthClients WHERE id = ?`, [this.id]);
      formatLogMessage(logger).debug(`OAuth Client was deleted: ${this.id}`);
      return true;
    } catch (err) {
      formatLogMessage(logger, { err }).error('Error deleting OAuthClient');
      throw err;
    }
  }

  static _SqlFieldsToProperties(row) {
    return {
      id: row.id,
      name: row.name,
      redirectUris: stringToArray(row.redirectUris, ','),
      grants: stringToArray(row.grants, ','),
      clientId: row.clientId,
      clientSecret: row.clientSecret,
    }
  }
}

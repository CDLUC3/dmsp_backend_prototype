import { v4 as uuidv4 } from 'uuid';
import oauthConfig from '../config/oauthConfig';
import { User } from '../models/User';
import { generateToken } from './tokenService';
import { mysqlConfig } from '../config/mysqlConfig';
import { MysqlDataSource } from '../datasources/mysqlDB';

const mysql = new MysqlDataSource({ config: mysqlConfig });

export const generateAuthCode = async (userId: string): Promise<string> => {
  const authCode = uuidv4();
  const expiresAt = new Date(Date.now() + oauthConfig.authorizationCodeLifetime * 1000);
  const sql = 'INSERT INTO auth_codes (code, user_id, expires_at) VALUES (?, ?, ?)';
  const [result] = await mysql.query(sql, [authCode, userId, expiresAt]);
  return authCode;
};

export const exchangeAuthCodeForToken = async (authCode: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const sqlFindCode = 'SELECT user_id FROM auth_codes WHERE code = ? AND expires_at > NOW()';
  const [rows] = await mysql.query(sqlFindCode, [authCode]);

  if (rows.length === 0) throw new Error('Invalid authorization code');

  const userId = rows[0].user_id;

  await mysql.query('DELETE FROM auth_codes WHERE code = ?', [authCode]);

  // TODO: Consider moving this to the User model
  const sqlFindUser = 'SELECT * FROM users WHERE id = ?';
  const [users] = await mysql.query(sqlFindUser, [userId]);

  if (users.length === 0) throw new Error('No user associated with this code');

  const user = new User(users[0]);
  if (!user) throw new Error('Invalid user');

  const accessToken = generateToken(user);
  const refreshToken = uuidv4();

  const expiresAt = new Date(Date.now() + oauthConfig.refreshTokenLifetime * 1000);
  const sqlAddRefresh = 'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)';
  await mysql.query(sqlAddRefresh, [refreshToken, userId, expiresAt]);

  return { accessToken, refreshToken };
};
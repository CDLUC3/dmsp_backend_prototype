import casual from 'casual';
import jwt, { Jwt } from 'jsonwebtoken';
import { Response } from 'express';
import { logger } from '../../__mocks__/logger';
import { User, UserRole } from '../../models/User';
import { DEFAULT_INTERNAL_SERVER_MESSAGE, DEFAULT_UNAUTHORIZED_MESSAGE } from '../../utils/graphQLErrors';
import { Cache } from '../../datasources/cache';
import { generalConfig } from '../../config/generalConfig';
import {
  setTokenCookie,
  generateTokens,
  verifyAccessToken,
  refreshTokens,
  revokeAccessToken,
  revokeRefreshToken,
  isRevokedCallback,
} from '../tokenService'; // assuming the original code is in auth.ts
import { buildContext, mockToken } from '../../__mocks__/context';

jest.mock('jsonwebtoken');
jest.mock('../../datasources/cache');
jest.mock('../../models/User');

// Mock the process.env
const originalEnv = process.env;

let mockCache: jest.Mocked<Cache>;
let mockUser;

beforeEach(() => {
  jest.clearAllMocks();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // mockCache = { adapter: jest.fn() } as any;

  (Cache.getInstance as jest.Mock).mockReturnValue({
    adapter: {
      delete: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    },
  });
  mockCache = Cache.getInstance();

  mockUser = {
    id: casual.integer(1, 999),
    email: casual.email,
    givenName: casual.first_name,
    surName: casual.last_name,
    affiliationId: casual.url,
    role: UserRole.RESEARCHER,
  };
});

describe('setTokenCookie', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = { cookie: jest.fn() };
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should set a cookie with the provided name and value', () => {
    setTokenCookie(mockResponse as Response, 'testCookie', 'testValue');
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'testCookie',
      'testValue',
      expect.any(Object)
    );
  });

  it('should set httpOnly to true', () => {
    setTokenCookie(mockResponse as Response, 'testCookie', 'testValue');
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
      })
    );
  });

  it('should set secure to true in production environment', () => {
    process.env.NODE_ENV = 'production';
    setTokenCookie(mockResponse as Response, 'testCookie', 'testValue');
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        secure: true,
      })
    );
  });

  it('should set secure to false in non-production environment', () => {
    process.env.NODE_ENV = 'development';
    setTokenCookie(mockResponse as Response, 'testCookie', 'testValue');
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        secure: false,
      })
    );
  });

  it('should set sameSite to strict', () => {
    setTokenCookie(mockResponse as Response, 'testCookie', 'testValue');
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        sameSite: 'strict',
      })
    );
  });

  it('should set path to /', () => {
    setTokenCookie(mockResponse as Response, 'testCookie', 'testValue');
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        path: '/',
      })
    );
  });

  it('should use provided maxAge when given', () => {
    const maxAge = 3600000; // 1 hour in milliseconds
    setTokenCookie(mockResponse as Response, 'testCookie', 'testValue', maxAge);
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        maxAge: maxAge,
      })
    );
  });

  it('should use JWT TTL from env when maxAge is not provided', () => {
    generalConfig.jwtTTL = 90;

    setTokenCookie(mockResponse as Response, 'testCookie', 'testValue');
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        maxAge: 90,
      })
    );
  });
});

describe('generateTokens', () => {
  it('should generate access and refresh tokens', async () => {
    const mockAccessToken = 'mock-access-token';
    const mockRefreshToken = 'mock-refresh-token';

    const mockDate = new Date();
    jest.useFakeTimers().setSystemTime(mockDate);

    (jwt.sign as jest.Mock).mockImplementation((_payload, secret) => {
      if (secret === generalConfig.jwtSecret) return mockAccessToken;
      if (secret === generalConfig.jwtRefreshSecret) return mockRefreshToken;
    });

    const result = await generateTokens(mockCache, mockUser);

    expect(result).toEqual({ accessToken: mockAccessToken, refreshToken: mockRefreshToken });
    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(mockCache.adapter.set).toHaveBeenCalledWith(
      `dmspr-${mockDate.getTime().toString()}`, mockRefreshToken, { ttl: generalConfig.jwtRefreshTTL }
    );

    jest.useRealTimers();
  });

  it('should return null tokens if conditions are not met', async () => {
    const result = await generateTokens(mockCache, {} as User);
    expect(result).toEqual({ accessToken: null, refreshToken: null });
  });
});

describe('verifyAccessToken', () => {
  it('should return the decoded token if the token is valid', () => {
    const mockToken = 'valid-token';
    const mockPayload = { id: casual.integer(1, 9999), email: casual.email };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    const result = verifyAccessToken(mockToken);

    expect(result).toEqual(mockPayload);
    expect(jwt.verify).toHaveBeenCalledWith(mockToken, generalConfig.jwtSecret);
  });

  it('should return null if the token is invalid', () => {
    const mockToken = 'invalid-token';

    (jwt.verify as jest.Mock).mockReturnValue(null);

    expect(verifyAccessToken(mockToken)).toBe(null);
  });

  it('should throw an AuthenticationError for invalid token', () => {
    const mockToken = 'invalid-token';
    const errorMessage = 'Invalid token';
    const mockError = new Error(errorMessage);

    (jwt.verify as jest.Mock).mockImplementation(() => { throw mockError; });

    const expectedErr = `${DEFAULT_UNAUTHORIZED_MESSAGE} - ${errorMessage}`;
    expect(() => verifyAccessToken(mockToken)).toThrow(expectedErr);
    expect(logger.error).toHaveBeenCalledWith(mockError, `verifyAccessToken error - ${errorMessage}`);
  });
});

describe('isRevokedCallback', () => {
  it('returns false if the token is null or it has no payload', async () => {
    expect(await isRevokedCallback(null, null)).toBe(false);
  });

  it('returns false if the token has no payload', async () => {
    const token = { header: null, signature: null, payload: null };

    expect(await isRevokedCallback(null, token as Jwt)).toBe(false);
  });

  it('logs an error and returns false if an error is thrown', async () => {
    const mockJti = casual.integer(1, 99999).toString();
    const token = { header: null, signature: null, payload: { jti: mockJti } };

    const mockErr = new Error('Test cache error');
    (mockCache.adapter.get as jest.Mock).mockImplementation(() => { throw mockErr; });

    await isRevokedCallback(null, token as Jwt);
    const expoectedErr = 'isRevokedCallback - unable to fetch token from cache';
    expect(mockCache.adapter.get).toHaveBeenLastCalledWith(`dmspbl-${mockJti}`);
    expect(logger.error).toHaveBeenLastCalledWith(mockErr, expoectedErr);
  });

  it('returns true if the token is black listed', async () => {
    const mockJti = casual.integer(1, 99999).toString();
    const token = { header: null, signature: null, payload: { jti: mockJti } };

    (mockCache.adapter.get as jest.Mock).mockReturnValueOnce(mockJti);

    expect(await isRevokedCallback(null, token as Jwt)).toBe(true);
    expect(mockCache.adapter.get).toHaveBeenLastCalledWith(`dmspbl-${mockJti}`);
  });
});

describe('refreshTokens', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();

    context = buildContext(logger, mockToken());
  });

  it('should refresh valid tokens', async () => {
    const mockRefreshToken = 'valid-refresh-token';

    const mockNewAccessToken = 'valid-access-token';
    const mockNewRefreshToken = 'valid-refresh-token';

    (jwt.verify as jest.Mock).mockImplementation(() => { return mockUser; });
    (User.findById as jest.Mock).mockReturnValue(mockUser);
    (jwt.sign as jest.Mock).mockImplementation((_payload, secret) => {
      if (secret === generalConfig.jwtSecret) return mockNewAccessToken;
      if (secret === generalConfig.jwtRefreshSecret) return mockNewRefreshToken;
    })

    const result = await refreshTokens(mockCache, context, mockRefreshToken);

    expect(result).toEqual({ accessToken: mockNewAccessToken, refreshToken: mockNewRefreshToken });
    expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, generalConfig.jwtRefreshSecret);
  });

  it('should return null tokens if the User could not be found', async () => {
    const mockRefreshToken = 'revoked-refresh-token';
    const mockUserId = casual.integer(1, 999);

    (jwt.verify as jest.Mock).mockImplementation(() => { return { id: mockUserId }; });
    (User.findById as jest.Mock).mockReturnValue(null);

    const result = await refreshTokens(mockCache, context, mockRefreshToken);
    expect(result.accessToken).toBeFalsy();
    expect(result.refreshToken).toBeFalsy();
  });

  it('should return null tokens if the refresh token is invalid or revoked', async () => {
    const mockRefreshToken = 'revoked-refresh-token';

    (jwt.verify as jest.Mock).mockReturnValue(null);

    const result = await refreshTokens(mockCache, context, mockRefreshToken);
    expect(result.accessToken).toBeFalsy();
    expect(result.refreshToken).toBeFalsy();
  });

  it('should throw an AuthenticationError if jwt or RefreshToken throw an error', async () => {
    const mockRefreshToken = 'invalid-refresh-token';
    const errorMessage = 'Revoked token';

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });;

    await expect(refreshTokens(mockCache, context, mockRefreshToken))
      .rejects.toThrow(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${errorMessage}`);
    expect(logger.error).toHaveBeenCalled();
  });
});

describe('revokeRefreshToken', () => {
  it('should delete the token from the cache', async () => {
    const mockUserJti = casual.integer(1, 999999).toString();
    (mockCache.adapter.delete as jest.Mock).mockReturnValue(true);

    const result = await revokeRefreshToken(mockCache, mockUserJti);

    expect(result).toBe(true);
    expect(mockCache.adapter.delete).toHaveBeenCalledWith(`dmspr-${mockUserJti}`);
  });

  it('should return false if the cache delete returns false', async () => {
    (mockCache.adapter.delete as jest.Mock).mockReturnValue(false);

    const mockJti = casual.integer(1, 99999).toString();
    const result = await revokeRefreshToken(mockCache, mockJti);

    expect(result).toBe(false);
  });

  it('should throw and error and log error on failure', async () => {
    const mockError = new Error('Test error');
    (mockCache.adapter.delete as jest.Mock).mockImplementation(() => { throw mockError; });

    const expectedErr = `${DEFAULT_INTERNAL_SERVER_MESSAGE} - Test error`;
    await expect(() => revokeRefreshToken(mockCache, 'mock-token')).rejects.toThrow(expectedErr);
    const thrownErr = `revokeRefreshToken unable to delete token from cache - Test error`;
    expect(logger.error).toHaveBeenCalledWith(mockError, thrownErr);
  });
});

describe('revokeAccessToken', () => {
  it('should add the token to the cache black list', async () => {
    const mockJti = casual.integer(1, 999999).toString();
    (mockCache.adapter.set as jest.Mock);

    const result = await revokeAccessToken(mockCache, mockJti);

    expect(result).toBe(true);
    expect(mockCache.adapter.set)
      .toHaveBeenCalledWith(`dmspbl-${mockJti}`, '', { ttl: generalConfig.jwtTTL });
  });

  it('should throw and error and log error on failure', async () => {
    const mockJti = casual.integer(1, 999999).toString();
    const mockError = new Error('Test error');
    (mockCache.adapter.set as jest.Mock).mockImplementation(() => { throw mockError; });

    const expectedErr = `${DEFAULT_INTERNAL_SERVER_MESSAGE} - Test error`;
    await expect(() => revokeAccessToken(mockCache, mockJti)).rejects.toThrow(expectedErr);
    const thrownErr = `revokeAccessToken unable to add token to black list - Test error`;
    expect(logger.error).toHaveBeenCalledWith(mockError, thrownErr);
  });
});

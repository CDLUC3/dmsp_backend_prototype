import casual from 'casual';
import jwt, { Jwt } from 'jsonwebtoken';
import { createHash } from 'crypto';
import { Response } from 'express';
import { logger } from '../../__mocks__/logger';
import { User, UserRole } from '../../models/User';
import { DEFAULT_INTERNAL_SERVER_MESSAGE, DEFAULT_UNAUTHORIZED_MESSAGE } from '../../utils/graphQLErrors';
import { Cache } from '../../datasources/cache';
import { generalConfig } from '../../config/generalConfig';
import {
  setTokenCookie,
  generateAuthTokens,
  refreshAccessToken,
  revokeAccessToken,
  revokeRefreshToken,
  isRevokedCallback,
  verifyCSRFToken,
  generateCSRFToken,
} from '../tokenService'; // assuming the original code is in auth.ts
import { buildContext, mockToken } from '../../__mocks__/context';
import { defaultLanguageId } from '../../models/Language';

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
    languageId: defaultLanguageId,
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
        httpOnly: true,
        path: '/',
        secure: false,
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

describe('generateCSRFToken', () => {
  it('should generate a CSRF token and store the hashed version in the cache', async () => {
    (mockCache.adapter.set as jest.Mock);
    expect(await generateCSRFToken(mockCache)).toBeTruthy();
  });

  it('should return null if it is unable to store the CSRF token in the cache', async () => {
    const mockError = new Error('test CSRF failure');
    (mockCache.adapter.set as jest.Mock).mockImplementation(() => { throw mockError; });

    expect(await generateCSRFToken(mockCache)).toEqual(null);
    expect(logger.error).toHaveBeenLastCalledWith(mockError, 'generateCSRFToken error!');
  });
});

describe('generateAuthTokens', () => {
  it('should generate access and refresh tokens', async () => {
    const mockAccessToken = 'mock-access-token';
    const mockRefreshToken = 'mock-refresh-token';

    const mockDate = new Date();
    jest.useFakeTimers().setSystemTime(mockDate);

    (jwt.sign as jest.Mock).mockImplementation((_payload, secret) => {
      if (secret === generalConfig.jwtSecret) return mockAccessToken;
      if (secret === generalConfig.jwtRefreshSecret) return mockRefreshToken;
    });

    const result = await generateAuthTokens(mockCache, mockUser);

    expect(result).toEqual({ accessToken: mockAccessToken, refreshToken: mockRefreshToken });
    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(mockCache.adapter.set).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should return null tokens if conditions are not met', async () => {
    const result = await generateAuthTokens(mockCache, {} as User);
    expect(result).toEqual({ accessToken: null, refreshToken: null });
  });
});

describe('verifyCSRFToken', () => {
  it('returns true when the CSRF token matches the hashed token in the cache', async () => {
    const token = 'csrf-token';
    const hashed = createHash('sha256').update(`${token}${generalConfig.hashTokenSecret}`).digest('hex');

    (mockCache.adapter.get as jest.Mock).mockResolvedValue(hashed);

    expect(await verifyCSRFToken(mockCache, token)).toBe(true);
  });

  it('returns false when the CSRF token does NOT match the hashed token in the cache', async () => {
    const token = 'csrf-token';
    const hashed = 'hashed-token';

    (mockCache.adapter.get as jest.Mock).mockResolvedValue(hashed);

    expect(await verifyCSRFToken(mockCache, token)).toBe(false);
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
    expect(mockCache.adapter.get).toHaveBeenLastCalledWith(`dmspbl:${mockJti}`);
    expect(logger.error).toHaveBeenLastCalledWith(mockErr, expoectedErr);
  });

  it('returns true if the token is black listed', async () => {
    const mockJti = casual.integer(1, 99999).toString();
    const token = { header: null, signature: null, payload: { jti: mockJti } };

    (mockCache.adapter.get as jest.Mock).mockReturnValueOnce(mockJti);

    expect(await isRevokedCallback(null, token as Jwt)).toBe(true);
    expect(mockCache.adapter.get).toHaveBeenLastCalledWith(`dmspbl:${mockJti}`);
  });
});

describe('refreshAccessToken', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();

    context = buildContext(logger, mockToken());
  });

  it('should refresh the access token if refresh token is valid', async () => {
    const mockRefreshToken = 'valid-refresh-token';
    const hashedToken = createHash('sha256').update(`${mockRefreshToken}${generalConfig.hashTokenSecret}`).digest('hex');
    const mockNewAccessToken = 'valid-access-token';
    const mockNewRefreshToken = 'valid-refresh-token';

    (jwt.verify as jest.Mock).mockImplementation(() => { return mockUser; });
    (mockCache.adapter.get as jest.Mock).mockResolvedValue(hashedToken);
    (User.findById as jest.Mock).mockReturnValue(mockUser);
    (jwt.sign as jest.Mock).mockImplementation((_payload, secret) => {
      if (secret === generalConfig.jwtSecret) return mockNewAccessToken;
      if (secret === generalConfig.jwtRefreshSecret) return mockNewRefreshToken;
    })

    const result = await refreshAccessToken(mockCache, context, mockRefreshToken);

    expect(result).toEqual(mockNewAccessToken);
    expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, generalConfig.jwtRefreshSecret);
  });

  it('should throw an AuthenticationError if the User could not be found', async () => {
    const mockRefreshToken = 'revoked-refresh-token';
    const hashedToken = createHash('sha256').update(`${mockRefreshToken}${generalConfig.hashTokenSecret}`).digest('hex');
    const mockUserId = casual.integer(1, 999);

    (jwt.verify as jest.Mock).mockImplementation(() => { return { id: mockUserId }; });
    (mockCache.adapter.get as jest.Mock).mockResolvedValue(hashedToken);
    (User.findById as jest.Mock).mockReturnValue(null);

    await expect(refreshAccessToken(mockCache, context, mockRefreshToken))
      .rejects.toThrow(DEFAULT_UNAUTHORIZED_MESSAGE);
  });

  it('should throw an AuthenticationError if the refresh token is invalid', async () => {
    const mockRefreshToken = 'revoked-refresh-token';

    (jwt.verify as jest.Mock).mockReturnValue(null);

    await expect(refreshAccessToken(mockCache, context, mockRefreshToken))
      .rejects.toThrow(DEFAULT_UNAUTHORIZED_MESSAGE);
  });

  it('should throw an AuthenticationError if RefreshToken does not match the one stored in the cache', async () => {
    const mockRefreshToken = 'invalid-refresh-token';
    const mockHashed = 'mismatched-hash';
    const mockUserId = casual.integer(1, 999);
    const errorMessage = 'Invalid refresh token';

    (jwt.verify as jest.Mock).mockImplementation(() => { return { id: mockUserId }; });
    (mockCache.adapter.get as jest.Mock).mockResolvedValue(mockHashed);

    await expect(refreshAccessToken(mockCache, context, mockRefreshToken))
      .rejects.toThrow(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${errorMessage}`);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should throw an AuthenticationError if something throws an error', async () => {
    const mockRefreshToken = 'invalid-refresh-token';
    const errorMessage = 'Invalid refresh token';

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });;

    await expect(refreshAccessToken(mockCache, context, mockRefreshToken))
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
    expect(mockCache.adapter.delete).toHaveBeenCalledWith(`dmspr:${mockUserJti}`);
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
    expect(mockCache.adapter.set).toHaveBeenCalled();
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

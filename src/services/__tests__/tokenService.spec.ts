import casual from 'casual';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import mockLogger from '../../__tests__/mockLogger';
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
} from '../tokenService'; // assuming the original code is in auth.ts
import { buildContext, mockToken } from '../../__mocks__/context';

jest.mock('jsonwebtoken');

// Mock the process.env
const originalEnv = process.env;

let mockCache: jest.Mocked<Cache>;
let mockUser;

beforeEach(() => {
  jest.clearAllMocks();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockCache = { adapter: jest.fn() } as any;

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

  it('should use JWT_TTL from env when maxAge is not provided', () => {
    process.env.JWT_TTL = '900000'; // 15 minutes in milliseconds
    setTokenCookie(mockResponse as Response, 'testCookie', 'testValue');
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        maxAge: 900000,
      })
    );
  });
});

describe('generateTokens', () => {
  it('should generate access and refresh tokens', async () => {
    const mockAccessToken = 'mock-access-token';
    const mockRefreshToken = 'mock-refresh-token';

    (jwt.sign as jest.Mock).mockImplementation((_payload, secret) => {
      if (secret === generalConfig.jwtSecret) return mockAccessToken;
      if (secret === generalConfig.jwtRefreshSecret) return mockRefreshToken;
    });

    (mockCache.adapter.set as jest.Mock);

    const result = await generateTokens(mockCache, mockUser);

    expect(result).toEqual({ accessToken: mockAccessToken, refreshToken: mockRefreshToken });
    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(mockCache.adapter.set)
      .toHaveBeenCalledWith(`dmspr-${mockUser.id}`, refreshTokens, { ttl: generalConfig.jwtRefreshTTL });
  });

  it('should return null tokens if conditions are not met', async () => {
    const result = await generateTokens(mockCache, {} as User);
    expect(result).toEqual({ accessToken: null, refreshToken: null });
  });
});

describe('verifyAccessToken', () => {
  it('should verify a valid token', async () => {
    const mockToken = 'valid-token';
    const mockPayload = { id: 1, email: 'test@example.com' };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
    (mockCache.adapter.get as jest.Mock).mockReturnValue(null);

    const result = verifyAccessToken(mockCache, mockToken);

    expect(result).toEqual(mockPayload);
    expect(jwt.verify).toHaveBeenCalledWith(mockToken, generalConfig.jwtSecret);
    expect(mockCache.adapter.get).toHaveBeenCalledWith(`dmspbl-${mockToken}`);
  });

  it('should return null if the token is in the black list', async () => {
    const mockToken = 'invalid-token';
    const mockPayload = { id: 1, email: 'test@example.com' };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
    (mockCache.adapter.get as jest.Mock).mockReturnValue(mockToken);

    expect(await verifyAccessToken(mockCache, mockToken)).toBe(null);
  });

  it('should throw an AuthenticationError for invalid token', async () => {
    const mockToken = 'invalid-token';
    const errorMessage = 'Invalid token';

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    expect(() => verifyAccessToken(mockCache, mockToken)).toThrow(`${DEFAULT_UNAUTHORIZED_MESSAGE} - ${errorMessage}`);
    expect(mockLogger.error).toHaveBeenCalled();
  });
});

describe('refreshTokens', () => {
  let context;
  let logger;

  beforeEach(() => {
    jest.clearAllMocks();

    logger = mockLogger;
    context = buildContext(logger, mockToken());
  });

  it('should refresh valid tokens', async () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockDecoded = { id: 1, email: 'test@example.com' };

    const mockNewAccessToken = 'valid-access-token';
    const mockNewRefreshToken = 'valid-refresh-token';

    (jwt.verify as jest.Mock).mockImplementation((_payload, secret) => {
      if (secret === generalConfig.jwtSecret) return mockDecoded;
      if (secret === generalConfig.jwtRefreshSecret) return { id: mockDecoded.id };
    });
    (jwt.sign as jest.Mock).mockImplementation((_payload, secret) => {
      if (secret === generalConfig.jwtSecret) return mockNewAccessToken;
      if (secret === generalConfig.jwtRefreshSecret) return mockNewRefreshToken;
    });

    (User.findById as jest.Mock).mockResolvedValueOnce(mockDecoded as User);

    const result = await refreshTokens(mockCache, context, mockRefreshToken);

    expect(result).toEqual({ accessToken: mockNewAccessToken, refreshTokens: mockNewRefreshToken });
    expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, generalConfig.jwtRefreshSecret);
    expect(jwt.sign).toHaveBeenCalledWith(
      mockDecoded,
      generalConfig.jwtSecret, { expiresIn: generalConfig.jwtTTL });
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockDecoded.id },
      generalConfig.jwtRefreshSecret,
      { expiresIn: generalConfig.jwtRefreshTTL }
    );
  });

  it('should return null tokens if the User could not be found', async () => {
    const mockRefreshToken = 'revoked-refresh-token';
    const mockDecoded = { id: 1, email: 'test@example.com' };

    const mockNewAccessToken = 'valid-access-token';
    const mockNewRefreshToken = 'valid-refresh-token';

    (jwt.verify as jest.Mock).mockImplementation((_payload, secret) => {
      if (secret === generalConfig.jwtSecret) return mockDecoded;
      if (secret === generalConfig.jwtRefreshSecret) return { id: mockDecoded.id };
    });
    (User.findById as jest.Mock).mockResolvedValueOnce(null);

    const result = await refreshTokens(mockCache, context, mockRefreshToken);
    expect(result.accessToken).toBeFalsy();
    expect(result.refreshToken).toBeFalsy();
  });

  it('should return a null tokens if the refresh token is invalid or revoked', async () => {
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
    expect(mockLogger.error).toHaveBeenCalled();
  });
});

describe('revokeRefreshToken', () => {
  it('should delete the token from the cache', async () => {
    const mockUserId = casual.integer(1, 999);
    (mockCache.adapter.delete as jest.Mock);

    const result = await revokeRefreshToken(mockCache, mockUserId);

    expect(result).toBe(true);
    expect(mockCache.adapter.delete).toHaveBeenCalledWith(`dmspr-${mockUserId}`);
  });

  it('should return false and log error on failure', async () => {
    (mockCache.adapter.delete as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    const result = await revokeRefreshToken(mockCache, casual.integer(1, 99));

    expect(result).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error), `${DEFAULT_INTERNAL_SERVER_MESSAGE} - Test error`
    );
  });
});

describe('revokeAccessToken', () => {
  it('should add the token to the cache black list', async () => {
    const mockToken = 'mock-token';
    (mockCache.adapter.set as jest.Mock);

    const result = await revokeAccessToken(mockCache, mockToken);

    expect(result).toBe(true);
    expect(mockCache.adapter.set)
      .toHaveBeenCalledWith(`dmspbl-${mockToken}`, mockToken, { ttl: generalConfig.jwtTTL });
  });

  it('should return false and log error on failure', async () => {
    (mockCache.adapter.set as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    const result = await revokeAccessToken(mockCache, 'mock-token');

    expect(result).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error), `${DEFAULT_INTERNAL_SERVER_MESSAGE} - Test error`
    );
  });
});

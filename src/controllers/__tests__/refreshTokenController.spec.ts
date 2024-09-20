import { Response } from 'express';
import { Request } from 'express-jwt';
import { Cache } from "../../datasources/cache";
import { refreshAuthTokens, setTokenCookie } from '../../services/tokenService';
import { generalConfig } from '../../config/generalConfig';
import { logger } from '../../__mocks__/logger';
import { refreshTokenController } from '../refreshTokenController';
// We mock buildContext below, not sure why it complains here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { buildContext } from '../../context';
import { mockDataSources, mockToken } from '../../__mocks__/context';
import casual from 'casual';

// Mocking external dependencies
jest.mock('../../context');
jest.mock('../../datasources/cache');
jest.mock('../../services/tokenService');
jest.mock('../../config/generalConfig');

describe('refreshTokenController', () => {
  let mockContext;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCache: jest.Mocked<Cache>;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRequest = {
      auth: { jti: casual.integer(1, 99999).toString(), id: casual.integer(1, 999) },
      headers: { 'x-refresh-token': 'old-refresh-token' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockCache = Cache.getInstance() as jest.Mocked<Cache>;
    (Cache.getInstance as jest.Mock).mockReturnValue(mockCache);

    const token = mockToken();
    mockContext = jest.fn().mockImplementation(() => {
      return {
        token: token,
        logger: logger,
        dataSources: mockDataSources,
      }
    });
    (buildContext as jest.Mock) = mockContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh tokens successfully', async () => {
    mockRequest.cookies = { dmspr: 'old-refresh-token' };

    (refreshAuthTokens as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    });

    await refreshTokenController(mockRequest as Request, mockResponse as Response);

    expect(refreshAuthTokens).toHaveBeenCalledWith(mockCache, mockContext(), 'old-refresh-token');
    expect(setTokenCookie).toHaveBeenCalledWith(mockResponse, 'dmspt', 'new-access-token', generalConfig.jwtTTL);
    expect(setTokenCookie).toHaveBeenCalledWith(mockResponse, 'dmspr', 'new-refresh-token', generalConfig.jwtRefreshTTL);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'ok' });
  });

  it('should return 401 if refresh token is missing', async () => {
    await refreshTokenController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Refresh token required!' });
  });

  it('should return 400 if unable to refresh tokens', async () => {
    mockRequest.cookies = { dmspr: 'old-refresh-token' };
    (refreshAuthTokens as jest.Mock).mockResolvedValue({});

    await refreshTokenController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Unable to refresh the access token at this time!' });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    mockRequest.cookies = { dmspr: 'old-refresh-token' };
    (refreshAuthTokens as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    await refreshTokenController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'An unexpected error occurred' });
  });
});

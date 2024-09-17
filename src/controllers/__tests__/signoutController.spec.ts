import { Request, Response } from 'express';
import { Cache } from "../../datasources/cache";
import { verifyAccessToken, revokeAccessToken, revokeRefreshToken, tokensFromHeaders } from '../../services/tokenService';
import { refreshTokenController } from '../refreshTokenController';
import casual from 'casual';
import { signoutController } from '../signoutController';

// Mocking external dependencies
jest.mock('../../datasources/cache');
jest.mock('../../services/tokenService');

describe('signoutController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCache: jest.Mocked<Cache>;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRequest = { headers: { 'authorization': 'Bearer old-access-token' } };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };
    mockCache = Cache.getInstance() as jest.Mocked<Cache>;
    (Cache.getInstance as jest.Mock).mockReturnValue(mockCache);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh tokens successfully', async () => {
    mockRequest = { headers: { 'authorization': 'Bearer old-access-token' } };
    const mockJti = casual.integer(1, 99999);

    (tokensFromHeaders as jest.Mock).mockReturnValue({ accessToken: 'old-access-token' });
    (verifyAccessToken as jest.Mock).mockReturnValue({ jti: mockJti });
    (revokeRefreshToken as jest.Mock).mockResolvedValue(true);
    (revokeAccessToken as jest.Mock);
    jest.spyOn(mockResponse, 'clearCookie');

    await signoutController(mockRequest as Request, mockResponse as Response);

    expect(verifyAccessToken).toHaveBeenCalledWith('old-access-token');
    expect(revokeRefreshToken).toHaveBeenCalledWith(mockCache, mockJti);
    expect(revokeAccessToken).toHaveBeenCalledWith(mockCache, 'old-access-token');
    expect(mockResponse.clearCookie).toHaveBeenCalledWith('dmspt');
    expect(mockResponse.clearCookie).toHaveBeenCalledWith('dmspr');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'ok' });
  });

  it('should return 400 if no access token is present', async () => {
    (tokensFromHeaders as jest.Mock).mockReturnValue({ accessToken: null });

    await signoutController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json)
      .toHaveBeenCalledWith({ success: false, message: 'Unable to sign out at this time.' });
  });

  it('should return 400 if token could not be verfied', async () => {
    mockRequest = { headers: { 'authorization': 'Bearer old-access-token' } };

    (tokensFromHeaders as jest.Mock).mockReturnValue({ accessToken: 'old-access-token' });
    (verifyAccessToken as jest.Mock).mockReturnValue(null);
    await signoutController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json)
      .toHaveBeenCalledWith({ success: false, message: 'Unable to sign out at this time.' });
  });

  it('should return 400 if unable to revoke the refresh token', async () => {
    mockRequest = { headers: { 'authorization': 'Bearer old-access-token' } };
    const mockJti = casual.integer(1, 99999);

    (tokensFromHeaders as jest.Mock).mockReturnValue({ accessToken: 'old-access-token' });
    (verifyAccessToken as jest.Mock).mockReturnValue({ jti: mockJti });
    (revokeRefreshToken as jest.Mock).mockResolvedValue(false);

    await signoutController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json)
      .toHaveBeenCalledWith({ success: false, message: 'Unable to sign out at this time.' });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    (tokensFromHeaders as jest.Mock).mockReturnValue({ accessToken: 'old-access-token' });
    (verifyAccessToken as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    await refreshTokenController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
  });
});

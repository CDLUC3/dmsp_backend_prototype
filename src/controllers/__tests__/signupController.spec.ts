import casual from 'casual';
import { Request, Response } from 'express';
import { Cache } from "../../datasources/cache";
import { generateAuthTokens, setTokenCookie } from '../../services/tokenService';
import { generalConfig } from '../../config/generalConfig';
import * as UserModel from '../../models/User';
import { signupController } from '../signupController';

// Mocking external dependencies
jest.mock('../../datasources/cache');
jest.mock('../../services/tokenService');
jest.mock('../../config/generalConfig');

const mockedUser: UserModel.User = {
  id: casual.integer(1, 999),
  email: casual.email,
  givenName: casual.first_name,
  surName: casual.last_name,
  affiliationId: casual.url,
  role: UserModel.UserRole.RESEARCHER,
  acceptedTerms: true,
  password: casual.uuid,
  created: new Date().toISOString(),
  errors: [],

  isValid: jest.fn(),
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
  cleanup: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
};

jest.mock('../../models/User');

describe('signupController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCache: jest.Mocked<Cache>;
  let mockUser;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRequest = {
      body: {
        email: casual.email,
        givenName: casual.first_name,
        surName: casual.last_name,
        password: casual.uuid,
        affiliationId: casual.url,
        role: UserModel.UserRole.RESEARCHER,
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockCache = Cache.getInstance() as jest.Mocked<Cache>;
    (Cache.getInstance as jest.Mock).mockReturnValue(mockCache);

    mockUser = mockedUser;
    jest.spyOn(UserModel, 'User').mockReturnValue(mockUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sign the user in and set the access and refresh tokens successfully', async () => {
    jest.spyOn(mockUser, 'register').mockResolvedValueOnce(mockedUser);
    (generateAuthTokens as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    });

    await signupController(mockRequest as Request, mockResponse as Response);

    expect(generateAuthTokens).toHaveBeenCalledWith(mockCache, mockedUser);
    expect(setTokenCookie).toHaveBeenCalledWith(mockResponse, 'dmspt', 'new-access-token', generalConfig.jwtTTL);
    expect(setTokenCookie).toHaveBeenCalledWith(mockResponse, 'dmspr', 'new-refresh-token', generalConfig.jwtRefreshTTL);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'ok' });
  });

  it('should return 400 if user is invalid', async () => {
    jest.spyOn(mockUser, 'register').mockResolvedValueOnce(mockedUser);
    mockUser.errors = ['Test error 1', 'Test error 2'];
    await signupController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json)
      .toHaveBeenCalledWith({ success: false, message: 'Test error 1 | Test error 2' });
    mockUser.errors = [];
  });

  it('should return 500 if user registration fails for some unknown reason', async () => {
    jest.spyOn(mockUser, 'register').mockResolvedValueOnce(null);
    await signupController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json)
      .toHaveBeenCalledWith({ success: false, message: 'Unable to create the account at this time.' });
  });

  it('should return 500 if unable to generate tokens', async () => {
    jest.spyOn(mockUser, 'register').mockResolvedValueOnce(mockedUser);
    (generateAuthTokens as jest.Mock).mockResolvedValue({});

    await signupController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Unable to create the account at this time.' });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    jest.spyOn(mockUser, 'register').mockResolvedValueOnce(mockedUser);
    const mockError = new Error('Unexpected error');
    (generateAuthTokens as jest.Mock).mockRejectedValue(mockError);

    await signupController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error' });
  });
});

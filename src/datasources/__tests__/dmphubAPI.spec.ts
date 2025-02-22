import nock from 'nock';
import { DMPHubAPI, Authorizer } from '../dmphubAPI';
import { RESTDataSource } from '@apollo/datasource-rest';
import { logger, formatLogMessage } from '../../__mocks__/logger';
import { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { JWTAccessToken } from '../../services/tokenService';
import { buildContext, MockCache, mockToken } from '../../__mocks__/context';
import { DMP } from '../../models/DMP';
import { DMPHubConfig } from '../../config/dmpHubConfig';

jest.mock('../../context.ts');

let mockError;

beforeEach(() => {
  jest.clearAllMocks();

  mockError = jest.fn();
  (logger.error as jest.Mock) = mockError;
});

// Mock RESTDataSource methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGet = jest.spyOn(RESTDataSource.prototype as any, 'get');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPost = jest.spyOn(RESTDataSource.prototype as any, 'post');

describe('Authorizer', () => {
  let authorizer: Authorizer;

  beforeEach(() => {
    mockPost.mockClear();
    authorizer = Authorizer.instance;

    // Set up nock to intercept the OAuth2 token request
    nock(DMPHubConfig.dmpHubAuthURL)
      .post('/oauth2/token')
      .reply(200, { access_token: 'test_token' });
  });

  afterEach(() => {
    // Clean up all mocks after each test
    nock.cleanAll();
  });

  it('should create a singleton instance', () => {
    const instance1 = Authorizer.instance;
    const instance2 = Authorizer.instance;
    expect(instance1).toBe(instance2); // Both should be the same instance
  });

  it('should encode credentials and call authenticate method', async () => {
    const mockResponse = { access_token: 'test_token' };
    mockPost.mockResolvedValue(mockResponse);
    await authorizer.authenticate();

    expect(mockPost).toHaveBeenCalledWith(`/oauth2/token`);
    expect(authorizer.oauth2Token).toBe('test_token');
    expect(logger.info).toHaveBeenCalledWith('Authenticating with DMPHub');
  });

  it('should check token expiration', () => {
    const expiredDate = new Date(Date.now() - 600 * 1000); // Set expired date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (authorizer as any).expiry = expiredDate;
    expect(authorizer.hasExpired()).toBe(true);
  });

  it('should correctly set request headers in willSendRequest', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request: any = { headers: {}, body: '' };

    authorizer.willSendRequest('/oauth2/token', request);

    const creds = Buffer.from(`${DMPHubConfig.dmpHubClientId}:${DMPHubConfig.dmpHubClientSecret}`).toString('base64');
    expect(request.headers['authorization']).toBe(`Basic ${creds}`);
    expect(request.headers['content-type']).toBe('application/x-www-form-urlencoded');
    expect(request.body).toContain('grant_type=client_credentials');
  });
});

describe('DMPToolAPI', () => {
  let dmphubAPI: DMPHubAPI;

  beforeEach(() => {
    mockGet.mockClear();

    // Initialize DMPToolAPI
    dmphubAPI = new DMPHubAPI({
      cache: {} as KeyValueCache,
      token: {} as JWTAccessToken,
    });
  });

  describe('willSendRequest', () => {
    it('should re-authenticate if token has expired and set headers', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: any = { headers: {} };

      // Mock token expiration and authentication
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(true);
      jest.spyOn(Authorizer.instance, 'authenticate').mockResolvedValue(undefined);
      Authorizer.instance.oauth2Token = 'new_test_token';

      dmphubAPI.willSendRequest('/affiliations', request);

      expect(Authorizer.instance.authenticate).toHaveBeenCalled();
      expect(request.headers['authorization']).toBe('Bearer new_test_token');
    });
  });

  describe('getDMP', () => {
    it('should call get with the correct dmpId and the latest version by default', async () => {
      const context = buildContext(logger, mockToken(), new MockCache());
      const dmpId = '11.22222/3C4D5E6G';
      const mockResponse = {
        status: 200,
        items: [{ dmp: { dmp_id: `https://doi.org/${dmpId}`, title: 'Test DMP' } }]
      };
      mockGet.mockResolvedValue(mockResponse);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      const result = await dmphubAPI.getDMP(context, dmpId);

      expect(mockGet).toHaveBeenCalledWith(`dmps/${dmpId}?version=LATEST`);
      expect(result).toBeInstanceOf(DMP);
      expect(formatLogMessage(context).info).toHaveBeenCalledWith(
        `getDMP Calling DMPHub: ${DMPHubConfig.dmpHubURL}/dmps/${dmpId}?version=LATEST`
      );
    });

    it('should call get with the correct dmpId and the specified version', async () => {
      const context = buildContext(logger, mockToken(), new MockCache());
      const dmpId = '11.22222/3C4D5E6G';
      const mockResponse = {
        status: 200,
        items: [{ dmp: { dmp_id: `https://doi.org/${dmpId}`, title: 'Test DMP' } }]
      };
      mockGet.mockResolvedValue(mockResponse);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      const result = await dmphubAPI.getDMP(context, dmpId, '1234', 'getDMP');

      expect(mockGet).toHaveBeenCalledWith(`dmps/${dmpId}?version=1234`);
      expect(result).toBeInstanceOf(DMP);
      expect(formatLogMessage(context).info).toHaveBeenCalledWith(
        `getDMP Calling DMPHub: ${DMPHubConfig.dmpHubURL}/dmps/${dmpId}?version=1234`
      );
    });

    it('should throw and error when get fails', async () => {
      const context = buildContext(logger);
      const dmpId = '11.22222/3C4D5E6G';
      const mockError = new Error('API error');
      //mockGet.mockRejectedValue(mockError);
      mockGet.mockImplementation(() => { throw mockError });
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      await expect(dmphubAPI.getDMP(context, `http://localhost:3000/dmphub/dmps/${dmpId}`)).rejects.toThrow('API error');
    });
  });
});

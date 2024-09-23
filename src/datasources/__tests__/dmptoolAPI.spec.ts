import nock from 'nock';
import { DMPToolAPI, Authorizer } from '../dmptoolAPI';
import { RESTDataSource } from '@apollo/datasource-rest';
import { logger, formatLogMessage } from '../../__mocks__/logger';
import { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { JWTAccessToken } from '../../services/tokenService';
import { Affiliation, AffiliationSearch } from "../../models/Affiliation";

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

    // Mock environment variables
    process.env.DMPHUB_AUTH_URL = 'https://dmphub.example.com';
    process.env.DMPHUB_API_CLIENT_ID = 'test_client_id';
    process.env.DMPHUB_API_CLIENT_SECRET = 'test_client_secret';

    authorizer = Authorizer.instance;

    // Set up nock to intercept the OAuth2 token request
    nock(process.env.DMPHUB_AUTH_URL)
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
    expect(formatLogMessage(logger).info).toHaveBeenCalledWith('Authenticating with DMPHub');
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

    expect(request.headers['authorization']).toBe('Basic dGVzdF9jbGllbnRfaWQ6dGVzdF9jbGllbnRfc2VjcmV0');
    expect(request.headers['content-type']).toBe('application/x-www-form-urlencoded');
    expect(request.body).toContain('grant_type=client_credentials');
  });
});

describe('DMPToolAPI', () => {
  let dmptoolAPI: DMPToolAPI;

  beforeEach(() => {
    mockGet.mockClear();

    // Mock environment variable
    process.env.DMPHUB_API_BASE_URL = 'https://dmphub.example.com';

    // Initialize DMPToolAPI
    dmptoolAPI = new DMPToolAPI({
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

      dmptoolAPI.willSendRequest('/affiliations', request);

      expect(Authorizer.instance.authenticate).toHaveBeenCalled();
      expect(request.headers['authorization']).toBe('Bearer new_test_token');
    });
  });

  describe('getAffiliation', () => {
    it('should call get with the correct affiliationId and log the message', async () => {
      const mockResponse = { id: '123', name: 'Test Affiliation' };
      mockGet.mockResolvedValue(mockResponse);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      const result = await dmptoolAPI.getAffiliation('https://example.com/affiliation/123');

      expect(mockGet).toHaveBeenCalledWith('affiliations/example.com/affiliation/123');
      expect(result).toBeInstanceOf(Affiliation);
      expect(formatLogMessage(logger).info).toHaveBeenCalledWith(
        'Calling DMPHub: https://dmphub.example.com/affiliations/example.com/affiliation/123'
      );
    });

    it('should log error and throw when get fails', async () => {
      const mockError = new Error('API error');
      mockGet.mockRejectedValue(mockError);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      await expect(dmptoolAPI.getAffiliation('https://example.com/affiliation/123')).rejects.toThrow('API error');
      expect(formatLogMessage(logger, { err: mockError }).error).toHaveBeenCalledWith(
        'Error calling DMPHub API getAffiliation.'
      );
    });
  });

  describe('getAffiliations', () => {
    it('should call get with the correct query string and return affiliations', async () => {
      const mockResponse = [{ id: '1', name: 'Affiliation1' }, { id: '2', name: 'Affiliation2' }];
      mockGet.mockResolvedValue(mockResponse);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      const result = await dmptoolAPI.getAffiliations({ name: 'University', funderOnly: true });

      expect(mockGet).toHaveBeenCalledWith('affiliations?search=University&funderOnly=true');
      expect(result.length).toBe(2);
      expect(result[0]).toBeInstanceOf(AffiliationSearch);
    });

    it('should log error and throw when get fails', async () => {
      const mockError = new Error('API error');
      mockGet.mockRejectedValue(mockError);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      await expect(dmptoolAPI.getAffiliations({ name: 'University' })).rejects.toThrow('API error');
      expect(formatLogMessage(logger, { err: mockError }).error).toHaveBeenCalledWith(
        'Error calling DMPHub API getAffiliation.'
      );
    });
  });
});

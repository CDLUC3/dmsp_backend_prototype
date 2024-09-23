import { DMPHubAPI } from '../dmphubAPI';
import { RESTDataSource } from '@apollo/datasource-rest';
import { logger, formatLogMessage } from '../../__mocks__/logger';
import { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { JWTAccessToken } from '../../services/tokenService';
import { DmspModel as Dmsp } from '../../models/Dmsp';
import casual from 'casual';
import { ContributorRole } from '../../models/ContributorRole';

let mockError;

beforeEach(() => {
  jest.clearAllMocks();

  mockError = jest.fn();
  (logger.error as jest.Mock) = mockError;
});

// Mock RESTDataSource.get method
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGet = jest.spyOn(RESTDataSource.prototype as any, 'get');

describe('DMPHubAPI', () => {
  let dmphubAPI: DMPHubAPI;

  beforeEach(() => {
    mockGet.mockClear();

    // Mock environment variable
    process.env.DMPHUB_API_BASE_URL = 'https://dmphub.example.com';

    // Initialize the class
    dmphubAPI = new DMPHubAPI({
      cache: {} as KeyValueCache,
      token: {} as JWTAccessToken,
    });
  });

  describe('dmspIdWithoutProtocol', () => {
    it('should remove protocol and keep the rest of the DMSP ID', () => {
      const dmspId = 'https://example.com/dmsp';
      const result = dmphubAPI.dmspIdWithoutProtocol(dmspId);
      expect(result).toBe('example.com/dmsp');
    });

    it('should handle encoded slashes and preserve them', () => {
      const dmspId = 'https://example.com%2Fdmsp';
      const result = dmphubAPI.dmspIdWithoutProtocol(dmspId);
      expect(result).toBe('example.com/dmsp');
    });
  });

  describe('getDMSPs', () => {
    it('should call RESTDataSource.get with the correct endpoint', async () => {
      const mockDMSPs: Dmsp[] = [{
        title: casual.sentence,
        isFeatured: 'no',
        description: casual.sentences(5),
        primaryContact: {
          name: casual.name,
          mbox: casual.email,
          affiliation: {
            name: casual.company_name,
            ror: casual.url,
            affiliation_id: casual.url,
          },
          orcid: casual.url,
        },
        contributors: [{
          name: casual.name,
          mbox: casual.email,
          role: [new ContributorRole({})],
          orcid: casual.url,
          affiliation: {
            name: casual.company_name,
            ror: casual.url,
            affiliation_id: casual.url,
          }
        }],
        hasEthicalConcerns: 'yes',
        ethicalConcernsDescription: casual.sentences(3),
        ethicalConcernsReportURL: casual.url,
        visibility: 'PUBLIC',
        language: 'eng',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      }];
      mockGet.mockResolvedValue(mockDMSPs);

      const result = await dmphubAPI.getDMSPs();
      expect(mockGet).toHaveBeenCalledWith('dmps');
      expect(result).toEqual(mockDMSPs);
    });
  });

  describe('getDMSP', () => {
    it('should log and call RESTDataSource.get with the correct DMSP ID', async () => {
      const mockResponse = {
        status: 200,
        items: [{ dmp: { id: '123' } }],
      };
      mockGet.mockResolvedValue(mockResponse);

      const dmspID = 'https://example.com/dmsp/123';
      const result = await dmphubAPI.getDMSP(dmspID);

      // Ensure the log message is correct
      expect(formatLogMessage(logger).info).toHaveBeenCalledWith(
        `Calling DMPHub: https://dmphub.example.com/dmps/${dmspID}`
      );

      // Ensure the RESTDataSource.get is called with the correct ID
      expect(mockGet).toHaveBeenCalledWith('dmps/example.com/dmsp/123');

      // Ensure the handleResponse logic is called and processes the mock response
      expect(result).toEqual({
        code: 200,
        success: true,
        message: 'Ok',
        dmsp: { id: '123' },
      });
    });

    it('should handle errors gracefully and log them', async () => {
      const mockError = new Error('API error');
      mockGet.mockRejectedValue(mockError);

      const dmspID = 'https://example.com/dmsp/123';

      await expect(dmphubAPI.getDMSP(dmspID)).rejects.toThrow('API error');

      // Ensure the error was logged
      expect(formatLogMessage(logger, { err: mockError }).error).toHaveBeenCalledWith(
        'Error calling DMPHub API getDMSP.'
      );
    });
  });

  describe('handleResponse', () => {
    it('should return a success response when status is 200', () => {
      const response = {
        status: 200,
        items: [{ dmp: { id: '123' } }],
      };
      const result = dmphubAPI.handleResponse(response);

      expect(result).toEqual({
        code: 200,
        success: true,
        message: 'Ok',
        dmsp: { id: '123' },
      });
    });

    it('should return an error response when status is not 200', () => {
      const response = {
        status: 400,
        errors: ['Bad request'],
        items: [],
      };
      const result = dmphubAPI.handleResponse(response);

      expect(result).toEqual({
        code: 400,
        success: false,
        message: 'Bad request',
        dmsp: undefined,
      });
    });
  });
});

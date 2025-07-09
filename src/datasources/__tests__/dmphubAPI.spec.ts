import nock from 'nock';
import { DMPHubAPI, Authorizer } from '../dmphubAPI';
import { DMPIdentifierType, DMPPrivacy, DMPStatus, DMPYesNoUnknown } from '../../types/DMP';
import { RESTDataSource } from '@apollo/datasource-rest';
import { JWTAccessToken } from '../../services/tokenService';
import { buildContext, MockCache, mockToken, buildMockContextWithToken } from '../../__mocks__/context';
import { DMPHubConfig } from '../../config/dmpHubConfig';
import casual from 'casual';
import { getRandomEnumValue } from '../../__tests__/helpers';
import {KeyvAdapter} from "@apollo/utils.keyvadapter";
import { logger } from "../../logger";

jest.mock('../../context.ts');

let mockError;
let dmp;

beforeEach(() => {
  jest.clearAllMocks();

  mockError = jest.fn();
  (logger.error as jest.Mock) = mockError;

  dmp = {
    dmphub_provenance_id: casual.word,
    dmproadmap_featured: casual.boolean,
    dmproadmap_privacy: getRandomEnumValue(DMPPrivacy),
    dmproadmap_status: getRandomEnumValue(DMPStatus),
    created: casual.date('YYYY-MM-DD'),
    modified: casual.date('YYYY-MM-DD'),
    title: casual.title,
    language: 'eng',
    ethical_issues_exist: getRandomEnumValue(DMPYesNoUnknown),
    dmp_id: { identifier: casual.url, type: getRandomEnumValue(DMPIdentifierType) },
    contact: {
      mbox: casual.email,
      name: casual.name,
      contact_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.uuid },
      dmproadmap_affiliation: {
        name: casual.company_name,
        affiliation_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.url },
      }
    },
    dataset: [{
      type: casual.word,
      title: casual.title,
      dataset_id: { type: getRandomEnumValue(DMPIdentifierType), identifier: casual.url },
      sensitive_data: getRandomEnumValue(DMPYesNoUnknown),
      personal_data: getRandomEnumValue(DMPYesNoUnknown),
    }],
    project: [{ title: casual.title }],
  }
});

// Mock RESTDataSource methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGet = jest.spyOn(RESTDataSource.prototype as any, 'get');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPost = jest.spyOn(RESTDataSource.prototype as any, 'post');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPut = jest.spyOn(RESTDataSource.prototype as any, 'put');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDelete = jest.spyOn(RESTDataSource.prototype as any, 'delete');

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
      cache: {} as KeyvAdapter,
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
      const context = await buildMockContextWithToken(logger);
      const dmpId = '11.22222/3C4D5E6G';
      const mockResponse = {
        status: 200,
        items: [{ dmp: { dmp_id: `https://doi.org/${dmpId}`, title: 'Test DMP' } }]
      };
      mockGet.mockResolvedValue(mockResponse);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      await dmphubAPI.getDMP(context, dmpId);

      expect(mockGet).toHaveBeenCalledWith(`dmps/${dmpId}?version=LATEST`);
      expect(context.logger.debug).toHaveBeenCalledWith(
        `dmphubAPI.getDMP calling DMPHub Get: ${DMPHubConfig.dmpHubURL}/dmps/${dmpId}?version=LATEST`
      );
    });

    it('should call get with the correct dmpId and the specified version', async () => {
      const context = await buildMockContextWithToken(logger);
      const dmpId = '11.22222/3C4D5E6G';
      const mockResponse = {
        status: 200,
        items: [{ dmp: { dmp_id: `https://doi.org/${dmpId}`, title: 'Test DMP' } }]
      };
      mockGet.mockResolvedValue(mockResponse);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      await dmphubAPI.getDMP(context, dmpId, '1234', 'getDMP');

      expect(mockGet).toHaveBeenCalledWith(`dmps/${dmpId}?version=1234`);
      expect(context.logger.debug).toHaveBeenCalledWith(
        `getDMP calling DMPHub Get: ${DMPHubConfig.dmpHubURL}/dmps/${dmpId}?version=1234`
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

  describe('createDMP', () => {
    it('should create the DMP', async () => {
      const context = await buildMockContextWithToken(logger);
      const dmpId = '11.22222/3C4D5E6G';
      const mockResponse = {
        status: 200,
        items: [{
          dmp: {
            ...dmp,
            dmp_id: { type: 'doi', identifier: dmpId }
          }
        }]
      };
      mockPost.mockResolvedValue(mockResponse);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);
      await dmphubAPI.createDMP(context, dmp);

      expect(mockPost).toHaveBeenCalledWith(`dmps`, { body: JSON.stringify({ dmp }) });
      expect(context.logger.debug).toHaveBeenCalledWith(
        `dmphubAPI.createDMP calling DMPHub Create: ${DMPHubConfig.dmpHubURL}/dmps`
      );
    });

    it('should throw and error when get fails', async () => {
      const context = buildContext(logger);
      const mockError = new Error('API error');
      mockPost.mockImplementation(() => { throw mockError });
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      await expect(dmphubAPI.createDMP(context, dmp)).rejects.toThrow('API error');
    });
  });

  describe('updateDMP', () => {
    it('should update the DMP', async () => {
      const context = await buildMockContextWithToken(logger);
      const mockResponse = {
        status: 200,
        items: [{ dmp }]
      };
      const dmpId = '11.22222/3C4D5E6G';
      dmp.dmp_id = { type: 'doi', identifier: dmpId };
      mockPut.mockResolvedValue(mockResponse);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);
      await dmphubAPI.updateDMP(context, dmp);

      expect(mockPut).toHaveBeenCalledWith(`dmps/${dmpId}`, { body: JSON.stringify({ dmp }) });
      expect(context.logger.debug).toHaveBeenCalledWith(
        `dmphubAPI.updateDMP calling DMPHub Update: ${DMPHubConfig.dmpHubURL}/dmps/${dmpId}`
      );
    });

    it('should throw and error when get fails', async () => {
      const context = buildContext(logger);
      const mockError = new Error('API error');
      mockPut.mockImplementation(() => { throw mockError });
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      await expect(dmphubAPI.updateDMP(context, dmp)).rejects.toThrow('API error');
    });
  });

  describe('tombstoneDMP', () => {
    it('should tombstone the DMP', async () => {
      const context = await buildMockContextWithToken(logger);
      const mockResponse = {
        status: 200,
        items: [{ dmp }]
      };
      const dmpId = '11.22222/3C4D5E6G';
      dmp.dmp_id = { type: 'doi', identifier: dmpId };
      mockDelete.mockResolvedValue(mockResponse);
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);
      await dmphubAPI.tombstoneDMP(context, dmp);

      expect(mockDelete).toHaveBeenCalledWith(`dmps/${dmpId}`);
      expect(context.logger.debug).toHaveBeenCalledWith(
        `dmphubAPI.tombstoneDMP calling DMPHub Tombstone: ${DMPHubConfig.dmpHubURL}/dmps/${dmpId}`
      );
    });

    it('should throw and error when get fails', async () => {
      const context = buildContext(logger);
      const mockError = new Error('API error');
      mockDelete.mockImplementation(() => { throw mockError });
      jest.spyOn(Authorizer.instance, 'hasExpired').mockReturnValue(false);

      await expect(dmphubAPI.tombstoneDMP(context, dmp)).rejects.toThrow('API error');
    });
  });

  describe('getAwards', () => {

    it('should getAwards', async () => {
      const context = await buildMockContextWithToken(logger);
      const mockItems = [{
        project: {
          title: casual.title,
          description: casual.description,
          start: casual.date('YYYY-M-DD'),
          end: casual.date('YYYY-M-DD'),
          funding: [
            {
              dmproadmap_project_number: "CTF-2023-01-006",
              dmproadmap_award_amount: casual.double(1000, 1000000).toFixed(2),
              grant_id: {
                identifier: "https://doi.org/10.00000/grant-id",
                type: "url"
              }
            }
          ]
        },
        contact: {
          name: `${casual.last_name}, ${casual.first_name}`,
          dmproadmap_affiliation: {
            "name": casual.name,
            "affiliation_id": {
              "identifier": "https://ror.org/000000000",
              "type": "ror"
            }
          },
          contact_id: {
            type: "orcid",
            identifier: "http://orcid.org/0000-0000-0000-0000"
          },
          role: [
            "http://credit.niso.org/contributor-roles/investigation"
          ]
        },
        contributor: [
          {
            name: `${casual.last_name}, ${casual.first_name}`,
            dmproadmap_affiliation: {
              name: casual.name,
              affiliation_id: {
                identifier: "https://ror.org/000000000",
                type: "ror"
              }
            },
            contributor_id: {
              type: "orcid",
              identifier: "http://orcid.org/0000-0000-0000-0000"
            },
            role: [
              "http://credit.niso.org/contributor-roles/investigation"
            ]
          }
        ]
      }];
      const mockResponse = {
        status: 200,
        items: mockItems
      };

      const apiTarget = "awards/crossref/000000000000";
      const awardId = "123";
      const awardName = "Physics";
      const awardYear = "2024";
      const piNames = ["John Doe", "Jane Doe"];
      const expectedPath = "awards/crossref/000000000000?project=123&pi_names=John+Doe%2CJane+Doe&keywords=Physics&years=2024";
      mockGet.mockResolvedValue(mockResponse);
      const result = await dmphubAPI.getAwards(context, apiTarget, awardId, awardName, awardYear, piNames);

      expect(mockGet).toHaveBeenCalledWith(expectedPath);
      expect(result).toEqual(mockItems);
      expect(context.logger.debug).toHaveBeenCalledWith(
        { items: mockItems },
        `dmphubAPI.getAwards results from DMPHub getAwards: ${DMPHubConfig.dmpHubURL}/${expectedPath}`
      );
    });

    it('should throw and error when get fails', async () => {
      const context = buildContext(logger);
      const apiTarget = 'awards/nih';
      const mockError = new Error('API down');
      mockGet.mockImplementation(() => { throw mockError });

      await expect(dmphubAPI.getAwards(context, apiTarget)).rejects.toThrow('API down');
    });
  });
});

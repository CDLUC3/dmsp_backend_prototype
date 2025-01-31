import { Logger } from "pino";
import { JWTAccessToken } from "../services/tokenService";
import { MyContext } from "../context";
import { DMPHubAPI } from "../datasources/dmphubAPI";
import { DMPToolAPI } from "../datasources/dmptoolAPI";
import { MySQLDataSource } from "../datasources/mySQLDataSource";
import { User, UserRole } from "../models/User";
import casual from "casual";
import { defaultLanguageId } from "../models/Language";

jest.mock('../datasources/dmphubAPI');
jest.mock('../datasources/dmptoolAPI');
jest.mock('../datasources/mySQLDataSource');

jest.mock('../datasources/mySQLDataSource', () => {
  return {
    __esModule: true,
    MySQLDataSource: {
      getInstance: jest.fn().mockReturnValue({
        query: jest.fn(),
      }),
    },
  };
});

jest.spyOn(MySQLDataSource, 'getInstance').mockImplementation(function () {
  this.pool = null;
  this.connection = null;
  this.initializePool = jest.fn();
  this.getConnection = jest.fn();
  this.releaseConnection = jest.fn();
  this.close = jest.fn();
  this.query = jest.fn();
  return this;
});

const mockedMysqlInstance = MySQLDataSource.getInstance();

// Mock Cache for testing, just has a local storage hash
let mockCacheStore = {};
// eslint-disable-next-line  @typescript-eslint/no-extraneous-class
export class MockCache {
  public static getInstance() {
    return {
      adapter: {
        set(key: string, val: string): void {
          mockCacheStore[key] = val;
        },
        get(key: string): string {
          return mockCacheStore[key];
        },
        delete(key: string): void {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete mockCacheStore[key];
        },
      },
      getStore() {
        return mockCacheStore
      },
      resetStore(): void {
        mockCacheStore = {};
      },
    }
  }
}
export class MockDMPHubAPI extends DMPHubAPI {
  getData = jest.fn();
  getDMSPs = jest.fn();
  handleResponse = jest.fn();
  getDMSP = jest.fn();
  baseURL = '';

  // Mocking the private properties
  dmspIdWithoutProtocol = jest.fn();
}

export class MockDMPToolAPI extends DMPToolAPI {
  getAffiliation = jest.fn();
  getAffiliations = jest.fn();
  handleResponse = jest.fn();
  willSendRequest = jest.fn();
  baseURL = '';

  // Mocking the private properties
  removeProtocol = jest.fn();
}

// Generate a mock user
export const mockUser = (
  id = casual.integer(1, 9999),
  email = casual.email,
  givenName = casual.first_name,
  surName = casual.last_name,
  affiliationId = casual.url,
  userRole = UserRole.RESEARCHER,
): User => {
  return new User({ id, email, givenName, surName, affiliationId, role: userRole });
}

// Generate a mock JWToken
export const mockToken = (user = mockUser()): JWTAccessToken => {
  return {
    id: user.id,
    email: user.email,
    givenName: user.givenName,
    surName: user.surName,
    affiliationId: user.affiliationId,
    role: user.role,
    languageId: defaultLanguageId,
    jti: casual.integer(1, 999999).toString(),
    expiresIn: casual.integer(1, 999999999),
  }
}

export const mockDataSources = {
  dmphubAPIDataSource: new MockDMPHubAPI({ cache: null, token: null}),
  dmptoolAPIDataSource: null,
  sqlDataSource: mockedMysqlInstance,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function buildContext(logger: Logger, token: JWTAccessToken = null, cache: any = null): MyContext {
  return {
    cache: cache,
    token: token,
    logger: logger,
    requestId: casual.rgb_hex,
    dataSources: mockDataSources,
  }
}

import { Logger } from "pino";
import { JWTAccessToken } from "../services/tokenService";
import { MyContext } from "../context";
import { Authorizer, DMPHubAPI } from "../datasources/dmphubAPI";
import { MySQLConnection } from "../datasources/mysql";
import { User, UserRole } from "../models/User";
import casual from "casual";
import { defaultLanguageId } from "../models/Language";

jest.mock('../datasources/mysql', () => {
  return {
    __esModule: true,
    MySQLConnection: jest.fn().mockImplementation(() => ({
      pool: null,
      getConnection: jest.fn(),
      releaseConnection: jest.fn(),
      close: jest.fn(),
      query: jest.fn()
    }))
  };
});

jest.mock('../datasources/dmphubAPI', () => {
  return {
    __esModule: true,
    Authorizer: jest.fn().mockImplementation(() => ({
      authenticate: jest.fn(),
      hasExpired: jest.fn(),
    })),
    DMPHubAPI: jest.fn().mockImplementation(() => ({
      getDMP: jest.fn(),
      createDMP: jest.fn(),
      updateDMP: jest.fn(),
      validateDMP: jest.fn(),
      tombstoneDMP: jest.fn(),
      getAwards: jest.fn(),
      handleResponse: jest.fn(),
      willSendRequest: jest.fn(),
      baseURL: '',
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      authorizer: new Authorizer(),
    })),
  };
});

// Mock Cache for testing, just has a local storage hash
let mockCacheStore = {};
// eslint-disable-next-line  @typescript-eslint/no-extraneous-class
export class MockCache {
  public static getInstance() {
    return {
      adapter: {
        async set(key: string, val: string): Promise<void> {
          mockCacheStore[key] = val;
        },
        async get(key: string): Promise<string> {
          return mockCacheStore[key];
        },
        async delete(key: string): Promise<void> {
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

export const mockedMysqlInstance = new MySQLConnection();

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
  dmphubAPIDataSource: new DMPHubAPI({ cache: null, token: null}),
  sqlDataSource: mockedMysqlInstance,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildContext(logger: Logger, token: JWTAccessToken = null, cache: any = null): MyContext {
  return {
    cache: cache,
    token: token,
    logger: logger,
    requestId: casual.rgb_hex,
    dataSources: mockDataSources,
  }
}

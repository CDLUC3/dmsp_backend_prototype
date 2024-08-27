import { Logger } from "pino";
import { JWTToken } from "../services/tokenService";
import { MyContext } from "../context";
import mockLogger from "../__tests__/mockLogger";
import { DMPHubAPI } from "../datasources/dmphubAPI";
import { DMPToolAPI } from "../datasources/dmptoolAPI";
import { MySQLDataSource } from "../datasources/mySQLDataSource";
import { User, UserRole } from "../models/User";
import casual from "casual";

jest.mock('../datasources/dmphubAPI');
jest.mock('../datasources/dmptoolAPI');
jest.mock('../datasources/mySQLDataSource');

jest.mocked(MySQLDataSource.getInstance).mockImplementation(() => {
  return {
    close: jest.fn(),
    getConnection: jest.fn(),
    pool: null,
    query: jest.fn(),
  }
});

const mockedMysqlInstance = MySQLDataSource.getInstance();

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
export const mockToken = (user = mockUser()): JWTToken => {
  return {
    id: user.id,
    email: user.email,
    givenName: user.givenName,
    surName: user.surName,
    affiliationId: user.affiliationId,
    role: user.role,
  }
}

export const mockDataSources = {
  dmphubAPIDataSource: new MockDMPHubAPI({ cache: null, token: null}),
  dmptoolAPIDataSource: null,
  sqlDataSource: mockedMysqlInstance,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export async function buildContext(logger: Logger, token: JWTToken = null, _cache: any = null): Promise<MyContext> {
  return {
    token: token,
    logger: logger || mockLogger,
    dataSources: mockDataSources,
  }
}

import { Logger } from "pino";
import { JWTToken } from "../services/tokenService";
import { MyContext } from "../context";
import mockLogger from "../__tests__/mockLogger";
import { DMPHubAPI } from "../datasources/dmphubAPI";
import { DMPToolAPI } from "../datasources/dmptoolAPI";
import { MySQLDataSource } from "../datasources/mySQLDataSource";
import { User } from "../types";

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

export const mockToken = (user: User): JWTToken => {
  return {
    id: user.id,
    email: user.email,
    givenName: user.givenName,
    surName: user.surName,
    affiliationId: user.affiliation,
    role: user.role.toString() || 'Researcher',
    user
  }
}

export const mockDataSources = {
  dmphubAPIDataSource: null,
  dmptoolAPIDataSource: null,
  sqlDataSource: mockedMysqlInstance,
}


export async function buildContext(logger: Logger, cache: any = null, token: JWTToken = null): Promise<MyContext> {
  return {
    token: token,
    logger: logger || mockLogger,
    user: null,
    dataSources: mockDataSources,
  }
}

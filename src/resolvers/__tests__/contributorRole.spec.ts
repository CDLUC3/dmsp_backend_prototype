import { Logger } from 'pino';
import { RESTDataSource } from "@apollo/datasource-rest";
import * as loggerMethods from "../../logger";
import { resolvers } from "../contributorRole";
import { DMPHubAPI } from "../../datasources/dmphub-api";
import { MySQLDataSource } from "../../datasources/mySQLDataSource";
import { MyContext } from "../../context";

// Mock the DMPHubAPI data source
class MockDMPHubAPI extends RESTDataSource {
  getData = jest.fn();
  getDMSPs = jest.fn();
  handleResponse = jest.fn();
  getDMSP = jest.fn();
  baseURL = '';

  // Mocking the private properties
  token = jest.fn();
  dmspIdWithoutProtocol = jest.fn();
}

// Mocking MySQL connection pool
jest.mock('../../datasources/mySQLDataSource', () => ({
  __esModule: true,
  MySQLDataSource: {
    getInstance: jest.fn().mockReturnValue({
      query: jest.fn(),
    }),
  },
}))

// Set this debugMock so I can test what logger.debug() is called with
const debugMock = jest.fn();

const logger: Logger = {
  debug: debugMock,
  error: jest.fn(),
  child: jest.fn().mockReturnValue({
    debug: debugMock,
    error: jest.fn(),
    child: jest.fn(),
  })
} as any;

describe('contributorRoles query resolver', () => {
  let mockQuery: jest.MockedFunction<typeof MySQLDataSource.prototype.query>;
  const formatLog = jest.spyOn(loggerMethods, 'formatLogMessage');

  beforeEach(() => {
    jest.clearAllMocks();
    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
  })

  afterEach(() => {
    mockQuery.mockClear();
    formatLog.mockRestore();
  })

  it('should return contributor roles when contributorRoles query resolver called', async () => {
    const mockQueryResponse = [
      { id: 1, displayOrder: 1, label: 'Data Manager', url: 'https://credit.niso.org/contributor-roles/data-curation/', created: '2024-06-10T00:07:22.000Z', modified: '2024-06-10T00:07:22.000Z' },
      { id: 2, displayOrder: 2, label: 'Project Admin', url: 'https://credit.niso.org/contributor-roles/project-administration/', created: '2024-06-10T00:07:22.000Z', modified: '2024-06-10T00:07:22.000Z' },
    ]
    mockQuery.mockResolvedValueOnce(mockQueryResponse);
    const context: MyContext = {
      logger,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI
      },
    };

    const contributorRolesResolver = resolvers.Query.contributorRoles as unknown as Function;
    const result = await contributorRolesResolver({}, {}, context);

    expect(result).toEqual(mockQueryResponse);
    expect(formatLog).toHaveBeenCalledWith(logger);
    expect(debugMock).toHaveBeenCalledWith('Resolving query contributorRoles');
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM contributorRoles ORDER BY label', []);

    formatLog.mockRestore();
  });

  it('should log and throw an error if contributorRoles query fails', async () => {
    const context: MyContext = {
      logger,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI
      },
    };
    const mockError = new Error('Query failed');
    mockQuery.mockRejectedValueOnce(mockError);

    const contributorRolesResolver = resolvers.Query.contributorRoles as unknown as Function;
    await expect(contributorRolesResolver({}, {}, context)).rejects.toThrow('Query failed');

  })

  it('should return a contributor role for contributorRoleById query and call the formatLogMessage and logger.debug', async () => {
    const formatLog = jest.spyOn(loggerMethods, 'formatLogMessage');
    const mockIdQueryResponse = [
      { id: 1, displayOrder: 1, label: 'Data Manager', url: 'https://credit.niso.org/contributor-roles/data-curation/', created: '2024-06-10T00:07:22.000Z', modified: '2024-06-10T00:07:22.000Z' },
    ]

    mockQuery.mockResolvedValueOnce([mockIdQueryResponse]);
    const context: MyContext = {
      logger,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI
      },
    };

    const contributorRolesByIdResolver = resolvers.Query.contributorRoleById as unknown as Function;
    const contributorRoleId = 1;
    const result = await contributorRolesByIdResolver({}, { contributorRoleId: 1 }, context);
    expect(result).toEqual(mockIdQueryResponse[0]);
    expect(formatLog).toHaveBeenCalledWith(logger, { contributorRoleId });
    expect(debugMock).toHaveBeenCalledWith("Resolving query contributorRoleById(id: '1')");
  })

  it('should log and throw an error when contributorRoleById query fails', async () => {
    const context: MyContext = {
      logger,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI
      },
    };
    const mockError = new Error('Query failed');
    mockQuery.mockRejectedValueOnce(mockError);

    const contributorRolesByIdResolver = resolvers.Query.contributorRoleById as unknown as Function;
    await expect(contributorRolesByIdResolver({}, {}, context)).rejects.toThrow('Query failed');
  })

  it('should return a contributor role for contributorRoleByURL query', async () => {
    const formatLog = jest.spyOn(loggerMethods, 'formatLogMessage');
    const mockUrlQueryResponse = [
      { id: 1, displayOrder: 1, label: 'Data Manager', url: 'https://credit.niso.org/contributor-roles/data-curation/', created: '2024-06-10T00:07:22.000Z', modified: '2024-06-10T00:07:22.000Z' },
    ]

    mockQuery.mockResolvedValueOnce([mockUrlQueryResponse]);
    const context: MyContext = {
      logger,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI
      },
    };

    const contributorRolesByUrlResolver = resolvers.Query.contributorRoleByURL as unknown as Function;
    const contributorRoleURL = 'https://credit.niso.org/contributor-roles/investigation/';
    const result = await contributorRolesByUrlResolver({}, { contributorRoleURL }, context);
    expect(result).toEqual(mockUrlQueryResponse);
    expect(formatLog).toHaveBeenCalledWith(logger, { contributorRoleURL });
    expect(debugMock).toHaveBeenCalledWith("Resolved query contirbutorRoleByURL(url: 'https://credit.niso.org/contributor-roles/investigation/')");
  })

  it('should log and throw an error when contributorRoleByURL query fails', async () => {
    const context: MyContext = {
      logger,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI
      },
    };
    const mockError = new Error('Query failed');
    mockQuery.mockRejectedValueOnce(mockError);

    const contributorRolesByUrlResolver = resolvers.Query.contributorRoleByURL as unknown as Function;
    await expect(contributorRolesByUrlResolver({}, {}, context)).rejects.toThrow('Query failed');
  })
})

describe('contributorRoles mutation resolver', () => {
  let mockQuery: jest.MockedFunction<typeof MySQLDataSource.prototype.query>;
  const formatLog = jest.spyOn(loggerMethods, 'formatLogMessage');

  beforeEach(() => {
    jest.clearAllMocks();
    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
  })

  afterEach(() => {
    mockQuery.mockClear();
    formatLog.mockRestore();
  })

  it('should return 201 code when contributor roles when addContributorRole mutation is successful', async () => {
    const mockMutationResponse = { id: 1, displayOrder: 1, label: 'Data Manager', url: 'https://credit.niso.org/contributor-roles/data-curation/', created: '2024-06-10T00:07:22.000Z', modified: '2024-06-10T00:07:22.000Z', description: 'First record' };

    // First mysql call
    mockQuery.mockResolvedValueOnce(mockMutationResponse);

    // Second mysql call
    mockQuery.mockResolvedValueOnce([mockMutationResponse]);

    const context: MyContext = {
      logger,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI
      },
    };

    const addContributorRoleMutation = resolvers.Mutation.addContributorRole as unknown as Function;
    const params = {
      url: 'https://credit.niso.org/contributor-roles/data-curation/',
      label: 'Data Manager',
      displayOrder: 1,
      description: 'First record'
    }
    const expected = {
      code: 201,
      success: true,
      message: 'Successfully added ContributorRole 1',
      contributorRole: mockMutationResponse
    }
    const result = await addContributorRoleMutation({}, params, context);

    expect(result).toEqual(expected);

  });

  it('should return 400 from generic error handler when addContributorRole mutation fails', async () => {
    const context: MyContext = {
      logger,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI
      },
    };
    const params = {
      url: 'https://credit.niso.org/contributor-roles/data-curation/',
      label: 'Data Manager',
      displayOrder: 1,
      description: 'First record'
    }
    const expected = {
      code: 400,
      success: false,
      message: 'Mutation failed',
      contributorRole: null,
    }
    const mockError = new Error('Mutation failed');
    mockQuery.mockRejectedValueOnce(mockError);
    mockQuery.mockRejectedValueOnce(mockError);

    const addContributorRoleMutation = resolvers.Mutation.addContributorRole as unknown as Function;
    const result = await addContributorRoleMutation({}, params, context);
    expect(result).toEqual(expected);
    mockQuery.mockClear();
  })
});

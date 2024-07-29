import * as loggerMethods from "../../logger";
import {
  ContributorRolesResolver,
  MockDMPHubAPI,
  mockDMPToolAPI,
} from '../../__tests__/mockApolloContext';
import logger from '../../__tests__/mockLogger';
import { MySQLDataSource } from "../../datasources/mySQLDataSource";
import { resolvers } from "../contributorRole";
import { User } from "../../models/User";
import { DMPHubAPI } from "../../datasources/dmphubAPI";
import { MyContext } from "../../context";
import { DMPToolAPI } from "../../datasources/dmptoolAPI";

let debugSpy: jest.SpyInstance;
const user = new User({ email: 'test@example.com', password: '12345'});

describe('contributorRoles query resolver', () => {
  beforeEach(() => {
    debugSpy = jest.spyOn(logger, 'debug');
    jest.clearAllMocks();
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

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
      user,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI,
        dmptoolAPIDataSource: new mockDMPToolAPI() as unknown as DMPToolAPI,
      },
    };

    const contributorRolesResolver = resolvers.Query.contributorRoles as ContributorRolesResolver;
    const result = await contributorRolesResolver({}, {}, context, null);

    expect(result).toEqual(mockQueryResponse);
    expect(formatLog).toHaveBeenCalledWith(logger);
    expect(debugSpy).toHaveBeenCalledWith('Resolving query contributorRoles');
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM contributorRoles ORDER BY label', []);

    formatLog.mockRestore();
  });

  it('should log and throw an error if contributorRoles query fails', async () => {
    const context: MyContext = {
      logger,
      user,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI,
        dmptoolAPIDataSource: new mockDMPToolAPI() as unknown as DMPToolAPI,
      },
    };
    const mockError = new Error('Query failed');
    mockQuery.mockRejectedValueOnce(mockError);

    const contributorRolesResolver = resolvers.Query.contributorRoles as ContributorRolesResolver;
    await expect(contributorRolesResolver({}, {}, context, null)).rejects.toThrow('Query failed');

  })

  it('should return a contributor role for contributorRoleById query and call the formatLogMessage and logger.debug', async () => {
    const formatLog = jest.spyOn(loggerMethods, 'formatLogMessage');
    const mockIdQueryResponse = [
      { id: 1, displayOrder: 1, label: 'Data Manager', url: 'https://credit.niso.org/contributor-roles/data-curation/', created: '2024-06-10T00:07:22.000Z', modified: '2024-06-10T00:07:22.000Z' },
    ]

    mockQuery.mockResolvedValueOnce([mockIdQueryResponse]);
    const context: MyContext = {
      logger,
      user,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI,
        dmptoolAPIDataSource: new mockDMPToolAPI() as unknown as DMPToolAPI,
      },
    };

    const contributorRolesByIdResolver = resolvers.Query.contributorRoleById as ContributorRolesResolver;
    const contributorRoleId = 1;
    const result = await contributorRolesByIdResolver({}, { contributorRoleId: 1 }, context, null);
    expect(result).toEqual(mockIdQueryResponse[0]);
    expect(formatLog).toHaveBeenCalledWith(logger, { contributorRoleId });
    expect(debugSpy).toHaveBeenCalledWith("Resolving query contributorRoleById(id: '1')");
  })

  it('should log and throw an error when contributorRoleById query fails', async () => {
    const context: MyContext = {
      logger,
      user,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI,
        dmptoolAPIDataSource: new mockDMPToolAPI() as unknown as DMPToolAPI,
      },
    };
    const mockError = new Error('Query failed');
    mockQuery.mockRejectedValueOnce(mockError);

    const contributorRolesByIdResolver = resolvers.Query.contributorRoleById as ContributorRolesResolver;
    await expect(contributorRolesByIdResolver({}, {}, context, null)).rejects.toThrow('Query failed');
  })

  it('should return a contributor role for contributorRoleByURL query', async () => {
    const formatLog = jest.spyOn(loggerMethods, 'formatLogMessage');
    const mockUrlQueryResponse = [
      { id: 1, displayOrder: 1, label: 'Data Manager', url: 'https://credit.niso.org/contributor-roles/data-curation/', created: '2024-06-10T00:07:22.000Z', modified: '2024-06-10T00:07:22.000Z' },
    ]

    mockQuery.mockResolvedValueOnce([mockUrlQueryResponse]);
    const context: MyContext = {
      logger,
      user,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI,
        dmptoolAPIDataSource: new mockDMPToolAPI() as unknown as DMPToolAPI,
      },
    };

    const contributorRolesByUrlResolver = resolvers.Query.contributorRoleByURL as ContributorRolesResolver;
    const contributorRoleURL = 'https://credit.niso.org/contributor-roles/investigation/';
    const result = await contributorRolesByUrlResolver({}, { contributorRoleURL }, context, null);
    expect(result).toEqual(mockUrlQueryResponse);
    expect(formatLog).toHaveBeenCalledWith(logger, { contributorRoleURL });
    expect(debugSpy).toHaveBeenCalledWith("Resolved query contirbutorRoleByURL(url: 'https://credit.niso.org/contributor-roles/investigation/')");
  })

  it('should log and throw an error when contributorRoleByURL query fails', async () => {
    const context: MyContext = {
      logger,
      user,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI,
        dmptoolAPIDataSource: new mockDMPToolAPI() as unknown as DMPToolAPI,
      },
    };
    const mockError = new Error('Query failed');
    mockQuery.mockRejectedValueOnce(mockError);

    const contributorRolesByUrlResolver = resolvers.Query.contributorRoleByURL as ContributorRolesResolver;
    await expect(contributorRolesByUrlResolver({}, {}, context, null)).rejects.toThrow('Query failed');
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
      user,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI,
        dmptoolAPIDataSource: new mockDMPToolAPI() as unknown as DMPToolAPI,
      },
    };

    const addContributorRoleMutation = resolvers.Mutation.addContributorRole as ContributorRolesResolver;
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
    const result = await addContributorRoleMutation({}, params, context, null);

    expect(result).toEqual(expected);

  });

  it('should return 400 from generic error handler when addContributorRole mutation fails', async () => {
    const context: MyContext = {
      logger,
      user,
      dataSources: {
        sqlDataSource: MySQLDataSource.getInstance(),
        dmphubAPIDataSource: new MockDMPHubAPI() as unknown as DMPHubAPI,
        dmptoolAPIDataSource: new mockDMPToolAPI() as unknown as DMPToolAPI,
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

    const addContributorRoleMutation = resolvers.Mutation.addContributorRole as ContributorRolesResolver;
    const result = await addContributorRoleMutation({}, params, context, null);
    expect(result).toEqual(expected);
    mockQuery.mockClear();
  })
});

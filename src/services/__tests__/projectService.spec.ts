import casual from "casual";
import { logger } from "../../__mocks__/logger";
import { buildContext, mockToken } from "../../__mocks__/context";
import { MySQLDataSource } from "../../datasources/mySQLDataSource";
import { Project } from "../../models/Project";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { isAdmin, isSuperAdmin } from "../authService";
import { hasPermissionOnProject } from "../projectService";
import { ProjectCollaborator } from "../../models/Collaborator";

// Pulling context in here so that the MySQLDataSource gets mocked
jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('hasPermissionOnProject', () => {
  let project;
  let mockQuery;
  let mockIsSuperAdmin;
  let mockIsAdmin;
  let mockCollaboratorQuery;

  beforeEach(() => {
    // Cast getInstance to a jest.Mock type to use mockReturnValue
    (MySQLDataSource.getInstance as jest.Mock).mockReturnValue({
      query: jest.fn(), // Initialize the query mock function here
    });

    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
    context = { logger, dataSources: { sqlDataSource: { query: mockQuery } } };

    mockIsSuperAdmin = jest.fn();
    (isSuperAdmin as jest.Mock) = mockIsSuperAdmin;

    mockIsAdmin = jest.fn();
    (isAdmin as jest.Mock) = mockIsAdmin;

    mockCollaboratorQuery = jest.fn();
    (ProjectCollaborator.findByProjectId as jest.Mock) = mockCollaboratorQuery;

    project = new Project({
      id: casual.integer(1, 999),
      title: casual.sentence,
      createdById: casual.integer(1, 9999),
    });
  });

  it('returns true if the current user is a Super Admin', async () => {
    mockIsSuperAdmin.mockResolvedValueOnce(true);

    expect(await hasPermissionOnProject(context, project)).toBe(true)
    expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
    expect(mockIsAdmin).toHaveBeenCalledTimes(0);
    expect(mockQuery).toHaveBeenCalledTimes(0);
    expect(mockCollaboratorQuery).toHaveBeenCalledTimes(0);
  });

  it('returns true if the current user\'s id is the same as the project\'s owner', async () => {
    mockIsSuperAdmin.mockResolvedValueOnce(false);

    context.token = { id: project.createdById };
    expect(await hasPermissionOnProject(context, project)).toBe(true)
    expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
    expect(mockIsAdmin).toHaveBeenCalledTimes(0);
    expect(mockQuery).toHaveBeenCalledTimes(0);
    expect(mockCollaboratorQuery).toHaveBeenCalledTimes(0);
  });

  it('returns true if the current user\'s is an Admin and the project\'s owner are the same org', async () => {
    mockIsSuperAdmin.mockResolvedValueOnce(false);
    mockIsAdmin.mockResolvedValueOnce(true);
    context.token = { id: casual.integer(1, 9999) };
    mockQuery.mockResolvedValueOnce({ affiliationId: context.token.affiliationId });
    expect(await hasPermissionOnProject(context, project)).toBe(true)
    expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
    expect(mockIsAdmin).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockCollaboratorQuery).toHaveBeenCalledTimes(0);
  });

  it('returns true if the current user\'s is a collaborator on the project', async () => {
    mockIsSuperAdmin.mockResolvedValueOnce(false);
    mockIsAdmin.mockResolvedValueOnce(false);
    context.token = { id: casual.integer(1, 9999) };
    mockQuery.mockResolvedValueOnce({ affiliationId: context.token.affiliationId });
    mockCollaboratorQuery.mockResolvedValueOnce([{ userId: context.token.id }]);
    expect(await hasPermissionOnProject(context, project)).toBe(true)
    expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
    expect(mockIsAdmin).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(0);
    expect(mockCollaboratorQuery).toHaveBeenCalledTimes(1);
  });

  it('returns false when the user does not have permission', async () => {
    mockIsSuperAdmin.mockResolvedValueOnce(false);
    mockIsAdmin.mockResolvedValueOnce(false);
    mockCollaboratorQuery.mockResolvedValueOnce([]);
    context.token = { id: casual.integer(1, 9999) };
    expect(await hasPermissionOnProject(context, project)).toBe(false)
    expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
    expect(mockIsAdmin).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(0);
    expect(mockCollaboratorQuery).toHaveBeenCalledTimes(1);
  });
});
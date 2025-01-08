import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { ProjectContributor } from "../Contributor";
import { getMockORCID } from "../../__tests__/helpers";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ProjectContributor', () => {
  let projectContributor;

  const contributorData = {
    projectId: casual.integer(1, 9),
    affiliationId: casual.url,
    givenName: casual.first_name,
    surName: casual.last_name,
    orcid: getMockORCID(),
    email: casual.email,
    roles: [casual.integer(1, 9)]
  }
  beforeEach(() => {
    projectContributor = new ProjectContributor(contributorData);
  });

  it('should initialize options as expected', () => {
    expect(projectContributor.projectId).toEqual(contributorData.projectId);
    expect(projectContributor.affiliationId).toEqual(contributorData.affiliationId);
    expect(projectContributor.givenName).toEqual(contributorData.givenName);
    expect(projectContributor.surName).toEqual(contributorData.surName);
    expect(projectContributor.orcid).toEqual(contributorData.orcid);
    expect(projectContributor.email).toEqual(contributorData.email);
    expect(projectContributor.roles).toEqual(contributorData.roles);
  });

  it('should return true when calling isValid with a name field', async () => {
    expect(await projectContributor.isValid()).toBe(true);
  });

  it('should return false when calling isValid without a projectId field', async () => {
    projectContributor.projectId = null;
    expect(await projectContributor.isValid()).toBe(false);
    expect(projectContributor.errors.length).toBe(1);
    expect(projectContributor.errors[0]).toEqual('Project can\'t be blank');
  });

  it('should return false when calling isValid when the orcid field is not a valid ORCID', async () => {
    projectContributor.orcid = '2945yt9u245yt';
    expect(await projectContributor.isValid()).toBe(false);
    expect(projectContributor.errors.length).toBe(1);
    expect(projectContributor.errors[0]).toEqual('Invalid ORCID format');
  });

  it('should return false when calling isValid when the email field is not a valid email', async () => {
    projectContributor.email = 'tester.testing.edu';
    expect(await projectContributor.isValid()).toBe(false);
    expect(projectContributor.errors.length).toBe(1);
    expect(projectContributor.errors[0]).toEqual('Invalid email format');
  });

  it('should return false when calling isValid if no name, orcid or email is present', async () => {
    projectContributor.givenName = null;
    projectContributor.surName = null;
    projectContributor.orcid = null;
    projectContributor.email = null;
    expect(await projectContributor.isValid()).toBe(false);
    expect(projectContributor.errors.length).toBe(1);
    expect(projectContributor.errors[0]).toEqual('You must specify at least one name, ORCID or email');
  });

  it('should return false when calling isValid if no roles are specified', async () => {
    projectContributor.roles = null;
    expect(await projectContributor.isValid()).toBe(false);
    expect(projectContributor.errors.length).toBe(1);
    expect(projectContributor.errors[0]).toEqual('You must specify at least one role');

    projectContributor.errors = [];
    projectContributor.roles = [];
    expect(await projectContributor.isValid()).toBe(false);
    expect(projectContributor.errors.length).toBe(1);
    expect(projectContributor.errors[0]).toEqual('You must specify at least one role');
  });
});

describe('findBy Queries', () => {
  const originalQuery = ProjectContributor.query;

  let localQuery;
  let context;
  let projectContributor;

  beforeEach(() => {
    localQuery = jest.fn();
    (ProjectContributor.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    projectContributor = new ProjectContributor({
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      roles: [casual.integer(1, 9)]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    ProjectContributor.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectContributor]);
    const projectContributorId = casual.integer(1, 999);
    const result = await ProjectContributor.findById('testing', context, projectContributorId);
    const expectedSql = 'SELECT * FROM projectContributors WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectContributorId.toString()], 'testing')
    expect(result).toEqual(projectContributor);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectContributorId = casual.integer(1, 999);
    const result = await ProjectContributor.findById('testing', context, projectContributorId);
    expect(result).toEqual(null);
  });

  it('findByProjectId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectContributor]);
    const projectId = casual.integer(1, 999);
    const result = await ProjectContributor.findByProjectId('testing', context, projectId);
    const expectedSql = 'SELECT * FROM projectContributors WHERE projectId = ? ORDER BY surName, givenName';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString()], 'testing')
    expect(result).toEqual([projectContributor]);
  });

  it('findByProjectId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await ProjectContributor.findByProjectId('testing', context, projectId);
    expect(result).toEqual([]);
  });

  it('findByAffiliation should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectContributor]);
    const affiliationId = casual.url;
    const result = await ProjectContributor.findByAffiliation('testing', context, affiliationId);
    const expectedSql = 'SELECT * FROM projectContributors WHERE affiliationId = ? ORDER BY surName, givenName';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [affiliationId], 'testing')
    expect(result).toEqual([projectContributor]);
  });

  it('findByAffiliation should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const affiliationId = casual.url;
    const result = await ProjectContributor.findByAffiliation('testing', context, affiliationId);
    expect(result).toEqual([]);
  });

  it('findByProjectAndEmail should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectContributor]);
    const projectId = casual.integer(1, 999);
    const email = casual.email;
    const result = await ProjectContributor.findByProjectAndEmail('testing', context, projectId, email);
    const expectedSql = 'SELECT * FROM projectContributors WHERE projectId = ? AND email = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString(), email], 'testing')
    expect(result).toEqual(projectContributor);
  });

  it('findByProjectAndEmail should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const email = casual.email;
    const result = await ProjectContributor.findByProjectAndEmail('testing', context, projectId, email);
    expect(result).toEqual(null);
  });

  it('findByProjectAndORCID should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectContributor]);
    const projectId = casual.integer(1, 999);
    const orcid = casual.card_number();
    const result = await ProjectContributor.findByProjectAndORCID('testing', context, projectId, orcid);
    const expectedSql = 'SELECT * FROM projectContributors WHERE projectId = ? AND orcid = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString(), orcid], 'testing')
    expect(result).toEqual(projectContributor);
  });

  it('findByProjectAndORCID should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const orcid = casual.card_number();
    const result = await ProjectContributor.findByProjectAndORCID('testing', context, projectId, orcid);
    expect(result).toEqual(null);
  });

  it('findByProjectAndName should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectContributor]);
    const projectId = casual.integer(1, 999);
    const givenName = casual.first_name;
    const surName = casual.last_name;
    const result = await ProjectContributor.findByProjectAndName('testing', context, projectId, givenName, surName);
    const expectedSql = 'SELECT * FROM projectContributors WHERE projectId = ? AND LOWER(givenName) = ? AND LOWER(surName) = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    const vals = [projectId.toString(), givenName.toLowerCase(), surName.toLowerCase()];
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'testing')
    expect(result).toEqual(projectContributor);
  });

  it('findByProjectAndName should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const givenName = casual.first_name;
    const surName = casual.last_name;
    const result = await ProjectContributor.findByProjectAndName('testing', context, projectId, givenName, surName);
    expect(result).toEqual(null);
  });
});

describe('update', () => {
  let updateQuery;
  let projectContributor;

  beforeEach(() => {
    updateQuery = jest.fn();
    (ProjectContributor.update as jest.Mock) = updateQuery;

    projectContributor = new ProjectContributor({
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      roles: [casual.integer(1, 9)]
    })
  });

  it('returns the ProjectContributor with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (projectContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await projectContributor.update(context)).toBe(projectContributor);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the ProjectContributor has no id', async () => {
    const localValidator = jest.fn();
    (projectContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    projectContributor.id = null;
    const result = await projectContributor.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('ProjectContributor has never been saved');
  });

  it('returns the updated ProjectContributor', async () => {
    const localValidator = jest.fn();
    (projectContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(projectContributor);

    const mockFindById = jest.fn();
    (ProjectContributor.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectContributor);

    const result = await projectContributor.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(projectContributor);
  });
});

describe('create', () => {
  const originalInsert = ProjectContributor.insert;
  let insertQuery;
  let projectContributor;

  beforeEach(() => {
    insertQuery = jest.fn();
    (ProjectContributor.insert as jest.Mock) = insertQuery;

    projectContributor = new ProjectContributor({
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      roles: [casual.integer(1, 9)]
    });
  });

  afterEach(() => {
    ProjectContributor.insert = originalInsert;
    ProjectContributor.findByProjectAndEmail = null; //originalFindByProjectAndEmail;
  });

  it('returns the ProjectContributor without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (projectContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await projectContributor.create(context)).toBe(projectContributor);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the ProjectContributor with errors if it is invalid', async () => {
    projectContributor.projectId = undefined;
    const response = await projectContributor.create(context);
    expect(response.errors[0]).toBe('Project ID can\'t be blank');
  });

  it('returns the ProjectContributor with an error if the question already exists', async () => {
    const mockFindBy = jest.fn();
    (ProjectContributor.findByProjectAndEmail as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(projectContributor);

    const result = await projectContributor.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Project already has an entry for this contributor');
  });

  it('returns the newly added ProjectContributor', async () => {
    const mockFindBy = jest.fn();
    (ProjectContributor.findByProjectAndEmail as jest.Mock) = mockFindBy;
    (ProjectContributor.findByProjectAndORCID as jest.Mock) = mockFindBy;
    (ProjectContributor.findByProjectAndName as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (ProjectContributor.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectContributor);

    const result = await projectContributor.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(projectContributor);
  });
});

describe('delete', () => {
  let projectContributor;

  beforeEach(() => {
    projectContributor = new ProjectContributor({
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      roles: [casual.integer(1, 9)]
    });
  })

  it('returns null if the ProjectContributor has no id', async () => {
    projectContributor.id = null;
    expect(await projectContributor.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ProjectContributor.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await projectContributor.delete(context)).toBe(null);
  });

  it('returns the ProjectContributor if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ProjectContributor.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(projectContributor);

    const mockFindById = jest.fn();
    (ProjectContributor.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectContributor);

    const result = await projectContributor.delete(context);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(projectContributor);
  });
});

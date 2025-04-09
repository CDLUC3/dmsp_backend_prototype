import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { PlanContributor, ProjectContributor } from "../Contributor";
import { getMockORCID } from "../../__tests__/helpers";
import { ContributorRole } from "../ContributorRole";

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
    contributorRoles: [new ContributorRole({ id: casual.integer(1, 99) })],
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
    expect(projectContributor.contributorRoles).toEqual(contributorData.contributorRoles);
  });

  it('should return true when calling isValid with a name field', async () => {
    expect(await projectContributor.isValid()).toBe(true);
  });

  it('should return false when calling isValid without a projectId field', async () => {
    projectContributor.projectId = null;
    expect(await projectContributor.isValid()).toBe(false);
    expect(Object.keys(projectContributor.errors).length).toBe(1);
    expect(projectContributor.errors['projectId']).toBeTruthy();
  });

  it('should return false when calling isValid when the orcid field is not a valid ORCID', async () => {
    projectContributor.orcid = '2945yt9u245yt';
    expect(await projectContributor.isValid()).toBe(false);
    expect(Object.keys(projectContributor.errors).length).toBe(1);
    expect(projectContributor.errors['orcid']).toBeTruthy();
  });

  it('should return false when calling isValid when the email field is not a valid email', async () => {
    projectContributor.email = 'tester.testing.edu';
    expect(await projectContributor.isValid()).toBe(false);
    expect(Object.keys(projectContributor.errors).length).toBe(1);
    expect(projectContributor.errors['email']).toBeTruthy();
  });

  it('should return false when calling isValid if no name, orcid or email is present', async () => {
    projectContributor.givenName = null;
    projectContributor.surName = null;
    projectContributor.orcid = null;
    projectContributor.email = null;
    expect(await projectContributor.isValid()).toBe(false);
    expect(Object.keys(projectContributor.errors).length).toBe(1);
    expect(projectContributor.errors['general']).toBeTruthy();
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
      contributorRoles: [new ContributorRole({ id: casual.integer(1, 99) })]
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

  it('findByProjectAndNameOrORCIDOrEmail should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectContributor]);
    const projectId = casual.integer(1, 999);
    const givenName = casual.first_name;
    const surName = casual.last_name;
    const orcid = casual.card_number();
    const email = casual.email;
    const result = await ProjectContributor.findByProjectAndNameOrORCIDOrEmail('testing', context, projectId, givenName, surName, orcid, email);
    const expectedSql = 'SELECT * FROM projectContributors WHERE projectId = ? AND (LOWER(givenName) = ? AND LOWER(surName) = ?) OR (orcid = ?) ' +
      'OR (email = ?) ORDER BY orcid DESC, email DESC, surName, givenName';
    expect(localQuery).toHaveBeenCalledTimes(1);
    const vals = [projectId.toString(), givenName.toLowerCase(), surName.toLowerCase(), orcid, email];
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'testing')
    expect(result).toEqual(projectContributor);
  });

  it('findByProjectAndNameOrORCIDOrEmail should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const givenName = casual.first_name;
    const surName = casual.last_name;
    const orcid = casual.card_number();
    const email = casual.email;
    const result = await ProjectContributor.findByProjectAndNameOrORCIDOrEmail('testing', context, projectId, givenName, surName, orcid, email);
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
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      contributorRoles: [new ContributorRole({ id: casual.integer(1, 99) })]
    })
  });

  it('returns the ProjectContributor with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (projectContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await projectContributor.update(context);
    expect(result).toBeInstanceOf(ProjectContributor);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the ProjectContributor has no id', async () => {
    const localValidator = jest.fn();
    (projectContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    projectContributor.id = null;
    const result = await projectContributor.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
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
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectContributor);
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
      contributorRoles: [new ContributorRole({ id: casual.integer(1, 99) })]
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

    const result = await projectContributor.create(context);
    expect(result).toBeInstanceOf(ProjectContributor);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the ProjectContributor with errors if it is invalid', async () => {
    projectContributor.projectId = undefined;
    const response = await projectContributor.create(context);
    expect(response.errors['projectId']).toBe('Project can\'t be blank');
  });

  it('returns the ProjectContributor with an error if the question already exists', async () => {
    const mockFindBy = jest.fn();
    (ProjectContributor.findByProjectAndORCID as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(projectContributor);

    const result = await projectContributor.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
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
    expect(mockFindBy).toHaveBeenCalledTimes(3);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectContributor);
  });
});

describe('delete', () => {
  let projectContributor;

  beforeEach(() => {
    projectContributor = new ProjectContributor({
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      contributorRoles: [new ContributorRole({ id: casual.integer(1, 99) })]
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
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectContributor);
  });
});

describe('PlanContributor', () => {
  let planContributor;

  const contributorData = {
    planId: casual.integer(1, 9),
    projectContributorId: casual.url,
    contributorRoleIds: [casual.integer(1, 99)],
  }
  beforeEach(() => {
    planContributor = new PlanContributor(contributorData);
  });

  it('should initialize options as expected', () => {
    expect(planContributor.planId).toEqual(contributorData.planId);
    expect(planContributor.projectContributorId).toEqual(contributorData.projectContributorId);
    expect(planContributor.contributorRoleIds).toEqual(contributorData.contributorRoleIds);
  });

  it('should return true when calling isValid with a name field', async () => {
    expect(await planContributor.isValid()).toBe(true);
  });

  it('should return false when calling isValid without a planId field', async () => {
    planContributor.planId = null;
    expect(await planContributor.isValid()).toBe(false);
    expect(Object.keys(planContributor.errors).length).toBe(1);
    expect(planContributor.errors['planId']).toBeTruthy();
  });

  it('should return false when calling isValid without a projectContributorId field', async () => {
    planContributor.projectContributorId = null;
    expect(await planContributor.isValid()).toBe(false);
    expect(Object.keys(planContributor.errors).length).toBe(1);
    expect(planContributor.errors['projectContributorId']).toBeTruthy();
  });

  it('should return false when calling isValid if there are no contributorRoleIds', async () => {
    planContributor.contributorRoleIds = [];
    expect(await planContributor.isValid()).toBe(false);
    expect(Object.keys(planContributor.errors).length).toBe(1);
    expect(planContributor.errors['contributorRoleIds']).toBeTruthy();
  });
});

describe('findByPlanId', () => {
  const originalQuery = PlanContributor.query;

  let localQuery;
  let context;
  let planContributor;

  beforeEach(() => {
    localQuery = jest.fn();
    (PlanContributor.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    planContributor = new PlanContributor({
      planId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      contributorRoles: [new ContributorRole({ id: casual.integer(1, 99) })]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    PlanContributor.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planContributor]);
    const planContributorId = casual.integer(1, 999);
    const result = await PlanContributor.findById('testing', context, planContributorId);
    const expectedSql = 'SELECT * FROM planContributors WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planContributorId.toString()], 'testing')
    expect(result).toEqual(planContributor);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planContributorId = casual.integer(1, 999);
    const result = await PlanContributor.findById('testing', context, planContributorId);
    expect(result).toEqual(null);
  });

  it('findByPlanAndProjectContributor should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planContributor]);
    const planId = casual.integer(1, 999);
    const planContributorId = casual.integer(1, 999);
    const result = await PlanContributor.findByPlanAndProjectContributor('testing', context, planId, planContributorId);
    const expectedSql = 'SELECT * FROM planContributors WHERE planId = ? AND projectContributorId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planId.toString(), planContributorId.toString()], 'testing')
    expect(result).toEqual(planContributor);
  });

  it('findByPlanAndProjectContributor should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planId = casual.integer(1, 999);
    const planContributorId = casual.integer(1, 999);
    const result = await PlanContributor.findByPlanAndProjectContributor('testing', context, planId, planContributorId);
    expect(result).toEqual(null);
  });

  it('findByPlanId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planContributor]);
    const planId = casual.integer(1, 999);
    const result = await PlanContributor.findByPlanId('testing', context, planId);
    const expectedSql = 'SELECT * FROM planContributors WHERE planId = ? ORDER BY isPrimaryContact DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planId.toString()], 'testing')
    expect(result).toEqual([planContributor]);
  });

  it('findByPlanId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planId = casual.integer(1, 999);
    const result = await PlanContributor.findByPlanId('testing', context, planId);
    expect(result).toEqual([]);
  });

  it('findByProjectContributorId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planContributor]);
    const projectContributorId = casual.integer(1, 999);
    const result = await PlanContributor.findByProjectContributorId('testing', context, projectContributorId);
    const expectedSql = 'SELECT * FROM planContributors WHERE projectContributorId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectContributorId.toString()], 'testing')
    expect(result).toEqual(planContributor);
  });

  it('findByProjectContributorId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectContributorId = casual.integer(1, 999);
    const result = await PlanContributor.findByProjectContributorId('testing', context, projectContributorId);
    expect(result).toEqual(null);
  });
});

describe('update', () => {
  let updateQuery;
  let planContributor;

  beforeEach(() => {
    updateQuery = jest.fn();
    (PlanContributor.update as jest.Mock) = updateQuery;

    planContributor = new PlanContributor({
      id: casual.integer(1, 9999),
      planId: casual.integer(1, 999),
      projectContributorId: casual.integer(1, 999),
      contributorRoles: [casual.integer(1, 99)]
    })
  });

  it('returns the PlanContributor with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (planContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await planContributor.update(context);
    expect(result).toBeInstanceOf(PlanContributor);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the PlanContributor has no id', async () => {
    const localValidator = jest.fn();
    (planContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    planContributor.id = null;
    const result = await planContributor.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the updated PlanContributor', async () => {
    const localValidator = jest.fn();
    (planContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(planContributor);

    const mockFindById = jest.fn();
    (PlanContributor.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(planContributor);

    const result = await planContributor.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(PlanContributor);
  });
});

describe('create', () => {
  const originalInsert = PlanContributor.insert;
  let insertQuery;
  let planContributor;

  beforeEach(() => {
    insertQuery = jest.fn();
    (PlanContributor.insert as jest.Mock) = insertQuery;

    planContributor = new PlanContributor({
      planId: casual.integer(1, 999),
      projectContributorId: casual.integer(1, 999),
      contributorRoleIds: [casual.integer(1, 99)],
    });
  });

  afterEach(() => {
    PlanContributor.insert = originalInsert;
    PlanContributor.findByPlanAndProjectContributor = null;
  });

  it('returns the PlanContributor without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (planContributor.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await planContributor.create(context);
    expect(result).toBeInstanceOf(PlanContributor);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the PlanContributor with errors if it is invalid', async () => {
    planContributor.planId = undefined;
    const response = await planContributor.create(context);
    expect(response.errors['planId']).toBe('Plan can\'t be blank');
  });

  it('returns the PlanContributor with an error if the question already exists', async () => {
    const mockFindBy = jest.fn();
    (PlanContributor.findByPlanAndProjectContributor as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(planContributor);

    const result = await planContributor.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the newly added PlanContributor', async () => {
    const mockFindBy = jest.fn();
    (PlanContributor.findByPlanAndProjectContributor as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (PlanContributor.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(planContributor);

    const result = await planContributor.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(PlanContributor);
  });
});

describe('delete', () => {
  let planContributor;

  beforeEach(() => {
    planContributor = new PlanContributor({
      id: casual.integer(1, 9999),
      planId: casual.integer(1, 999),
      projectContributorId: casual.integer(1, 999),
      contributorRoleIds: [casual.integer(1, 99)],
    });
  })

  it('returns null if the PlanContributor has no id', async () => {
    planContributor.id = null;
    expect(await planContributor.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (PlanContributor.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await planContributor.delete(context)).toBe(null);
  });

  it('returns the PlanContributor if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (PlanContributor.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(planContributor);

    const mockFindById = jest.fn();
    (PlanContributor.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(planContributor);

    const result = await planContributor.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(PlanContributor);
  });
});
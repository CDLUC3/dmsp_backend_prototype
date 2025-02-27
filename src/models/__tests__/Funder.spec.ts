import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { PlanFunder, ProjectFunder, ProjectFunderStatus } from "../Funder";
import { getRandomEnumValue } from "../../__tests__/helpers";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ProjectFunder', () => {
  let projectFunder;

  const funderData = {
    projectId: casual.integer(1, 9),
    affiliationId: casual.url,
    status: getRandomEnumValue(ProjectFunderStatus),
    funderOpportunityNumber: casual.url,
    funderProjectNumber: casual.uuid,
    grantId: casual.url,
  }
  beforeEach(() => {
    projectFunder = new ProjectFunder(funderData);
  });

  it('should initialize options as expected', () => {
    expect(projectFunder.projectId).toEqual(funderData.projectId);
    expect(projectFunder.affiliationId).toEqual(funderData.affiliationId);
    expect(projectFunder.status).toEqual(funderData.status);
    expect(projectFunder.funderOpportunityNumber).toEqual(funderData.funderOpportunityNumber);
    expect(projectFunder.funderProjectNumber).toEqual(funderData.funderProjectNumber);
    expect(projectFunder.grantId).toEqual(funderData.grantId);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await projectFunder.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the projectId field is missing', async () => {
    projectFunder.projectId = null;
    expect(await projectFunder.isValid()).toBe(false);
    expect(Object.keys(projectFunder.errors).length).toBe(1);
    expect(projectFunder.errors['projectId']).toBeTruthy();
  });

  it('should return false when calling isValid if the projectId field is missing', async () => {
    projectFunder.affiliationId = null;
    expect(await projectFunder.isValid()).toBe(false);
    expect(Object.keys(projectFunder.errors).length).toBe(1);
    expect(projectFunder.errors['affiliationId']).toBeTruthy();
  });

  it('should return false when calling isValid if the projectId field is missing', async () => {
    projectFunder.status = null;
    expect(await projectFunder.isValid()).toBe(false);
    expect(Object.keys(projectFunder.errors).length).toBe(1);
    expect(projectFunder.errors['status']).toBeTruthy();
  });
});

describe('findBy Queries', () => {
  const originalQuery = ProjectFunder.query;

  let localQuery;
  let context;
  let projectFunder;

  beforeEach(() => {
    localQuery = jest.fn();
    (ProjectFunder.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    projectFunder = new ProjectFunder({
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      status: getRandomEnumValue(ProjectFunderStatus),
      funderOpportunityNumber: casual.url,
      funderProjectNumber: casual.uuid,
      grantId: casual.url
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    ProjectFunder.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectFunder]);
    const projectFunderId = casual.integer(1, 999);
    const result = await ProjectFunder.findById('testing', context, projectFunderId);
    const expectedSql = 'SELECT * FROM projectFunders WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectFunderId.toString()], 'testing')
    expect(result).toEqual(projectFunder);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectFunderId = casual.integer(1, 999);
    const result = await ProjectFunder.findById('testing', context, projectFunderId);
    expect(result).toEqual(null);
  });

  it('findByProjectId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectFunder]);
    const projectId = casual.integer(1, 999);
    const result = await ProjectFunder.findByProjectId('testing', context, projectId);
    const expectedSql = 'SELECT * FROM projectFunders WHERE projectId = ? ORDER BY created DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString()], 'testing')
    expect(result).toEqual([projectFunder]);
  });

  it('findByProjectId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await ProjectFunder.findByProjectId('testing', context, projectId);
    expect(result).toEqual([]);
  });

  it('findByAffiliation should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectFunder]);
    const affiliationId = casual.url;
    const result = await ProjectFunder.findByAffiliation('testing', context, affiliationId);
    const expectedSql = 'SELECT * FROM projectFunders WHERE affiliationId = ? ORDER BY created DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [affiliationId], 'testing')
    expect(result).toEqual([projectFunder]);
  });

  it('findByAffiliation should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const affiliationId = casual.url;
    const result = await ProjectFunder.findByAffiliation('testing', context, affiliationId);
    expect(result).toEqual([]);
  });

  it('findByProjectAndAffiliation should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectFunder]);
    const projectId = casual.integer(1, 999);
    const email = casual.email;
    const result = await ProjectFunder.findByProjectAndAffiliation('testing', context, projectId, email);
    const expectedSql = 'SELECT * FROM projectFunders WHERE projectId = ? AND affiliationId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString(), email], 'testing')
    expect(result).toEqual(projectFunder);
  });

  it('findByProjectAndAffiliation should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const email = casual.email;
    const result = await ProjectFunder.findByProjectAndAffiliation('testing', context, projectId, email);
    expect(result).toEqual(null);
  });
});

describe('update', () => {
  let updateQuery;
  let projectFunder;

  beforeEach(() => {
    updateQuery = jest.fn();
    (ProjectFunder.update as jest.Mock) = updateQuery;

    projectFunder = new ProjectFunder({
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      status: getRandomEnumValue(ProjectFunderStatus),
      funderOpportunityNumber: casual.url,
      funderProjectNumber: casual.uuid,
      grantId: casual.url
    })
  });

  it('returns the ProjectFunder with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (projectFunder.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await projectFunder.update(context);
    expect(result).toBeInstanceOf(ProjectFunder);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the ProjectFunder has no id', async () => {
    const localValidator = jest.fn();
    (projectFunder.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    projectFunder.id = null;
    const result = await projectFunder.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the updated ProjectFunder', async () => {
    const localValidator = jest.fn();
    (projectFunder.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(projectFunder);

    const mockFindById = jest.fn();
    (ProjectFunder.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectFunder);

    const result = await projectFunder.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectFunder);
  });
});

describe('create', () => {
  const originalInsert = ProjectFunder.insert;
  let insertQuery;
  let projectFunder;

  beforeEach(() => {
    insertQuery = jest.fn();
    (ProjectFunder.insert as jest.Mock) = insertQuery;

    projectFunder = new ProjectFunder({
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      status: getRandomEnumValue(ProjectFunderStatus),
      funderOpportunityNumber: casual.url,
      funderProjectNumber: casual.uuid,
      grantId: casual.url
    });
  });

  afterEach(() => {
    ProjectFunder.insert = originalInsert;
  });

  it('returns the ProjectFunder without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (projectFunder.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await projectFunder.create(context);
    expect(result).toBeInstanceOf(ProjectFunder);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the ProjectFunder with errors if it is invalid', async () => {
    projectFunder.projectId = undefined;
    const response = await projectFunder.create(context);
    expect(response.errors['projectId']).toBe('Project can\'t be blank');
  });

  it('returns the ProjectFunder with an error if the question already exists', async () => {
    const mockFindBy = jest.fn();
    (ProjectFunder.findByProjectAndAffiliation as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(projectFunder);

    const result = await projectFunder.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the newly added ProjectFunder', async () => {
    const mockFindBy = jest.fn();
    (ProjectFunder.findByProjectAndAffiliation as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (ProjectFunder.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectFunder);

    const result = await projectFunder.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectFunder);
  });
});

describe('delete', () => {
  let projectFunder;

  beforeEach(() => {
    projectFunder = new ProjectFunder({
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      status: getRandomEnumValue(ProjectFunderStatus),
      funderOpportunityNumber: casual.url,
      funderProjectNumber: casual.uuid,
      grantId: casual.url
    });
  })

  it('returns null if the ProjectFunder has no id', async () => {
    projectFunder.id = null;
    expect(await projectFunder.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ProjectFunder.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await projectFunder.delete(context)).toBe(null);
  });

  it('returns the ProjectFunder if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ProjectFunder.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(projectFunder);

    const mockFindById = jest.fn();
    (ProjectFunder.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectFunder);

    const result = await projectFunder.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectFunder);
  });
});

describe('PlanFunder', () => {
  let planFunder;

  const funderData = {
    createdById: casual.integer(1, 999),
    planId: casual.integer(1, 9),
    projectFunderId: casual.integer(1, 999),
  }
  beforeEach(() => {
    planFunder = new PlanFunder(funderData);
  });

  it('should initialize options as expected', () => {
    expect(planFunder.planId).toEqual(funderData.planId);
    expect(planFunder.projectFunderId).toEqual(funderData.projectFunderId);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await planFunder.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the planId field is missing', async () => {
    planFunder.planId = null;
    expect(await planFunder.isValid()).toBe(false);
    expect(Object.keys(planFunder.errors).length).toBe(1);
    expect(planFunder.errors['planId']).toBeTruthy();
  });

  it('should return false when calling isValid if the projectFunderId field is missing', async () => {
    planFunder.projectFunderId = null;
    expect(await planFunder.isValid()).toBe(false);
    expect(Object.keys(planFunder.errors).length).toBe(1);
    expect(planFunder.errors['projectFunderId']).toBeTruthy();
  });
});

describe('findBy Queries', () => {
  const originalQuery = PlanFunder.query;

  let localQuery;
  let context;
  let planFunder;

  beforeEach(() => {
    localQuery = jest.fn();
    (PlanFunder.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    planFunder = new PlanFunder({
      planId: casual.integer(1, 999),
      projectFunderId: casual.url,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    PlanFunder.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planFunder]);
    const planFunderId = casual.integer(1, 999);
    const result = await PlanFunder.findById('testing', context, planFunderId);
    const expectedSql = 'SELECT * FROM planFunders WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planFunderId.toString()], 'testing')
    expect(result).toEqual(planFunder);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planFunderId = casual.integer(1, 999);
    const result = await PlanFunder.findById('testing', context, planFunderId);
    expect(result).toEqual(null);
  });

  it('findByPlanId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planFunder]);
    const projectId = casual.integer(1, 999);
    const result = await PlanFunder.findByPlanId('testing', context, projectId);
    const expectedSql = 'SELECT * FROM planFunders WHERE planId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString()], 'testing')
    expect(result).toEqual([planFunder]);
  });

  it('findByPlanId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await PlanFunder.findByPlanId('testing', context, projectId);
    expect(result).toEqual([]);
  });

  it('findByProjectFunderId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planFunder]);
    const planId = casual.integer(1, 999);
    const projectFunderId = casual.integer(1, 999);
    const result = await PlanFunder.findByProjectFunderId('testing', context, planId, projectFunderId);
    const expectedSql = 'SELECT * FROM planFunders WHERE planId = ? AND projectFunderId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    const vals = [planId.toString(), projectFunderId.toString()];
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'testing')
    expect(result).toEqual(planFunder);
  });

  it('findByProjectFunderId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planId = casual.integer(1, 999);
    const projectFunderId = casual.integer(1, 999);
    const result = await PlanFunder.findByProjectFunderId('testing', context, planId, projectFunderId);
    expect(result).toEqual(null);
  });
});

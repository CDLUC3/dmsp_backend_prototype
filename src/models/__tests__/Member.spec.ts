import casual from "casual";
import { buildContext, mockToken } from "../../__mocks__/context";
import { PlanMember, ProjectMember } from "../Member";
import { getMockORCID } from "../../__tests__/helpers";
import { MemberRole } from "../MemberRole";
import { logger } from "../../logger";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ProjectMember', () => {
  let projectMember;

  const memberData = {
    projectId: casual.integer(1, 9),
    affiliationId: casual.url,
    givenName: casual.first_name,
    surName: casual.last_name,
    orcid: getMockORCID(),
    email: casual.email,
    memberRoles: [new MemberRole({ id: casual.integer(1, 99) })],
  }
  beforeEach(() => {
    projectMember = new ProjectMember(memberData);
  });

  it('should initialize options as expected', () => {
    expect(projectMember.projectId).toEqual(memberData.projectId);
    expect(projectMember.affiliationId).toEqual(memberData.affiliationId);
    expect(projectMember.givenName).toEqual(memberData.givenName);
    expect(projectMember.surName).toEqual(memberData.surName);
    expect(projectMember.orcid).toEqual(memberData.orcid);
    expect(projectMember.email).toEqual(memberData.email);
    expect(projectMember.memberRoles).toEqual(memberData.memberRoles);
  });

  it('should return true when calling isValid with a name field', async () => {
    expect(await projectMember.isValid()).toBe(true);
  });

  it('should return false when calling isValid without a projectId field', async () => {
    projectMember.projectId = null;
    expect(await projectMember.isValid()).toBe(false);
    expect(Object.keys(projectMember.errors).length).toBe(1);
    expect(projectMember.errors['projectId']).toBeTruthy();
  });

  it('should return false when calling isValid when the orcid field is not a valid ORCID', async () => {
    projectMember.orcid = '2945yt9u245yt';
    expect(await projectMember.isValid()).toBe(false);
    expect(Object.keys(projectMember.errors).length).toBe(1);
    expect(projectMember.errors['orcid']).toBeTruthy();
  });

  it('should return false when calling isValid when the email field is not a valid email', async () => {
    projectMember.email = 'tester.testing.edu';
    expect(await projectMember.isValid()).toBe(false);
    expect(Object.keys(projectMember.errors).length).toBe(1);
    expect(projectMember.errors['email']).toBeTruthy();
  });

  it('should return false when calling isValid if no name, orcid or email is present', async () => {
    projectMember.givenName = null;
    projectMember.surName = null;
    projectMember.orcid = null;
    projectMember.email = null;
    expect(await projectMember.isValid()).toBe(false);
    expect(Object.keys(projectMember.errors).length).toBe(1);
    expect(projectMember.errors['general']).toBeTruthy();
  });
});

describe('findBy Queries', () => {
  const originalQuery = ProjectMember.query;

  let localQuery;
  let context;
  let projectMember;

  beforeEach(() => {
    localQuery = jest.fn();
    (ProjectMember.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    projectMember = new ProjectMember({
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      memberRoles: [new MemberRole({ id: casual.integer(1, 99) })]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    ProjectMember.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectMember]);
    const projectMemberId = casual.integer(1, 999);
    const result = await ProjectMember.findById('testing', context, projectMemberId);
    const expectedSql = 'SELECT * FROM projectMembers WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectMemberId.toString()], 'testing')
    expect(result).toEqual(projectMember);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectMemberId = casual.integer(1, 999);
    const result = await ProjectMember.findById('testing', context, projectMemberId);
    expect(result).toEqual(null);
  });

  it('findByProjectId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectMember]);
    const projectId = casual.integer(1, 999);
    const result = await ProjectMember.findByProjectId('testing', context, projectId);
    const expectedSql = 'SELECT * FROM projectMembers WHERE projectId = ? ORDER BY surName, givenName';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString()], 'testing')
    expect(result).toEqual([projectMember]);
  });

  it('findByProjectId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await ProjectMember.findByProjectId('testing', context, projectId);
    expect(result).toEqual([]);
  });

  it('findByAffiliation should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectMember]);
    const affiliationId = casual.url;
    const result = await ProjectMember.findByAffiliation('testing', context, affiliationId);
    const expectedSql = 'SELECT * FROM projectMembers WHERE affiliationId = ? ORDER BY surName, givenName';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [affiliationId], 'testing')
    expect(result).toEqual([projectMember]);
  });

  it('findByAffiliation should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const affiliationId = casual.url;
    const result = await ProjectMember.findByAffiliation('testing', context, affiliationId);
    expect(result).toEqual([]);
  });

  it('findByProjectAndEmail should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectMember]);
    const projectId = casual.integer(1, 999);
    const email = casual.email;
    const result = await ProjectMember.findByProjectAndEmail('testing', context, projectId, email);
    const expectedSql = 'SELECT * FROM projectMembers WHERE projectId = ? AND email = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString(), email], 'testing')
    expect(result).toEqual(projectMember);
  });

  it('findByProjectAndEmail should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const email = casual.email;
    const result = await ProjectMember.findByProjectAndEmail('testing', context, projectId, email);
    expect(result).toEqual(null);
  });

  it('findByProjectAndORCID should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectMember]);
    const projectId = casual.integer(1, 999);
    const orcid = casual.card_number();
    const result = await ProjectMember.findByProjectAndORCID('testing', context, projectId, orcid);
    const expectedSql = 'SELECT * FROM projectMembers WHERE projectId = ? AND orcid = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString(), orcid], 'testing')
    expect(result).toEqual(projectMember);
  });

  it('findByProjectAndORCID should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const orcid = casual.card_number();
    const result = await ProjectMember.findByProjectAndORCID('testing', context, projectId, orcid);
    expect(result).toEqual(null);
  });

  it('findByProjectAndName should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectMember]);
    const projectId = casual.integer(1, 999);
    const givenName = casual.first_name;
    const surName = casual.last_name;
    const result = await ProjectMember.findByProjectAndName('testing', context, projectId, givenName, surName);
    const expectedSql = 'SELECT * FROM projectMembers WHERE projectId = ? AND LOWER(givenName) = ? AND LOWER(surName) = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    const vals = [projectId.toString(), givenName.toLowerCase(), surName.toLowerCase()];
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'testing')
    expect(result).toEqual(projectMember);
  });

  it('findByProjectAndName should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const givenName = casual.first_name;
    const surName = casual.last_name;
    const result = await ProjectMember.findByProjectAndName('testing', context, projectId, givenName, surName);
    expect(result).toEqual(null);
  });

  it('findByProjectAndNameOrORCIDOrEmail should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectMember]);
    const projectId = casual.integer(1, 999);
    const givenName = casual.first_name;
    const surName = casual.last_name;
    const orcid = casual.card_number();
    const email = casual.email;
    const result = await ProjectMember.findByProjectAndNameOrORCIDOrEmail('testing', context, projectId, givenName, surName, orcid, email);
    const expectedSql = 'SELECT * FROM projectMembers WHERE projectId = ? AND (LOWER(givenName) = ? AND LOWER(surName) = ?) OR (orcid = ?) ' +
      'OR (email = ?) ORDER BY orcid DESC, email DESC, surName, givenName';
    expect(localQuery).toHaveBeenCalledTimes(1);
    const vals = [projectId.toString(), givenName.toLowerCase(), surName.toLowerCase(), orcid, email];
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'testing')
    expect(result).toEqual(projectMember);
  });

  it('findByProjectAndNameOrORCIDOrEmail should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const givenName = casual.first_name;
    const surName = casual.last_name;
    const orcid = casual.card_number();
    const email = casual.email;
    const result = await ProjectMember.findByProjectAndNameOrORCIDOrEmail('testing', context, projectId, givenName, surName, orcid, email);
    expect(result).toEqual(null);
  });
});

describe('update', () => {
  let updateQuery;
  let projectMember;

  beforeEach(() => {
    updateQuery = jest.fn();
    (ProjectMember.update as jest.Mock) = updateQuery;

    projectMember = new ProjectMember({
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      memberRoles: [new MemberRole({ id: casual.integer(1, 99) })]
    })
  });

  it('returns the ProjectMember with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (projectMember.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await projectMember.update(context);
    expect(result).toBeInstanceOf(ProjectMember);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the ProjectMember has no id', async () => {
    const localValidator = jest.fn();
    (projectMember.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    projectMember.id = null;
    const result = await projectMember.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the updated ProjectMember', async () => {
    const localValidator = jest.fn();
    (projectMember.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(projectMember);

    const mockFindById = jest.fn();
    (ProjectMember.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectMember);

    const result = await projectMember.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectMember);
  });
});

describe('create', () => {
  const originalInsert = ProjectMember.insert;
  let insertQuery;
  let projectMember;

  beforeEach(() => {
    insertQuery = jest.fn();
    (ProjectMember.insert as jest.Mock) = insertQuery;

    projectMember = new ProjectMember({
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      memberRoles: [new MemberRole({ id: casual.integer(1, 99) })]
    });
  });

  afterEach(() => {
    ProjectMember.insert = originalInsert;
    ProjectMember.findByProjectAndEmail = null; //originalFindByProjectAndEmail;
  });

  it('returns the ProjectMember without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (projectMember.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await projectMember.create(context);
    expect(result).toBeInstanceOf(ProjectMember);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the ProjectMember with errors if it is invalid', async () => {
    projectMember.projectId = undefined;
    const response = await projectMember.create(context);
    expect(response.errors['projectId']).toBe('Project can\'t be blank');
  });

  it('returns the ProjectMember with an error if the question already exists', async () => {
    const mockFindBy = jest.fn();
    (ProjectMember.findByProjectAndORCID as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(projectMember);

    const result = await projectMember.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the newly added ProjectMember', async () => {
    const mockFindBy = jest.fn();
    (ProjectMember.findByProjectAndEmail as jest.Mock) = mockFindBy;
    (ProjectMember.findByProjectAndORCID as jest.Mock) = mockFindBy;
    (ProjectMember.findByProjectAndName as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (ProjectMember.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectMember);

    const result = await projectMember.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(3);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectMember);
  });
});

describe('delete', () => {
  let projectMember;

  beforeEach(() => {
    projectMember = new ProjectMember({
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      memberRoles: [new MemberRole({ id: casual.integer(1, 99) })]
    });
  })

  it('returns null if the ProjectMember has no id', async () => {
    projectMember.id = null;
    expect(await projectMember.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ProjectMember.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await projectMember.delete(context)).toBe(null);
  });

  it('returns the ProjectMember if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ProjectMember.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(projectMember);

    const mockFindById = jest.fn();
    (ProjectMember.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectMember);

    const result = await projectMember.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectMember);
  });
});

describe('PlanMember', () => {
  let planMember;

  const memberData = {
    planId: casual.integer(1, 9),
    projectMemberId: casual.url,
    memberRoleIds: [casual.integer(1, 99)],
  }
  beforeEach(() => {
    planMember = new PlanMember(memberData);
  });

  it('should initialize options as expected', () => {
    expect(planMember.planId).toEqual(memberData.planId);
    expect(planMember.projectMemberId).toEqual(memberData.projectMemberId);
    expect(planMember.memberRoleIds).toEqual(memberData.memberRoleIds);
  });

  it('should return true when calling isValid with a name field', async () => {
    expect(await planMember.isValid()).toBe(true);
  });

  it('should return false when calling isValid without a planId field', async () => {
    planMember.planId = null;
    expect(await planMember.isValid()).toBe(false);
    expect(Object.keys(planMember.errors).length).toBe(1);
    expect(planMember.errors['planId']).toBeTruthy();
  });

  it('should return false when calling isValid without a projectMemberId field', async () => {
    planMember.projectMemberId = null;
    expect(await planMember.isValid()).toBe(false);
    expect(Object.keys(planMember.errors).length).toBe(1);
    expect(planMember.errors['projectMemberId']).toBeTruthy();
  });

  it('should return false when calling isValid if there are no memberRoleIds', async () => {
    planMember.memberRoleIds = [];
    expect(await planMember.isValid()).toBe(false);
    expect(Object.keys(planMember.errors).length).toBe(1);
    expect(planMember.errors['memberRoleIds']).toBeTruthy();
  });
});

describe('findByPlanId', () => {
  const originalQuery = PlanMember.query;

  let localQuery;
  let context;
  let planMember;

  beforeEach(() => {
    localQuery = jest.fn();
    (PlanMember.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    planMember = new PlanMember({
      planId: casual.integer(1, 999),
      affiliationId: casual.url,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: getMockORCID(),
      email: casual.email,
      memberRoles: [new MemberRole({ id: casual.integer(1, 99) })]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    PlanMember.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planMember]);
    const planMemberId = casual.integer(1, 999);
    const result = await PlanMember.findById('testing', context, planMemberId);
    const expectedSql = 'SELECT * FROM planMembers WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planMemberId.toString()], 'testing')
    expect(result).toEqual(planMember);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planMemberId = casual.integer(1, 999);
    const result = await PlanMember.findById('testing', context, planMemberId);
    expect(result).toEqual(null);
  });

  it('findByPlanAndProjectMember should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planMember]);
    const planId = casual.integer(1, 999);
    const planMemberId = casual.integer(1, 999);
    const result = await PlanMember.findByPlanAndProjectMember('testing', context, planId, planMemberId);
    const expectedSql = 'SELECT * FROM planMembers WHERE planId = ? AND projectMemberId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planId.toString(), planMemberId.toString()], 'testing')
    expect(result).toEqual(planMember);
  });

  it('findByPlanAndProjectMember should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planId = casual.integer(1, 999);
    const planMemberId = casual.integer(1, 999);
    const result = await PlanMember.findByPlanAndProjectMember('testing', context, planId, planMemberId);
    expect(result).toEqual(null);
  });

  it('findByPlanId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planMember]);
    const planId = casual.integer(1, 999);
    const result = await PlanMember.findByPlanId('testing', context, planId);
    const expectedSql = 'SELECT * FROM planMembers WHERE planId = ? ORDER BY isPrimaryContact DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planId.toString()], 'testing')
    expect(result).toEqual([planMember]);
  });

  it('findByPlanId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planId = casual.integer(1, 999);
    const result = await PlanMember.findByPlanId('testing', context, planId);
    expect(result).toEqual([]);
  });

  it('findByProjectMemberId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([planMember]);
    const projectMemberId = casual.integer(1, 999);
    const result = await PlanMember.findByProjectMemberId('testing', context, projectMemberId);
    const expectedSql = 'SELECT * FROM planMembers WHERE projectMemberId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectMemberId.toString()], 'testing')
    expect(result).toEqual(planMember);
  });

  it('findByProjectMemberId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectMemberId = casual.integer(1, 999);
    const result = await PlanMember.findByProjectMemberId('testing', context, projectMemberId);
    expect(result).toEqual(null);
  });
});

describe('update', () => {
  let updateQuery;
  let planMember;

  beforeEach(() => {
    updateQuery = jest.fn();
    (PlanMember.update as jest.Mock) = updateQuery;

    planMember = new PlanMember({
      id: casual.integer(1, 9999),
      planId: casual.integer(1, 999),
      projectMemberId: casual.integer(1, 999),
      memberRoles: [casual.integer(1, 99)]
    })
  });

  it('returns the PlanMember with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (planMember.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await planMember.update(context);
    expect(result).toBeInstanceOf(PlanMember);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the PlanMember has no id', async () => {
    const localValidator = jest.fn();
    (planMember.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    planMember.id = null;
    const result = await planMember.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the updated PlanMember', async () => {
    const localValidator = jest.fn();
    (planMember.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(planMember);

    const mockFindById = jest.fn();
    (PlanMember.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(planMember);

    const result = await planMember.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(PlanMember);
  });
});

describe('create', () => {
  const originalInsert = PlanMember.insert;
  let insertQuery;
  let planMember;

  beforeEach(() => {
    insertQuery = jest.fn();
    (PlanMember.insert as jest.Mock) = insertQuery;

    planMember = new PlanMember({
      planId: casual.integer(1, 999),
      projectMemberId: casual.integer(1, 999),
      memberRoleIds: [casual.integer(1, 99)],
    });
  });

  afterEach(() => {
    PlanMember.insert = originalInsert;
    PlanMember.findByPlanAndProjectMember = null;
  });

  it('returns the PlanMember without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (planMember.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await planMember.create(context);
    expect(result).toBeInstanceOf(PlanMember);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the PlanMember with errors if it is invalid', async () => {
    planMember.planId = undefined;
    const response = await planMember.create(context);
    expect(response.errors['planId']).toBe('Plan can\'t be blank');
  });

  it('returns the PlanMember with an error if the question already exists', async () => {
    const mockFindBy = jest.fn();
    (PlanMember.findByPlanAndProjectMember as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(planMember);

    const result = await planMember.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the newly added PlanMember', async () => {
    const mockFindBy = jest.fn();
    (PlanMember.findByPlanAndProjectMember as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (PlanMember.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(planMember);

    const result = await planMember.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(PlanMember);
  });
});

describe('delete', () => {
  let planMember;

  beforeEach(() => {
    planMember = new PlanMember({
      id: casual.integer(1, 9999),
      planId: casual.integer(1, 999),
      projectMemberId: casual.integer(1, 999),
      memberRoleIds: [casual.integer(1, 99)],
    });
  })

  it('returns null if the PlanMember has no id', async () => {
    planMember.id = null;
    expect(await planMember.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (PlanMember.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await planMember.delete(context)).toBe(null);
  });

  it('returns the PlanMember if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (PlanMember.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(planMember);

    const mockFindById = jest.fn();
    (PlanMember.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(planMember);

    const result = await planMember.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(PlanMember);
  });
});

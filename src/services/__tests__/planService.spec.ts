import { MyContext } from '../../context';
import { buildMockContextWithToken } from '../../__mocks__/context';
import {ensureDefaultPlanContact, updateMemberRoles} from '../planService';
import { MemberRole } from '../../models/MemberRole';
import { logger } from '../../logger';
import {PlanMember, ProjectMember} from "../../models/Member";
import casual from "casual";
import {Project} from "../../models/Project";
import {Plan} from "../../models/Plan";

jest.mock('../commonStandardService');
jest.mock('../../datasources/dynamo');
jest.mock('../../models/PlanVersion');

describe('planService', () => {
  let context: MyContext;

  beforeEach(async () => {
    context = await buildMockContextWithToken(logger);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  jest.mock('../../models/MemberRole');

  describe('updateMemberRoles', () => {
    it('should remove roles and return updated role IDs', async () => {
      const reference = 'test-reference';
      const memberId = 1;
      const currentRoleIds = [1, 2, 3];
      const newRoleIds = [2, 4];

      MemberRole.reconcileAssociationIds = jest.fn().mockReturnValue({
        idsToBeRemoved: [1, 3],
        idsToBeSaved: [4],
      });

      MemberRole.findById = jest.fn()
        .mockResolvedValueOnce({ removeFromPlanMember: jest.fn().mockResolvedValue(true), label: 'Role 1' })
        .mockResolvedValueOnce({ removeFromPlanMember: jest.fn().mockResolvedValue(true), label: 'Role 3' })
        .mockResolvedValueOnce({ addToPlanMember: jest.fn().mockResolvedValue(true), label: 'Role 4' });

      const result = await updateMemberRoles(reference, context, memberId, currentRoleIds, newRoleIds);

      expect(result.updatedRoleIds).toEqual([2, 4]);
      expect(result.errors).toEqual([]);
      expect(MemberRole.findById).toHaveBeenCalledTimes(3);
    });

    it('should return errors if roles cannot be removed', async () => {
      const reference = 'test-reference';
      const memberId = 1;
      const currentRoleIds = [1, 2];
      const newRoleIds = [2];

      MemberRole.reconcileAssociationIds = jest.fn().mockReturnValue({
        idsToBeRemoved: [1],
        idsToBeSaved: [],
      });

      MemberRole.findById = jest.fn()
        .mockResolvedValueOnce({ removeFromPlanMember: jest.fn().mockResolvedValue(false), label: 'Role 1' });

      const result = await updateMemberRoles(reference, context, memberId, currentRoleIds, newRoleIds);

      expect(result.updatedRoleIds).toEqual([2]);
      expect(result.errors).toEqual(['unable to remove roles: Role 1']);
      expect(MemberRole.findById).toHaveBeenCalledTimes(1);
    });

    it('should return errors if roles cannot be added', async () => {
      const reference = 'test-reference';
      const memberId = 1;
      const currentRoleIds = [1];
      const newRoleIds = [1, 2];

      MemberRole.reconcileAssociationIds = jest.fn().mockReturnValue({
        idsToBeRemoved: [],
        idsToBeSaved: [2],
      });

      MemberRole.findById = jest.fn()
        .mockResolvedValueOnce({ addToPlanMember: jest.fn().mockResolvedValue(false), label: 'Role 2' });

      const result = await updateMemberRoles(reference, context, memberId, currentRoleIds, newRoleIds);

      expect(result.updatedRoleIds).toEqual([1]);
      expect(result.errors).toEqual(['unable to assign roles: Role 2']);
      expect(MemberRole.findById).toHaveBeenCalledTimes(1);
    });

    it('should handle both add and remove errors', async () => {
      const reference = 'test-reference';
      const memberId = 1;
      const currentRoleIds = [1, 2];
      const newRoleIds = [3];

      MemberRole.reconcileAssociationIds = jest.fn().mockReturnValue({
        idsToBeRemoved: [1, 2],
        idsToBeSaved: [3],
      });

      MemberRole.findById = jest.fn()
        .mockResolvedValueOnce({ removeFromPlanMember: jest.fn().mockResolvedValue(false), label: 'Role 1' })
        .mockResolvedValueOnce({ removeFromPlanMember: jest.fn().mockResolvedValue(false), label: 'Role 2' })
        .mockResolvedValueOnce({ addToPlanMember: jest.fn().mockResolvedValue(false), label: 'Role 3' });

      const result = await updateMemberRoles(reference, context, memberId, currentRoleIds, newRoleIds);

      expect(result.updatedRoleIds).toEqual([1, 2]);
      expect(result.errors).toEqual([
        'unable to remove roles: Role 1, Role 2',
        'unable to assign roles: Role 3',
      ]);
      expect(MemberRole.findById).toHaveBeenCalledTimes(3);
    });
  });
});

describe('ensureDefaultPlanContact', () => {
  let context: MyContext;
  let project: Project;
  let plan: Plan;
  let defaultMember: ProjectMember;
  let defaultRole: MemberRole;

  let originalFindPrimaryContact: typeof ProjectMember.findPrimaryContact;
  let originalDefaultRole: typeof MemberRole.defaultRole;
  let originalFindByProjectMemberId: typeof MemberRole.findByProjectMemberId;

  beforeEach(async () => {
    jest.clearAllMocks();

    context = await buildMockContextWithToken(logger)

    originalFindPrimaryContact = ProjectMember.findPrimaryContact;
    originalDefaultRole = MemberRole.defaultRole;
    originalFindByProjectMemberId = MemberRole.findByProjectMemberId;

    defaultRole = new MemberRole({
      id: casual.integer(1, 999),
      label: 'Test',
    });
    jest.spyOn(MemberRole, 'defaultRole').mockResolvedValue(defaultRole);
    jest.spyOn(MemberRole, 'findByProjectMemberId').mockResolvedValue([defaultRole]);

    project = new Project({
      id: casual.integer(1, 999),
      title: casual.sentence
    });
    plan = new Plan({
      id: casual.integer(1, 999),
      projectId: project.id,
      affiliationId: casual.url,
    });
    defaultMember = new ProjectMember({
      id: casual.integer(1, 999),
      projectId: project.id,
      email: casual.email,
      givenName: casual.first_name,
      surName: casual.last_name,
      memberRoles: [defaultRole],
      memberRoleIds: [defaultRole.id],
    });

    jest.spyOn(ProjectMember, 'findPrimaryContact').mockResolvedValue(defaultMember);
  });

  afterEach(() => {
    ProjectMember.findPrimaryContact = originalFindPrimaryContact;
    MemberRole.defaultRole = originalDefaultRole;
    MemberRole.findByProjectMemberId = originalFindByProjectMemberId;
  })

  it('sets default primary contact', async () => {
    const originalFindPrimaryContact = PlanMember.findPrimaryContact;
    const originalInsert = PlanMember.insert;
    const originalFindByPlanAndProjectMember = PlanMember.findByPlanAndProjectMember;
    const originalFindById = PlanMember.findById;

    const newId = casual.integer(1, 9999);
    const newMember = new PlanMember({
      email: casual.email,
      planId: plan.id,
      projectMemberId: defaultMember.id,
      isPrimaryContact: true,
      memberRoleIds: defaultMember.memberRoles.map(mr => mr.id),
    });
    jest.spyOn(PlanMember, 'findPrimaryContact').mockResolvedValue(null);
    jest.spyOn(PlanMember, 'insert').mockResolvedValue(newId);
    jest.spyOn(PlanMember, 'findByPlanAndProjectMember').mockResolvedValue(null);
    jest.spyOn(PlanMember, 'findById').mockResolvedValue(newMember);

    expect(await ensureDefaultPlanContact(context, plan, project)).toBe(true);
    expect(PlanMember.insert).toHaveBeenCalledWith(
      context,
      'planMembers',
      newMember,
      'PlanMember.create',
      ['memberRoleIds']
    );
    PlanMember.findPrimaryContact = originalFindPrimaryContact;
    PlanMember.findByPlanAndProjectMember = originalFindByPlanAndProjectMember;
    PlanMember.findById = originalFindById;
    PlanMember.insert = originalInsert;
  });

  it('returns false if the plan or project are missing', async () => {
    expect(await ensureDefaultPlanContact(context, null, project)).toBe(false);
    expect(await ensureDefaultPlanContact(context, plan, null)).toBe(false);
  });

  it('returns false if there was a problem creating the PlanMember', async () => {
    const originalFindPrimaryContact = PlanMember.findPrimaryContact;
    jest.spyOn(PlanMember, 'findPrimaryContact').mockImplementation(() => {
      throw new Error('test error');
    });

    await expect(ensureDefaultPlanContact(context, plan, project)).rejects.toThrow('test error');
    PlanMember.findPrimaryContact = originalFindPrimaryContact;
  });

  it('returns true if the plan already has a primary contact', async () => {
    const originalFindPrimaryContact = PlanMember.findPrimaryContact;
    const current = new PlanMember({
      planId: plan.id,
      email: casual.email,
    });
    jest.spyOn(PlanMember, 'findPrimaryContact').mockResolvedValue(current);

    expect(await ensureDefaultPlanContact(context, plan, project)).toBe(true);
    PlanMember.findPrimaryContact = originalFindPrimaryContact;
  });
});

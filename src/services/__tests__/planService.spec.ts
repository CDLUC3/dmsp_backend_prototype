import { MyContext } from '../../context';
import {
  buildMockContextWithToken,
  mockedMysqlInstance,
} from '../../__mocks__/context';
import {
  ensureDefaultPlanContact,
  hasPermissionOnPlan,
  updateMemberRoles
} from '../planService';
import { MemberRole } from '../../models/MemberRole';
import { logger } from '../../logger';
import { PlanMember, ProjectMember } from "../../models/Member";
import casual from "casual";
import { Project } from "../../models/Project";
import { Plan } from "../../models/Plan";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { isAdmin, isSuperAdmin } from "../authService";
import {
  ProjectCollaboratorAccessLevel
} from "../../models/Collaborator";
import { User } from "../../models/User";
import { getMockDMPId } from "../../__tests__/helpers";

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

  describe('hasPermissionOnPlan', () => {
    let plan;
    let mockQuery;
    let mockIsSuperAdmin;
    let mockIsAdmin;

    beforeEach(async () => {
      const instance = mockedMysqlInstance;
      mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
      context = await buildMockContextWithToken(logger);

      mockIsSuperAdmin = jest.fn();
      (isSuperAdmin as jest.Mock) = mockIsSuperAdmin;

      mockIsAdmin = jest.fn();
      (isAdmin as jest.Mock) = mockIsAdmin;

      plan = new Plan({
        id: casual.integer(1, 999),
        title: casual.sentence,
        createdById: casual.integer(1, 9999),
        dmpId: getMockDMPId()
      });
    });

    it('returns true if the current user is a Super Admin', async () => {
      mockIsSuperAdmin.mockResolvedValueOnce(true);

      expect(await hasPermissionOnPlan(context, plan)).toBe(true)
      expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
      expect(mockIsAdmin).toHaveBeenCalledTimes(0);
      expect(mockQuery).toHaveBeenCalledTimes(0);
    });

    it('returns true if the current user\'s id is the same as the project\'s owner', async () => {
      mockIsSuperAdmin.mockResolvedValueOnce(false);

      context.token.id = plan.createdById;

      expect(await hasPermissionOnPlan(context, plan)).toBe(true)
      expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
      expect(mockIsAdmin).toHaveBeenCalledTimes(0);
      expect(mockQuery).toHaveBeenCalledTimes(0);
    });

    it('returns true if the current user\'s is an Admin and the project\'s owner are the same org', async () => {
      mockIsSuperAdmin.mockResolvedValueOnce(false);
      mockIsAdmin.mockResolvedValueOnce(true);
      context.token.id = casual.integer(1, 9999);
      jest.spyOn(User, 'findById').mockResolvedValueOnce(new User({ affiliationId: context.token.affiliationId }));
      expect(await hasPermissionOnPlan(context, plan)).toBe(true)
      expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
      expect(mockIsAdmin).toHaveBeenCalledTimes(1);
      expect(User.findById).toHaveBeenCalledTimes(1);
    });

    it('returns true if the current user\'s is a collaborator on the project', async () => {
      mockIsSuperAdmin.mockResolvedValueOnce(false);
      mockIsAdmin.mockResolvedValueOnce(false);
      context.token.id = casual.integer(1, 9999);
      context.token.dmpIds = [{
        dmpId: plan.dmpId,
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      }]
      mockQuery.mockResolvedValueOnce({ affiliationId: context.token.affiliationId });
      expect(await hasPermissionOnPlan(context, plan)).toBe(true)
      expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
      expect(mockIsAdmin).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledTimes(0);
    });

    it('returns false when the user does not have permission', async () => {
      mockIsSuperAdmin.mockResolvedValueOnce(false);
      mockIsAdmin.mockResolvedValueOnce(false);
      context.token.id = casual.integer(1, 9999);
      context.token.dmpIds = [];
      expect(await hasPermissionOnPlan(context, plan)).toBe(false)
      expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
      expect(mockIsAdmin).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledTimes(0);
    });
  });

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

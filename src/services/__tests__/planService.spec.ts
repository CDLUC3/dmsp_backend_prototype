import { MyContext } from '../../context';
import { buildMockContextWithToken } from '../../__mocks__/context';
import { updateMemberRoles } from '../planService';
import { MemberRole } from '../../models/MemberRole';
import { logger } from '../../logger';

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

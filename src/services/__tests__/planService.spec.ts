import { MyContext } from '../../context';
import { buildContext, mockToken } from '../../__mocks__/context';
import { logger } from '../../__mocks__/logger';
import { updateContributorRoles } from '../planService';
import { ContributorRole } from '../../models/ContributorRole';

jest.mock('../commonStandardService');
jest.mock('../../datasources/dynamo');
jest.mock('../../models/PlanVersion');
jest.mock('../../logger');

describe('planService', () => {
  let context: MyContext;

  beforeEach(() => {
    context = buildContext(logger, mockToken());
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  jest.mock('../../models/ContributorRole');

  describe('updateContributorRoles', () => {
    it('should remove roles and return updated role IDs', async () => {
      const reference = 'test-reference';
      const contributorId = 1;
      const currentRoleIds = [1, 2, 3];
      const newRoleIds = [2, 4];

      ContributorRole.reconcileAssociationIds = jest.fn().mockReturnValue({
        idsToBeRemoved: [1, 3],
        idsToBeSaved: [4],
      });

      ContributorRole.findById = jest.fn()
        .mockResolvedValueOnce({ removeFromPlanContributor: jest.fn().mockResolvedValue(true), label: 'Role 1' })
        .mockResolvedValueOnce({ removeFromPlanContributor: jest.fn().mockResolvedValue(true), label: 'Role 3' })
        .mockResolvedValueOnce({ addToPlanContributor: jest.fn().mockResolvedValue(true), label: 'Role 4' });

      const result = await updateContributorRoles(reference, context, contributorId, currentRoleIds, newRoleIds);

      expect(result.updatedRoleIds).toEqual([2, 4]);
      expect(result.errors).toEqual([]);
      expect(ContributorRole.findById).toHaveBeenCalledTimes(3);
    });

    it('should return errors if roles cannot be removed', async () => {
      const reference = 'test-reference';
      const contributorId = 1;
      const currentRoleIds = [1, 2];
      const newRoleIds = [2];

      ContributorRole.reconcileAssociationIds = jest.fn().mockReturnValue({
        idsToBeRemoved: [1],
        idsToBeSaved: [],
      });

      ContributorRole.findById = jest.fn()
        .mockResolvedValueOnce({ removeFromPlanContributor: jest.fn().mockResolvedValue(false), label: 'Role 1' });

      const result = await updateContributorRoles(reference, context, contributorId, currentRoleIds, newRoleIds);

      expect(result.updatedRoleIds).toEqual([2]);
      expect(result.errors).toEqual(['unable to remove roles: Role 1']);
      expect(ContributorRole.findById).toHaveBeenCalledTimes(1);
    });

    it('should return errors if roles cannot be added', async () => {
      const reference = 'test-reference';
      const contributorId = 1;
      const currentRoleIds = [1];
      const newRoleIds = [1, 2];

      ContributorRole.reconcileAssociationIds = jest.fn().mockReturnValue({
        idsToBeRemoved: [],
        idsToBeSaved: [2],
      });

      ContributorRole.findById = jest.fn()
        .mockResolvedValueOnce({ addToPlanContributor: jest.fn().mockResolvedValue(false), label: 'Role 2' });

      const result = await updateContributorRoles(reference, context, contributorId, currentRoleIds, newRoleIds);

      expect(result.updatedRoleIds).toEqual([1]);
      expect(result.errors).toEqual(['unable to assign roles: Role 2']);
      expect(ContributorRole.findById).toHaveBeenCalledTimes(1);
    });

    it('should handle both add and remove errors', async () => {
      const reference = 'test-reference';
      const contributorId = 1;
      const currentRoleIds = [1, 2];
      const newRoleIds = [3];

      ContributorRole.reconcileAssociationIds = jest.fn().mockReturnValue({
        idsToBeRemoved: [1, 2],
        idsToBeSaved: [3],
      });

      ContributorRole.findById = jest.fn()
        .mockResolvedValueOnce({ removeFromPlanContributor: jest.fn().mockResolvedValue(false), label: 'Role 1' })
        .mockResolvedValueOnce({ removeFromPlanContributor: jest.fn().mockResolvedValue(false), label: 'Role 2' })
        .mockResolvedValueOnce({ addToPlanContributor: jest.fn().mockResolvedValue(false), label: 'Role 3' });

      const result = await updateContributorRoles(reference, context, contributorId, currentRoleIds, newRoleIds);

      expect(result.updatedRoleIds).toEqual([1, 2]);
      expect(result.errors).toEqual([
        'unable to remove roles: Role 1, Role 2',
        'unable to assign roles: Role 3',
      ]);
      expect(ContributorRole.findById).toHaveBeenCalledTimes(3);
    });
  });
});

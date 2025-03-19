import { createPlanVersion, syncWithDMPHub } from '../planService';
import { MyContext } from '../../context';
import { Plan, PlanStatus } from '../../models/Plan';
import { PlanVersion } from '../../models/PlanVersion';
import { planToDMPCommonStandard } from '../commonStandardService';
import { buildContext, mockToken } from '../../__mocks__/context';
import { logger } from '../../__mocks__/logger';
import { DMPCommonStandard } from '../../datasources/dmphubAPI';

jest.mock('../commonStandardService');
jest.mock('../../models/PlanVersion');
jest.mock('../../logger');

describe('planService', () => {
  let context: MyContext;
  let plan: Plan;

  beforeEach(() => {
    context = buildContext(logger, mockToken());

    plan = {
      dmpId: null,
      status: PlanStatus.DRAFT,
      lastSynced: null,
      registered: null,
      update: jest.fn(),
    } as unknown as Plan;
  });

  describe('createPlanVersion', () => {
    it('should create a new plan version', async () => {
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      const planVersion = { create: jest.fn().mockResolvedValue({}) } as unknown as PlanVersion;
      (PlanVersion as unknown as jest.Mock).mockImplementation(() => planVersion);

      const result = await createPlanVersion(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'createPlanVersion', plan);
      expect(planVersion.create).toHaveBeenCalledWith(context);
      expect(result).toEqual({});
    });
  });

  describe('syncWithDMPHub', () => {
    it('should return null if there are validation errors', async () => {
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      (context.dataSources.dmphubAPIDataSource.validateDMP as jest.Mock).mockResolvedValue(['error']);

      const result = await syncWithDMPHub(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'syncWithDMPHub', plan);
      expect(context.dataSources.dmphubAPIDataSource.validateDMP).toHaveBeenCalledWith(context, commonStandard, 'syncWithDMPHub');
      expect(logger.error).toHaveBeenCalled();
      expect(plan.update).not.toHaveBeenCalledWith(context, true);
      expect(result).toBeNull();
    });

    it('should create a new DMP if no DMP ID exists', async () => {
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      const dmp = {};
      (context.dataSources.dmphubAPIDataSource.validateDMP as jest.Mock).mockResolvedValue([]);
      (context.dataSources.dmphubAPIDataSource.createDMP as jest.Mock).mockResolvedValue(dmp);

      const result = await syncWithDMPHub(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'syncWithDMPHub', plan);
      expect(context.dataSources.dmphubAPIDataSource.validateDMP).toHaveBeenCalledWith(context, commonStandard, 'syncWithDMPHub');
      expect(context.dataSources.dmphubAPIDataSource.createDMP).toHaveBeenCalledWith(context, commonStandard, 'syncWithDMPHub');
      expect(plan.update).not.toHaveBeenCalledWith(context, true);
      expect(result).toEqual(dmp);
    });

    it('should tombstone the DMP if the plan is archived', async () => {
      plan.id = 123;
      plan.dmpId = '123';
      plan.status = PlanStatus.ARCHIVED;
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      const dmp = {};
      (context.dataSources.dmphubAPIDataSource.validateDMP as jest.Mock).mockResolvedValue([]);
      (context.dataSources.dmphubAPIDataSource.tombstoneDMP as jest.Mock).mockResolvedValue(dmp);

      const result = await syncWithDMPHub(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'syncWithDMPHub', plan);
      expect(context.dataSources.dmphubAPIDataSource.validateDMP).toHaveBeenCalledWith(context, commonStandard, 'syncWithDMPHub');
      expect(context.dataSources.dmphubAPIDataSource.tombstoneDMP).toHaveBeenCalledWith(context, commonStandard, 'syncWithDMPHub');
      expect(plan.update).toHaveBeenCalledWith(context, true);
      expect(result).toEqual(dmp);
    });

    it('should update the DMP if the plan is not archived', async () => {
      plan.id = 123;
      plan.dmpId = '123';
      plan.status = PlanStatus.DRAFT;
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      const dmp = {};
      (context.dataSources.dmphubAPIDataSource.validateDMP as jest.Mock).mockResolvedValue([]);
      (context.dataSources.dmphubAPIDataSource.updateDMP as jest.Mock).mockResolvedValue(dmp);

      const result = await syncWithDMPHub(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'syncWithDMPHub', plan);
      expect(context.dataSources.dmphubAPIDataSource.validateDMP).toHaveBeenCalledWith(context, commonStandard, 'syncWithDMPHub');
      expect(context.dataSources.dmphubAPIDataSource.updateDMP).toHaveBeenCalledWith(context, commonStandard, 'syncWithDMPHub');
      expect(plan.update).toHaveBeenCalledWith(context, true);
      expect(result).toEqual(dmp);
    });
  });
});
import { versionDMP } from '../planService';
import { MyContext } from '../../context';
import { Plan, PlanStatus } from '../../models/Plan';
import { planToDMPCommonStandard } from '../commonStandardService';
import { buildContext, mockToken } from '../../__mocks__/context';
import { logger } from '../../__mocks__/logger';
import { DMPCommonStandard } from '../../types/DMP';
import { dynamo } from '../../datasources/dynamo';

jest.mock('../commonStandardService');
jest.mock('../../datasources/dynamo');
jest.mock('../../models/PlanVersion');
jest.mock('../../logger');

describe('planService', () => {
  let context: MyContext;
  let plan: Plan;

  beforeEach(() => {
    context = buildContext(logger, mockToken());

    plan = new Plan({
      dmpId: null,
      status: PlanStatus.DRAFT,
      lastSynced: null,
      update: jest.fn(),
    });
  });

  describe.only('versionDMP', () => {
    it('should create a new DMP', async () => {
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      jest.spyOn(Plan, 'findByDMPId').mockResolvedValue(null);
      jest.spyOn(dynamo, 'createDMP').mockResolvedValue(commonStandard);

      const result = await versionDMP(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'versionDMP', plan);
      expect(dynamo.createDMP).toHaveBeenCalled();
      expect(result).toEqual(plan);
      expect(plan.lastSynced).toBeTruthy();
    });

    it('should create a new temporary DMP ID if it cannot generate a unique DMP ID', async () => {
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      jest.spyOn(Plan, 'findByDMPId').mockResolvedValue(new Plan({}));
      (dynamo.createDMP as jest.Mock).mockResolvedValue(commonStandard);

      const result = await versionDMP(context, plan);

      expect(dynamo.createDMP).toHaveBeenCalled();
      expect(result.dmpId.startsWith('temp-dmpId-')).toBe(true);
    });

    it('should return the plan with an error if the create fails', async () => {
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      jest.spyOn(dynamo, 'createDMP').mockResolvedValue(null);

      const result = await versionDMP(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'versionDMP', plan);
      expect(dynamo.createDMP).toHaveBeenCalled();
      expect(result).toEqual(plan);
      expect(plan.hasErrors()).toBeTruthy();
    });

    it('should tombstone the DMP', async () => {
      plan.dmpId = '12345';
      plan.status = PlanStatus.ARCHIVED;
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      jest.spyOn(dynamo, 'getDMP').mockResolvedValue([commonStandard]);
      jest.spyOn(dynamo, 'tombstoneDMP').mockResolvedValue(commonStandard);

      const result = await versionDMP(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'versionDMP', plan);
      expect(dynamo.tombstoneDMP).toHaveBeenCalled();
      expect(result).toEqual(plan);
    });

    it('should return the plan with an error if the tombstone fails', async () => {
      plan.dmpId = '12345';
      plan.status = PlanStatus.ARCHIVED;
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      jest.spyOn(dynamo, 'getDMP').mockResolvedValue([commonStandard]);
      jest.spyOn(dynamo, 'tombstoneDMP').mockResolvedValue(null);

      const result = await versionDMP(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'versionDMP', plan);
      expect(dynamo.tombstoneDMP).toHaveBeenCalled();
      expect(result).toEqual(plan);
      expect(plan.hasErrors()).toBeTruthy();
    });

    it('should return the plan with an error if the DMP does not exist', async () => {
      plan.dmpId = '12345';
      plan.status = PlanStatus.ARCHIVED;
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      jest.spyOn(dynamo, 'getDMP').mockResolvedValue([]);

      const result = await versionDMP(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'versionDMP', plan);
      expect(result).toEqual(plan);
      expect(plan.hasErrors()).toBeTruthy();
    });

    it('should generate a new version of the DMP', async () => {
      plan.dmpId = '12345';
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      jest.spyOn(dynamo, 'getDMP').mockResolvedValue([commonStandard]);
      jest.spyOn(dynamo, 'updateDMP').mockResolvedValue(commonStandard);

      const result = await versionDMP(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'versionDMP', plan);
      expect(dynamo.updateDMP).toHaveBeenCalled();
      expect(result).toEqual(plan);
    });

    it('should return the plan with an error if the update fails', async () => {
      plan.dmpId = '12345';
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      jest.spyOn(dynamo, 'getDMP').mockResolvedValue([commonStandard]);
      jest.spyOn(dynamo, 'updateDMP').mockResolvedValue(null);

      const result = await versionDMP(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'versionDMP', plan);
      expect(dynamo.updateDMP).toHaveBeenCalled();
      expect(result).toEqual(plan);
      expect(plan.hasErrors()).toBeTruthy();
    });

    it('should return the plan with an error if the DMP does not exist', async () => {
      plan.dmpId = '12345';
      const commonStandard = {} as DMPCommonStandard;
      (planToDMPCommonStandard as jest.Mock).mockResolvedValue(commonStandard);
      jest.spyOn(dynamo, 'getDMP').mockResolvedValue([]);

      const result = await versionDMP(context, plan);

      expect(planToDMPCommonStandard).toHaveBeenCalledWith(context, 'versionDMP', plan);
      expect(result).toEqual(plan);
      expect(plan.hasErrors()).toBeTruthy();
    });
  });
});

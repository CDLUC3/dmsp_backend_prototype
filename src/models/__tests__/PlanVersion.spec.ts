import casual from "casual";
import { buildMockContextWithToken } from "../../__mocks__/context";
import {
  addVersion,
  findVersionByTimestamp,
  findVersionsByDMPId,
  latestVersion,
  removeVersions,
  updateVersion
} from "../PlanVersion";
import { Plan, PlanStatus, PlanVisibility } from "../Plan";
import { getRandomEnumValue } from "../../__tests__/helpers";
import * as DynamoModule from '../../datasources/dynamo';
import * as CommonStandardModule from '../../services/commonStandardService';
import { getCurrentDate } from "../../utils/helpers";
import { logger } from "../../logger";

jest.mock('../../context.ts');

let context;
let plan;
let mockCommonStandard;

beforeEach(async () => {
  jest.resetAllMocks();

  context = await buildMockContextWithToken(logger);

  plan = new Plan({
    projectId: casual.integer(1, 100),
    versionedTemplateId: casual.integer(1, 100),
    status: getRandomEnumValue(PlanStatus),
    visibility: getRandomEnumValue(PlanVisibility),
    languageId: 'en-US',
    featured: casual.boolean,
    dmpId: casual.uuid,
    registeredById: casual.integer(1, 100),
    registered: casual.date,
  });

  mockCommonStandard = jest.fn().mockResolvedValue({});
  (CommonStandardModule.planToDMPCommonStandard as jest.Mock) = mockCommonStandard;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('addVersion', () => {
  it('should add an initial version of the plan', async () => {
    const reference = 'addVersion';
    const mockLatestVersion = jest.fn().mockResolvedValueOnce([]);
    const mockVersion = jest.fn().mockResolvedValueOnce(plan);
    (DynamoModule.getDMP as jest.Mock) = mockLatestVersion;
    (DynamoModule.createDMP as jest.Mock) = mockVersion;

    const result = await addVersion(context, plan, reference);

    expect(result).toEqual(plan);
    expect(mockCommonStandard).toHaveBeenCalledTimes(1);
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });

  it('should create a version snapshot of the plan', async () => {
    const reference = 'addVersion';
    const mockLatestVersion = jest.fn().mockResolvedValueOnce([{ modified: getCurrentDate() }]);
    const mockVersion = jest.fn().mockResolvedValueOnce(plan);
    (DynamoModule.getDMP as jest.Mock) = mockLatestVersion;
    (DynamoModule.createDMP as jest.Mock) = mockVersion;

    const result = await addVersion(context, plan, reference);

    expect(result).toEqual(plan);
    expect(mockCommonStandard).toHaveBeenCalledTimes(1);
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });

  it('should handle error when adding a version to the plan', async () => {
    const reference = 'addVersion';
    const mockLatestVersion = jest.fn().mockResolvedValueOnce([{ modified: getCurrentDate() }]);
    const mockVersion = jest.fn().mockImplementation(() => { throw new Error('Error adding versions'); });
    (DynamoModule.getDMP as jest.Mock) = mockLatestVersion;
    (DynamoModule.createDMP as jest.Mock) = mockVersion;

    await expect(addVersion(context, plan, reference)).rejects.toThrow('Error adding version');
    expect(mockCommonStandard).toHaveBeenCalledTimes(1);
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });
});

describe('updateVersion', () => {
  it('should update the version of the plan if it was last modified within the last hour', async () => {
    const reference = 'updateVersion';
    const mockLatestVersion = jest.fn().mockResolvedValueOnce([{ modified: getCurrentDate() }]);
    const mockVersion = jest.fn().mockResolvedValueOnce(plan);
    (DynamoModule.getDMP as jest.Mock) = mockLatestVersion;
    (DynamoModule.updateDMP as jest.Mock) = mockVersion;

    const result = await updateVersion(context, plan, reference);

    expect(result).toEqual(plan);
    expect(mockCommonStandard).toHaveBeenCalledTimes(1);
    expect(mockLatestVersion).toHaveBeenCalledTimes(1)
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });

  it('should add a new version of the plan if it was last modified longer than one hour ago', async () => {
    const reference = 'updateVersion';
    const mockLatestVersion = jest.fn().mockResolvedValueOnce([{ modified: '2020-01-01T00:00:00Z' }]);
    const mockVersion = jest.fn().mockResolvedValueOnce(plan);
    (DynamoModule.getDMP as jest.Mock) = mockLatestVersion;
    (DynamoModule.createDMP as jest.Mock) = mockVersion;

    const result = await updateVersion(context, plan, reference);

    expect(result).toEqual(plan);
    expect(mockCommonStandard).toHaveBeenCalledTimes(2);
    expect(mockLatestVersion).toHaveBeenCalledTimes(2)
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });

  it('should add an error if the plan has no latest version', async () => {
    const reference = 'updateVersion';
    const mockVersion = jest.fn().mockResolvedValue([]);
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    const result = await updateVersion(context, plan, reference);

    expect(result).toEqual(plan);
    expect(plan.errors.general).toEqual('Unable to find the latest version of the DMP');
    expect(mockCommonStandard).toHaveBeenCalledTimes(1);
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });

  it('should handle error when updating the version of the plan', async () => {
    const reference = 'updateVersion';
    const mockVersion = jest.fn().mockImplementation(() => { throw new Error('Error updating versions'); });
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    await expect(updateVersion(context, plan, reference)).rejects.toThrow('Error updating version');
    expect(mockCommonStandard).toHaveBeenCalledTimes(1);
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });
});

describe('findVersionByTimestamp', () => {
  it('should find a version by timestamp', async () => {
    const timestamp = casual.date();
    const mockVersion = jest.fn().mockResolvedValueOnce(plan);
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    const result = await findVersionByTimestamp(context, plan, timestamp);

    expect(result).toBeDefined();
    expect(mockVersion).toHaveBeenCalledTimes(1);
  });

  it('should handle error when finding a version by timestamp', async () => {
    const timestamp = casual.date();
    const mockVersion = jest.fn().mockImplementation(() => { throw new Error('Error finding versions'); });
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    await expect(findVersionByTimestamp(context, plan, timestamp)).rejects.toThrow('Error finding version');
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });
});

describe('findVersionsByDMPId', () => {
  it('should find versions by DMP ID', async () => {
    const dmpId = casual.uuid;
    const mockVersion = jest.fn().mockResolvedValueOnce([plan]);
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    const result = await findVersionsByDMPId(context, dmpId);

    expect(result).toBeDefined();
  });

  it('should handle error when finding versions by DMP ID', async () => {
    const dmpId = casual.uuid;
    const mockVersion = jest.fn().mockImplementation(() => { throw new Error('Error finding versions'); });
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    await expect(findVersionsByDMPId(context, dmpId)).rejects.toThrow('Error finding versions');
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });
});

describe('latestVersion', () => {
  it('should find versions by DMP ID', async () => {
    const mockVersion = jest.fn().mockResolvedValueOnce([plan]);
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    const result = await latestVersion(context, plan);

    expect(result).toBeDefined();
  });

  it('should handle error when finding versions by DMP ID', async () => {
    const mockVersion = jest.fn().mockImplementation(() => { throw new Error('Error finding versions'); });
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    await expect(latestVersion(context, plan)).rejects.toThrow('Error finding versions');
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });
});

describe('removeVersions', () => {
  it('should tombstone the DMP if the plan is registered/published', async () => {
    const reference = 'removeVersions';
    const mockLatestVersion = jest.fn().mockResolvedValueOnce([{ registered: getCurrentDate() }]);
    const mockVersion = jest.fn().mockResolvedValueOnce(plan);
    (DynamoModule.getDMP as jest.Mock) = mockLatestVersion;
    (DynamoModule.tombstoneDMP as jest.Mock) = mockVersion;

    const result = await removeVersions(context, plan, reference);

    expect(result).toEqual(plan);
    expect(mockLatestVersion).toHaveBeenCalledTimes(1)
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });

  it('should remove the versions of the plan if it is NOT registered/published', async () => {
    const reference = 'removeVersions';
    plan.registered = null;
    plan.registeredById = null;
    plan.dmpId = null;
    const mockLatestVersion = jest.fn().mockResolvedValueOnce([{ modified: getCurrentDate() }]);
    const mockVersion = jest.fn().mockResolvedValueOnce(plan);
    (DynamoModule.getDMP as jest.Mock) = mockLatestVersion;
    (DynamoModule.deleteDMP as jest.Mock) = mockVersion;

    const result = await removeVersions(context, plan, reference);
    expect(result).toEqual(plan);
    expect(mockLatestVersion).toHaveBeenCalledTimes(1)
    expect(mockVersion).toHaveBeenCalledTimes(1)
  });

  it('should handle error when tombstoning a registered/published plan', async () => {
    const reference = 'removeVersions';
    const mockVersion = jest.fn().mockImplementation(() => { throw new Error('Error removing versions'); });
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    await expect(removeVersions(context, plan, reference)).rejects.toThrow('Error removing versions');
    expect(mockVersion).toHaveBeenCalledTimes(1);
  });

  it('should handle error when removing versions from a plan that is NOT registered/published', async () => {
    const reference = 'removeVersions';
    plan.registered = null;
    plan.registeredById = null;
    plan.dmpId = null;
    const mockVersion = jest.fn().mockImplementation(() => { throw new Error('Error removing versions'); });
    (DynamoModule.getDMP as jest.Mock) = mockVersion;

    await expect(removeVersions(context, plan, reference)).rejects.toThrow('Error removing versions');
    expect(mockVersion).toHaveBeenCalledTimes(1);
  });
});

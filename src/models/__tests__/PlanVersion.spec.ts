import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { PlanVersion } from "../PlanVersion";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('PlanVersion', () => {
  let planVersion;

  const planVersionData = {
    planId: casual.integer(1, 9999),
    dmp: {
      title: casual.title,
      description: casual.sentences(3),
      created: casual.date('YYYY-MM-DD'),
      modified: casual.date('YYYY-MM-DD'),
      dmproadmap_status: casual.random_element(['draft', 'published', 'archived']),
      dmproadmap_visibility: casual.random_element(['private', 'public']),
      dmp_id: {
        identifier: casual.url,
        type: 'url',
      },
      dataset: [{
        title: casual.title,
        dataset_id: {
          identifier: casual.url,
          type: 'url',
        },
      }],
      project: [{
        title: casual.title,
      }]
    },
  }
  beforeEach(() => {
    planVersion = new PlanVersion(planVersionData);
  });

  it('should initialize options as expected', () => {
    expect(planVersion.planId).toEqual(planVersionData.planId);
    expect(planVersion.dmp).toEqual(planVersionData.dmp);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await planVersion.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the planId field is missing', async () => {
    planVersion.planId = null;
    expect(await planVersion.isValid()).toBe(false);
    expect(Object.keys(planVersion.errors).length).toBe(1);
    expect(planVersion.errors['planId']).toBeTruthy();
  });

  it('should return false when calling isValid if the dmp field is missing', async () => {
    planVersion.dmp = null;
    expect(await planVersion.isValid()).toBe(false);
    expect(Object.keys(planVersion.errors).length).toBe(1);
    expect(planVersion.errors['dmp']).toBeTruthy();
  });
});

describe('findBy Queries', () => {
  const originalQuery = PlanVersion.query;

  let localQuery;
  let context;
  let planVersion;

  beforeEach(() => {
    localQuery = jest.fn();
    (PlanVersion.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    planVersion = new PlanVersion({
      id: casual.integer(1,9999),
      planId: casual.integer(1, 9999),
      dmp: {
        title: casual.title,
        description: casual.sentences(3),
        created: casual.date('YYYY-MM-DD'),
        modified: casual.date('YYYY-MM-DD'),
        dmproadmap_status: casual.random_element(['draft', 'published', 'archived']),
        dmproadmap_visibility: casual.random_element(['private', 'public']),
        dmp_id: {
          identifier: casual.url,
          type: 'url',
        },
        dataset: [{
          title: casual.title,
          dataset_id: {
            identifier: casual.url,
            type: 'url',
          },
        }],
        project: [{
          title: casual.title,
        }]
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    PlanVersion.query = originalQuery;
  });

  it('findById should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([planVersion]);
    const planVersionId = casual.integer(1, 999);
    const result = await PlanVersion.findById('testing', context, planVersionId);
    const expectedSql = 'SELECT * FROM planVersions WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planVersionId.toString()], 'testing')
    expect(result).toEqual(planVersion);
  });

  it('findById should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planVersionId = casual.integer(1, 999);
    const result = await PlanVersion.findById('testing', context, planVersionId);
    expect(result).toEqual(null);
  });

  it('findByPlanId should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([planVersion]);
    const planId = casual.integer(1, 9999);
    const result = await PlanVersion.findByPlanId('testing', context, planId);
    const expectedSql = 'SELECT * FROM planVersions WHERE planId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planId.toString()], 'testing')
    expect(result).toEqual([planVersion]);
  });

  it('findByPlanId should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planId = casual.integer(1, 9999);
    const result = await PlanVersion.findByPlanId('testing', context, planId);
    expect(result).toEqual([]);
  });
});

describe('create', () => {
  const originalInsert = PlanVersion.insert;
  let insertQuery;
  let planVersion;

  beforeEach(() => {
    insertQuery = jest.fn();
    (PlanVersion.insert as jest.Mock) = insertQuery;

    planVersion = new PlanVersion({
      planId: casual.integer(1, 9999),
      dmp: {
        title: casual.title,
        description: casual.sentences(3),
        created: casual.date('YYYY-MM-DD'),
        modified: casual.date('YYYY-MM-DD'),
        dmproadmap_status: casual.random_element(['draft', 'published', 'archived']),
        dmproadmap_visibility: casual.random_element(['private', 'public']),
        dmp_id: {
          identifier: casual.url,
          type: 'url',
        },
        dataset: [{
          title: casual.title,
          dataset_id: {
            identifier: casual.url,
            type: 'url',
          },
        }],
        project: [{
          title: casual.title,
        }]
      },
    });
  });

  afterEach(() => {
    PlanVersion.insert = originalInsert;
  });

  it('returns the PlanVersion without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (planVersion.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await planVersion.create(context);
    expect(result instanceof PlanVersion).toBe(true);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the PlanVersion with errors if it is invalid', async () => {
    planVersion.planId = undefined;
    const response = await planVersion.create(context);
    expect(response.errors['planId']).toBe('Plan can\'t be blank');
  });

  it('returns the newly added PlanVersion', async () => {
    const mockFindById = jest.fn();
    (PlanVersion.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(planVersion);

    const result = await planVersion.create(context);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(PlanVersion);
  });
});

describe('delete', () => {
  let planVersion;

  beforeEach(() => {
    planVersion = new PlanVersion({
      id: casual.integer(1, 9999),
      planId: casual.integer(1, 9999),
      dmp: {
        title: casual.title,
        description: casual.sentences(3),
        created: casual.date('YYYY-MM-DD'),
        modified: casual.date('YYYY-MM-DD'),
        dmproadmap_status: casual.random_element(['draft', 'published', 'archived']),
        dmproadmap_visibility: casual.random_element(['private', 'public']),
        dmp_id: {
          identifier: casual.url,
          type: 'url',
        },
        dataset: [{
          title: casual.title,
          dataset_id: {
            identifier: casual.url,
            type: 'url',
          },
        }],
        project: [{
          title: casual.title,
        }]
      },
    });
  })

  it('returns null if the PlanVersion has no id', async () => {
    planVersion.id = null;
    expect(await planVersion.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (PlanVersion.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await planVersion.delete(context)).toBe(null);
  });

  it('returns the PlanVersion if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (PlanVersion.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(planVersion);

    const mockFindById = jest.fn();
    (PlanVersion.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(planVersion);

    const result = await planVersion.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(PlanVersion);
  });
});

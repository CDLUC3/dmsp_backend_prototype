import casual from "casual";
import { Guidance } from "../Guidance";
import { buildMockContextWithToken } from "../../__mocks__/context";
import { logger } from "../../logger";

let context;
jest.mock('../../context.ts');

describe('Guidance', () => {
  let guidance;
  const guidanceData = {
    guidanceGroupId: casual.integer(1, 100),
    guidanceText: 'This is guidance text',
  }

  beforeEach(() => {
    guidance = new Guidance(guidanceData);
  });

  it('should initialize options as expected', () => {
    expect(guidance.id).toBeFalsy();
    expect(guidance.guidanceGroupId).toEqual(guidanceData.guidanceGroupId);
    expect(guidance.guidanceText).toEqual(guidanceData.guidanceText);
    expect(guidance.created).toBeTruthy();
    expect(guidance.modified).toBeTruthy();
    expect(guidance.errors).toEqual({});
  });

  it('should return true when calling isValid with required fields', async () => {
    expect(await guidance.isValid()).toBe(true);
  });

  it('should return false when calling isValid without a guidanceGroupId field', async () => {
    guidance.guidanceGroupId = null;
    expect(await guidance.isValid()).toBe(false);
    expect(Object.keys(guidance.errors).length).toBe(1);
    expect(guidance.errors['guidanceGroupId']).toBeTruthy();
  });
});

describe('Guidance.findByGuidanceGroupId', () => {
  const originalQuery = Guidance.query;

  let localQuery;
  let context;
  let guidance;

  beforeEach(async () => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (Guidance.query as jest.Mock) = localQuery;

    context = await buildMockContextWithToken(logger);

    guidance = new Guidance({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      guidanceGroupId: casual.integer(1, 100),
      guidanceText: casual.sentence,
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    Guidance.query = originalQuery;
  });

  it('should call query with correct params and return the guidance items', async () => {
    localQuery.mockResolvedValueOnce([guidance]);
    const result = await Guidance.findByGuidanceGroupId('Guidance query', context, guidance.guidanceGroupId);
    const expectedSql = 'SELECT * FROM guidance WHERE guidanceGroupId = ? ORDER BY id ASC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenCalledWith(context, expectedSql, [guidance.guidanceGroupId.toString()], 'Guidance query');
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual(guidance.id);
  });

  it('should return an empty array if no records are found', async () => {
    localQuery.mockResolvedValueOnce([]);
    const result = await Guidance.findByGuidanceGroupId('Guidance query', context, 999);
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(result.length).toBe(0);
  });
});

describe('Guidance.findById', () => {
  const originalQuery = Guidance.query;

  let localQuery;
  let context;
  let guidance;

  beforeEach(async () => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (Guidance.query as jest.Mock) = localQuery;

    context = await buildMockContextWithToken(logger);

    guidance = new Guidance({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      guidanceGroupId: casual.integer(1, 100),
      guidanceText: casual.sentence,
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    Guidance.query = originalQuery;
  });

  it('should call query with correct params and return the guidance', async () => {
    localQuery.mockResolvedValueOnce([guidance]);
    const result = await Guidance.findById('Guidance query', context, guidance.id);
    const expectedSql = 'SELECT * FROM guidance WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenCalledWith(context, expectedSql, [guidance.id.toString()], 'Guidance query');
    expect(result.id).toEqual(guidance.id);
  });

  it('should return null if no record is found', async () => {
    localQuery.mockResolvedValueOnce([]);
    const result = await Guidance.findById('Guidance query', context, 999);
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});

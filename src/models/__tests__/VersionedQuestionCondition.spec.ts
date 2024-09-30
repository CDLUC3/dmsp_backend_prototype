import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { QuestionConditionActionType, QuestionConditionCondition } from "../QuestionCondition";
import { getRandomEnumValue } from "../../__tests__/helpers";
import { VersionedQuestionCondition } from "../VersionedQuestionCondition";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('QuestionCondition', () => {
  let versionedQuestionCondition;

  const versionedQuestionConditionData = {
    versionedQuestionId: casual.integer(1, 9999),
    questionConditionId: casual.integer(1, 999),
    action: getRandomEnumValue(QuestionConditionActionType),
    condition: getRandomEnumValue(QuestionConditionCondition),
    conditionMatch: casual.words(3),
    target: casual.word,
  }
  beforeEach(() => {
    versionedQuestionCondition = new VersionedQuestionCondition(versionedQuestionConditionData);
  });

  it('should initialize options as expected', () => {
    expect(versionedQuestionCondition.versionedQuestionId).toEqual(versionedQuestionConditionData.versionedQuestionId);
    expect(versionedQuestionCondition.questionConditionId).toEqual(versionedQuestionConditionData.questionConditionId);
    expect(versionedQuestionCondition.action).toEqual(versionedQuestionConditionData.action);
    expect(versionedQuestionCondition.condition).toEqual(versionedQuestionConditionData.condition);
    expect(versionedQuestionCondition.conditionMatch).toEqual(versionedQuestionConditionData.conditionMatch);
    expect(versionedQuestionCondition.target).toEqual(versionedQuestionConditionData.target);
  });

  it('isValid returns true when the record is valid', async () => {
    expect(await versionedQuestionCondition.isValid()).toBe(true);
  });

  it('isValid returns false if the versioneQuestionId is null', async () => {
    versionedQuestionCondition.versionedQuestionId = null;
    expect(await versionedQuestionCondition.isValid()).toBe(false);
    expect(versionedQuestionCondition.errors.length).toBe(1);
    expect(versionedQuestionCondition.errors[0].includes('Versioned Question')).toBe(true);
  });

  it('isValid returns false if the questionConditionId is null', async () => {
    versionedQuestionCondition.questionConditionId = null;
    expect(await versionedQuestionCondition.isValid()).toBe(false);
    expect(versionedQuestionCondition.errors.length).toBe(1);
    expect(versionedQuestionCondition.errors[0].includes('Question Condition')).toBe(true);
  });

  it('isValid returns false if the action is null', async () => {
    versionedQuestionCondition.action = null;
    expect(await versionedQuestionCondition.isValid()).toBe(false);
    expect(versionedQuestionCondition.errors.length).toBe(1);
    expect(versionedQuestionCondition.errors[0].includes('Action')).toBe(true);
  });

  it('isValid returns false if the condition is null', async () => {
    versionedQuestionCondition.condition = null;
    expect(await versionedQuestionCondition.isValid()).toBe(false);
    expect(versionedQuestionCondition.errors.length).toBe(1);
    expect(versionedQuestionCondition.errors[0].includes('Condition text')).toBe(true);
  });

  it('isValid returns false if the target is null', async () => {
    versionedQuestionCondition.target = null;
    expect(await versionedQuestionCondition.isValid()).toBe(false);
    expect(versionedQuestionCondition.errors.length).toBe(1);
    expect(versionedQuestionCondition.errors[0].includes('Target text')).toBe(true);
  });
});

describe('findBy Queries', () => {
  const originalQuery = VersionedQuestionCondition.query;

  let localQuery;
  let context;
  let versionedQuestionCondition;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (VersionedQuestionCondition.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    versionedQuestionCondition = new VersionedQuestionCondition({
      id: casual.integer(1, 9),
      questionId: casual.integer(1, 999),
      action: getRandomEnumValue(QuestionConditionActionType),
      condition: getRandomEnumValue(QuestionConditionCondition),
      conditionMatch: casual.words(5),
      target: casual.integer(1, 9999).toString(),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    VersionedQuestionCondition.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([versionedQuestionCondition]);
    const id = casual.integer(1, 999);
    const result = await VersionedQuestionCondition.findById('testing', context, id);
    const expectedSql = 'SELECT * FROM versionedQuestionConditions WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'testing')
    expect(result).toEqual(versionedQuestionCondition);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const id = casual.integer(1, 999);
    const result = await VersionedQuestionCondition.findById('testing', context, id);
    expect(result).toEqual(null);
  });
});

describe('create', () => {
  let insertQuery;
  let versionedQuestionCondition;

  beforeEach(() => {
    insertQuery = jest.fn();
    (VersionedQuestionCondition.insert as jest.Mock) = insertQuery;

    versionedQuestionCondition = new VersionedQuestionCondition({
      versionedQuestionId: casual.integer(1, 999),
      questionConditionId: casual.integer(1, 99),
      action: getRandomEnumValue(QuestionConditionActionType),
      condition: getRandomEnumValue(QuestionConditionCondition),
      conditionMatch: casual.words(3),
      target: casual.word,
    })
  });

  it('returns the VersionedQuestionCondition with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (versionedQuestionCondition.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await versionedQuestionCondition.create(context)).toBe(versionedQuestionCondition);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the newly added VersionedQuestionCondition', async () => {
    const localValidator = jest.fn();
    (versionedQuestionCondition.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindBy = jest.fn();
    (VersionedQuestionCondition.findById as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValue(versionedQuestionCondition);

    const result = await versionedQuestionCondition.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(versionedQuestionCondition);
  });
});

import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { QuestionCondition, QuestionConditionActionType, QuestionConditionCondition } from "../QuestionCondition";
import { getRandomEnumValue } from "../../__tests__/helpers";

let context;
jest.mock('../../context.ts');

describe('QuestionCondition', () => {
  let questionCondition;

  const questionConditionData = {
    questionId: casual.integer(1, 999),
    conditionMatch: casual.words(3),
    target: casual.word,
  }
  beforeEach(() => {
    questionCondition = new QuestionCondition(questionConditionData);
  });

  it('should initialize options as expected', () => {
    expect(questionCondition.questionId).toEqual(questionConditionData.questionId);
    expect(questionCondition.action).toEqual(QuestionConditionActionType.SHOW_QUESTION);
    expect(questionCondition.condition).toEqual(QuestionConditionCondition.EQUAL);
    expect(questionCondition.conditionMatch).toEqual(questionConditionData.conditionMatch);
    expect(questionCondition.target).toEqual(questionConditionData.target);
  });
});

describe('findBy Queries', () => {
  const originalQuery = QuestionCondition.query;

  let localQuery;
  let context;
  let questionCondition;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (QuestionCondition.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    questionCondition = new QuestionCondition({
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
    QuestionCondition.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([questionCondition]);
    const id = casual.integer(1, 999);
    const result = await QuestionCondition.findById('testing', context, id);
    const expectedSql = 'SELECT * FROM questionConditions WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'testing')
    expect(result).toEqual(questionCondition);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const id = casual.integer(1, 999);
    const result = await QuestionCondition.findById('testing', context, id);
    expect(result).toEqual(null);
  });

  it('findByQuestionId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([questionCondition]);
    const questionId = casual.integer(1, 999);
    const result = await QuestionCondition.findByQuestionId('testing', context, questionId);
    const expectedSql = 'SELECT * FROM questionConditions WHERE questionId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [questionId.toString()], 'testing')
    expect(result).toEqual([questionCondition]);
  });

  it('findByQuestionId should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const questionId = casual.integer(1, 999);
    const result = await QuestionCondition.findByQuestionId('testing', context, questionId);
    expect(result).toEqual([]);
  });
});

describe('create', () => {
  const originalInsert = QuestionCondition.insert;
  let insertQuery;
  let questionCondition;

  beforeEach(() => {
    // jest.resetAllMocks();

    insertQuery = jest.fn();
    (QuestionCondition.insert as jest.Mock) = insertQuery;

    questionCondition = new QuestionCondition({
      id: casual.integer(1, 9),
      questionId: casual.integer(1, 999),
      action: getRandomEnumValue(QuestionConditionActionType),
      condition: getRandomEnumValue(QuestionConditionCondition),
      conditionMatch: casual.words(5),
      target: casual.integer(1, 9999).toString(),
    })
  });

  afterEach(() => {
    // jest.resetAllMocks();
    QuestionCondition.insert = originalInsert;
  });

  it('returns the QuestionCondition without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (questionCondition.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await questionCondition.create(context)).toBe(questionCondition);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the newly added QuestionCondition', async () => {
    const localValidator = jest.fn();
    (questionCondition.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindById = jest.fn();
    (QuestionCondition.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(questionCondition);

    const result = await questionCondition.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(questionCondition);
  });
});

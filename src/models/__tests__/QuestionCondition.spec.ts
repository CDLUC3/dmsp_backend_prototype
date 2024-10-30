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
    expect(questionCondition.conditionType).toEqual(QuestionConditionCondition.EQUAL);
    expect(questionCondition.conditionMatch).toEqual(questionConditionData.conditionMatch);
    expect(questionCondition.target).toEqual(questionConditionData.target);
  });

  it('should return true when calling isValid with a name field', async () => {
    expect(await questionCondition.isValid()).toBe(true);
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
      conditionType: getRandomEnumValue(QuestionConditionCondition),
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
      conditionType: getRandomEnumValue(QuestionConditionCondition),
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

  it('returns the QuestionCondition with an error if questionId is undefined', async () => {
    questionCondition.questionId = undefined;
    const response = await questionCondition.create(context);
    expect(response.errors[0]).toBe('Question ID can\'t be blank');
  });

  it('returns the QuestionCondition with an error if action is undefined', async () => {
    questionCondition.action = undefined;
    const response = await questionCondition.create(context);
    expect(response.errors[0]).toBe('Action can\'t be blank');
  });

  it('returns the QuestionCondition with an error if conditionType is undefined', async () => {
    questionCondition.conditionType = undefined;
    const response = await questionCondition.create(context);
    expect(response.errors[0]).toBe('Condition Type can\'t be blank');
  });

  it('returns the QuestionCondition with an error if target is undefined', async () => {
    questionCondition.target = undefined;
    const response = await questionCondition.create(context);
    expect(response.errors[0]).toBe('Target can\'t be blank');
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

describe('update', () => {
  let updateQuery;
  let questionCondition;

  beforeEach(() => {
    updateQuery = jest.fn();
    (QuestionCondition.update as jest.Mock) = updateQuery;

    questionCondition = new QuestionCondition({
      id: casual.integer(1, 9),
      questionId: casual.integer(1, 999),
      action: getRandomEnumValue(QuestionConditionActionType),
      conditionType: getRandomEnumValue(QuestionConditionCondition),
      conditionMatch: casual.words(5),
      target: casual.integer(1, 9999).toString(),
    })
  });

  it('returns the QuestionCondition with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (questionCondition.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await questionCondition.update(context)).toBe(questionCondition);
  });

  it('returns an error if the QuestionCondition has no id', async () => {
    const localValidator = jest.fn();
    (questionCondition.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    questionCondition.id = null;
    const result = await questionCondition.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('QuestionCondition has never been saved');
  });

  it('returns the updated QuestionCondition', async () => {
    updateQuery.mockResolvedValueOnce(questionCondition);

    const mockFindById = jest.fn();
    (QuestionCondition.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(questionCondition);

    const result = await questionCondition.update(context);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(questionCondition);
  });
});

describe('delete', () => {
  let questionCondition;

  beforeEach(() => {
    questionCondition = new QuestionCondition({
      id: casual.integer(1, 9),
      questionId: casual.integer(1, 999),
      action: getRandomEnumValue(QuestionConditionActionType),
      conditionType: getRandomEnumValue(QuestionConditionCondition),
      conditionMatch: casual.words(5),
      target: casual.integer(1, 9999).toString(),
    })
  })

  it('returns null if the QuestionCondition has no id', async () => {
    questionCondition.id = null;
    expect(await questionCondition.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (QuestionCondition.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await questionCondition.delete(context)).toBe(null);
  });

  it('returns the QuestionCondition if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (QuestionCondition.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(questionCondition);

    const mockFindById = jest.fn();
    (QuestionCondition.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(questionCondition);

    const result = await questionCondition.delete(context);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(questionCondition);
  });
});
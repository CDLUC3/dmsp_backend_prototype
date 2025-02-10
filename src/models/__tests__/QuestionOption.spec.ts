import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { QuestionOption } from "../QuestionOption";

let context;
jest.mock('../../context.ts');

describe('QuestionOption', () => {
  let questionOption;

  const questionOptionData = {
    questionId: casual.integer(1, 999),
    text: casual.words(3),
    orderNumber: casual.integer(1, 10),
    isDefault: false
  }
  beforeEach(() => {
    questionOption = new QuestionOption(questionOptionData);
  });

  it('should initialize options as expected', () => {
    expect(questionOption.questionId).toEqual(questionOptionData.questionId);
    expect(questionOption.text).toEqual(questionOptionData.text);
    expect(questionOption.orderNumber).toEqual(questionOptionData.orderNumber);
    expect(questionOption.isDefault).toEqual(questionOptionData.isDefault);
  });

  it('should return true when calling isValid with a questionId', async () => {
    expect(await questionOption.isValid()).toBe(true);
  });
});

describe('findBy Queries', () => {
  const originalQuery = QuestionOption.query;

  let localQuery;
  let context;
  let questionOption;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (QuestionOption.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    questionOption = new QuestionOption({
      id: 10,
      questionId: 67,
      text: "Yes",
      orderNumber: 1,
      isDefault: false
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    QuestionOption.query = originalQuery;
  });

  it('findByQuestionOptionId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([questionOption]);
    const questionOptionId = 10;
    const result = await QuestionOption.findByQuestionOptionId('testing', context, questionOptionId);
    const expectedSql = 'SELECT * FROM questionOptions WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [questionOptionId.toString()], 'testing')
    expect(result).toEqual(questionOption);
  });

  it('findByQuestionOptionId should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const questionOptionId = casual.integer(1, 999);
    const result = await QuestionOption.findByQuestionOptionId('testing', context, questionOptionId);
    expect(result).toEqual(null);
  });

  it('findByQuestionId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([questionOption]);
    const questionId = casual.integer(1, 999);
    const result = await QuestionOption.findByQuestionId('testing', context, questionId);
    const expectedSql = 'SELECT * FROM questionOptions WHERE questionId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [questionId.toString()], 'testing')
    expect(result).toEqual([questionOption]);
  });

  it('findByQuestionId should return an empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const questionId = casual.integer(1, 999);
    const result = await QuestionOption.findByQuestionId('testing', context, questionId);
    expect(result).toEqual([]);
  });
});

describe('create', () => {
  const originalInsert = QuestionOption.insert;
  let insertQuery;
  let questionOption;

  beforeEach(() => {
    // jest.resetAllMocks();

    insertQuery = jest.fn();
    (QuestionOption.insert as jest.Mock) = insertQuery;

    questionOption = new QuestionOption({
      questionId: 10,
      text: "Option 1",
      orderNumber: 1,
      isDefault: true
    })
  });

  afterEach(() => {
    // jest.resetAllMocks();
    QuestionOption.insert = originalInsert;
  });

  it('returns the QuestionOption without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (questionOption.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await questionOption.create(context);
    expect(result.errors).toEqual({});
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the QuestionOption with an error if questionId is undefined', async () => {
    questionOption.questionId = undefined;
    const response = await questionOption.create(context);
    expect(response.errors['questionId']).toBe('Question can\'t be blank');
  });

  it('returns the newly added QuestionOption', async () => {
    const localValidator = jest.fn();
    (questionOption.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindById = jest.fn();
    (QuestionOption.findByQuestionOptionId as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(questionOption);

    const result = await questionOption.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(QuestionOption);
  });
});

describe('update', () => {
  let updateQuery;
  let questionOption;

  beforeEach(() => {
    updateQuery = jest.fn();
    (QuestionOption.update as jest.Mock) = updateQuery;

    questionOption = new QuestionOption({
      id: 2,
      questionId: 67,
      text: "Option 2",
      orderNumber: 2,
      isDefault: true
    })
  });

  it('returns an error if the QuestionOption has no id', async () => {
    const localValidator = jest.fn();
    (questionOption.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    questionOption.id = null;
    const result = await questionOption.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the updated QuestionOption', async () => {
    updateQuery.mockResolvedValueOnce(questionOption);

    const mockFindById = jest.fn();
    (QuestionOption.findByQuestionOptionId as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(questionOption);

    const result = await questionOption.update(context);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(QuestionOption);
  });
});

describe('delete', () => {
  let questionOption;

  beforeEach(() => {
    questionOption = new QuestionOption({
      id: 2,
      questionId: 68,
      text: "No",
      orderNumber: 2,
      isDefault: false
    })
  })

  it('returns null if the QuestionOption has no id', async () => {
    questionOption.id = null;
    expect(await questionOption.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (QuestionOption.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await questionOption.delete(context)).toBe(null);
  });

  it('returns the QuestionOption if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (QuestionOption.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(questionOption);

    const mockFindById = jest.fn();
    (QuestionOption.findByQuestionOptionId as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(questionOption);

    const result = await questionOption.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(QuestionOption);
  });
});
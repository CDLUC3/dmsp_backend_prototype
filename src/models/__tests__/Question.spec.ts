import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { Question } from "../Question";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Question', () => {
  let question;

  const questionData = {
    templateId: casual.integer(1, 9),
    sectionId: casual.integer(1, 9),
    questionTypeId: casual.integer(1, 9),
    questionText: casual.sentences(5),
    requirementText: casual.sentences(3),
    guidanceText: casual.sentences(10),
    sampleText: casual.sentences(10),
    useSampleTextAsDefault: true,
    displayOrder: casual.integer(1, 20),
  }
  beforeEach(() => {
    question = new Question(questionData);

    console.log("***QUESTION", question);
  });

  it('should initialize options as expected', () => {
    expect(question.questionTypeId).toEqual(questionData.questionTypeId);
    expect(question.questionText).toEqual(questionData.questionText);
    expect(question.requirementText).toEqual(questionData.requirementText);
    expect(question.guidanceText).toEqual(questionData.guidanceText);
    expect(question.sampleText).toEqual(questionData.sampleText);
    expect(question.useSampleTextAsDefault).toEqual(questionData.useSampleTextAsDefault);
    expect(question.displayOrder).toEqual(questionData.displayOrder);
    expect(question.required).toEqual(false);
  });

  it('should return true when calling isValid with a name field', async () => {
    expect(await question.isValid()).toBe(true);
  });
});

describe('findBy Queries', () => {
  const originalQuery = Question.query;

  let localQuery;
  let context;
  let question;

  beforeEach(() => {
    // jest.resetAllMocks();

    localQuery = jest.fn();
    (Question.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    question = new Question({
      templateId: casual.integer(1, 999),
      sectionId: casual.integer(1, 999),
      id: casual.integer(1, 9),
      questionText: casual.sentences(5),
      displayOrder: casual.integer(1, 9),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    Question.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([question]);
    const questionId = casual.integer(1, 999);
    const result = await Question.findById('testing', context, questionId);
    const expectedSql = 'SELECT * FROM questions WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [questionId.toString()], 'testing')
    expect(result).toEqual(question);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const questionId = casual.integer(1, 999);
    const result = await Question.findById('testing', context, questionId);
    expect(result).toEqual(null);
  });

  it('findBySectionId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([question]);
    const questionId = casual.integer(1, 999);
    const result = await Question.findBySectionId('testing', context, questionId);
    const expectedSql = 'SELECT * FROM questions WHERE sectionId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [questionId.toString()], 'testing')
    expect(result).toEqual([question]);
  });

  it('findBySectionId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const questionId = casual.integer(1, 999);
    const result = await Question.findBySectionId('testing', context, questionId);
    expect(result).toEqual([]);
  });
});

describe('update', () => {
  let updateQuery;
  let question;

  beforeEach(() => {
    updateQuery = jest.fn();
    (Question.update as jest.Mock) = updateQuery;

    question = new Question({
      templateId: casual.integer(1, 999),
      sectionId: casual.integer(1, 999),
      id: casual.integer(1, 9),
      questionText: casual.sentences(5),
      displayOrder: casual.integer(1, 9),
    })
  });

  it('returns the Question with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (question.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await question.update(context)).toBe(question);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the Template has no id', async () => {
    const localValidator = jest.fn();
    (question.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    question.id = null;
    const result = await question.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Question has never been saved');
  });

  it('returns the updated Template', async () => {
    const localValidator = jest.fn();
    (question.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(question);

    const mockFindById = jest.fn();
    (Question.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(question);

    const result = await question.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(question);
  });
});

describe('create', () => {
  const originalInsert = Question.insert;
  let insertQuery;
  let question;

  beforeEach(() => {
    // jest.resetAllMocks();

    insertQuery = jest.fn();
    (Question.insert as jest.Mock) = insertQuery;

    question = new Question({
      templateId: casual.integer(1, 999),
      sectionId: casual.integer(1, 999),
      id: casual.integer(1, 9),
      questionText: casual.sentences(5),
      displayOrder: casual.integer(1, 9),
    })
  });

  afterEach(() => {
    // jest.resetAllMocks();
    Question.insert = originalInsert;
  });

  it('returns the Question without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (question.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await question.create(context)).toBe(question);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the Question with an error if templateId is undefined', async () => {
    question.templateId = undefined;
    const response = await question.create(context);
    expect(response.errors[0]).toBe('Template ID can\'t be blank');
  });

  it('returns the Question with an error if sectionId is undefined', async () => {
    question.sectionId = undefined;
    const response = await question.create(context);
    expect(response.errors[0]).toBe('Section ID can\'t be blank');
  });

  it('returns the Question with an error if questionText is undefined', async () => {
    question.questionText = undefined;
    const response = await question.create(context);
    expect(response.errors[0]).toBe('Question text can\'t be blank');
  });

  it('returns the newly added Question', async () => {
    const mockFindById = jest.fn();
    (Question.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(question);

    const result = await question.create(context);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(question);
  });
});

describe('delete', () => {
  let question;

  beforeEach(() => {
    question = new Question({
      templateId: casual.integer(1, 999),
      sectionId: casual.integer(1, 999),
      id: casual.integer(1, 9),
      questionText: casual.sentences(5),
      displayOrder: casual.integer(1, 9),
    })
  })

  it('returns null if the Question has no id', async () => {
    question.id = null;
    expect(await question.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Question.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await question.delete(context)).toBe(null);
  });

  it('returns the Question if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Question.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(question);

    const mockFindById = jest.fn();
    (Question.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(question);

    const result = await question.delete(context);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(question);
  });
});
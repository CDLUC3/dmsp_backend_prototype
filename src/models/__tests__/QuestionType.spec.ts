import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { QuestionType } from "../QuestionType";

jest.mock('../../context.ts');

describe('QuestionType', () => {
  let questionType;

  const questionTypeData = {
    name: casual.sentence,
    usageDescription: casual.sentences(5),
  }
  beforeEach(() => {
    questionType = new QuestionType(questionTypeData);
  });

  it('should initialize options as expected', () => {
    expect(questionType.name).toEqual(questionTypeData.name);
    expect(questionType.usageDescription).toEqual(questionTypeData.usageDescription);
    expect(questionType.isDefault).toEqual(false);
  });
});

describe('default', () => {
  const originalQuery = QuestionType.query;

  let localQuery;
  let context;
  let questionType;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (QuestionType.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    questionType = new QuestionType({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      name: casual.sentence,
      usageDescription: casual.sentences(5),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    QuestionType.query = originalQuery;
  });

  it('should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([questionType]);
    const result = await QuestionType.default(context);
    const expectedSql = 'SELECT * FROM questionTypes WHERE isDefault = 1';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [], 'QuestionType default')
    expect(result).toEqual(questionType);
  });

  it('should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const result = await QuestionType.default(context);
    expect(result).toEqual(null);
  });
});

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

  beforeEach(async () => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (QuestionType.query as jest.Mock) = localQuery;

    context = await buildContext(logger, mockToken());

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
    const result = await QuestionType.findAll('QuestionType ref', context);
    const expectedSql = 'SELECT * FROM questionTypes';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [], 'QuestionType ref')
    expect(result).toEqual([questionType]);
  });

  it('should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const result = await QuestionType.findAll('QuestionType ref', context);
    expect(result).toEqual([]);
  });
});

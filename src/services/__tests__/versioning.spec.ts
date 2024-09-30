import casual from "casual";
import { getRandomEnumValue } from "../../__tests__/helpers";
import { QuestionCondition, QuestionConditionActionType, QuestionConditionCondition } from "../../models/QuestionCondition";
import { Question } from "../../models/Question";
import { generateQuestionConditionVersion, generateQuestionVersion } from "../questionService";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { MySQLDataSource } from "../../datasources/mySQLDataSource";

let context;
let mockQuery;
let mockFindByQuestionId;
let mockCreateVersionedQuestion;
let mockCreateVersionedQuestionCondition;

jest.mock('../../context.ts');

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());

  // Cast getInstance to a jest.Mock type to use mockReturnValue
  (MySQLDataSource.getInstance as jest.Mock).mockReturnValue({
    query: jest.fn(),
  });

  const instance = MySQLDataSource.getInstance();
  mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
});

afterEach(() => {
  jest.clearAllMocks();
});

/*
jest.mock('../../models/VersionedQuestion', () => {
  return {
    VersionedQuestion: function mockConstructor(options) {
      return {
        id: options.id || casual.integer(1, 999),
        versionedTemplateId: options.versionedTemplateId || casual.integer(1, 99),
        versionedSectionId: options.versionedSectionId || casual.integer(1, 99),
        questionId: options.questionId || casual.integer(1, 999),
        questionTypeId: options.questionTypeId || casual.integer(1, 9),
        questionText: options.questionText || casual.sentences(5),
        requirementText: options.requirementText || casual.sentences(3),
        guidanceText: options.guidanceText || casual.sentences(1),
        sampleText: options.sampleText || casual.sentences(2),
        required: options.required || false,
        errors: [],

        create: (mockCreateVersionedQuestion as jest.Mock),
      };
    },
  };
});
*/

jest.mock('../../models/VersionedQuestionCondition', () => {
  return {
    VersionedQuestionCondition: function mockConstructor(options) {
      return {
        id: options.id || casual.integer(1, 999),
        versionedQuestionId: options.versionedQuestionId || casual.integer(1, 99),
        questionConditionId: options.questionConditionId || casual.integer(1, 999),
        action: options.action || getRandomEnumValue(QuestionConditionActionType),
        condition: options.condition || getRandomEnumValue(QuestionConditionCondition),
        conditionMatch: options.conditionMatch || casual.words(3),
        target: options.target || casual.word,

        create: (mockCreateVersionedQuestion as jest.Mock),
      };
    },
  };
});


describe('generateQuestionVersion', () => {
  let question;
  let versionedTemplateId;
  let versionedSectionId;

  beforeEach(() => {
    jest.resetAllMocks();

    versionedTemplateId = casual.integer(1, 999);
    versionedSectionId = casual.integer(1, 9999);

    question = new Question({
      id: casual.integer(1, 99999),
      templateId: casual.integer(1, 999),
      sectionId: casual.integer(1, 9999),
      questionTypeId: casual.integer(1, 9),
      questionText: casual.sentence,
      requirementText: casual.sentence,
      guidanceText: casual.sentence,
      sampleText: casual.sentence,
      displayOrder: casual.integer(1, 9),
      required: true,
      isDirty: true,
    });
  });

  it.only('is able to generate the version', async () => {
    mockFindByQuestionId = jest.fn(() => { return []; });
    (QuestionCondition.findByQuestionId as jest.Mock) = mockFindByQuestionId;
    mockQuery = jest.fn();
    mockQuery.mockResolvedValueOnce({ errors: [] });
    const result = await generateQuestionVersion(context, question, versionedTemplateId, versionedSectionId);

console.log(result)

    // expect(mockCreateVersionedQuestion).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith('FOOO')
    expect(QuestionCondition.findByQuestionId).toHaveBeenCalledTimes(1);

    expect(question.isDirty).toEqual(false);
    expect(result.displayOrder).toEqual(question.displayOrder);
    expect(result.guidanceText).toEqual(question.guidanceText.id)
    expect(result.questionText).toEqual(question.questionText);
    expect(result.questionTypeId).toEqual(question.questionTypeId);
    expect(result.required).toEqual(false);
    expect(result.requirementText).toEqual(question.requirementText);
    expect(result.sampleText).toEqual(question.sampleText);
    expect(result.questionId).toEqual(question.id);
    expect(result.versionedSectionId).toEqual(versionedSectionId);
    expect(result.versionedTemplateId).toEqual(versionedTemplateId);
  });

  it('returns null if we are unable to generate the version', async () => {
    mockCreateVersionedQuestion = jest.fn();

    const result = await generateQuestionVersion(context, question, versionedTemplateId, versionedSectionId);
    expect(mockCreateVersionedQuestion).toHaveBeenCalledTimes(1);
    expect(result).toBeFalsy();
  });
});

describe('generateQuestionConditionVersion', () => {
  let questionCondition;
  let versionedQuestionId;

  beforeEach(() => {
    jest.resetAllMocks();

    versionedQuestionId = casual.integer(1, 99999);

    questionCondition = new QuestionCondition({
      id: casual.integer(1, 99999),
      action: getRandomEnumValue(QuestionConditionActionType),
      condition: getRandomEnumValue(QuestionConditionCondition),
      conditionMatch: casual.words(2),
      target: casual.word,
    });
  });

  it('is able to generate the version', async () => {
    mockCreateVersionedQuestionCondition = jest.fn(() => { return { errors: [] }; });

    const result = await generateQuestionConditionVersion(context, questionCondition, versionedQuestionId);
    expect(mockCreateVersionedQuestionCondition).toHaveBeenCalledTimes(1);
    expect(result.versionedQuestionId).toEqual(versionedQuestionId);
    expect(result.questionConditionId).toEqual(questionCondition.id)
    expect(result.action).toEqual(questionCondition.action);
    expect(result.condition).toEqual(questionCondition.condition);
    expect(result.conditionMatch).toEqual(questionCondition.conditionMatch);
    expect(result.target).toEqual(questionCondition.target);
  });

  it('returns null if we are unable to generate the version', async () => {
    mockCreateVersionedQuestionCondition = jest.fn();

    const result = await generateQuestionConditionVersion(context, questionCondition, versionedQuestionId);
    expect(mockCreateVersionedQuestionCondition).toHaveBeenCalledTimes(1);
    expect(result).toBeFalsy();
  });
});

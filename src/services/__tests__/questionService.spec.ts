import casual from "casual";
import { Template } from "../../models/Template";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { MySQLDataSource } from "../../datasources/mySQLDataSource";
import { cloneQuestion, hasPermissionOnQuestion } from "../questionService";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { hasPermissionOnTemplate } from "../templateService";
import { NotFoundError } from "../../utils/graphQLErrors";
import { Question } from "../../models/Question";
import { VersionedQuestion } from "../../models/VersionedQuestion";
import { QuestionType } from "../../models/QuestionType";

// Pulling context in here so that the MySQLDataSource gets mocked
jest.mock('../../context.ts');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('hasPermissionOnQuestion', () => {
  let template;
  let mockQuery;
  let mockFindById;
  let mockHashPermissionOnTemplate;
  let context;

  beforeEach(() => {
    jest.resetAllMocks();

    // Cast getInstance to a jest.Mock type to use mockReturnValue
    (MySQLDataSource.getInstance as jest.Mock).mockReturnValue({
      query: jest.fn(), // Initialize the query mock function here
    });

    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
    context = { logger, dataSources: { sqlDataSource: { query: mockQuery } } };

    mockFindById = jest.fn();
    (Template.findById as jest.Mock) = mockFindById;

    mockHashPermissionOnTemplate = jest.fn();
    (hasPermissionOnTemplate as jest.Mock) = mockHashPermissionOnTemplate;

    template = new Template({
      id: casual.integer(1, 999),
      name: casual.sentence,
      ownerId: casual.url,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if the Template is not found', async () => {
    mockFindById.mockResolvedValue(null);
    expect(async () => { await hasPermissionOnQuestion(context, template.id) }).rejects.toThrow(NotFoundError());
  });

  it('returns true if the current user has permission on the Template', async () => {
    mockFindById.mockResolvedValueOnce(template);
    mockHashPermissionOnTemplate.mockResolvedValueOnce(true);

    expect(await hasPermissionOnQuestion(context, template.id)).toBe(true)
    expect(Template.findById).toHaveBeenCalledTimes(1);
    expect(mockHashPermissionOnTemplate).toHaveBeenCalledTimes(1);
  });

  it('returns false if the current user does NOT have permission on the Template', async () => {
    mockFindById.mockResolvedValueOnce(template);
    mockHashPermissionOnTemplate.mockResolvedValueOnce(false);

    expect(await hasPermissionOnQuestion(context, template.id)).toBe(false)
    expect(Template.findById).toHaveBeenCalledTimes(1);
    expect(mockHashPermissionOnTemplate).toHaveBeenCalledTimes(1);
  });
});

describe('cloneQuestion', () => {
  let question;

  let id;
  let templateId;
  let sectionId;
  let questionType;
  let questionText;
  let sampleText;
  let requirementText;
  let guidanceText;
  let displayOrder;
  let required;
  let isDirty;
  let createdById;

  beforeEach(() => {
    questionType = new QuestionType({ id: casual.integer(1, 9), name: casual.words });
    templateId = casual.integer(1, 999);
    sectionId = casual.integer(1, 999);
    id = casual.integer(1, 999);
    questionText = casual.sentence;
    sampleText = casual.sentences(3);
    requirementText = casual.sentences(5);
    guidanceText = casual.sentences(5);
    displayOrder = casual.integer(1, 9);
    required = casual.boolean;
    isDirty = true;
    createdById = casual.integer(1, 999);

    question = new Question({
      id, templateId, sectionId, questionTypeId: questionType.id, questionText, requirementText, guidanceText,
      sampleText, displayOrder, required, isDirty, createdById
    });
  });

  it('Clone retains the expected parts of the specified Question', () => {
    const clonedById = casual.integer(1, 99);
    const copy = cloneQuestion(clonedById, templateId, sectionId, question);

    expect(copy).toBeInstanceOf(Question);
    expect(copy.id).toBeFalsy();
    expect(copy.templateId).toEqual(templateId);
    expect(copy.sectionId).toEqual(sectionId);
    expect(copy.sourceQuestionId).toEqual(question.id);
    expect(copy.questionTypeId).toEqual(questionType.id);
    expect(copy.questionText).toEqual(questionText);
    expect(copy.sampleText).toEqual(sampleText);
    expect(copy.requirementText).toEqual(requirementText);
    expect(copy.guidanceText).toEqual(guidanceText);
    expect(copy.errors).toEqual([]);
    expect(copy.displayOrder).toEqual(displayOrder);
    expect(copy.required).toEqual(false);
    expect(copy.isDirty).toEqual(true);
    expect(copy.created).toBeTruthy();
    expect(copy.createdById).toEqual(clonedById)
    expect(copy.modified).toBeTruthy();
  });

  it('Clone retains the expected parts of the specified VersionedQuestion', () => {
    const clonedById = casual.integer(1, 999);
    const published = new VersionedQuestion({
      versionedTemplateId: templateId,
      versionedSectionId: sectionId,
      questionId: question.id,
      questionTypeId: questionType.id,
      questionText: casual.sentence,
      sampleText: casual.sentences(3),
      requirementText: casual.sentences(5),
      guidanceText: casual.sentences(5),
      displayOrder: casual.integer(1, 9),
      required: true,
      createdById: casual.integer(1, 9999),
    });

    const copy = cloneQuestion(clonedById, templateId, sectionId, published);

    expect(copy).toBeInstanceOf(Question);
    expect(copy.id).toBeFalsy();
    expect(copy.sourceQuestionId).toEqual(published.questionId);
    expect(copy.questionTypeId).toEqual(questionType.id);
    expect(copy.questionText).toEqual(published.questionText);
    expect(copy.sampleText).toEqual(published.sampleText);
    expect(copy.requirementText).toEqual(published.requirementText);
    expect(copy.guidanceText).toEqual(published.guidanceText);
    expect(copy.errors).toEqual([]);
    expect(copy.createdById).toEqual(clonedById);
    expect(copy.displayOrder).toEqual(published.displayOrder);
    expect(copy.required).toEqual(false);
    expect(copy.isDirty).toEqual(true);
    expect(copy.created).toBeTruthy();
    expect(copy.modified).toBeTruthy();
  });
});

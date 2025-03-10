import casual from "casual";
import { Template } from "../../models/Template";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { MySQLDataSource } from "../../datasources/mySQLDataSource";
import { cloneQuestion, generateQuestionConditionVersion, generateQuestionVersion, hasPermissionOnQuestion } from "../questionService";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { hasPermissionOnTemplate } from "../templateService";
import { NotFoundError } from "../../utils/graphQLErrors";
import { Question } from "../../models/Question";
import { VersionedQuestion } from "../../models/VersionedQuestion";
import { QuestionType } from "../../models/QuestionType";
import { QuestionCondition, QuestionConditionActionType, QuestionConditionCondition } from "../../models/QuestionCondition";
import { VersionedQuestionCondition } from "../../models/VersionedQuestionCondition";
import { getRandomEnumValue } from "../../__tests__/helpers";
import { getCurrentDate } from "../../utils/helpers";

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
    expect(copy.errors).toEqual({});
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
    expect(copy.errors).toEqual({});
    expect(copy.createdById).toEqual(clonedById);
    expect(copy.displayOrder).toEqual(published.displayOrder);
    expect(copy.required).toEqual(false);
    expect(copy.isDirty).toEqual(true);
    expect(copy.created).toBeTruthy();
    expect(copy.modified).toBeTruthy();
  });
});

describe('generateQuestionVersion', () => {
  let questionStore;
  let versionedQuestionStore;
  let mockInsert;
  let mockUpdate;
  let mockFindQuestionById;
  let mockFindVersionedQuestionById;

  beforeEach(() => {
    // Mock the QuestionConditions
    const mockQuestionConditionFindByQuestionId = jest.fn().mockResolvedValue([]);
    (QuestionCondition.findByQuestionId as jest.Mock) = mockQuestionConditionFindByQuestionId;

    const tstamp = getCurrentDate();

    // Setup the mock data stores
    questionStore = [
      new Question({
        id: casual.integer(1, 99),
        templateId: casual.integer(1, 99),
        sectionId: casual.integer(1, 999),
        questionTypeId: casual.integer(1, 9),
        questionText: casual.sentences(2),
        requirementText: casual.sentences(3),
        guidanceText: casual.sentences(2),
        sampleText: casual.sentences(2),
        required: true,
        displayOrder: casual.integer(1, 9),
        isDirty: true,
        createdById: casual.integer(1, 999),
        created: tstamp,
        modifiedById: casual.integer(1, 999),
        modified: tstamp,
      }),
    ];
    versionedQuestionStore = [];

    // Fetch an item from the questionStore
    mockFindQuestionById = jest.fn().mockImplementation((_, __, id) => {
      return questionStore.find((entry) => { return entry.id === id });
    });

    // Fetch an item from the versionedQuestionStore
    mockFindVersionedQuestionById = jest.fn().mockImplementation((_, __, id) => {
      return versionedQuestionStore.find((entry) => { return entry.id === id });
    });

    // Add the entry to the appropriate store
    mockInsert = jest.fn().mockImplementation((context, table, obj) => {
      const tstamp = getCurrentDate();
      const userId = context.token.id;
      obj.id = casual.integer(1, 9999);
      obj.created = tstamp;
      obj.createdById = userId;
      obj.modifed = tstamp;
      obj.modifiedById = userId;

      switch (table) {
        case 'questions': {
          questionStore.push(obj);
          break;
        }
        case 'versionedQuestions': {
          versionedQuestionStore.push(obj);
          break;
        }
      }
      // Need to return the new id for the object
      return obj.id;
    });

    // Update the entry in the store
    mockUpdate = jest.fn().mockImplementation((context, table, obj, _ref, _keys, noTouch) => {
      const tstamp = getCurrentDate();
      const userId = context.token.id;
      if (!noTouch) {
        obj.modifed = tstamp;
        obj.modifiedById = userId;
      }

      switch (table) {
        case 'questions': {
          const existing = questionStore.find((entry) => { return entry.id === obj.id });
          if (!existing) {
            throw new Error(`No entry in the questionStore for id: ${obj.id}`);
          }
          questionStore.splice(questionStore.indexOf(existing), 1, obj);
          break;
        }
        case 'versionedQuestions': {
          const existing = versionedQuestionStore.find((entry) => { return entry.id === obj.id });
          if (!existing) {
            throw new Error(`No entry in the versionedQuestionStore for id: ${obj.id}`);
          }
          versionedQuestionStore.splice(versionedQuestionStore.indexOf(existing), 1, obj);
          break;
        }
      }
      return obj;
    });
  });

  it('does not allow an unsaved question to be versioned', async () => {
    const question = new Question({ name: casual.words(4) });

    expect(async () => {
      await generateQuestionVersion(context, question, casual.integer(1, 999), casual.integer(1, 999));
    }).rejects.toThrow(Error('Cannot publish unsaved Question'));
  });

  it('does not version if the VersionedQuestion could not be created', async () => {
    const question = questionStore[0];
    const versioned = new VersionedQuestion({ questionId: question.id });
    versioned.errors = { general: 'Test failure' };

    (context.dataSources.sqlDataSource.query as jest.Mock).mockResolvedValueOnce(null);
    (VersionedQuestion.insert as jest.Mock) = mockInsert;
    const mockFindByFailure = jest.fn().mockImplementation(() => { return versioned; });
    (VersionedQuestion.findById as jest.Mock) = mockFindByFailure;

    const err = `Unable to create new version for question: ${question.id}`;
    expect(async () => {
      await generateQuestionVersion(context, question, casual.integer(1, 999), casual.integer(1, 999));
    }).rejects.toThrow(Error(err));
  });

  it('does not version if the Question could not be updated', async () => {
    const question = questionStore[0];
    const updated = new Question({ id: question.id });
    updated.errors = { general: 'Test failure' };

    (VersionedQuestion.insert as jest.Mock) = mockInsert;
    (VersionedQuestion.findById as jest.Mock) = mockFindVersionedQuestionById;
    const mockUpdateFailure = jest.fn().mockImplementation(() => { return updated; });
    (Question.update as jest.Mock) = mockUpdate;
    (Question.findById as jest.Mock) = mockUpdateFailure;

    const err = `Unable to set isDirty flag on question: ${question.id}`;
    expect(async () => {
      await generateQuestionVersion(context, question, casual.integer(1, 999), casual.integer(1, 999))
    }).rejects.toThrow(Error(err));
  });

  it('versions the Question', async () => {
    const question = new Question(questionStore[0]);

    (VersionedQuestion.insert as jest.Mock) = mockInsert;
    (VersionedQuestion.findById as jest.Mock) = mockFindVersionedQuestionById;
    (Question.update as jest.Mock) = mockUpdate;
    (Question.findById as jest.Mock) = mockFindQuestionById;

    const versionedTemplateId = casual.integer(1, 999);
    const versionedSectionId = casual.integer(1, 999);
    expect(
      await generateQuestionVersion(context, question, versionedTemplateId, versionedSectionId)
    ).toEqual(true);

    // Verify that the Version was created as expected
    const newVersion = versionedQuestionStore[0];
    expect(mockInsert).toHaveBeenCalled();
    expect(newVersion.id).toBeTruthy();
    expect(newVersion.created).toBeTruthy();
    expect(newVersion.modified).toBeTruthy();
    expect(newVersion.createdById).toEqual(context.token.id);
    expect(newVersion.modifiedById).toEqual(context.token.id);
    expect(newVersion.versionedTemplateId).toEqual(versionedTemplateId);
    expect(newVersion.versionedSectionId).toEqual(versionedSectionId);
    expect(newVersion.questionId).toEqual(question.id);
    expect(newVersion.questionTypeId).toEqual(question.questionTypeId);
    expect(newVersion.questionText).toEqual(question.questionText);
    expect(newVersion.requirementText).toEqual(question.requirementText);
    expect(newVersion.guidanceText).toEqual(question.guidanceText);
    expect(newVersion.sampleText).toEqual(question.sampleText);
    expect(newVersion.required).toEqual(question.required)
    expect(newVersion.displayOrder).toEqual(question.displayOrder);

    // Verify that the question was updated as expected
    expect(mockUpdate).toHaveBeenCalled();
    const updated = questionStore.find((entry) => { return entry.id === question.id; });
    expect(updated.modifiedById).toEqual(question.modifiedById);
    expect(updated.modified).toEqual(question.modified);
    expect(updated.isDirty).toEqual(false);
  });
});

describe('generateQuestionConditionVersion', () => {
  let questionConditionStore;
  let versionedQuestionConditionStore;
  let mockInsert;
  let mockUpdate;
  let mockFindQuestionConditionById;
  let mockFindVersionedQuestionConditionById;

  beforeEach(() => {
    const tstamp = getCurrentDate();

    // Setup the mock data stores
    questionConditionStore = [
      new QuestionCondition({
        id: casual.integer(1, 99),
        questionId: casual.integer(1, 99),
        action: getRandomEnumValue(QuestionConditionActionType),
        conditionType: getRandomEnumValue(QuestionConditionCondition),
        conditionMatch: casual.words(2),
        target: casual.words(3),
        createdById: casual.integer(1, 999),
        created: tstamp,
        modifiedById: casual.integer(1, 999),
        modified: tstamp,
      }),
    ];
    versionedQuestionConditionStore = [];

    // Fetch an item from the questionConditionStore
    mockFindQuestionConditionById = jest.fn().mockImplementation((_, __, id) => {
      return questionConditionStore.find((entry) => { return entry.id === id });
    });

    // Fetch an item from the versionedQuestionConditionStore
    mockFindVersionedQuestionConditionById = jest.fn().mockImplementation((_, __, id) => {
      return versionedQuestionConditionStore.find((entry) => { return entry.id === id });
    });

    // Add the entry to the appropriate store
    mockInsert = jest.fn().mockImplementation((context, table, obj) => {
      const tstamp = getCurrentDate();
      const userId = context.token.id;
      obj.id = casual.integer(1, 9999);
      obj.created = tstamp;
      obj.createdById = userId;
      obj.modifed = tstamp;
      obj.modifiedById = userId;

      switch (table) {
        case 'questionConditions': {
          questionConditionStore.push(obj);
          break;
        }
        case 'versionedQuestionConditions': {
          versionedQuestionConditionStore.push(obj);
          break;
        }
      }
      // Need to return the new id for the object
      return obj.id;
    });

    // Update the entry in the store
    mockUpdate = jest.fn().mockImplementation((context, table, obj, _ref, _keys, noTouch) => {
      const tstamp = getCurrentDate();
      const userId = context.token.id;
      if (!noTouch) {
        obj.modifed = tstamp;
        obj.modifiedById = userId;
      }

      switch (table) {
        case 'questionConditions': {
          const existing = questionConditionStore.find((entry) => { return entry.id === obj.id });
          if (!existing) {
            throw new Error(`No entry in the questionConditionStore for id: ${obj.id}`);
          }
          questionConditionStore.splice(questionConditionStore.indexOf(existing), 1, obj);
          break;
        }
        case 'versionedQuestionConditions': {
          const existing = versionedQuestionConditionStore.find((entry) => { return entry.id === obj.id });
          if (!existing) {
            throw new Error(`No entry in the versionedQuestionConditionStore for id: ${obj.id}`);
          }
          versionedQuestionConditionStore.splice(versionedQuestionConditionStore.indexOf(existing), 1, obj);
          break;
        }
      }
      return obj;
    });
  });

  it('does not allow an unsaved QuestionCondition to be versioned', async () => {
    const questionCondition = new QuestionCondition({ questionId: casual.integer(1, 9) });

    expect(async () => {
      await generateQuestionConditionVersion(context, questionCondition, casual.integer(1, 999));
    }).rejects.toThrow(Error('Cannot publish unsaved QuestionCondition'));
  });

  it('does not version if the VersionedQuestionCondition could not be created', async () => {
    const questionCondition = questionConditionStore[0];
    const versioned = new VersionedQuestionCondition({ questionId: questionCondition.id });
    versioned.errors = { general: 'Test failure' };

    (context.dataSources.sqlDataSource.query as jest.Mock).mockResolvedValueOnce(null);
    (VersionedQuestionCondition.insert as jest.Mock) = mockInsert;
    const mockFindByFailure = jest.fn().mockImplementation(() => { return versioned; });
    (VersionedQuestionCondition.findById as jest.Mock) = mockFindByFailure;

    const err = `Unable to generate a new version for questionCondition: ${questionCondition.id}`;
    expect(async () => {
      await generateQuestionConditionVersion(context, questionCondition, casual.integer(1, 999));
    }).rejects.toThrow(Error(err));
  });

  it('versions the QuestionCondition', async () => {
    const questionCondition = new QuestionCondition(questionConditionStore[0]);

    (VersionedQuestionCondition.insert as jest.Mock) = mockInsert;
    (VersionedQuestionCondition.findById as jest.Mock) = mockFindVersionedQuestionConditionById;
    (QuestionCondition.update as jest.Mock) = mockUpdate;
    (QuestionCondition.findById as jest.Mock) = mockFindQuestionConditionById;

    const versionedQuestionId = casual.integer(1, 999);
    expect(
      await generateQuestionConditionVersion(context, questionCondition, versionedQuestionId)
    ).toEqual(true);

    // Verify that the Version was created as expected
    const newVersion = versionedQuestionConditionStore[0];
    expect(mockInsert).toHaveBeenCalled();
    expect(newVersion.id).toBeTruthy();
    expect(newVersion.created).toBeTruthy();
    expect(newVersion.modified).toBeTruthy();
    expect(newVersion.createdById).toEqual(context.token.id);
    expect(newVersion.modifiedById).toEqual(context.token.id);
    expect(newVersion.versionedQuestionId).toEqual(versionedQuestionId);
    expect(newVersion.action).toEqual(questionCondition.action);
    expect(newVersion.conditionType).toEqual(questionCondition.conditionType);
    expect(newVersion.conditionMatch).toEqual(questionCondition.conditionMatch);
    expect(newVersion.target).toEqual(questionCondition.target);
  });
});
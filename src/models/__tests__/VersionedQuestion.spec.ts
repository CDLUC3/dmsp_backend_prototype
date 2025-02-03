import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { VersionedQuestion } from "../VersionedQuestion";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('VersionedQuestion', () => {
  let versionedQuestion;

  const versionedQuestionData = {
    versionedTemplateId: casual.integer(1, 999),
    versionedSectionId: casual.integer(1, 999),
    questionId: casual.integer(1, 999),
    questionTypeId: casual.integer(1, 9),
    questionText: casual.sentences(5),
    requirementText: casual.sentences(3),
    guidanceText: casual.sentences(10),
    sampleText: casual.sentences(10),
    displayOrder: casual.integer(1, 20),
  }
  beforeEach(() => {
    versionedQuestion = new VersionedQuestion(versionedQuestionData);
  });

  it('should initialize options as expected', () => {
    expect(versionedQuestion.versionedTemplateId).toEqual(versionedQuestionData.versionedTemplateId);
    expect(versionedQuestion.versionedSectionId).toEqual(versionedQuestionData.versionedSectionId);
    expect(versionedQuestion.questionId).toEqual(versionedQuestionData.questionId);
    expect(versionedQuestion.questionTypeId).toEqual(versionedQuestionData.questionTypeId);
    expect(versionedQuestion.questionText).toEqual(versionedQuestionData.questionText);
    expect(versionedQuestion.requirementText).toEqual(versionedQuestionData.requirementText);
    expect(versionedQuestion.guidanceText).toEqual(versionedQuestionData.guidanceText);
    expect(versionedQuestion.sampleText).toEqual(versionedQuestionData.sampleText);
    expect(versionedQuestion.displayOrder).toEqual(versionedQuestionData.displayOrder);
    expect(versionedQuestion.required).toEqual(false);
  });

  it('isValid returns true when the record is valid', async () => {
    expect(await versionedQuestion.isValid()).toBe(true);
  });

  it('isValid returns false if the versionedTemplateId is null', async () => {
    versionedQuestion.versionedTemplateId = null;
    expect(await versionedQuestion.isValid()).toBe(false);
    expect(Object.keys(versionedQuestion.errors).length).toBe(1);
    expect(versionedQuestion.errors['versionedTemplateId'].includes('Versioned Template')).toBe(true);
  });

  it('isValid returns false if the versionedSectionId is null', async () => {
    versionedQuestion.versionedSectionId = null;
    expect(await versionedQuestion.isValid()).toBe(false);
    expect(Object.keys(versionedQuestion.errors).length).toBe(1);
    expect(versionedQuestion.errors['versionedSectionId'].includes('Versioned Section')).toBe(true);
  });

  it('isValid returns false if the questionId is null', async () => {
    versionedQuestion.questionId = null;
    expect(await versionedQuestion.isValid()).toBe(false);
    expect(Object.keys(versionedQuestion.errors).length).toBe(1);
    expect(versionedQuestion.errors['questionId'].includes('Question')).toBe(true);
  });

  it('isValid returns false if the questionTypeId is null', async () => {
    versionedQuestion.questionTypeId = null;
    expect(await versionedQuestion.isValid()).toBe(false);
    expect(Object.keys(versionedQuestion.errors).length).toBe(1);
    expect(versionedQuestion.errors['questionTypeId'].includes('Question type')).toBe(true);
  });

  it('isValid returns false if the questionText is null', async () => {
    versionedQuestion.questionText = null;
    expect(await versionedQuestion.isValid()).toBe(false);
    expect(Object.keys(versionedQuestion.errors).length).toBe(1);
    expect(versionedQuestion.errors['questionText'].includes('Question text')).toBe(true);
  });
});

describe('findBy Queries', () => {
  const originalQuery = VersionedQuestion.query;

  let localQuery;
  let context;
  let versionedQuestion;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (VersionedQuestion.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    versionedQuestion = new VersionedQuestion({
      templateId: casual.integer(1, 999),
      sectionId: casual.integer(1, 999),
      id: casual.integer(1, 9),
      questionText: casual.sentences(5),
      displayOrder: casual.integer(1, 9),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    VersionedQuestion.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([versionedQuestion]);
    const questionId = casual.integer(1, 999);
    const result = await VersionedQuestion.findById('testing', context, questionId);
    const expectedSql = 'SELECT * FROM versionedQuestions WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [questionId.toString()], 'testing')
    expect(result).toEqual(versionedQuestion);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const questionId = casual.integer(1, 999);
    const result = await VersionedQuestion.findById('testing', context, questionId);
    expect(result).toEqual(null);
  });
});

describe('create', () => {
  let insertQuery;
  let versionedQuestion;

  beforeEach(() => {
    insertQuery = jest.fn();
    (VersionedQuestion.insert as jest.Mock) = insertQuery;

    versionedQuestion = new VersionedQuestion({
      versionedTemplateId: casual.integer(1, 999),
      versionedSectionId: casual.integer(1, 999),
      questionId: casual.integer(1, 999),
      questionTypeId: casual.integer(1, 9),
      questionText: casual.sentences(5),
      displayOrder: casual.integer(1, 20),
    })
  });

  it('returns the VersionedQuestion with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (versionedQuestion.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await versionedQuestion.create(context)).toBe(versionedQuestion);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the newly added VersionedQuestion', async () => {
    const localValidator = jest.fn();
    (versionedQuestion.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindBy = jest.fn();
    (VersionedQuestion.findById as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValue(versionedQuestion);

    const result = await versionedQuestion.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toEqual(versionedQuestion);
  });
});

describe('findByVersionedSectionId', () => {
  const originalQuery = VersionedQuestion.query;

  let localQuery;
  let context;
  let versionedQuestion;

  beforeEach(() => {
    // jest.resetAllMocks();

    localQuery = jest.fn();
    (VersionedQuestion.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    versionedQuestion = new VersionedQuestion({
      versionedTemplateId: casual.integer(1, 999),
      versionedSectionId: casual.integer(1, 999),
      questionId: casual.integer(1, 999),
      questionTypeId: casual.integer(1, 9),
      questionText: casual.sentences(5),
      displayOrder: casual.integer(1, 20),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    VersionedQuestion.query = originalQuery;
  });

  it('should call query with correct params and return the default when findByVersionedSectionId called', async () => {
    localQuery.mockResolvedValueOnce([versionedQuestion]);
    const id = casual.integer(1, 999);
    const result = await VersionedQuestion.findByVersionedSectionId('testing', context, id);
    const expectedSql = 'SELECT * FROM versionedQuestions WHERE versionedSectionId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'testing')
    expect(result).toEqual([versionedQuestion]);
  });
});
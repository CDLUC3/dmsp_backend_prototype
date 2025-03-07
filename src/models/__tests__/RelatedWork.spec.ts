import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { RelatedWork, RelatedWorkRelationDescriptor, RelatedWorkType } from "../RelatedWork";
import { getRandomEnumValue } from "../../__tests__/helpers";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('RelatedWork', () => {
  let relatedWork;

  const relatedWorkData = {
    projectId: casual.integer(1, 9999),
    identifier: casual.url,
    citation: casual.sentences(3),
  }
  beforeEach(() => {
    relatedWork = new RelatedWork(relatedWorkData);
  });

  it('should initialize options as expected', () => {
    expect(relatedWork.projectId).toEqual(relatedWorkData.projectId);
    expect(relatedWork.workType).toEqual(RelatedWorkType.DATASET);
    expect(relatedWork.relationDescriptor).toEqual(RelatedWorkRelationDescriptor.REFERENCES);
    expect(relatedWork.identifier).toEqual(relatedWorkData.identifier);
    expect(relatedWork.citation).toEqual(relatedWorkData.citation);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await relatedWork.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the projectId field is missing', async () => {
    relatedWork.projectId = null;
    expect(await relatedWork.isValid()).toBe(false);
    expect(Object.keys(relatedWork.errors).length).toBe(1);
    expect(relatedWork.errors['projectId']).toBeTruthy();
  });

  it('should return false when calling isValid if the workType field is missing', async () => {
    relatedWork.workType = null;
    expect(await relatedWork.isValid()).toBe(false);
    expect(Object.keys(relatedWork.errors).length).toBe(1);
    expect(relatedWork.errors['workType']).toBeTruthy();
  });

  it('should return false when calling isValid if the relationDescriptor field is missing', async () => {
    relatedWork.relationDescriptor = null;
    expect(await relatedWork.isValid()).toBe(false);
    expect(Object.keys(relatedWork.errors).length).toBe(1);
    expect(relatedWork.errors['relationDescriptor']).toBeTruthy();
  });

  it('should return false when calling isValid if the identifier field is missing', async () => {
    relatedWork.identifier = null;
    expect(await relatedWork.isValid()).toBe(false);
    expect(Object.keys(relatedWork.errors).length).toBe(1);
    expect(relatedWork.errors['identifier']).toBeTruthy();
  });
});

describe('findBy Queries', () => {
  const originalQuery = RelatedWork.query;

  let localQuery;
  let context;
  let relatedWork;

  beforeEach(() => {
    localQuery = jest.fn();
    (RelatedWork.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    relatedWork = new RelatedWork({
      id: casual.integer(1,9999),
      projectId: casual.integer(1, 9999),
      workType: getRandomEnumValue(RelatedWorkType),
      relationDescriptor: getRandomEnumValue(RelatedWorkRelationDescriptor),
      identifier: casual.url,
      citation: casual.sentences(3),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    RelatedWork.query = originalQuery;
  });

  it('findById should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([relatedWork]);
    const relatedWorkId = casual.integer(1, 999);
    const result = await RelatedWork.findById('testing', context, relatedWorkId);
    const expectedSql = 'SELECT * FROM relatedWorks WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [relatedWorkId.toString()], 'testing')
    expect(result).toEqual(relatedWork);
  });

  it('findById should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const relatedWorkId = casual.integer(1, 999);
    const result = await RelatedWork.findById('testing', context, relatedWorkId);
    expect(result).toEqual(null);
  });

  it('findByProjectAndIdentifier should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([relatedWork]);
    const projectId = casual.integer(1, 999);
    const identifier = casual.url;
    const result = await RelatedWork.findByProjectAndIdentifier('testing', context, projectId, identifier);
    const expectedSql = 'SELECT * FROM relatedWorks WHERE projectId = ? AND identifier = ?';
    const vals = [projectId.toString(), identifier];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'testing')
    expect(result).toEqual(relatedWork);
  });

  it('findByProjectAndIdentifier should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const identifier = casual.url;
    const result = await RelatedWork.findByProjectAndIdentifier('testing', context, projectId, identifier);
    expect(result).toEqual(null);
  });

  it('findByIdentifier should call query with correct params and return the objects', async () => {
    localQuery.mockResolvedValueOnce([relatedWork]);
    const identifier = casual.url;
    const result = await RelatedWork.findByIdentifier('testing', context, identifier);
    const expectedSql = 'SELECT * FROM relatedWorks WHERE identifier = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [identifier], 'testing')
    expect(result).toEqual([relatedWork]);
  });

  it('findByIdentifier should return an empty array if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const identifier = casual.url;
    const result = await RelatedWork.findByIdentifier('testing', context, identifier);
    expect(result).toEqual([]);
  });

  it('findByProjectId should call query with correct params and return the objects', async () => {
    localQuery.mockResolvedValueOnce([relatedWork]);
    const projectId = casual.integer(1, 999);
    const result = await RelatedWork.findByProjectId('testing', context, projectId);
    const expectedSql = 'SELECT * FROM relatedWorks WHERE projectId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString()], 'testing')
    expect(result).toEqual([relatedWork]);
  });

  it('findByProjectId should return an empty array if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await RelatedWork.findByProjectId('testing', context, projectId);
    expect(result).toEqual([]);
  });
});

describe('update', () => {
  let updateQuery;
  let relatedWork;

  beforeEach(() => {
    updateQuery = jest.fn();
    (RelatedWork.update as jest.Mock) = updateQuery;

    relatedWork = new RelatedWork({
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 9999),
      workType: getRandomEnumValue(RelatedWorkType),
      relationDescriptor: getRandomEnumValue(RelatedWorkRelationDescriptor),
      identifier: casual.url,
      citation: casual.sentences(3),
    })
  });

  it('returns the RelatedWork with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (relatedWork.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await relatedWork.update(context);
    expect(result instanceof RelatedWork).toBe(true);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the updated RelatedWork', async () => {
    const localValidator = jest.fn();
    (relatedWork.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(relatedWork);

    const mockFindById = jest.fn();
    (RelatedWork.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(relatedWork);

    const result = await relatedWork.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(RelatedWork);
  });
});

describe('create', () => {
  const originalInsert = RelatedWork.insert;
  let insertQuery;
  let relatedWork;

  beforeEach(() => {
    insertQuery = jest.fn();
    (RelatedWork.insert as jest.Mock) = insertQuery;

    relatedWork = new RelatedWork({
      projectId: casual.integer(1, 9999),
      workType: getRandomEnumValue(RelatedWorkType),
      relationDescriptor: getRandomEnumValue(RelatedWorkRelationDescriptor),
      identifier: casual.url,
      citation: casual.sentences(3),
    });
  });

  afterEach(() => {
    RelatedWork.insert = originalInsert;
  });

  it('returns the RelatedWork without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (relatedWork.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await relatedWork.create(context);
    expect(result instanceof RelatedWork).toBe(true);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the RelatedWork with errors if it is invalid', async () => {
    relatedWork.projectId = undefined;
    const response = await relatedWork.create(context);
    expect(response.errors['projectId']).toBe('Project can\'t be blank');
  });

  it('returns the RelatedWork with an error if the object already exists', async () => {
    const mockFindByProjectAndIdentifier = jest.fn();
    (RelatedWork.findByProjectAndIdentifier as jest.Mock) = mockFindByProjectAndIdentifier;
    mockFindByProjectAndIdentifier.mockResolvedValueOnce(relatedWork);

    const result = await relatedWork.create(context);
    expect(mockFindByProjectAndIdentifier).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the newly added RelatedWork', async () => {
    const mockFindByProjectAndIdentifier = jest.fn();
    (RelatedWork.findByProjectAndIdentifier as jest.Mock) = mockFindByProjectAndIdentifier;
    mockFindByProjectAndIdentifier.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (RelatedWork.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(relatedWork);

    const result = await relatedWork.create(context);
    expect(mockFindByProjectAndIdentifier).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(RelatedWork);
  });
});

describe('delete', () => {
  let relatedWork;

  beforeEach(() => {
    relatedWork = new RelatedWork({
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 9999),
      workType: getRandomEnumValue(RelatedWorkType),
      relationDescriptor: getRandomEnumValue(RelatedWorkRelationDescriptor),
      identifier: casual.url,
      citation: casual.sentences(3),
    });
  })

  it('returns null if the RelatedWork has no id', async () => {
    relatedWork.id = null;
    expect(await relatedWork.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (RelatedWork.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await relatedWork.delete(context)).toBe(null);
  });

  it('returns the RelatedWork if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (RelatedWork.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(relatedWork);

    const mockFindById = jest.fn();
    (RelatedWork.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(relatedWork);

    const result = await relatedWork.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(RelatedWork);
  });
});

import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { ResearchDomain } from "../ResearchDomain";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ResearchDomain', () => {
  let domain;

  const funderData = {
    name: casual.company_name,
    uri: casual.url,
    description: casual.sentences(3),
  }
  beforeEach(() => {
    domain = new ResearchDomain(funderData);
  });

  it('should initialize options as expected', () => {
    expect(domain.name).toEqual(funderData.name);
    expect(domain.uri).toEqual(funderData.uri);
    expect(domain.description).toEqual(funderData.description);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await domain.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the name field is missing', async () => {
    domain.name = null;
    expect(await domain.isValid()).toBe(false);
    expect(domain.errors.length).toBe(1);
    expect(domain.errors[0]).toEqual('Name can\'t be blank');
  });

  it('should return false when calling isValid if the uri field is missing', async () => {
    domain.uri = null;
    expect(await domain.isValid()).toBe(false);
    expect(domain.errors.length).toBe(1);
    expect(domain.errors[0]).toEqual('Invalid URI format');
  });

  it('should return false when calling isValid if the uri field is not a URI', async () => {
    domain.uri = casual.uuid;
    expect(await domain.isValid()).toBe(false);
    expect(domain.errors.length).toBe(1);
    expect(domain.errors[0]).toEqual('Invalid URI format');
  });

  it('should return false when specifying a parent research domain that is the same id', async () => {
    const id = casual.integer(1, 9999)
    domain.id = id;
    domain.parentResearchDomain = { id };
    expect(await domain.isValid()).toBe(false);
    expect(domain.errors.length).toBe(1);
    expect(domain.errors[0]).toEqual('Parent research domain must be a different domain');
  });

  it('should return false when specifying a parent research domain that has a null id', async () => {
    domain.id = casual.integer(1, 9999);
    domain.parentResearchDomain = { name: casual.sentence };
    expect(await domain.isValid()).toBe(false);
    expect(domain.errors.length).toBe(1);
    expect(domain.errors[0]).toEqual('Parent research domain must be saved first');
  });
});

describe('findBy Queries', () => {
  const originalQuery = ResearchDomain.query;

  let localQuery;
  let context;
  let domain;

  beforeEach(() => {
    localQuery = jest.fn();
    (ResearchDomain.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    domain = new ResearchDomain({
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    ResearchDomain.query = originalQuery;
  });

  it('findById should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([domain]);
    const domainId = casual.integer(1, 999);
    const result = await ResearchDomain.findById('testing', context, domainId);
    const expectedSql = 'SELECT * FROM researchDomains WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [domainId.toString()], 'testing')
    expect(result).toEqual(domain);
  });

  it('findById should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const domainId = casual.integer(1, 999);
    const result = await ResearchDomain.findById('testing', context, domainId);
    expect(result).toEqual(null);
  });

  it('findByURI should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([domain]);
    const uri = casual.url;
    const result = await ResearchDomain.findByURI('testing', context, uri);
    const expectedSql = 'SELECT * FROM researchDomains WHERE uri = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [uri], 'testing')
    expect(result).toEqual(domain);
  });

  it('findByURI should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const uri = casual.url;
    const result = await ResearchDomain.findByURI('testing', context, uri);
    expect(result).toEqual(null);
  });

  it('findByName should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([domain]);
    const name = casual.company_name;
    const result = await ResearchDomain.findByName('testing', context, name.toLowerCase().trim());
    const expectedSql = 'SELECT * FROM researchDomains WHERE LOWER(name) = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [name.toLowerCase().trim()], 'testing')
    expect(result).toEqual(domain);
  });

  it('findByName should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const name = casual.company_name;
    const result = await ResearchDomain.findByName('testing', context, name);
    expect(result).toEqual(null);
  });

  it('topLevelDomains should call query with correct params and return the objects', async () => {
    localQuery.mockResolvedValueOnce([domain]);
    const result = await ResearchDomain.topLevelDomains('testing', context);
    const expectedSql = 'SELECT * FROM researchDomains WHERE parentResearchDomainId IS NULL ORDER BY name';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [], 'testing')
    expect(result).toEqual([domain]);
  });

  it('topLevelDomains should return an empty array if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const result = await ResearchDomain.topLevelDomains('testing', context);
    expect(result).toEqual([]);
  });

  it('findByParentId should call query with correct params and return the objects', async () => {
    localQuery.mockResolvedValueOnce([domain]);
    const domainId = casual.integer(1, 999);
    const result = await ResearchDomain.findByParentId('testing', context, domainId);
    const expectedSql = 'SELECT * FROM researchDomains WHERE parentResearchDomainId = ? ORDER BY name';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [domainId.toString()], 'testing')
    expect(result).toEqual([domain]);
  });

  it('findByParentId should return an empty array if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const domainId = casual.integer(1, 999);
    const result = await ResearchDomain.findByParentId('testing', context, domainId);
    expect(result).toEqual([]);
  });

  it('findByMetadataStandardId should call query with correct params and return an array', async () => {
    const mockId = casual.integer(1, 99);
    localQuery.mockResolvedValueOnce([{ researchDomainId: mockId }]);
    localQuery.mockResolvedValueOnce([domain]);
    const standardId = casual.integer(1, 999);
    const result = await ResearchDomain.findByMetadataStandardId('testing', context, standardId);
    const sql = 'SELECT researchDomainId FROM metadataStandardResearchDomains WHERE metadataStandardId = ?';
    const sql2 = 'SELECT * FROM researchDomains WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(2);
    expect(localQuery).toHaveBeenNthCalledWith(1, context, sql, [standardId.toString()], 'testing');
    expect(localQuery).toHaveBeenLastCalledWith(context, sql2, [mockId.toString()], 'testing');
    expect(result).toEqual([domain]);
  });

  it('findByMetadataStandardId should return and empty array if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const standardId = casual.integer(1, 999);
    const result = await ResearchDomain.findByMetadataStandardId('testing', context, standardId);
    expect(result).toEqual([]);
  });

  it('findByRepositoryId should call query with correct params and return an array', async () => {
    const mockId = casual.integer(1, 99);
    localQuery.mockResolvedValueOnce([{ researchDomainId: mockId }]);
    localQuery.mockResolvedValueOnce([domain]);
    const repositoryId = casual.integer(1, 999);
    const result = await ResearchDomain.findByRepositoryId('testing', context, repositoryId);
    const sql = 'SELECT researchDomainId FROM repositoryResearchDomains WHERE repositoryId = ?';
    const sql2 = 'SELECT * FROM researchDomains WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(2);
    expect(localQuery).toHaveBeenNthCalledWith(1, context, sql, [repositoryId.toString()], 'testing');
    expect(localQuery).toHaveBeenLastCalledWith(context, sql2, [mockId.toString()], 'testing');
    expect(result).toEqual([domain]);
  });

  it('findByRepositoryId should return and empty array if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const repositoryId = casual.integer(1, 999);
    const result = await ResearchDomain.findByRepositoryId('testing', context, repositoryId);
    expect(result).toEqual([]);
  });
});

describe('update', () => {
  let updateQuery;
  let domain;

  beforeEach(() => {
    updateQuery = jest.fn();
    (ResearchDomain.update as jest.Mock) = updateQuery;

    domain = new ResearchDomain({
      id: casual.integer(1, 9999),
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    })
  });

  it('returns the ResearchDomain with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (domain.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await domain.update(context)).toBe(domain);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the ResearchDomain has no id', async () => {
    const localValidator = jest.fn();
    (domain.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    domain.id = null;
    const result = await domain.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('ResearchDomain has never been saved');
  });

  it('returns the updated ResearchDomain', async () => {
    const localValidator = jest.fn();
    (domain.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(domain);

    const mockFindById = jest.fn();
    (ResearchDomain.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(domain);

    const result = await domain.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(domain);
  });
});

describe('create', () => {
  const originalInsert = ResearchDomain.insert;
  let insertQuery;
  let domain;

  beforeEach(() => {
    insertQuery = jest.fn();
    (ResearchDomain.insert as jest.Mock) = insertQuery;

    domain = new ResearchDomain({
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    });
  });

  afterEach(() => {
    ResearchDomain.insert = originalInsert;
  });

  it('returns the ResearchDomain without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (domain.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await domain.create(context)).toBe(domain);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the ResearchDomain with errors if it is invalid', async () => {
    domain.name = undefined;
    const response = await domain.create(context);
    expect(response.errors[0]).toBe('Name can\'t be blank');
  });

  it('returns the ResearchDomain with an error if the object already exists', async () => {
    const mockFindBy = jest.fn();
    (ResearchDomain.findByURI as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(domain);

    const result = await domain.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('ResearchDomain already exists');
  });

  it('returns the newly added ResearchDomain', async () => {
    const mockFindbyURI = jest.fn();
    (ResearchDomain.findByURI as jest.Mock) = mockFindbyURI;
    mockFindbyURI.mockResolvedValueOnce(null);

    const mockFindByName = jest.fn();
    (ResearchDomain.findByName as jest.Mock) = mockFindByName;
    mockFindByName.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (ResearchDomain.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(domain);

    const result = await domain.create(context);
    expect(mockFindbyURI).toHaveBeenCalledTimes(1);
    expect(mockFindByName).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(domain);
  });
});

describe('delete', () => {
  let domain;

  beforeEach(() => {
    domain = new ResearchDomain({
      id: casual.integer(1, 9999),
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    });
  })

  it('returns null if the ResearchDomain has no id', async () => {
    domain.id = null;
    expect(await domain.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ResearchDomain.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await domain.delete(context)).toBe(null);
  });

  it('returns the ResearchDomain if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ResearchDomain.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(domain);

    const mockFindById = jest.fn();
    (ResearchDomain.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(domain);

    const result = await domain.delete(context);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(domain);
  });
});

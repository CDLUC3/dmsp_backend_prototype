import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { Repository, RepositoryType } from "../Repository";
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

describe('Repository', () => {
  let repo;

  const repoData = {
    name: casual.company_name,
    uri: casual.url,
    description: casual.sentences(3),
    website: casual.url,
    researchDomains: [{ id: casual.integer(1, 99) }],
    repositoryTypes: [getRandomEnumValue(RepositoryType), getRandomEnumValue(RepositoryType)],
    keywords: [casual.word, casual.word],
  }
  beforeEach(() => {
    repo = new Repository(repoData);
  });

  it('should initialize options as expected', () => {
    expect(repo.name).toEqual(repoData.name);
    expect(repo.uri).toEqual(repoData.uri);
    expect(repo.description).toEqual(repoData.description);
    expect(repo.website).toEqual(repoData.website);
    expect(repo.repositoryTypes).toEqual(repoData.repositoryTypes);
    expect(repo.researchDomains).toEqual(repoData.researchDomains);
    expect(repo.keywords).toEqual(repoData.keywords);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await repo.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the name field is missing', async () => {
    repo.name = null;
    expect(await repo.isValid()).toBe(false);
    expect(repo.errors.length).toBe(1);
    expect(repo.errors[0]).toEqual('Name can\'t be blank');
  });

  it('should return false when calling isValid if the uri field is missing', async () => {
    repo.uri = null;
    expect(await repo.isValid()).toBe(false);
    expect(repo.errors.length).toBe(1);
    expect(repo.errors[0]).toEqual('Invalid URI format');
  });

  it('should return false when calling isValid if the uri field is not a URI', async () => {
    repo.uri = casual.uuid;
    expect(await repo.isValid()).toBe(false);
    expect(repo.errors.length).toBe(1);
    expect(repo.errors[0]).toEqual('Invalid URI format');
  });

  it('should return false when calling isValid if the website field is not a URI', async () => {
    repo.website = casual.uuid;
    expect(await repo.isValid()).toBe(false);
    expect(repo.errors.length).toBe(1);
    expect(repo.errors[0]).toEqual('Invalid website format');
  });
});

describe('findBy Queries', () => {
  const originalQuery = Repository.query;

  let localQuery;
  let context;
  let repo;

  beforeEach(() => {
    localQuery = jest.fn();
    (Repository.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    repo = new Repository({
      id: casual.integer(1, 9999),
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    Repository.query = originalQuery;
  });

  it('findById should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([repo]);
    const repoId = casual.integer(1, 999);
    const result = await Repository.findById('testing', context, repoId);
    const expectedSql = 'SELECT * FROM repositories WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [repoId.toString()], 'testing')
    expect(result).toEqual(repo);
  });

  it('findById should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const repoId = casual.integer(1, 999);
    const result = await Repository.findById('testing', context, repoId);
    expect(result).toEqual(null);
  });

  it('findByURI should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([repo]);
    const uri = casual.url;
    const result = await Repository.findByURI('testing', context, uri);
    const expectedSql = 'SELECT * FROM repositories WHERE uri = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [uri], 'testing')
    expect(result).toEqual(repo);
  });

  it('findByURI should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const uri = casual.url;
    const result = await Repository.findByURI('testing', context, uri);
    expect(result).toEqual(null);
  });

  it('findByName should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([repo]);
    const name = casual.company_name;
    const result = await Repository.findByName('testing', context, name.toLowerCase().trim());
    const expectedSql = 'SELECT * FROM repositories WHERE LOWER(name) = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [name.toLowerCase().trim()], 'testing')
    expect(result).toEqual(repo);
  });

  it('findByName should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const name = casual.company_name;
    const result = await Repository.findByName('testing', context, name);
    expect(result).toEqual(null);
  });

  it('findRepositoryIdsByResearchDomainId should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([{ repositoryId: repo.id }]);
    const id = casual.integer(1, 99);
    const result = await Repository.findRepositoryIdsByResearchDomainId('testing', context, id);
    const expectedSql = 'SELECT repositoryId FROM repositoryResearchDomains WHERE = researchDomainId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'testing')
    expect(result).toEqual([repo.id]);
  });

  it('findRepositoryIdsByResearchDomainId should return an empty array if there are no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const id = casual.integer(1, 99);
    const result = await Repository.findRepositoryIdsByResearchDomainId('testing', context, id);
    expect(result).toEqual([]);
  });

  it('search should work when a Research Domain, search term and repositoryType are specified', async () => {
    localQuery.mockResolvedValueOnce([repo]);
    const mockStandardQry = jest.fn();
    (Repository.findRepositoryIdsByResearchDomainId as jest.Mock) = mockStandardQry;
    mockStandardQry.mockResolvedValueOnce([repo.id]);
    const term = casual.words(3);
    const researchDomainId = casual.integer(1, 9);
    const repositoryType = getRandomEnumValue(RepositoryType);
    const result = await Repository.search('testing', context, term, researchDomainId, repositoryType);
    const sql = 'SELECT * FROM repositories WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? AND JSON_CONTAINS(repositoryTypes, ?, \'$\') ORDER BY name';
    const vals = [`%${term.toLowerCase()}%`, `%${term.toLowerCase()}%`, `%${term.toLowerCase()}%`, repositoryType];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(mockStandardQry).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenCalledWith(context, sql, vals, 'testing');
    expect(mockStandardQry).toHaveBeenCalledWith('testing', context, researchDomainId);
    expect(result).toEqual([repo]);
  });

  it('search should work when only a Research Domain is specified', async () => {
    localQuery.mockResolvedValueOnce([repo]);
    const mockStandardQry = jest.fn();
    (Repository.findRepositoryIdsByResearchDomainId as jest.Mock) = mockStandardQry;
    mockStandardQry.mockResolvedValueOnce([repo.id]);
    const researchDomainId = casual.integer(1, 9);
    const result = await Repository.search('testing', context, null, researchDomainId, null);
    const sql = 'SELECT * FROM repositories WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? ORDER BY name';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(mockStandardQry).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenCalledWith(context, sql, ['%', '%', '%'], 'testing');
    expect(mockStandardQry).toHaveBeenCalledWith('testing', context, researchDomainId);
    expect(result).toEqual([repo]);
  });

  it('search should work when only a Repository Type is specified', async () => {
    localQuery.mockResolvedValueOnce([repo]);
    const repositoryType = getRandomEnumValue(RepositoryType);
    const result = await Repository.search('testing', context, null, null, repositoryType);
    const sql = 'SELECT * FROM repositories WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? AND JSON_CONTAINS(repositoryTypes, ?, \'$\') ORDER BY name';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, sql, ['%', '%', '%', repositoryType], 'testing')
    expect(result).toEqual([repo]);
  });

  it('search should work when only a Research Domain and Repository Type are specified', async () => {
    localQuery.mockResolvedValueOnce([repo]);
    const mockStandardQry = jest.fn();
    (Repository.findRepositoryIdsByResearchDomainId as jest.Mock) = mockStandardQry;
    mockStandardQry.mockResolvedValueOnce([repo.id]);
    const researchDomainId = casual.integer(1, 9);
    const repositoryType = getRandomEnumValue(RepositoryType);
    const result = await Repository.search('testing', context, null, researchDomainId, repositoryType);
    const sql = 'SELECT * FROM repositories WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? AND JSON_CONTAINS(repositoryTypes, ?, \'$\') ORDER BY name';
    const vals = ['%', '%', '%', repositoryType];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(mockStandardQry).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenCalledWith(context, sql, vals, 'testing');
    expect(mockStandardQry).toHaveBeenCalledWith('testing', context, researchDomainId);
    expect(result).toEqual([repo]);
  });

  it('search should work when only a search term is specified', async () => {
    localQuery.mockResolvedValueOnce([repo]);
    const term = casual.words(3);
    const result = await Repository.search('testing', context, term, null, null);
    const expectedSql = 'SELECT * FROM repositories WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? ORDER BY name';
    const vals = [`%${term.toLowerCase()}%`, `%${term.toLowerCase()}%`, `%${term.toLowerCase()}%`];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'testing')
    expect(result).toEqual([repo]);
  });

  it('search should work when no Research Domain or search term are specified', async () => {
    localQuery.mockResolvedValueOnce([repo]);
    const result = await Repository.search('testing', context, null, null, null);
    const expectedSql = 'SELECT * FROM repositories WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? ORDER BY name';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, ['%', '%', '%'], 'testing')
    expect(result).toEqual([repo]);
  });

  it('search should return empty array if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const term = casual.words(3);
    const researchDomainId = casual.integer(1, 9);
    const repositoryType = getRandomEnumValue(RepositoryType);
    const result = await Repository.search('testing', context, term, researchDomainId, repositoryType);
    expect(result).toEqual([]);
  });
});

describe('update', () => {
  let updateQuery;
  let repo;

  beforeEach(() => {
    updateQuery = jest.fn();
    (Repository.update as jest.Mock) = updateQuery;

    repo = new Repository({
      id: casual.integer(1, 9999),
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    })
  });

  it('returns the Repository with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (repo.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await repo.update(context)).toBe(repo);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the Repository has no id', async () => {
    const localValidator = jest.fn();
    (repo.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    repo.id = null;
    const result = await repo.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Repository has never been saved');
  });

  it('returns the updated Repository', async () => {
    const localValidator = jest.fn();
    (repo.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(repo);

    const mockFindById = jest.fn();
    (Repository.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(repo);

    const result = await repo.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(repo);
  });
});

describe('create', () => {
  const originalInsert = Repository.insert;
  let insertQuery;
  let repo;

  beforeEach(() => {
    insertQuery = jest.fn();
    (Repository.insert as jest.Mock) = insertQuery;

    repo = new Repository({
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    });
  });

  afterEach(() => {
    Repository.insert = originalInsert;
  });

  it('returns the Repository without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (repo.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await repo.create(context)).toBe(repo);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the Repository with errors if it is invalid', async () => {
    repo.name = undefined;
    const response = await repo.create(context);
    expect(response.errors[0]).toBe('Name can\'t be blank');
  });

  it('returns the Repository with an error if the object already exists', async () => {
    const mockFindBy = jest.fn();
    (Repository.findByURI as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(repo);

    const result = await repo.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Repository already exists');
  });

  it('returns the newly added Repository', async () => {
    const mockFindbyURI = jest.fn();
    (Repository.findByURI as jest.Mock) = mockFindbyURI;
    mockFindbyURI.mockResolvedValueOnce(null);

    const mockFindByName = jest.fn();
    (Repository.findByName as jest.Mock) = mockFindByName;
    mockFindByName.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (Repository.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(repo);

    const result = await repo.create(context);
    expect(mockFindbyURI).toHaveBeenCalledTimes(1);
    expect(mockFindByName).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(repo);
  });
});

describe('delete', () => {
  let repo;

  beforeEach(() => {
    repo = new Repository({
      id: casual.integer(1, 9999),
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    });
  })

  it('returns null if the Repository has no id', async () => {
    repo.id = null;
    expect(await repo.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Repository.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await repo.delete(context)).toBe(null);
  });

  it('returns the Repository if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Repository.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(repo);

    const mockFindById = jest.fn();
    (Repository.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(repo);

    const result = await repo.delete(context);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(repo);
  });
});

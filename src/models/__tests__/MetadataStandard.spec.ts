import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { MetadataStandard } from "../MetadataStandard";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('MetadataStandard', () => {
  let standard;

  const standardData = {
    name: casual.company_name,
    uri: casual.url,
    description: casual.sentences(3),
    researchDomains: [{ id: casual.integer(1, 99) }],
    keywords: [casual.word, casual.word],
  }
  beforeEach(() => {
    standard = new MetadataStandard(standardData);
  });

  it('should initialize options as expected', () => {
    expect(standard.name).toEqual(standardData.name);
    expect(standard.uri).toEqual(standardData.uri);
    expect(standard.description).toEqual(standardData.description);
    expect(standard.researchDomains).toEqual(standardData.researchDomains);
    expect(standard.keywords).toEqual(standardData.keywords);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await standard.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the name field is missing', async () => {
    standard.name = null;
    expect(await standard.isValid()).toBe(false);
    expect(standard.errors.length).toBe(1);
    expect(standard.errors[0]).toEqual('Name can\'t be blank');
  });

  it('should return false when calling isValid if the uri field is missing', async () => {
    standard.uri = null;
    expect(await standard.isValid()).toBe(false);
    expect(standard.errors.length).toBe(1);
    expect(standard.errors[0]).toEqual('Invalid URI format');
  });

  it('should return false when calling isValid if the uri field is not a URI', async () => {
    standard.uri = casual.uuid;
    expect(await standard.isValid()).toBe(false);
    expect(standard.errors.length).toBe(1);
    expect(standard.errors[0]).toEqual('Invalid URI format');
  });
});

describe('findBy Queries', () => {
  const originalQuery = MetadataStandard.query;

  let localQuery;
  let context;
  let standard;

  beforeEach(() => {
    localQuery = jest.fn();
    (MetadataStandard.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    standard = new MetadataStandard({
      id: casual.integer(1,9999),
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomains: [{ id: casual.integer(1, 99) }],
      keywords: [casual.word, casual.word],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    MetadataStandard.query = originalQuery;
  });

  it('findById should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([standard]);
    const standardId = casual.integer(1, 999);
    const result = await MetadataStandard.findById('testing', context, standardId);
    const expectedSql = 'SELECT * FROM metadataStandards WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [standardId.toString()], 'testing')
    expect(result).toEqual(standard);
  });

  it('findById should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const standardId = casual.integer(1, 999);
    const result = await MetadataStandard.findById('testing', context, standardId);
    expect(result).toEqual(null);
  });

  it('findByURI should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([standard]);
    const uri = casual.url;
    const result = await MetadataStandard.findByURI('testing', context, uri);
    const expectedSql = 'SELECT * FROM metadataStandards WHERE uri = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [uri], 'testing')
    expect(result).toEqual(standard);
  });

  it('findByURI should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const uri = casual.url;
    const result = await MetadataStandard.findByURI('testing', context, uri);
    expect(result).toEqual(null);
  });

  it('findByName should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([standard]);
    const name = casual.company_name;
    const result = await MetadataStandard.findByName('testing', context, name.toLowerCase().trim());
    const expectedSql = 'SELECT * FROM metadataStandards WHERE LOWER(name) = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [name.toLowerCase().trim()], 'testing')
    expect(result).toEqual(standard);
  });

  it('findByName should return null if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const name = casual.company_name;
    const result = await MetadataStandard.findByName('testing', context, name);
    expect(result).toEqual(null);
  });

  it('findMetadataStandardIdsByResearchDomainId should call query with correct params and return the object', async () => {
    localQuery.mockResolvedValueOnce([{ metadataStandardId: standard.id }]);
    const id = casual.integer(1, 99);
    const result = await MetadataStandard.findMetadataStandardIdsByResearchDomainId('testing', context, id);
    const expectedSql = 'SELECT metadataStandardId FROM metadataStandardResearchDomains WHERE = researchDomainId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'testing')
    expect(result).toEqual([standard.id]);
  });

  it('findMetadataStandardIdsByResearchDomainId should return an empty array if there are no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const id = casual.integer(1, 99);
    const result = await MetadataStandard.findMetadataStandardIdsByResearchDomainId('testing', context, id);
    expect(result).toEqual([]);
  });

  it('search should work when a Research Domain and a search term are specified', async () => {
    localQuery.mockResolvedValueOnce([standard]);
    const mockStandardQry = jest.fn();
    (MetadataStandard.findMetadataStandardIdsByResearchDomainId as jest.Mock) = mockStandardQry;
    mockStandardQry.mockResolvedValueOnce([standard.id]);
    const term = casual.words(3);
    const researchDomainId = casual.integer(1, 9);
    const result = await MetadataStandard.search('testing', context, term, researchDomainId);
    const sql = 'SELECT * FROM metadataStandards WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? ORDER BY name';
    const vals = [`%${term.toLowerCase()}%`, `%${term.toLowerCase()}%`, `%${term.toLowerCase()}%`];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(mockStandardQry).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenCalledWith(context, sql, vals, 'testing');
    expect(mockStandardQry).toHaveBeenCalledWith('testing', context, researchDomainId);
    expect(result).toEqual([standard]);
  });

  it('search should work when only a Research Domain is specified', async () => {
    localQuery.mockResolvedValueOnce([standard]);
    const mockStandardQry = jest.fn();
    (MetadataStandard.findMetadataStandardIdsByResearchDomainId as jest.Mock) = mockStandardQry;
    mockStandardQry.mockResolvedValueOnce([standard.id]);
    const researchDomainId = casual.integer(1, 9);
    const result = await MetadataStandard.search('testing', context, null, researchDomainId);
    const sql = 'SELECT * FROM metadataStandards WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? ORDER BY name';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(mockStandardQry).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenCalledWith(context, sql, [`%`, `%`, '%'], 'testing');
    expect(mockStandardQry).toHaveBeenCalledWith('testing', context, researchDomainId);
    expect(result).toEqual([standard]);
  });

  it('search should work when only a search term is specified', async () => {
    localQuery.mockResolvedValueOnce([standard]);
    const term = casual.words(3);
    const result = await MetadataStandard.search('testing', context, term, null);
    const expectedSql = 'SELECT * FROM metadataStandards WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? ORDER BY name';
    const vals = [`%${term.toLowerCase()}%`, `%${term.toLowerCase()}%`, `%${term.toLowerCase()}%`];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'testing')
    expect(result).toEqual([standard]);
  });

  it('search should work when no Research Domain or search term are specified', async () => {
    localQuery.mockResolvedValueOnce([standard]);
    const result = await MetadataStandard.search('testing', context, null, null);
    const expectedSql = 'SELECT * FROM metadataStandards WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? ORDER BY name';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, ['%', '%', '%'], 'testing')
    expect(result).toEqual([standard]);
  });

  it('search should return empty array if it finds no records', async () => {
    localQuery.mockResolvedValueOnce([]);
    const term = casual.words(3);
    const researchDomainId = casual.integer(1, 9);
    const result = await MetadataStandard.search('testing', context, term, researchDomainId);
    expect(result).toEqual([]);
  });
});

describe('update', () => {
  let updateQuery;
  let standard;

  beforeEach(() => {
    updateQuery = jest.fn();
    (MetadataStandard.update as jest.Mock) = updateQuery;

    standard = new MetadataStandard({
      id: casual.integer(1, 9999),
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    })
  });

  it('returns the MetadataStandard with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (standard.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await standard.update(context)).toBe(standard);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the MetadataStandard has no id', async () => {
    const localValidator = jest.fn();
    (standard.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    standard.id = null;
    const result = await standard.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('MetadataStandard has never been saved');
  });

  it('returns the updated MetadataStandard', async () => {
    const localValidator = jest.fn();
    (standard.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(standard);

    const mockFindById = jest.fn();
    (MetadataStandard.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(standard);

    const result = await standard.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(standard);
  });
});

describe('create', () => {
  const originalInsert = MetadataStandard.insert;
  let insertQuery;
  let standard;

  beforeEach(() => {
    insertQuery = jest.fn();
    (MetadataStandard.insert as jest.Mock) = insertQuery;

    standard = new MetadataStandard({
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    });
  });

  afterEach(() => {
    MetadataStandard.insert = originalInsert;
  });

  it('returns the MetadataStandard without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (standard.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await standard.create(context)).toBe(standard);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the MetadataStandard with errors if it is invalid', async () => {
    standard.name = undefined;
    const response = await standard.create(context);
    expect(response.errors[0]).toBe('Name can\'t be blank');
  });

  it('returns the MetadataStandard with an error if the object already exists', async () => {
    const mockFindBy = jest.fn();
    (MetadataStandard.findByURI as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(standard);

    const result = await standard.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('MetadataStandard already exists');
  });

  it('returns the newly added MetadataStandard', async () => {
    const mockFindbyURI = jest.fn();
    (MetadataStandard.findByURI as jest.Mock) = mockFindbyURI;
    mockFindbyURI.mockResolvedValueOnce(null);

    const mockFindByName = jest.fn();
    (MetadataStandard.findByName as jest.Mock) = mockFindByName;
    mockFindByName.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (MetadataStandard.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(standard);

    const result = await standard.create(context);
    expect(mockFindbyURI).toHaveBeenCalledTimes(1);
    expect(mockFindByName).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(standard);
  });
});

describe('delete', () => {
  let standard;

  beforeEach(() => {
    standard = new MetadataStandard({
      id: casual.integer(1, 9999),
      name: casual.company_name,
      uri: casual.url,
      description: casual.sentences(3),
      researchDomainIds: [casual.integer(1, 99)],
      keywords: [casual.word, casual.word],
    });
  })

  it('returns null if the MetadataStandard has no id', async () => {
    standard.id = null;
    expect(await standard.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (MetadataStandard.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await standard.delete(context)).toBe(null);
  });

  it('returns the MetadataStandard if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (MetadataStandard.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(standard);

    const mockFindById = jest.fn();
    (MetadataStandard.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(standard);

    const result = await standard.delete(context);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(standard);
  });
});

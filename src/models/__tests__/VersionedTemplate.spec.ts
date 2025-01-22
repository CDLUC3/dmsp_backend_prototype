import casual from 'casual';
import { TemplateVisibility } from "../Template";
import { TemplateVersionType, VersionedTemplate } from '../VersionedTemplate';
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from '../../__mocks__/context';
import { defaultLanguageId } from '../Language';

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('VersionedTemplate', () => {
  let templateId;
  let ownerId;
  let version;
  let name;
  let versionedById;
  let versioned;

  beforeEach(() => {
    templateId = casual.integer(1, 999);
    ownerId = casual.url;
    version = casual.word;
    name = casual.sentence;
    versionedById = casual.integer(1, 999);

    versioned = new VersionedTemplate({ templateId, version, name, ownerId, versionedById });
  });

  it('constructor should initialize as expected', () => {
    expect(versioned.id).toBeFalsy();
    expect(versioned.templateId).toEqual(templateId);
    expect(versioned.version).toEqual(version);
    expect(versioned.name).toEqual(name);
    expect(versioned.ownerId).toEqual(ownerId);
    expect(versioned.versionedById).toEqual(versionedById);
    expect(versioned.visibility).toEqual(TemplateVisibility.PRIVATE);
    expect(versioned.languageId).toEqual(defaultLanguageId);
    expect(versioned.created).toBeTruthy();
    expect(versioned.active).toBe(false);
    expect(versioned.comment).toEqual('');
  });

  it('isValid returns true when the record is valid', async () => {
    expect(await versioned.isValid()).toBe(true);
  });

  it('isValid returns false if the templateId is null', async () => {
    versioned.templateId = null;
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Template')).toBe(true);
  });

  it('isValid returns false if the versionedById is null', async () => {
    versioned.versionedById = null;
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Versioned by')).toBe(true);
  });

  it('isValid returns false if the version is blank', async () => {
    versioned.version = '';
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Version')).toBe(true);
  });

  it('isValid returns false if the name is blank', async () => {
    versioned.name = '';
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Name')).toBe(true);
  });

  it('isValid returns false if the ownerId is null', async () => {
    versioned.ownerId = null;
    expect(await versioned.isValid()).toBe(false);
    expect(versioned.errors.length).toBe(1);
    expect(versioned.errors[0].includes('Owner')).toBe(true);
  });
});

describe('findBy queries', () => {
  const originalQuery = VersionedTemplate.query;

  let localQuery;
  let context;
  let versionedTemplate;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (VersionedTemplate.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    versionedTemplate = new VersionedTemplate({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      templateId: casual.integer(1, 99),
      name: casual.sentence,
      ownerId: casual.url,
      version: `v${casual.integer(1, 9)}`,
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    VersionedTemplate.query = originalQuery;
  });

  it('findByTemplateId returns the VersionedTemplates for the Template', async () => {
    localQuery.mockResolvedValueOnce([versionedTemplate]);

    const templateId = versionedTemplate.templateId;
    const result = await VersionedTemplate.findByTemplateId('Test', context, templateId);
    const expectedSql = 'SELECT * FROM versionedTemplates WHERE templateId = ? ORDER BY version DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [templateId.toString()], 'Test')
    expect(result).toEqual([versionedTemplate]);
  });

  it('findByAffiliationId returns the VersionedTemplates', async () => {
    localQuery.mockResolvedValueOnce([versionedTemplate]);
    const affiliationId = '1234'
    const result = await VersionedTemplate.findByAffiliationId('Test', context, affiliationId);
    const expectedSql = 'SELECT * FROM versionedTemplates WHERE ownerId = ? ORDER BY modified DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [affiliationId], 'Test')
    expect(result).toEqual([versionedTemplate]);
  });


  it('findByTemplateId returns an empty array if there are no VersionedTemplates', async () => {
    localQuery.mockResolvedValueOnce([]);

    const templateId = versionedTemplate.templateId;
    const result = await VersionedTemplate.findByTemplateId('Test', context, templateId);
    const expectedSql = 'SELECT * FROM versionedTemplates WHERE templateId = ? ORDER BY version DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [templateId.toString()], 'Test')
    expect(result).toEqual([]);
  });

  it('findVersionedTemplateById returns the VersionedTemplate', async () => {
    localQuery.mockResolvedValueOnce([versionedTemplate]);

    const id = versionedTemplate.id;
    const result = await VersionedTemplate.findVersionedTemplateById('Test', context, id);
    const expectedSql = 'SELECT * FROM versionedTemplates WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'Test')
    expect(result).toEqual(versionedTemplate);
  });

  it('findVersionedTemplateById returns null if there is no VersionedTemplate', async () => {
    localQuery.mockResolvedValueOnce([]);

    const id = versionedTemplate.id;
    const result = await VersionedTemplate.findVersionedTemplateById('Test', context, id);
    const expectedSql = 'SELECT * FROM versionedTemplates WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'Test')
    expect(result).toEqual(null);
  });
});

describe('search', () => {
  const originalQuery = VersionedTemplate.query;

  let localQuery;
  let context;
  let versionedTemplate;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (VersionedTemplate.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    versionedTemplate = new VersionedTemplate({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      templateId: casual.integer(1, 99),
      name: casual.sentence,
      ownerId: casual.url,
      version: `v${casual.integer(1, 9)}`,
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    VersionedTemplate.query = originalQuery;
  });

  it('search returns the matching VersionedTemplates', async () => {
    localQuery.mockResolvedValueOnce([versionedTemplate]);

    const term = versionedTemplate.name.split(0, 5);
    const result = await VersionedTemplate.search('Test', context, term);
    const sql = 'SELECT * FROM versionedTemplates \
                 WHERE name LIKE ? AND active = 1 AND versionType = ? \
                 ORDER BY name ASC';
    const vals = [`%${term}%`, TemplateVersionType.PUBLISHED];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, sql, vals, 'Test')
    expect(result).toEqual([versionedTemplate]);
  });

  it('search returns null if there are no matching VersionedTemplates', async () => {
    localQuery.mockResolvedValueOnce([]);

    const term = versionedTemplate.name.split(0, 5);
    const result = await VersionedTemplate.search('Test', context, term);
    const sql = 'SELECT * FROM versionedTemplates \
                 WHERE name LIKE ? AND active = 1 AND versionType = ? \
                 ORDER BY name ASC';
    const vals = [`%${term}%`, TemplateVersionType.PUBLISHED];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, sql, vals, 'Test')
    expect(result).toEqual([]);
  });
});

describe('create', () => {
  let insertQuery;
  let versionedTemplate;

  beforeEach(() => {
    insertQuery = jest.fn();
    (VersionedTemplate.insert as jest.Mock) = insertQuery;

    versionedTemplate = new VersionedTemplate({
      templateId: casual.integer(1, 999),
      versionedById: casual.integer(1, 99),
      version: `v${casual.integer(1, 9)}`,
      ownerId: casual.url,
      name: casual.sentence,
      description: casual.sentences(5),
      comment: casual.sentences(10),
    })
  });

  it('returns the VersionedTemplate with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (versionedTemplate.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await versionedTemplate.create(context)).toBe(versionedTemplate);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the newly added VersionedTemplate', async () => {
    const localValidator = jest.fn();
    (versionedTemplate.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindBy = jest.fn();
    (VersionedTemplate.findVersionedTemplateById as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValue(versionedTemplate);

    const result = await versionedTemplate.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(versionedTemplate);
  });
});

describe('update', () => {
  let updateQuery;
  let versionedTemplate;

  beforeEach(() => {
    updateQuery = jest.fn();
    (VersionedTemplate.update as jest.Mock) = updateQuery;

    versionedTemplate = new VersionedTemplate({
      id: casual.integer(1, 99),
      createdById: casual.integer(1, 999),
      ownerId: casual.url,
      name: casual.sentence,
    })
  });

  it('returns the VersionedTemplate with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (versionedTemplate.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await versionedTemplate.update(context)).toBe(versionedTemplate);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the VersionedTemplate has no id', async () => {
    const localValidator = jest.fn();
    (versionedTemplate.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    versionedTemplate.id = null;
    const result = await versionedTemplate.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('VersionedTemplate has never been saved');
  });

  it('returns the updated VersionedTemplate', async () => {
    const localValidator = jest.fn();
    (versionedTemplate.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(versionedTemplate);

    const result = await versionedTemplate.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(versionedTemplate);
  });
});

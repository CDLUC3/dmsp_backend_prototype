import casual from 'casual';
import { Template, TemplateVisibility } from "../Template";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from '../../__mocks__/context';
import { TemplateCollaborator } from '../Collaborator';
import { defaultLanguageId } from '../Language';

jest.mock('../../context.ts');

let context;

beforeEach(async () => {
  jest.restoreAllMocks();

  context = await buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Template', () => {
  let name;
  let createdById;
  let ownerId;
  let template;

  beforeEach(() => {
    name = casual.title;
    ownerId = casual.url;
    createdById = casual.integer(1, 999);

    template = new Template({ name, ownerId, createdById });
  });

  it('constructor should initialize as expected', () => {
    expect(template.id).toBeFalsy();
    expect(template.name).toEqual(name);
    expect(template.ownerId).toEqual(ownerId);
    expect(template.visibility).toEqual(TemplateVisibility.PRIVATE);
    expect(template.created).toBeTruthy();
    expect(template.modified).toBeTruthy();
    expect(template.latestPublishVersion).toBeFalsy();
    expect(template.isDirty).toBeTruthy();
    expect(template.errors).toEqual({});
    expect(template.languageId).toEqual(defaultLanguageId);
  });

  it('should prepForSave the data', () => {
    template.languageId = 'test';
    template.prepForSave();
    expect(template.languageId).toEqual(defaultLanguageId);
  });

  it('isValid returns true when the record is valid', async () => {
    expect(await template.isValid()).toBe(true);
  });

  it('isValid returns false if the ownerId is null', async () => {
    template.ownerId = null;
    expect(await template.isValid()).toBe(false);
    expect(Object.keys(template.errors).length).toBe(1);
    expect(template.errors['ownerId'].includes('Owner')).toBe(true);
  });

  it('isValid returns false if the name is null', async () => {
    template.name = null;
    expect(await template.isValid()).toBe(false);
    expect(Object.keys(template.errors).length).toBe(1);
    expect(template.errors['name'].includes('Name')).toBe(true);
  });

  it('isValid returns false if the name is blank', async () => {
    template.name = '';
    expect(await template.isValid()).toBe(false);
    expect(Object.keys(template.errors).length).toBe(1);
    expect(template.errors['name'].includes('Name')).toBe(true);
  });
});

describe('findBy queries', () => {
  const originalQuery = Template.query;

  let localQuery;
  let context;
  let template;

  beforeEach(async () => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (Template.query as jest.Mock) = localQuery;

    context = await buildContext(logger, mockToken());

    template = new Template({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      name: casual.sentence,
      ownerId: casual.url,
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    Template.query = originalQuery;
  });

  it('findById returns the Template', async () => {
    localQuery.mockResolvedValueOnce([template]);

    const id = template.id;
    const result = await Template.findById('Test', context, id);
    const expectedSql = 'SELECT * FROM templates WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'Test')
    expect(result).toEqual(template);
  });

  it('findById returns null if there is no Template', async () => {
    localQuery.mockResolvedValueOnce([]);

    const id = template.id;
    const result = await Template.findById('Test', context, id);
    const expectedSql = 'SELECT * FROM templates WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'Test')
    expect(result).toEqual(null);
  });

  it('findByNameAndOwnerId returns the matching Template', async () => {
    localQuery.mockResolvedValueOnce([template]);

    const name = template.name.toLowerCase();
    const ownerId = context.token?.affiliationId;
    const result = await Template.findByNameAndOwnerId('Test', context, name);
    const expectedSql = 'SELECT * FROM templates WHERE LOWER(name) = ? AND ownerId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [name, ownerId], 'Test')
    expect(result).toEqual(template);
  });

  it('findByNameAndOwnerId returns null if there is no matching Template', async () => {
    localQuery.mockResolvedValueOnce([]);

    const name = template.name.toLowerCase();
    const ownerId = context.token?.affiliationId;
    const result = await Template.findByNameAndOwnerId('Test', context, name);
    const expectedSql = 'SELECT * FROM templates WHERE LOWER(name) = ? AND ownerId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [name, ownerId], 'Test')
    expect(result).toEqual(null);
  });

  it('findByAffiliationId returns the Templates owned by the current user\'s Affiliation', async () => {
    localQuery.mockResolvedValueOnce([template]);

    const mockFindByEmail = jest.fn();
    (TemplateCollaborator.findByEmail as jest.Mock) = mockFindByEmail;
    mockFindByEmail.mockResolvedValueOnce([]);

    const affiliationId = context.token.affiliationId;
    const result = await Template.findByAffiliationId('Test', context, context.token.affiliationId);
    const expectedSql = 'SELECT * FROM templates WHERE ownerId = ? ORDER BY modified DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [affiliationId], 'Test')
    expect(result).toEqual([template]);
  });

  it('findByAffiliationId returns the Templates shared with the current user', async () => {
    localQuery.mockResolvedValueOnce([template]);

    const sharedTemplate = new Template({
      createdById: casual.integer(1, 99),
      name: casual.sentence,
      ownerId: casual.url,
    });

    const mockFindByEmail = jest.fn();
    (TemplateCollaborator.findByEmail as jest.Mock) = mockFindByEmail;
    mockFindByEmail.mockResolvedValueOnce([sharedTemplate]);

    const affiliationId = context.token.affiliationId;
    const result = await Template.findByAffiliationId('Test', context, context.token.affiliationId);
    const expectedSql = 'SELECT * FROM templates WHERE ownerId = ? ORDER BY modified DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [affiliationId], 'Test')
    expect(result).toEqual([template]);
  });

  it('findByAffiliationId returns null if there are no Templates for the current user', async () => {
    localQuery.mockResolvedValueOnce([]);

    const mockFindByEmail = jest.fn();
    (TemplateCollaborator.findByEmail as jest.Mock) = mockFindByEmail;
    mockFindByEmail.mockResolvedValueOnce([]);

    const affiliationId = context.token.affiliationId;
    const result = await Template.findByAffiliationId('Test', context, context.token.affiliationId);
    const expectedSql = 'SELECT * FROM templates WHERE ownerId = ? ORDER BY modified DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [affiliationId], 'Test')
    expect(result).toEqual([]);
  });
});

describe('create', () => {
  const originalInsert = Template.insert;
  let insertQuery;
  let template;

  beforeEach(() => {
    // jest.resetAllMocks();

    insertQuery = jest.fn();
    (Template.insert as jest.Mock) = insertQuery;

    template = new Template({
      createdById: casual.integer(1, 999),
      ownerId: casual.url,
      name: casual.sentence,
      description: casual.sentences(5),
    })
  });

  afterEach(() => {
    // jest.resetAllMocks();
    Template.insert = originalInsert;
  });

  it('returns the Template with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (template.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await template.create(context);
    expect(result.errors).toEqual({});
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the Template with an error if the template already exists', async () => {
    const localValidator = jest.fn();
    (template.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindBy = jest.fn();
    (Template.findByNameAndOwnerId as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(template);

    const result = await template.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the newly added Template', async () => {
    const localValidator = jest.fn();
    (template.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindBy = jest.fn();
    (Template.findByNameAndOwnerId as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);
    mockFindBy.mockResolvedValue(template);

    const mockFindById = jest.fn();
    (Template.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(template);

    const result = await template.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Template);
  });
});

describe('update', () => {
  let updateQuery;
  let template;

  beforeEach(() => {
    updateQuery = jest.fn();
    (Template.update as jest.Mock) = updateQuery;

    template = new Template({
      id: casual.integer(1, 99),
      createdById: casual.integer(1, 999),
      ownerId: casual.url,
      name: casual.sentence,
    })
  });

  it('returns the Template with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (template.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await template.update(context);
    expect(result.errors).toEqual({});
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the Template has no id', async () => {
    const localValidator = jest.fn();
    (template.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    template.id = null;
    const result = await template.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the updated Template', async () => {
    const localValidator = jest.fn();
    (template.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindById = jest.fn();
    (Template.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(template);

    updateQuery.mockResolvedValueOnce(template);

    const result = await template.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Template);
  });
});

describe('delete', () => {
  let template;

  beforeEach(() => {
    template = new Template({
      id: casual.integer(1, 99),
      createdById: casual.integer(1, 999),
      ownerId: casual.url,
      name: casual.sentence,
    });
  })

  it('returns null if the Template has no id', async () => {
    template.id = null;
    expect(await template.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Template.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await template.delete(context)).toBe(null);
  });

  it('returns the Template if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Template.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(template);
    const findById = jest.fn();
    (Template.findById as jest.Mock) = findById;
    findById.mockResolvedValueOnce(template);

    const result = await template.delete(context);
    expect(result).toBeInstanceOf(Template);
    expect(result.errors).toEqual({});
  });
});

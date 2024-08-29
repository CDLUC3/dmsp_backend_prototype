import casual from 'casual';
import { Template, TemplateVisibility } from "../Template";
import mockLogger from '../../__tests__/mockLogger';
import { buildContext, mockToken } from '../../__mocks__/context';

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(mockLogger, mockToken());
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
    expect(template.currentVersion).toBeFalsy();
    expect(template.isDirty).toBeTruthy();
    expect(template.errors).toEqual([]);
  });

  it('isValid returns true when the record is valid', async () => {
    expect(await template.isValid()).toBe(true);
  });

  it('isValid returns false if the ownerId is null', async () => {
    template.ownerId = null;
    expect(await template.isValid()).toBe(false);
    expect(template.errors.length).toBe(1);
    expect(template.errors[0].includes('Owner')).toBe(true);
  });

  it('isValid returns false if the name is null', async () => {
    template.name = null;
    expect(await template.isValid()).toBe(false);
    expect(template.errors.length).toBe(1);
    expect(template.errors[0].includes('Name')).toBe(true);
  });

  it('isValid returns false if the name is blank', async () => {
    template.name = '';
    expect(await template.isValid()).toBe(false);
    expect(template.errors.length).toBe(1);
    expect(template.errors[0].includes('Name')).toBe(true);
  });
});

describe('create', () => {
  let insertQuery;
  let template;

  beforeEach(() => {
    insertQuery = jest.fn();
    (Template.insert as jest.Mock) = insertQuery;

    template = new Template({
      createdById: casual.integer(1, 999),
      ownerId: casual.url,
      name: casual.sentence,
      description: casual.sentences(5),
    })
  });

  it('returns the Template with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (template.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await template.create(context)).toBe(template);
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
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Template with this name already exists');
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
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(template);
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

    expect(await template.update(context)).toBe(template);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the Template has no id', async () => {
    const localValidator = jest.fn();
    (template.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    template.id = null;
    const result = await template.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Template has never been saved');
  });

  it('returns the updated Template', async () => {
    const localValidator = jest.fn();
    (template.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(template);

    const result = await template.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(template);
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

  it('returns false if the Template has no id', async () => {
    template.id = null;
    expect(await template.delete(context)).toBe(false);
  });

  it('returns false if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Template.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await template.delete(context)).toBe(false);
  });

  it('returns true if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Template.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(template);
    expect(await template.delete(context)).toBe(true);
  });
});

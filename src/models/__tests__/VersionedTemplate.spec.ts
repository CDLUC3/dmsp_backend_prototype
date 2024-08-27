import casual from 'casual';
import { Visibility } from "../Template";
import { VersionedTemplate } from '../VersionedTemplate';
import mockLogger from '../../__tests__/mockLogger';
import { buildContext, mockToken } from '../../__mocks__/context';

jest.mock('../../context.ts');

let context;

beforeEach(async () => {
  jest.resetAllMocks();

  context = await buildContext(mockLogger, mockToken());
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
    expect(versioned.visibility).toEqual(Visibility.PRIVATE);
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

describe('create', () => {
  let insertQuery;
  let versionedTemplate;

  beforeEach(async () => {
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
    (VersionedTemplate.findPublishedTemplateById as jest.Mock) = mockFindBy;
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

  beforeEach(async () => {
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

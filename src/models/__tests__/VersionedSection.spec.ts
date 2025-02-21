import casual from "casual";
import { VersionedSection } from "../VersionedSection";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";

jest.mock('../../context.ts');

let context;

beforeEach(async () => {
  jest.resetAllMocks();

  context = await buildContext(logger, mockToken());
});

describe('VersionedSection', () => {
  let versionedSection;

  const versionedSectionData = {
    name: casual.sentence,
    introduction: casual.sentence,
    requirements: casual.sentence,
    guidance: casual.sentence,
    displayOrder: casual.integer(1, 20),
  }
  beforeEach(() => {
    versionedSection = new VersionedSection(versionedSectionData);
  });

  it('should initialize options as expected', () => {
    expect(versionedSection.name).toEqual(versionedSectionData.name);
    expect(versionedSection.introduction).toEqual(versionedSectionData.introduction);
    expect(versionedSection.requirements).toEqual(versionedSectionData.requirements);
    expect(versionedSection.guidance).toEqual(versionedSectionData.guidance);
    expect(versionedSection.displayOrder).toEqual(versionedSectionData.displayOrder);
  });
});

describe('findBySectionId', () => {
  const originalQuery = VersionedSection.query;

  let localQuery;
  let context;
  let versionedSection;

  beforeEach(async () => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (VersionedSection.query as jest.Mock) = localQuery;

    context = await buildContext(logger, mockToken());

    versionedSection = new VersionedSection({
      name: casual.sentence,
      introduction: casual.sentence,
      requirements: casual.sentence,
      guidance: casual.sentence,
      displayOrder: casual.integer(1, 20),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    VersionedSection.query = originalQuery;
  });

  it('should call query with correct params and return the section', async () => {
    localQuery.mockResolvedValueOnce([versionedSection]);

    const sectionId = 1;
    const result = await VersionedSection.findBySectionId('VersionedSection query', context, sectionId);
    const expectedSql = 'SELECT * FROM versionedSections WHERE sectionId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [sectionId.toString()], 'VersionedSection query')
    expect(result).toEqual([versionedSection]);
  });
  it('should return null if it finds no VersionedSection', async () => {
    localQuery.mockResolvedValueOnce([]);
    const sectionId = 1;
    const result = await VersionedSection.findBySectionId('VersionedSection query', context, sectionId);
    expect(result).toEqual(null);
  });
});

describe('findByName', () => {
  const originalQuery = VersionedSection.query;

  let localQuery;
  let context;
  let versionedSection;

  beforeEach(async () => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (VersionedSection.query as jest.Mock) = localQuery;

    context = await buildContext(logger, mockToken());

    versionedSection = new VersionedSection({
      name: casual.sentence,
      introduction: casual.sentence,
      requirements: casual.sentence,
      guidance: casual.sentence,
      displayOrder: casual.integer(1, 20),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    VersionedSection.query = originalQuery;
  });

  it('should call query with correct params and return the section', async () => {
    localQuery.mockResolvedValueOnce([versionedSection]);

    const result = await VersionedSection.findByName('VersionedSection query', context, versionedSection.name);
    const expectedSql = 'SELECT * FROM versionedSections WHERE name LIKE ?';
    const vals = [`%${versionedSection.name}%`];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'VersionedSection query')
    /* As part of this unit test, all fields without a value default to 'undefined' for the mocked VersionedSection, but
the getVersionedSectionsBySectionId method returns an empty array for tags, and not undefined*/
    expect(result).toEqual([versionedSection])
  });

  it('should return null if it finds no VersionedSection', async () => {
    localQuery.mockResolvedValueOnce([]);

    const result = await VersionedSection.findByName('VersionedSection query', context, versionedSection.name);
    expect(result).toEqual(null);
  });
});

describe('findByTemplateId', () => {
  const originalQuery = VersionedSection.query;

  let localQuery;
  let context;
  let versionedSection;

  beforeEach(async () => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (VersionedSection.query as jest.Mock) = localQuery;

    context = await buildContext(logger, mockToken());

    versionedSection = new VersionedSection({
      name: casual.sentence,
      introduction: casual.sentence,
      requirements: casual.sentence,
      guidance: casual.sentence,
      displayOrder: casual.integer(1, 20),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    VersionedSection.query = originalQuery;
  });

  it('should call query with correct params and return the section', async () => {
    localQuery.mockResolvedValueOnce([versionedSection]);
    const versionedTemplateId = 1;
    const result = await VersionedSection.findByTemplateId('VersionedSection query', context, versionedTemplateId);
    const expectedSql = 'SELECT * FROM versionedSections WHERE versionedTemplateId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [versionedTemplateId.toString()], 'VersionedSection query')
    /* As part of this unit test, all fields without a value default to 'undefined' for the mocked VersionedSection, but
the getVersionedSectionsBySectionId method returns an empty array for tags, and not undefined*/
    expect(result).toEqual([versionedSection])
  });

  it('should return null if it finds no VersionedSection', async () => {
    localQuery.mockResolvedValueOnce([]);
    const versionedTemplateId = 1;
    const result = await VersionedSection.findByTemplateId('VersionedSection query', context, versionedTemplateId);
    expect(result).toEqual(null);
  });
});

describe('create', () => {
  const originalInsert = VersionedSection.insert;
  const originalFindById = VersionedSection.findById;
  let insertQuery;
  let versionedSection;

  beforeEach(() => {
    // jest.resetAllMocks();

    insertQuery = jest.fn();
    (VersionedSection.insert as jest.Mock) = insertQuery;

    versionedSection = new VersionedSection({
      name: casual.sentence,
      versionedTemplateId: casual.integer(1, 20),
      sectionId: casual.integer(1, 20),
      introduction: casual.sentence,
      requirements: casual.sentence,
      guidance: casual.sentence,
      displayOrder: casual.integer(1, 20),
    })
  });

  afterEach(() => {
    // jest.resetAllMocks();
    VersionedSection.insert = originalInsert;
    VersionedSection.findById = originalFindById;
  });

  it('returns the VersionedSection without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (versionedSection.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await versionedSection.create(context);
    expect(result instanceof VersionedSection).toBe(true);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the VersionedSection with an error if versionedTemplateId is undefined', async () => {
    versionedSection.versionedTemplateId = undefined;
    const response = await versionedSection.create(context);
    expect(response.errors['versionedTemplateId']).toBeTruthy();
  });

  it('returns the VersionedSection with an error if sectionId is undefined', async () => {
    versionedSection.sectionId = undefined;
    const response = await versionedSection.create(context);
    expect(response.errors['sectionId']).toBeTruthy();
  });

  it('returns the VersionedSection with an error if name is undefined', async () => {
    versionedSection.name = undefined;
    const response = await versionedSection.create(context);
    expect(response.errors['name']).toBeTruthy();
  });

  it('returns the VersionedSection with an error if displayOrder is undefined', async () => {
    versionedSection.displayOrder = undefined;
    const response = await versionedSection.create(context);
    expect(response.errors['displayOrder']).toBeTruthy();
  });

  it('returns the newly added VersionedSection', async () => {
    const mockFindById = jest.fn();
    (VersionedSection.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(versionedSection);

    const result = await versionedSection.create(context);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(VersionedSection);
    expect(Object.keys(result.errors).length).toBe(0);
  });
});
describe('findById', () => {
  const originalQuery = VersionedSection.query;

  let localQuery;
  let context;
  let versionedSection;

  beforeEach(async () => {
    // jest.resetAllMocks();

    localQuery = jest.fn();
    (VersionedSection.query as jest.Mock) = localQuery;

    context = await buildContext(logger, mockToken());

    versionedSection = new VersionedSection({
      name: casual.sentence,
      versionedTemplateId: casual.integer(1, 20),
      sectionId: casual.integer(1, 20),
      introduction: casual.sentence,
      requirements: casual.sentence,
      guidance: casual.sentence,
      displayOrder: casual.integer(1, 20),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    VersionedSection.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([versionedSection]);
    const id = casual.integer(1, 999);
    const result = await VersionedSection.findById('testing', context, id);
    const expectedSql = 'SELECT * FROM versionedSections WHERE id= ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'testing')
    expect(result).toBeInstanceOf(VersionedSection);
  });
});
import casual from "casual";
import { Template } from "../../models/Template";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { MySQLDataSource } from "../../datasources/mySQLDataSource";
import { cloneSection, hasPermissionOnSection } from "../sectionService";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { hasPermissionOnTemplate } from "../templateService";
import { NotFoundError } from "../../utils/graphQLErrors";
import { Section } from "../../models/Section";
import { VersionedSection } from "../../models/VersionedSection";

// Pulling context in here so that the MySQLDataSource gets mocked
jest.mock('../../context.ts');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('hasPermissionOnSection', () => {
  let template;
  let mockQuery;
  let mockFindById;
  let mockHashPermissionOnTemplate;
  let context;

  beforeEach(() => {
    jest.resetAllMocks();

    // Cast getInstance to a jest.Mock type to use mockReturnValue
    (MySQLDataSource.getInstance as jest.Mock).mockReturnValue({
      query: jest.fn(), // Initialize the query mock function here
    });

    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
    context = { logger, dataSources: { sqlDataSource: { query: mockQuery } } };

    mockFindById = jest.fn();
    (Template.findById as jest.Mock) = mockFindById;

    mockHashPermissionOnTemplate = jest.fn();
    (hasPermissionOnTemplate as jest.Mock) = mockHashPermissionOnTemplate;

    template = new Template({
      id: casual.integer(1, 999),
      name: casual.sentence,
      ownerId: casual.url,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if the Template is not found', async () => {
    mockFindById.mockResolvedValue(null);
    expect(async () => { await hasPermissionOnSection(context, template.id) }).rejects.toThrow(NotFoundError());
  });

  it('returns true if the current user has permission on the Template', async () => {
    mockFindById.mockResolvedValueOnce(template);
    mockHashPermissionOnTemplate.mockResolvedValueOnce(true);

    expect(await hasPermissionOnSection(context, template.id)).toBe(true)
    expect(Template.findById).toHaveBeenCalledTimes(1);
    expect(mockHashPermissionOnTemplate).toHaveBeenCalledTimes(1);
  });

  it('returns false if the current user does NOT have permission on the Template', async () => {
    mockFindById.mockResolvedValueOnce(template);
    mockHashPermissionOnTemplate.mockResolvedValueOnce(false);

    expect(await hasPermissionOnSection(context, template.id)).toBe(false)
    expect(Template.findById).toHaveBeenCalledTimes(1);
    expect(mockHashPermissionOnTemplate).toHaveBeenCalledTimes(1);
  });
});

describe('cloneSection', () => {
  let section;

  let id;
  let templateId;
  let name;
  let introduction;
  let requirements;
  let guidance;
  let displayOrder;
  let tags;
  let isDirty;
  let createdById;

  beforeEach(() => {
    templateId = casual.integer(1, 999);
    id = casual.integer(1, 999);
    name = casual.sentence;
    introduction = casual.sentences(3);
    requirements = casual.sentences(5);
    guidance = casual.sentences(5);
    displayOrder = casual.integer(1, 9);
    tags = null;
    isDirty = true;
    createdById = casual.integer(1, 999);

    section = new Section({ id, templateId, name, introduction, requirements, guidance, displayOrder, tags, isDirty, createdById });
  });

  it('Clone retains the expected parts of the specified Section', () => {
    const clonedById = casual.integer(1, 99);
    const copy = cloneSection(clonedById, templateId, section);

    expect(copy).toBeInstanceOf(Section);
    expect(copy.id).toBeFalsy();
    expect(copy.sourceSectionId).toEqual(section.id);
    expect(copy.templateId).toEqual(templateId);
    expect(copy.name).toEqual(`Copy of ${section.name}`);
    expect(copy.introduction).toEqual(introduction);
    expect(copy.requirements).toEqual(requirements);
    expect(copy.guidance).toEqual(guidance);
    expect(copy.errors).toEqual([]);
    expect(copy.displayOrder).toEqual(displayOrder);
    expect(copy.isDirty).toEqual(true);//The cloneSection function accepts Section | VersionedSection, and VersionedSection doesn't have isDirty, so in this test will always be true
    expect(copy.created).toBeTruthy();
    expect(copy.createdById).toEqual(clonedById)
    expect(copy.modified).toBeTruthy();
  });

  it('Clone retains the expected parts of the specified VersionedSection', () => {
    const clonedById = casual.integer(1, 999);
    const published = new VersionedSection({
      versionedTemplateId: templateId,
      sectionId: section.id,
      name: casual.sentence,
      introduction: casual.sentences(3),
      requirements: casual.sentences(5),
      guidance: casual.sentences(5),
      displayOrder: casual.integer(1, 9),
      createdById: casual.integer(1, 9999),
    });

    const copy = cloneSection(clonedById, templateId, published);

    expect(copy).toBeInstanceOf(Section);
    expect(copy.id).toBeFalsy();
    expect(copy.sourceSectionId).toEqual(published.sectionId);
    expect(copy.name).toEqual(`Copy of ${published.name}`);
    expect(copy.introduction).toEqual(published.introduction);
    expect(copy.requirements).toEqual(published.requirements);
    expect(copy.guidance).toEqual(published.guidance);
    expect(copy.errors).toEqual([]);
    expect(copy.createdById).toEqual(clonedById);
    expect(copy.displayOrder).toEqual(published.displayOrder);
    expect(copy.isDirty).toEqual(true);
    expect(copy.created).toBeTruthy();
    expect(copy.modified).toBeTruthy();
  });
});

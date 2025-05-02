import casual from "casual";
import { Template } from "../../models/Template";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { mysql } from "../../datasources/mysql";
import { cloneSection, generateSectionVersion, hasPermissionOnSection } from "../sectionService";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { hasPermissionOnTemplate } from "../templateService";
import { NotFoundError } from "../../utils/graphQLErrors";
import { Section } from "../../models/Section";
import { VersionedSection } from "../../models/VersionedSection";
import { Tag } from "../../models/Tag";
import { getCurrentDate } from "../../utils/helpers";
import { Question } from "../../models/Question";

// Pulling context in here so that the mysql gets mocked
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
  let mockFindById;
  let mockHashPermissionOnTemplate;
  let context;

  beforeEach(() => {
    jest.resetAllMocks();

    // Cast getInstance to a jest.Mock type to use mockReturnValue
    (mysql.getInstance as jest.Mock).mockReturnValue({
      query: jest.fn(), // Initialize the query mock function here
    });

    context = buildContext(logger, mockToken());

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
    expect(copy.name).toEqual(section.name);
    expect(copy.introduction).toEqual(introduction);
    expect(copy.requirements).toEqual(requirements);
    expect(copy.guidance).toEqual(guidance);
    expect(copy.errors).toEqual({});
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
    expect(copy.name).toEqual(published.name);
    expect(copy.introduction).toEqual(published.introduction);
    expect(copy.requirements).toEqual(published.requirements);
    expect(copy.guidance).toEqual(published.guidance);
    expect(copy.errors).toEqual({});
    expect(copy.createdById).toEqual(clonedById);
    expect(copy.displayOrder).toEqual(published.displayOrder);
    expect(copy.isDirty).toEqual(true);
    expect(copy.created).toBeTruthy();
    expect(copy.modified).toBeTruthy();
  });
});

describe('generateSectionVersion', () => {
  let sectionStore;
  let versionedSectionStore;
  let mockInsert;
  let mockUpdate;
  let mockFindSectionById;
  let mockFindVersionedSectionbyId;

  beforeEach(() => {
    jest.resetAllMocks();

    // Mock the Questions
    const mockQuestionFindBySectionId = jest.fn().mockResolvedValue([]);
    (Question.findBySectionId as jest.Mock) = mockQuestionFindBySectionId;

    const tstamp = getCurrentDate();

    // Setup the mock data stores
    sectionStore = [
      new Section({
        id: casual.integer(1, 99),
        templateId: casual.integer(1, 9),
        name: casual.sentence,
        introduction: casual.sentences(3),
        requirements: casual.sentences(2),
        guidance: casual.sentences(5),
        displayOrder: casual.integer(1, 9),
        tags: [
          new Tag({ name: casual.words(3) }),
          new Tag({ name: casual.words(1) }),
        ],
        isDirty: true,
        createdById: casual.integer(1, 999),
        created: tstamp,
        modifiedById: casual.integer(1, 999),
        modified: tstamp,
      }),
    ];
    versionedSectionStore = [];

    // Fetch an item from the sectionStore
    mockFindSectionById = jest.fn().mockImplementation((_, __, id) => {
      return sectionStore.find((entry) => { return entry.id === id });
    });

    // Fetch an item from the versionedSectionStore
    mockFindVersionedSectionbyId = jest.fn().mockImplementation((_, __, id) => {
      return versionedSectionStore.find((entry) => { return entry.id === id });
    });

    // Add the entry to the appropriate store
    mockInsert = jest.fn().mockImplementation((context, table, obj) => {
      const tstamp = getCurrentDate();
      const userId = context.token.id;
      obj.id = casual.integer(1, 9999);
      obj.created = tstamp;
      obj.createdById = userId;
      obj.modifed = tstamp;
      obj.modifiedById = userId;

      switch (table) {
        case 'sections': {
          sectionStore.push(obj);
          break;
        }
        case 'versionedSections': {
          versionedSectionStore.push(obj);
          break;
        }
      }
      // Need to return the new id for the object
      return obj.id;
    });

    // Update the entry in the store
    mockUpdate = jest.fn().mockImplementation((context, table, obj, _ref, _keys, noTouch) => {
      const tstamp = getCurrentDate();
      const userId = context.token.id;
      if (!noTouch) {
        obj.modifed = tstamp;
        obj.modifiedById = userId;
      }

      switch (table) {
        case 'sections': {
          const existing = sectionStore.find((entry) => { return entry.id === obj.id });
          if (!existing) {
            throw new Error(`No entry in the sectionStore for id: ${obj.id}`);
          }
          sectionStore.splice(sectionStore.indexOf(existing), 1, obj);
          break;
        }
        case 'versionedSections': {
          const existing = versionedSectionStore.find((entry) => { return entry.id === obj.id });
          if (!existing) {
            throw new Error(`No entry in the versionedSectionStore for id: ${obj.id}`);
          }
          versionedSectionStore.splice(versionedSectionStore.indexOf(existing), 1, obj);
          break;
        }
      }
      return obj;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not allow an unsaved section to be versioned', async () => {
    const section = new Section({ name: casual.words(4) });

    expect(async () => {
      await generateSectionVersion(context, section, casual.integer(1, 999));
    }).rejects.toThrow(Error('Cannot publish unsaved Section'));
  });

  it('does not version if the VersionedSection could not be created', async () => {
    const section = sectionStore[0];
    const versioned = new VersionedSection({ sectionId: section.id });
    versioned.errors = { general: 'Test failure' };

    (context.dataSources.sqlDataSource.query as jest.Mock).mockResolvedValueOnce(null);
    (VersionedSection.insert as jest.Mock) = mockInsert;
    const mockFindByFailure = jest.fn().mockImplementation(() => { return versioned; });
    (VersionedSection.findById as jest.Mock) = mockFindByFailure;

    const err = `Unable to create a new version for section: ${section.id}`;
    expect(async () => {
      await generateSectionVersion(context, section, casual.integer(1, 999));
    }).rejects.toThrow(Error(err));
  });

  it('does not version if the Section could not be updated', async () => {
    const section = sectionStore[0];
    const updated = new Section({ id: section.id });
    updated.errors = { general: 'Test failure' };

    (VersionedSection.insert as jest.Mock) = mockInsert;
    (VersionedSection.findById as jest.Mock) = mockFindVersionedSectionbyId;
    const mockUpdateFailure = jest.fn().mockImplementation(() => { return updated; });
    (Section.update as jest.Mock) = mockUpdate;
    (Section.findById as jest.Mock) = mockUpdateFailure;

    const err = `Unable to set the isDirty flag for section: ${section.id}`;
    expect(async () => {
      await generateSectionVersion(context, section, casual.integer(1, 999))
    }).rejects.toThrow(Error(err));
  });

  it('versions the Section', async () => {
    const section = new Section(sectionStore[0]);

    (VersionedSection.insert as jest.Mock) = mockInsert;
    (VersionedSection.findById as jest.Mock) = mockFindVersionedSectionbyId;
    (Section.update as jest.Mock) = mockUpdate;
    (Section.findById as jest.Mock) = mockFindSectionById;

    const versionedTemplateId = casual.integer(1, 999);
    expect(await generateSectionVersion(context, section, versionedTemplateId)).toEqual(true);

    // Verify that the Version was created as expected
    const newVersion = versionedSectionStore[0];
    expect(mockInsert).toHaveBeenCalled();
    expect(newVersion.id).toBeTruthy();
    expect(newVersion.created).toBeTruthy();
    expect(newVersion.modified).toBeTruthy();
    expect(newVersion.createdById).toEqual(context.token.id);
    expect(newVersion.modifiedById).toEqual(context.token.id);
    expect(newVersion.versionedTemplateId).toEqual(versionedTemplateId);
    expect(newVersion.sectionId).toEqual(section.id);
    expect(newVersion.name).toEqual(section.name);
    expect(newVersion.introduction).toEqual(section.introduction);
    expect(newVersion.requirements).toEqual(section.requirements);
    expect(newVersion.guidance).toEqual(section.guidance);
    expect(newVersion.displayOrder).toEqual(section.displayOrder);
    expect(newVersion.tags).toEqual(section.tags);

    // Verify that the template was updated as expected
    expect(mockUpdate).toHaveBeenCalled();
    const updated = sectionStore.find((entry) => { return entry.id === section.id; });
    expect(updated.modifiedById).toEqual(section.modifiedById);
    expect(updated.modified).toEqual(section.modified);
    expect(updated.isDirty).toEqual(false);
  });
});

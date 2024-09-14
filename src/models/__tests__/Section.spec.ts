import casual from 'casual';
import { Section, sectionsBySectionIdQuery, sectionsByTemplateIdQuery } from "../Section";
import mockLogger from '../../__tests__/mockLogger';
import { buildContext, mockToken } from '../../__mocks__/context';

jest.mock('../../context.ts');

describe('Section', () => {
    let section;
    const sectionData = {
        name: 'Henry',
        introduction: 'This is the intro',
        requirements: 'This is the requirements',
        guidance: 'This is the guidance',
        displayOrder: 1,
        isDirty: false
    }
    beforeEach(() => {
        section = new Section(sectionData);
    });

    it('should initialize options as expected', () => {
        expect(section.id).toBeFalsy();
        expect(section.name).toEqual(sectionData.name);
        expect(section.introduction).toEqual(sectionData.introduction);
        expect(section.requirements).toEqual(sectionData.requirements);
        expect(section.guidance).toEqual(sectionData.guidance);
        expect(section.displayOrder).toEqual(sectionData.displayOrder);
        expect(section.isDirty).toBeFalsy();
        expect(section.created).toBeTruthy();
        expect(section.modified).toBeTruthy();
        expect(section.errors).toEqual([]);
    });

    it('should return true when calling isValid with a name field', async () => {
        expect(await section.isValid()).toBe(true);
    });

    it('should return false when calling isValid without a name field', async () => {
        section.name = null;
        expect(await section.isValid()).toBe(false);
        expect(section.errors.length).toBe(1);
        expect(section.errors[0]).toEqual('Name can\'t be blank');
    });
});

describe('findSectionBySectionName', () => {
    const originalQuery = Section.query;

    let localQuery;
    let context;
    let section;

    beforeEach(() => {
        jest.resetAllMocks();

        localQuery = jest.fn();
        (Section.query as jest.Mock) = localQuery;

        context = buildContext(mockLogger, mockToken());

        section = new Section({
            id: casual.integer(1, 9),
            createdById: casual.integer(1, 999),
            name: casual.sentence,
            ownerId: casual.url,
        })
    });

    afterEach(() => {
        jest.clearAllMocks();
        Section.query = originalQuery;
    });

    it('should call query with correct params and return the section', async () => {
        localQuery.mockResolvedValueOnce([section]);

        const result = await Section.findSectionBySectionName('Section query', context, section.name);
        const expectedSql = 'SELECT * FROM sections WHERE LOWER(name) = ?';
        expect(localQuery).toHaveBeenCalledTimes(1);
        expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [section.name.toLowerCase()], 'Section query')
        expect(result).toEqual(section);
    });

    it('should return null if it finds no Section', async () => {
        localQuery.mockResolvedValueOnce([]);

        const result = await Section.findSectionBySectionName('Section query', context, section.name);
        expect(result).toEqual(null);
    });
});

describe('getSectionsByTemplateId', () => {
    const originalQuery = Section.query;

    let localQuery;
    let context;
    let section;

    beforeEach(() => {
        jest.resetAllMocks();

        localQuery = jest.fn();
        (Section.query as jest.Mock) = localQuery;

        context = buildContext(mockLogger, mockToken());

        section = new Section({
            id: casual.integer(1, 9),
            createdById: casual.integer(1, 999),
            name: casual.sentence,
            ownerId: casual.url,
        })
    });

    afterEach(() => {
        jest.clearAllMocks();
        Section.query = originalQuery;
    });

    it('should call query with correct params and return the section', async () => {
        localQuery.mockResolvedValueOnce([section]);
        const templateId = 1;
        const result = await Section.getSectionsByTemplateId('Section query', context, templateId);
        const expectedSql = 'SELECT * FROM sections WHERE templateId = ?';
        expect(localQuery).toHaveBeenCalledTimes(1);
        expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [templateId.toString()], 'Section query')
        expect(result).toEqual([section]);
    });

    it('should return an empty array if it finds no Section', async () => {
        localQuery.mockResolvedValueOnce([]);
        const templateId = 1;
        const result = await Section.getSectionsByTemplateId('Section query', context, templateId);
        expect(result).toEqual([]);
    });
});

describe('getSectionsWithTagsByTemplateId', () => {
    const originalQuery = Section.query;

    let localQuery;
    let context;
    let section;

    beforeEach(() => {
        jest.resetAllMocks();

        localQuery = jest.fn();
        (Section.query as jest.Mock) = localQuery;

        context = buildContext(mockLogger, mockToken());

        section = new Section({
            id: casual.integer(1, 9),
            createdById: casual.integer(1, 999),
            name: casual.sentence,
            ownerId: casual.url,
        })
    });

    afterEach(() => {
        jest.clearAllMocks();
        Section.query = originalQuery;
    });

    it('should call query with correct params and return the section', async () => {
        localQuery.mockResolvedValueOnce([section]);
        const templateId = 1;
        const result = await Section.getSectionsWithTagsByTemplateId('Section query', context, templateId);
        const expectedSql = sectionsByTemplateIdQuery;
        expect(localQuery).toHaveBeenCalledTimes(1);
        expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [templateId.toString()], 'Section query')
        /* As part of this test, all fields without a value default to 'undefined' for the mocked Section, but
        the getSectionsWithTagsByTemplateId method returns an empty array, and not undefined*/
        expect(result).toEqual([{ ...section, ...{ tags: [] } }]);
    });

    it('should return an empty array if it finds no Section', async () => {
        localQuery.mockResolvedValueOnce([]);
        const templateId = 1;
        const result = await Section.getSectionsWithTagsByTemplateId('Section query', context, templateId);
        expect(result).toEqual([]);
    });
});

describe('getSectionWithTagsBySectionId', () => {
    const originalQuery = Section.query;

    let localQuery;
    let context;
    let section;

    beforeEach(() => {
        jest.resetAllMocks();

        localQuery = jest.fn();
        (Section.query as jest.Mock) = localQuery;

        context = buildContext(mockLogger, mockToken());

        section = new Section({
            id: casual.integer(1, 9),
            createdById: casual.integer(1, 999),
            name: casual.sentence,
            ownerId: casual.url,
        })
    });

    afterEach(() => {
        jest.clearAllMocks();
        Section.query = originalQuery;
    });

    it('should call query with correct params and return the section', async () => {
        localQuery.mockResolvedValueOnce([section]);
        const sectionId = 1;
        const result = await Section.getSectionWithTagsBySectionId('Section query', context, sectionId);
        const expectedSql = sectionsBySectionIdQuery;
        expect(localQuery).toHaveBeenCalledTimes(1);
        expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [sectionId.toString()], 'Section query')
        /* As part of this test, all fields without a value default to 'undefined' for the mocked Section, but
        the getSectionsWithTagsByTemplateId method returns an empty array, and not undefined*/
        expect(result).toEqual({ ...section, ...{ tags: [] } });
    });

    it('should return an empty array if it finds no Section', async () => {
        localQuery.mockResolvedValueOnce([]);
        const templateId = 1;
        const result = await Section.getSectionWithTagsBySectionId('Section query', context, templateId);
        expect(result).toEqual(null);
    });
});

describe('getSectionBySectionId', () => {
    const originalQuery = Section.query;

    let localQuery;
    let context;
    let section;

    beforeEach(() => {
        jest.resetAllMocks();

        localQuery = jest.fn();
        (Section.query as jest.Mock) = localQuery;

        context = buildContext(mockLogger, mockToken());

        section = new Section({
            id: casual.integer(1, 9),
            createdById: casual.integer(1, 999),
            name: casual.sentence,
            ownerId: casual.url,
        })
    });

    afterEach(() => {
        jest.clearAllMocks();
        Section.query = originalQuery;
    });

    it('should call query with correct params and return the section', async () => {
        localQuery.mockResolvedValueOnce([section]);
        const sectionId = 1;
        const result = await Section.getSectionBySectionId('Section query', context, sectionId);
        const expectedSql = 'SELECT * FROM sections where id = ?';
        expect(localQuery).toHaveBeenCalledTimes(1);
        expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [sectionId.toString()], 'Section query')
        expect(result).toEqual(section);
    });

    it('should return an empty array if it finds no Section', async () => {
        localQuery.mockResolvedValueOnce([]);
        const templateId = 1;
        const result = await Section.getSectionBySectionId('Section query', context, templateId);
        expect(result).toEqual(null);
    });
});


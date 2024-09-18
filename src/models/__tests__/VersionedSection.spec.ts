import casual from "casual";
import { VersionedSection } from "../VersionedSection";
import mockLogger from "../../__tests__/mockLogger";
import { buildContext, mockToken } from "../../__mocks__/context";

jest.mock('../../context.ts');

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

describe('getVersionedSectionsBySectionId', () => {
    const originalQuery = VersionedSection.query;

    let localQuery;
    let context;
    let versionedSection;

    beforeEach(() => {
        jest.resetAllMocks();

        localQuery = jest.fn();
        (VersionedSection.query as jest.Mock) = localQuery;

        context = buildContext(mockLogger, mockToken());

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
        const result = await VersionedSection.getVersionedSectionsBySectionId('VersionedSection query', context, sectionId);
        const expectedSql = 'SELECT * FROM versionedSections WHERE sectionId = ?';
        expect(localQuery).toHaveBeenCalledTimes(1);
        expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [sectionId.toString()], 'VersionedSection query')
        expect(result).toEqual([versionedSection]);
    });
    it('should return null if it finds no VersionedSection', async () => {
        localQuery.mockResolvedValueOnce([]);
        const sectionId = 1;
        const result = await VersionedSection.getVersionedSectionsBySectionId('VersionedSection query', context, sectionId);
        expect(result).toEqual(null);
    });
});

describe('getVersionedSectionsByName', () => {
    const originalQuery = VersionedSection.query;

    let localQuery;
    let context;
    let versionedSection;

    beforeEach(() => {
        jest.resetAllMocks();

        localQuery = jest.fn();
        (VersionedSection.query as jest.Mock) = localQuery;

        context = buildContext(mockLogger, mockToken());

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

        const result = await VersionedSection.getVersionedSectionsByName('VersionedSection query', context, versionedSection.name);
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

        const result = await VersionedSection.getVersionedSectionsByName('VersionedSection query', context, versionedSection.name);
        expect(result).toEqual(null);
    });
});



import { SectionTag } from "../SectionTag";
import casual from "casual";

let context;
jest.mock('../../context.ts');

describe('SectionTag', () => {
    let sectionTag;
    const sectionTagData = {
        sectionId: 10,
        tagId: 12
    }
    beforeEach(() => {
        sectionTag = new SectionTag(sectionTagData);
    });

    it('should initialize options as expected', () => {
        expect(sectionTag.sectionId).toEqual(sectionTagData.sectionId)
        expect(sectionTag.tagId).toEqual(sectionTagData.tagId)
    });
});

describe('create', () => {
    const originalInsert = SectionTag.insert;
    let insertQuery;
    let sectionTag;

    beforeEach(() => {
        // jest.resetAllMocks();

        insertQuery = jest.fn();
        (SectionTag.insert as jest.Mock) = insertQuery;

        sectionTag = new SectionTag({
            sectionId: casual.integer(1, 9),
            tagId: casual.integer(1, 999),
        })
    });

    afterEach(() => {
        // jest.resetAllMocks();
        SectionTag.insert = originalInsert;
    });

    it('returns the SectionTag ', async () => {
        const localValidator = jest.fn();
        localValidator.mockResolvedValueOnce(false);

        expect(await sectionTag.create(context)).toBe(sectionTag);
    });
});





import { SectionTag } from "../SectionTag";


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





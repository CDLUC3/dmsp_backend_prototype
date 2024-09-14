import casual from "casual";
import { Tag } from "../Tag";

let context;
jest.mock('../../context.ts');

describe('Tag', () => {
    let tag;
    const tagData = {
        name: 'Henry',
        description: 'This is a description'
    }
    beforeEach(() => {
        tag = new Tag(tagData);
    });

    it('should initialize options as expected', () => {
        expect(tag.name).toEqual(tagData.name);
        expect(tag.description).toEqual(tagData.description);
    });
});

describe('create', () => {
    const originalInsert = Tag.insert;
    let insertQuery;
    let tag;

    beforeEach(() => {
        // jest.resetAllMocks();

        insertQuery = jest.fn();
        (Tag.insert as jest.Mock) = insertQuery;

        tag = new Tag({
            name: casual.sentence,
            description: casual.sentence,
        })
    });

    afterEach(() => {
        // jest.resetAllMocks();
        Tag.insert = originalInsert;
    });

    it('returns the Tag with an error if the tag already exists', async () => {
        const mockFindBy = jest.fn();
        (Tag.findTagByTagName as jest.Mock) = mockFindBy;
        mockFindBy.mockResolvedValueOnce(tag);

        const result = await tag.create(context);
        expect(mockFindBy).toHaveBeenCalledTimes(1);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0]).toEqual('Tag with this name already exists');
    });
    it('returns the newly added Tag', async () => {
        const mockFindBy = jest.fn();
        (Tag.findTagByTagName as jest.Mock) = mockFindBy;
        mockFindBy.mockResolvedValueOnce(null);
        mockFindBy.mockResolvedValue(tag);

        const mockFindById = jest.fn();
        (Tag.getTagById as jest.Mock) = mockFindById;
        mockFindById.mockResolvedValueOnce(tag);

        const result = await tag.create(context);
        expect(mockFindBy).toHaveBeenCalledTimes(1);
        expect(insertQuery).toHaveBeenCalledTimes(1);
        expect(result.errors.length).toBe(0);
        expect(result).toEqual(tag);
    });
});
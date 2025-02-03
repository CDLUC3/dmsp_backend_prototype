import casual from "casual";
import { Tag } from "../Tag";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";

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
  const originalFindTagByTagName = Tag.findTagByTagName;
  const originalgetTagById = Tag.getTagById
  let insertQuery;
  let tag;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();


    insertQuery = jest.fn();
    (Tag.insert as jest.Mock) = insertQuery;

    tag = new Tag({
      name: casual.sentence,
      description: casual.sentence,
    })
  });

  afterEach(() => {
    Tag.insert = originalInsert;
    Tag.findTagByTagName = originalFindTagByTagName;
    Tag.getTagById = originalgetTagById;
  });

  it('returns the Tag with an error if the tag already exists', async () => {
    const mockFindBy = jest.fn();
    (Tag.findTagByTagName as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(tag);

    const result = await tag.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });
  it('returns the newly added Tag', async () => {
    const mockFindBy = jest.fn();
    context = {
      token: {
        id: 1,
        email: 'test@test.com',
        givenName: 'henry',
        surName: 'smith',
        role: 'admin',
      }
      // Add other required properties of MyContext here
    };
    (Tag.findTagByTagName as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);
    mockFindBy.mockResolvedValue(tag);

    const mockFindById = jest.fn();
    (Tag.getTagById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(tag);

    context.token = { id: 1 };
    const result = await tag.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toEqual(tag);
  });
});


describe('update', () => {
  let updateQuery;
  let tag;

  beforeEach(() => {
    updateQuery = jest.fn();
    (Tag.update as jest.Mock) = updateQuery;

    tag = new Tag({
      name: casual.sentence,
      description: casual.sentence,
    })
  });

  it('returns the Tag without errors if it is valid', async () => {
    const mockFindById = jest.fn();
    (Tag.getTagById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(tag);
    expect(await tag.update(context)).toBe(tag);
    expect(updateQuery).toHaveBeenCalledTimes(1);
  });
});

describe('delete', () => {
  const originalgetTagById = Tag.getTagById
  let tag;

  beforeEach(() => {
    tag = new Tag({
      id: casual.integer(1, 9),
      name: casual.sentence,
      description: casual.sentence,
    })
  });

  afterEach(() => {
    Tag.getTagById = originalgetTagById;
  })

  it('returns null if the Section has no id', async () => {
    tag.id = null;
    expect(await tag.delete(context)).toBe(null);
  });
  it('returns the Tag if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Tag.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(tag);

    const mockFindById = jest.fn();
    (Tag.getTagById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(tag);

    const result = await tag.delete(context);
    expect(Object.keys(result?.errors).length).toBe(0);
    expect(result).toEqual(tag);
  });
});

describe('getAllTags', () => {
  const originalQuery = Tag.query;

  let localQuery;
  let context;
  let tag;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (Tag.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    tag = new Tag({
      id: casual.integer(1, 9),
      name: casual.sentence,
      description: casual.sentence,
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    Tag.query = originalQuery;
  });

  it('should call query with correct params and return the section', async () => {
    localQuery.mockResolvedValueOnce([tag]);
    const result = await Tag.getAllTags('Tag query', context);
    const expectedSql = 'SELECT * FROM tags';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [], 'Tag query')
    expect(result).toEqual([tag]);
  });
});


describe('getTagsBySectionId', () => {
  const originalQuery = Tag.query;

  let localQuery;
  let context;
  let tag;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (Tag.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    tag = new Tag({
      id: casual.integer(1, 9),
      name: casual.sentence,
      description: casual.sentence,
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    Tag.query = originalQuery;
  });

  it('should call query with correct params and return the tag', async () => {
    localQuery.mockResolvedValueOnce([tag]);
    const sectionId = 1;
    const result = await Tag.getTagsBySectionId('Tag query', context, sectionId);
    const expectedSql = `SELECT tags.*
    FROM sectionTags
    JOIN tags ON sectionTags.tagId = tags.id
    WHERE sectionTags.sectionId = ?;`;
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [sectionId.toString()], 'Tag query')
    expect(result).toEqual([tag]);
  });
});

describe('getTagById', () => {

  let localQuery;
  let context;
  let tag;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (Tag.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    tag = new Tag({
      id: casual.integer(1, 9),
      name: casual.sentence,
      description: casual.sentence,
    })
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call query with correct params and return the tag', async () => {
    localQuery.mockResolvedValueOnce([tag]);
    const tagId = 1;
    const result = await Tag.getTagById('Tag query', context, tagId);
    const expectedSql = 'SELECT * FROM tags where id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [tagId.toString()], 'Tag query')
    expect(result).toEqual(tag);

  });
});

describe('findTagByTagName', () => {

  let localQuery;
  let context;
  let tag;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (Tag.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    tag = new Tag({
      id: casual.integer(1, 9),
      name: casual.sentence,
      description: casual.sentence,
    })
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call query with correct params and return the tag', async () => {
    localQuery.mockResolvedValueOnce([tag]);
    const name = 'tagName';
    const result = await Tag.findTagByTagName('Tag query', context, name);
    const expectedSql = 'SELECT * FROM tags WHERE LOWER(name) = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [name.toLowerCase()], 'Tag query')
    expect(result).toEqual(tag);

  });
});


import { SectionTag } from "../SectionTag";
import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";

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

describe('getSectionTagsBySectionId', () => {
  const originalQuery = SectionTag.query;

  let localQuery;
  let context;
  let sectionTag;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (SectionTag.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    sectionTag = new SectionTag({
      sectionId: casual.integer(1, 9),
      tagId: casual.integer(1, 9)
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    SectionTag.query = originalQuery;
  });

  it('should call query with correct params and return the section', async () => {
    localQuery.mockResolvedValueOnce([sectionTag]);
    const sectionId = 1;
    const result = await SectionTag.getSectionTagsBySectionId('SectionTag query', context, sectionId);
    const expectedSql = 'SELECT * FROM sectionTags WHERE sectionId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [sectionId.toString()], 'SectionTag query')
    expect(result).toEqual([sectionTag]);
  });
});

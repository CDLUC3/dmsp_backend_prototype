import casual from "casual";
import { Affiliation } from "../../models/Affiliation";
import { paginateResults } from "../paginationService";
import { generalConfig } from "../../config/generalConfig";

describe('paginateResults', () => {
  let queryResults;

  beforeEach(() => {
    queryResults = [
      new Affiliation({ id: casual.integer(1, 9999), name: casual.sentence }),
      new Affiliation({ id: casual.integer(1, 9999), name: casual.sentence }),
      new Affiliation({ id: casual.integer(1, 9999), name: casual.sentence }),
      new Affiliation({ id: casual.integer(1, 9999), name: casual.sentence }),
      new Affiliation({ id: casual.integer(1, 9999), name: casual.sentence }),
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an empty itemset with no errors and no cursor if the the items were empty', () => {
    const cursor = queryResults[1].id;
    const limit = 2;
    const field = 'id';
    const { items, nextCursor, error } = paginateResults([], cursor, field, limit);

    expect(items.length).toEqual(0);
    expect(nextCursor).toBeFalsy();
    expect(error).toBeFalsy();
  });

  it('uses the specified limit', () => {
    const limit = 1;
    const field = 'id';
    const { items, nextCursor, error } = paginateResults(queryResults, null, field, limit);

    expect(items.length).toEqual(1);
    expect(nextCursor).toEqual(queryResults[0].id);
    expect(error).toBeFalsy();
  });

  it('uses the default limit if no limit is specified', () => {
    generalConfig.defaultSearchLimit = 2;
    const field = 'id';
    const { items, nextCursor, error } = paginateResults(queryResults, null, field, null);

    expect(items.length).toEqual(2);
    expect(nextCursor).toEqual(queryResults[1].id);
    expect(error).toBeFalsy();
  });

  it('uses the default limit if the specified limit was zero', () => {
    generalConfig.defaultSearchLimit = 2;
    const field = 'id';
    const { items, nextCursor, error } = paginateResults(queryResults, null, field, 0);

    expect(items.length).toEqual(2);
    expect(nextCursor).toEqual(queryResults[1].id);
    expect(error).toBeFalsy();
  });

  it('uses the default limit if the specified limit was less than zero', () => {
    generalConfig.defaultSearchLimit = 2;
    const field = 'id';
    const { items, nextCursor, error } = paginateResults(queryResults, null, field, -2);

    expect(items.length).toEqual(2);
    expect(nextCursor).toEqual(queryResults[1].id);
    expect(error).toBeFalsy();
  });

  it('does not allow more items than the maximum limit', () => {
    generalConfig.maximumSearchLimit = 2;
    const field = 'id';
    const { items, nextCursor, error } = paginateResults(queryResults, null, field, 3);

    expect(items.length).toEqual(2);
    expect(nextCursor).toEqual(queryResults[1].id);
    expect(error).toBeFalsy();
  });

  it('returns an empty array and error if the cursor is not found', () => {
    const cursor = "testing-missing-record";
    const field = 'id';
    const { items, nextCursor, error } = paginateResults(queryResults, cursor, field, 1);

    expect(items.length).toEqual(0);
    expect(nextCursor).toBeFalsy();
    expect(error).toBeTruthy();
  });

  it('returns an empty array and error if the cursorField does not exist on the objects', () => {
    const cursor = queryResults[0].id;
    const field = 'testing-missing-field';
    const { items, nextCursor, error } = paginateResults(queryResults, cursor, field, 1);

    expect(items.length).toEqual(0);
    expect(nextCursor).toBeFalsy();
    expect(error).toBeTruthy();
  });

  it('returns the expected items when the cursor is found and there are more pages', () => {
    const cursor = queryResults[1].id;
    const field = 'id';
    const limit = 2;
    const { items, nextCursor, error } = paginateResults(queryResults, cursor, field, limit);

    expect(items.length).toEqual(2);
    expect(items[0].id).toEqual(queryResults[2].id);
    expect(items[1].id).toEqual(queryResults[3].id);
    expect(nextCursor).toEqual(queryResults[3].id);
    expect(error).toBeFalsy();
  });

  it('returns the expected items when the cursor is found and there are no more pages', () => {
    const cursor = queryResults[3].id;
    const field = 'id';
    const limit = 2;
    const { items, nextCursor, error } = paginateResults(queryResults, cursor, field, limit);

    expect(items.length).toEqual(1);
    expect(items[0].id).toEqual(queryResults[4].id);
    expect(nextCursor).toBeFalsy();
    expect(error).toBeFalsy();
  });

  it('returns the expected items when the cursor is null and there are more pages', () => {
    const field = 'id';
    const limit = 2;
    const { items, nextCursor, error } = paginateResults(queryResults, null, field, limit);

    expect(items.length).toEqual(2);
    expect(items[0].id).toEqual(queryResults[0].id);
    expect(items[1].id).toEqual(queryResults[1].id);
    expect(nextCursor).toEqual(queryResults[1].id);
    expect(error).toBeFalsy();
  });

  it('returns the expected items when the cursor is null and there are no more pages', () => {
    generalConfig.defaultSearchLimit = 20;
    generalConfig.maximumSearchLimit = 100;
    const field = 'id';
    const limit = 10;
    const { items, nextCursor, error } = paginateResults(queryResults, null, field, limit);

    expect(items.length).toEqual(5);
    expect(items[0].id).toEqual(queryResults[0].id);
    expect(items[1].id).toEqual(queryResults[1].id);
    expect(items[2].id).toEqual(queryResults[2].id);
    expect(items[3].id).toEqual(queryResults[3].id);
    expect(items[4].id).toEqual(queryResults[4].id);
    expect(nextCursor).toBeFalsy();
    expect(error).toBeFalsy();
  });
});

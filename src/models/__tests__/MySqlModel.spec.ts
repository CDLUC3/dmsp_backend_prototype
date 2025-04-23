import casual from 'casual';
import { MySqlModel } from "../MySqlModel";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from '../../__mocks__/context';
import { getCurrentDate } from '../../utils/helpers';

jest.mock('../../dataSources/mysql', () => {
  return {
    __esModule: true,
    mysql: {
      getInstance: jest.fn().mockReturnValue({
        query: jest.fn(), // Initialize the query mock function
      }),
    },
  };
});

class TestImplementation extends MySqlModel {
  public name: string;
  public testA: string;
  public testB: number;
  public testC: string[];
  public testD: boolean;

  protected testZ: string;

  constructor(opts) {
    super(opts.id, opts.created, opts.createdById, opts.modified, opts.modifiedById);

    this.name = opts.name ?? casual.sentence;
    this.testA = opts.testA;
    this.testB = opts.testB;
    this.testC = opts.testC;
    this.testD = opts.testD;
    this.testZ = opts.testZ;
  }
}

describe('MySqlModel abstract class', () => {
  it('constructor should initialize as expected if it is a new record', () => {
    const createdById = casual.integer(1, 999);
    const formattedDate = getCurrentDate();
    const model = new MySqlModel(null, formattedDate, createdById);

    expect(model.id).toBeFalsy();
    expect(model.createdById).toEqual(createdById);
    expect(model.modifiedById).toEqual(createdById);
    expect(model.created).toEqual(formattedDate);
    expect(model.modified).toEqual(formattedDate);
  });

  it('constructor should initialize as expected if it is an existing record', () => {
    const id = casual.integer(1, 999);
    const formattedDate = getCurrentDate();
    const created = formattedDate;
    const createdById = casual.integer(1, 999);
    const modified = formattedDate;
    const modifiedById = casual.integer(1, 999);

    const model = new MySqlModel(id, created, createdById, modified, modifiedById);

    expect(model.id).toEqual(id);
    expect(model.createdById).toEqual(createdById);
    expect(model.modifiedById).toEqual(modifiedById);
    expect(model.created).toEqual(formattedDate);
    expect(model.modified).toEqual(formattedDate);
  });

  it('isValid should return false when the modified date is not a Date', async () => {
    const createdById = casual.integer(1, 999);
    const formattedDate = getCurrentDate();
    const model = new MySqlModel(null, formattedDate, createdById);

    model.modified = '2456247dgerg';
    expect(await model.isValid()).toBe(false);
    expect(Object.keys(model.errors).length).toBe(1);
    expect(model.errors['modified'].includes('Modified date')).toBe(true);
  });

  it('isValid should return false when the created date is not a Date', async () => {
    const createdById = casual.integer(1, 999);
    const formattedDate = getCurrentDate();
    const model = new MySqlModel(null, formattedDate, createdById);

    model.created = '2456247dgerg';
    expect(await model.isValid()).toBe(false);
    expect(Object.keys(model.errors).length).toBe(1);
    expect(model.errors['created'].includes('Created date')).toBe(true);
  });

  it('isValid should return false when the createdById is null', async () => {
    const createdById = casual.integer(1, 999);
    const formattedDate = getCurrentDate();
    const model = new MySqlModel(null, formattedDate, createdById);

    model.createdById = null;
    expect(await model.isValid()).toBe(false);
    expect(Object.keys(model.errors).length).toBe(1);
    expect(model.errors['createdById'].includes('Created by')).toBe(true);
  });

  it('isValid should return false when the modifiedById is null', async () => {
    const createdById = casual.integer(1, 999);
    const formattedDate = getCurrentDate();
    const model = new MySqlModel(null, formattedDate, createdById);

    model.modifiedById = null;
    expect(await model.isValid()).toBe(false);
    expect(Object.keys(model.errors).length).toBe(1);
    expect(model.errors['modifiedById'].includes('Modified by')).toBe(true);
  });

  it('isValid should return true when the id is null', async () => {
    const createdById = casual.integer(1, 999);
    const formattedDate = getCurrentDate();
    const model = new MySqlModel(null, formattedDate, createdById);

    model.id = null;
    expect(await model.isValid()).toBe(true);
  });
});

describe('prepareValue', () => {
  it('can handle a string', () => {
    const val = 'test';
    expect(MySqlModel.prepareValue(val, String)).toEqual("test");
    const str = new String('test');
    expect(MySqlModel.prepareValue(str, String)).toEqual("test");
  });

  it('can handle a number', () => {
    const val = 12345;
    expect(MySqlModel.prepareValue(val, Number)).toEqual("12345");
    const flt = new String(123.45);
    expect(MySqlModel.prepareValue(flt, Number)).toEqual("123.45");
  });

  it('can handle a boolean', () => {
    const val = true;
    expect(MySqlModel.prepareValue(val, Boolean)).toEqual("true");
    const bool = new Boolean(0);
    expect(MySqlModel.prepareValue(bool, Boolean)).toEqual("false");
  });

  it('can handle an Array', () => {
    const val = ['test1', 'test2'];
    expect(MySqlModel.prepareValue(val, Array)).toEqual('["test1","test2"]');
    const nested = ['test1', 'test2', [12, 34]];
    expect(MySqlModel.prepareValue(nested, Array)).toEqual('["test1","test2",[12,34]]');
    // eslint-disable-next-line @typescript-eslint/no-array-constructor
    const arr = new Array('1', '2');
    expect(MySqlModel.prepareValue(arr, Array)).toEqual('["1","2"]');
  });

  it('can handle an Object', () => {
    const val = { test1: 'test1', test2: 2, test3: false };
    expect(MySqlModel.prepareValue(val, Object)).toEqual('{"test1":"test1","test2":2,"test3":false}');
    const nested = { test1: 'test1', test2: { subA: 2, subB: '3' }, test3: false };
    expect(MySqlModel.prepareValue(nested, Object)).toEqual('{"test1":"test1","test2":{"subA":2,"subB":"3"},"test3":false}');
  });
});

describe('propertyInfo', () => {
  const options = {
    id: casual.integer(1, 9999),
    createdById: casual.integer(1, 99),
    created: casual.date('YYYY-MM-DD'),
    modifiedById: casual.integer(1, 99),
    modifed: casual.date('YYYY-MM-DD'),

    testA: casual.sentence,
    testB: casual.integer(1, 999),
    testC: [casual.sentence, casual.word],
    testD: casual.boolean,
    testZ: casual.words(3),
  }

  it('returns all of the expected properties', () => {
    const obj = new TestImplementation(options);
    const props = MySqlModel.propertyInfo(obj, ['testZ']);

    expect(props.find(i => i.name === 'testA')?.value).toEqual(options.testA);
    expect(props.find(i => i.name === 'testB')?.value).toEqual(options.testB);
    expect(props.find(i => i.name === 'testC')?.value).toEqual(options.testC);
    expect(props.find(i => i.name === 'testD')?.value).toEqual(options.testD);

    expect(props.find(i => i.name === 'testZ')).toBeFalsy();
    expect(props.find(i => i.name === 'id')).toBeFalsy();
    expect(props.find(i => i.name === 'errors')).toBeFalsy();
  });
});

describe('query function', () => {
  let mockQuery;
  let context;

  beforeEach(() => {
    jest.resetAllMocks();

    context = buildContext(logger, mockToken());

    mockQuery = jest.fn();
    const dataSource = context.dataSources.sqlDataSource;
    (dataSource.query as jest.Mock) = mockQuery;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('query returns an array and logs the event', async () => {
    mockQuery.mockResolvedValueOnce(['test']);
    const sql = 'SELECT * FROM tests WHERE field = ?';
    const result = await MySqlModel.query(context, sql, ['1'], 'Testing');
    expect(context.logger.debug).toHaveBeenCalledTimes(1);
    expect(context.logger.debug).toHaveBeenCalledWith(`Testing, sql: ${sql}, vals: 1`);
    expect(result).toEqual(['test']);
  });

  it('query can be called without a values array or reference string', async () => {
    mockQuery.mockResolvedValueOnce([]);
    const sql = 'SELECT * FROM tests WHERE field = ?';
    const result = await MySqlModel.query(context, sql,);
    expect(context.logger.debug).toHaveBeenCalledTimes(1);
    expect(context.logger.debug).toHaveBeenCalledWith(`undefined caller, sql: ${sql}, vals: `);
    expect(result).toEqual([]);
  });

  it('query returns an empty array if an error occurs and logs the error', async () => {
    const mockError = new Error('Testing error handler');
    mockQuery.mockImplementation(() => { throw mockError });
    const sql = 'SELECT * FROM tests WHERE field = ?';
    const result = await MySqlModel.query(context, sql, ['123'], 'testing failure');
    expect(context.logger.debug).toHaveBeenCalledTimes(1);
    expect(context.logger.error).toHaveBeenCalledTimes(1);
    expect(context.logger.debug).toHaveBeenCalledWith(`testing failure, sql: ${sql}, vals: 123`);
    expect(context.logger.error).toHaveBeenCalledWith(
      mockError, "testing failure, ERROR: Testing error handler"
    );
    expect(result).toEqual([]);
  });

  it('query returns an empty array if an error occurs and logs the error if no context is provided', async () => {
    mockQuery.mockImplementation(() => {
      throw new Error('Testing error handler');
    });
    const sql = 'SELECT * FROM tests WHERE field = ?';
    context.dataSources = null;
    const result = await MySqlModel.query(context, sql, ['123'], 'testing failure');
    expect(context.logger.error).toHaveBeenCalledTimes(1);
    expect(context.logger.error).toHaveBeenCalledWith(`testing failure, ERROR: apolloContext and sqlStatement are required.`);
    expect(result).toEqual([]);
  });
});

describe('exists', () => {
  let localQuery;
  let context;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (MySqlModel.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns true if the record is found and logs the event', async () => {
    localQuery.mockResolvedValueOnce(['test']);
    const result = await MySqlModel.exists(context, 'tests', 1, 'Testing');
    expect(result).toEqual(true);
  });

  it('returns false if the record is NOT found and logs the event', async () => {
    localQuery.mockResolvedValueOnce([]);
    const result = await MySqlModel.exists(context, 'tests', 1, 'Testing');
    expect(result).toEqual(false);
  });
});

describe('insert function', () => {
  let localQuery;
  let context;
  let options;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (MySqlModel.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    options = {
      createdById: casual.integer(1, 99),

      testA: casual.sentence,
      testB: casual.integer(1, 999),
      testC: [casual.sentence, casual.word],
      testD: casual.boolean,
      testZ: casual.words(3),
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('insert returns null if it fails', async () => {
    const table = casual.word;
    const obj = new TestImplementation(options);

    localQuery.mockResolvedValueOnce(null);

    const result = await MySqlModel.insert(context, table, obj, 'Testing');
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(result).toEqual(null);
  });

  it('insert returns the new item\'s id', async () => {
    const table = casual.word;
    const obj = new TestImplementation(options);

    const id = casual.integer(1, 9999);
    localQuery.mockResolvedValueOnce([{ insertId: id }]);

    const result = await MySqlModel.insert(context, table, obj, 'Testing');
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(result).toEqual(id);
  });
});

describe('update function', () => {
  let localQuery;
  let context;
  let options;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (MySqlModel.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    options = {
      id: casual.integer(1, 999),
      createdById: casual.integer(1, 99),

      testA: casual.sentence,
      testB: casual.integer(1, 999),
      testC: [casual.sentence, casual.word],
      testD: casual.boolean,
      testZ: casual.words(3),
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('update returns null if it fails', async () => {
    const table = casual.word;
    const obj = new TestImplementation(options);

    localQuery.mockResolvedValueOnce(null);

    const result = await MySqlModel.update(context, table, obj, 'Testing');
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(result).toEqual(null);
  });

  it('update returns the new item\'s id', async () => {
    const table = casual.word;
    const obj = new TestImplementation(options);

    localQuery.mockResolvedValueOnce([obj]);

    const result = await MySqlModel.update(context, table, obj, 'Testing');
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(result).toEqual(obj);
  });
});

describe('delete function', () => {
  let localQuery;
  let context;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (MySqlModel.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('update returns false if it fails', async () => {
    const table = casual.word;
    const deleteId = casual.integer(1, 99);
    localQuery.mockResolvedValueOnce(null);

    const result = await MySqlModel.delete(context, table, deleteId, 'Testing');
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(result).toEqual(false);
  });

  it('update returns the deleted item\'s id', async () => {
    const table = casual.word;
    const deleteId = 1;
    const response = {
      fieldCount: 0,
      affectedRows: 1,
      insertId: 0,
      info: '',
      serverStatus: 2,
      warningStatus: 0,
      changedRows: 0
    }
    localQuery.mockResolvedValueOnce([response]);

    const result = await MySqlModel.delete(context, table, deleteId, 'Testing');
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(result).toEqual(true);
  });
});

describe('reconcileAssociationIds', () => {
  it('Works when both arrays are empty', () => {
    const expected = { idsToBeRemoved: [], idsToBeSaved: [] };
    expect(MySqlModel.reconcileAssociationIds([], [])).toEqual(expected);
  });

  it('Works when the arrays are the same', () => {
    const expected = { idsToBeRemoved: [], idsToBeSaved: [] };
    expect(MySqlModel.reconcileAssociationIds([1, 2, 3], [1, 2, 3])).toEqual(expected);
  });

  it('Works when we need to remove all ids', () => {
    const expected = { idsToBeRemoved: [1, 2, 3], idsToBeSaved: [] };
    expect(MySqlModel.reconcileAssociationIds([1, 2, 3], [])).toEqual(expected);
  });

  it('Works when we need to add all ids', () => {
    const expected = { idsToBeRemoved: [], idsToBeSaved: [1, 2, 3] };
    expect(MySqlModel.reconcileAssociationIds([], [1, 2, 3])).toEqual(expected);
  });

  it('Works when we need to remove some ids and add others', () => {
    const expected = { idsToBeRemoved: [4, 8], idsToBeSaved: [1, 5, 7] };
    expect(MySqlModel.reconcileAssociationIds([2, 4, 6, 8], [1, 2, 5, 6, 7])).toEqual(expected);
  });
});

import casual from 'casual';
import { MySqlModel } from "../MySqlModel";
import { MySQLDataSource } from '../../datasources/mySQLDataSource';
import mockLogger from '../../__tests__/mockLogger';

jest.mock('../../dataSources/mySQLDataSource', () => {
  return {
    __esModule: true,
    MySQLDataSource: {
      getInstance: jest.fn().mockReturnValue({
        query: jest.fn(), // Initialize the query mock function
      }),
    },
  };
});

class TestImplementation extends MySqlModel {
  public testA: string;
  public testB: number;
  public testC: string[];
  public testD: boolean;

  protected testZ: string;

  constructor(opts) {
    super(opts.id, opts.created, opts.createdById, opts.modified, opts.modifiedById);

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

    const model = new MySqlModel(null, new Date().toISOString(), createdById);

    expect(model.id).toBeFalsy();
    expect(model.createdById).toEqual(createdById);
    expect(model.modifiedById).toEqual(createdById);
    expect(model.created).toBeTruthy();
    expect(model.modified).toEqual(model.created);
  });

  it('constructor should initialize as expected if it is an existing record', () => {
    const id = casual.integer(1, 999);
    const created = new Date().toUTCString();
    const createdById = casual.integer(1, 999);
    const modified = new Date().toUTCString();
    const modifiedById = casual.integer(1, 999);

    const model = new MySqlModel(id, created, createdById, modified, modifiedById);

    expect(model.id).toEqual(id);
    expect(model.createdById).toEqual(createdById);
    expect(model.modifiedById).toEqual(modifiedById);
    expect(model.created).toEqual(created);
    expect(model.modified).toEqual(modified);
  });

  it('isValid should return false when the modified date is not a Date', async () => {
    const createdById = casual.integer(1, 999);
    const model = new MySqlModel(null, new Date().toISOString(), createdById);

    model.modified = '2456247dgerg';
    expect(await model.isValid()).toBe(false);
    expect(model.errors.length).toBe(1);
    expect(model.errors[0].includes('Modified date')).toBe(true);
  });

  it('isValid should return false when the created date is not a Date', async () => {
    const createdById = casual.integer(1, 999);
    const model = new MySqlModel(null, new Date().toISOString(), createdById);

    model.created = '2456247dgerg';
    expect(await model.isValid()).toBe(false);
    expect(model.errors.length).toBe(1);
    expect(model.errors[0].includes('Created date')).toBe(true);
  });

  it('isValid should return false when the createdById is null', async () => {
    const createdById = casual.integer(1, 999);
    const model = new MySqlModel(null, new Date().toISOString(), createdById);

    model.createdById = null;
    expect(await model.isValid()).toBe(false);
    expect(model.errors.length).toBe(1);
    expect(model.errors[0].includes('Created by')).toBe(true);
  });

  it('isValid should return false when the modifiedById is null', async () => {
    const createdById = casual.integer(1, 999);
    const model = new MySqlModel(null, new Date().toISOString(), createdById);

    model.modifiedById = null;
    expect(await model.isValid()).toBe(false);
    expect(model.errors.length).toBe(1);
    expect(model.errors[0].includes('Modified by')).toBe(true);
  });

  it('isValid should return true when the id is null', async () => {
    const createdById = casual.integer(1, 999);
    const model = new MySqlModel(null, new Date().toISOString(), createdById);

    model.id = null;
    expect(await model.isValid()).toBe(true);
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
  let mockDebug;
  let mockError;
  let context;
  let logger;

  beforeEach(() => {
    jest.resetAllMocks();

    // Cast getInstance to a jest.Mock type to use mockReturnValue
    (MySQLDataSource.getInstance as jest.Mock).mockReturnValue({
      query: jest.fn(), // Initialize the query mock function here
    });

    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
    logger = mockLogger;
    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;
    context = { logger, dataSources: { sqlDataSource: { query: mockQuery } } };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('query returns an array and logs the event', async () => {
    mockQuery.mockResolvedValueOnce(['test']);
    const sql = 'SELECT * FROM tests WHERE field = ?';
    const result = await MySqlModel.query(context, sql, ['1'], 'Testing');
    expect(mockDebug).toHaveBeenCalledTimes(1);
    expect(mockDebug).toHaveBeenCalledWith(`Testing, sql: ${sql}, vals: 1`);
    expect(result).toEqual(['test']);
  });

  it('query can be called without a values array or reference string', async () => {
    mockQuery.mockResolvedValueOnce([]);
    const sql = 'SELECT * FROM tests WHERE field = ?';
    const result = await MySqlModel.query(context, sql,);
    expect(mockDebug).toHaveBeenCalledTimes(1);
    expect(mockDebug).toHaveBeenCalledWith(`undefined caller, sql: ${sql}, vals: `);
    expect(result).toEqual([]);
  });

  it('query returns an empty array if an error occurs and logs the error', async () => {
    mockQuery.mockImplementation(() => {
      throw new Error('Testing error handler');
    });
    const sql = 'SELECT * FROM tests WHERE field = ?';
    const result = await MySqlModel.query(context, sql, ['123'], 'testing failure');
    expect(mockDebug).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockDebug).toHaveBeenCalledWith(`testing failure, sql: ${sql}, vals: 123`);
    expect(mockError).toHaveBeenCalledWith(`testing failure, ERROR: Testing error handler`);
    expect(result).toEqual([]);
  });

  it('query returns an empty array if an error occurs and logs the error if no context is provided', async () => {
    mockQuery.mockImplementation(() => {
      throw new Error('Testing error handler');
    });
    const sql = 'SELECT * FROM tests WHERE field = ?';
    context.dataSources = null;
    const result = await MySqlModel.query(context, sql, ['123'], 'testing failure');
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(`testing failure, ERROR: apolloContext and sqlStatement are required.`);
    expect(result).toEqual([]);
  });
});

describe('insert function', () => {
  let mockQuery;
  let localQuery;
  let mockDebug;
  let mockError;
  let context;
  let logger;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (MySqlModel.query as jest.Mock) = localQuery;

    // Cast getInstance to a jest.Mock type to use mockReturnValue
    (MySQLDataSource.getInstance as jest.Mock).mockReturnValue({
      query: jest.fn(), // Initialize the query mock function here
    });

    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
    logger = mockLogger;
    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;
    context = { logger, dataSources: { sqlDataSource: { query: mockQuery } } };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('query returns the new item\'s id', async () => {
    const options = {
      createdById: casual.integer(1, 99),

      testA: casual.sentence,
      testB: casual.integer(1, 999),
      testC: [casual.sentence, casual.word],
      testD: casual.boolean,
      testZ: casual.words(3),
    }
    const table = casual.word;
    const obj = new TestImplementation(options);

    const id = casual.integer(1, 9999);
    localQuery.mockResolvedValueOnce([{ insertId: id }]);

    const result = await MySqlModel.insert(context, table, obj, 'Testing');
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith();
    expect(result).toEqual(id);
  });
});

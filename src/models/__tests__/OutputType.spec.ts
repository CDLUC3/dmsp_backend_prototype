import casual from 'casual';
import { OutputType } from '../OutputType';
import { buildContext, mockToken } from '../../__mocks__/context';
import { logger } from '../../__mocks__/logger';

describe('OutputType', () => {
  it('constructor should initialize as expected', () => {
    const name = casual.words(2);
    const uri = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new OutputType({ name, uri, createdById });

    expect(role.name).toEqual(name);
    expect(role.uri).toEqual(uri);
    expect(role.description).toBeFalsy();
    expect(role.createdById).toEqual(createdById);
  });

  it('isValid returns true when the name and url are present', async () => {
    const name = casual.words(3);
    const uri = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new OutputType({ name, uri, createdById });
    expect(await role.isValid()).toBe(true);
  });

  it('isValid returns false when the label is NOT present', async () => {
    const uri = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new OutputType({ uri, createdById });
    expect(await role.isValid()).toBe(false);
    expect(role.errors.length).toBe(1);
    expect(role.errors[0].includes('Name')).toBe(true);
  });

  it('isValid returns false when the uri is NOT present', async () => {
    const name = casual.words(3);
    const createdById = casual.integer(1, 999);

    const role = new OutputType({ name, createdById });
    expect(await role.isValid()).toBe(false);
    expect(role.errors.length).toBe(1);
    expect(role.errors[0].includes('URL')).toBe(true);
  });
});

describe('queries', () => {
  const originalQuery = OutputType.query;
  let mockQuery;
  let context;
  let mockType;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQuery = jest.fn();
    (OutputType.insert as jest.Mock) = mockQuery;

    context = buildContext(logger, mockToken());

    mockType = {
      id: casual.integer(1, 99),
      name: casual.word,
      uri: casual.url
    };
  });

  afterEach(() => {
    OutputType.query = originalQuery;
  });

  it('all performs the expected query', async () => {
    const querySpy = jest.spyOn(OutputType, 'query').mockResolvedValueOnce([mockType]);
    await OutputType.all('Testing', context);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const expectedSql = 'SELECT * FROM outputTypes ORDER BY name';
    expect(querySpy).toHaveBeenLastCalledWith(context, expectedSql, [], 'Testing')
  });

  it('findById performs the expected query', async () => {
    const typeId = casual.integer(1, 999);
    const querySpy = jest.spyOn(OutputType, 'query').mockResolvedValueOnce([mockType]);
    await OutputType.findById('Testing', context, typeId);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const expectedSql = 'SELECT * FROM outputTypes WHERE id = ?';
    expect(querySpy).toHaveBeenLastCalledWith(context, expectedSql, [typeId.toString()], 'Testing')
  });

  it('findByURL performs the expected query', async () => {
    const uri = casual.url;
    const querySpy = jest.spyOn(OutputType, 'query').mockResolvedValueOnce([mockType]);
    await OutputType.findByURL('Testing', context, uri);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const expectedSql = 'SELECT * FROM outputTypes WHERE url = ?';
    expect(querySpy).toHaveBeenLastCalledWith(context, expectedSql, [uri], 'Testing')
  });
});

import casual from 'casual';
import { ContributorRole } from '../ContributorRole';
import { buildContext, mockToken } from '../../__mocks__/context';
import { logger } from '../../__mocks__/logger';

describe('ContributorRole', () => {
  it('constructor should initialize as expected', () => {
    const displayOrder = casual.integer(1, 9);
    const label = casual.words(3);
    const url = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ displayOrder, label, url, createdById });

    expect(role.displayOrder).toEqual(displayOrder);
    expect(role.label).toEqual(label);
    expect(role.url).toEqual(url);
    expect(role.description).toBeFalsy();
    expect(role.createdById).toEqual(createdById);
  });

  it('isValid returns true when the displayOrder, label and url are present', async () => {
    const displayOrder = casual.integer(1, 9);
    const label = casual.words(3);
    const url = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ displayOrder, label, url, createdById });
    expect(await role.isValid()).toBe(true);
  });

  it('isValid returns false when the displayOrder is NOT present', async () => {
    const label = casual.words(3);
    const url = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ label, url, createdById });
    expect(await role.isValid()).toBe(false);
    expect(role.errors.length).toBe(1);
    expect(role.errors[0].includes('Display order')).toBe(true);
  });

  it('isValid returns false when the label is NOT present', async () => {
    const displayOrder = casual.integer(1, 9);
    const url = casual.url;
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ displayOrder, url, createdById });
    expect(await role.isValid()).toBe(false);
    expect(role.errors.length).toBe(1);
    expect(role.errors[0].includes('Label')).toBe(true);
  });

  it('isValid returns false when the url is NOT present', async () => {
    const displayOrder = casual.integer(1, 9);
    const label = casual.words(3);
    const createdById = casual.integer(1, 999);

    const role = new ContributorRole({ displayOrder, label, createdById });
    expect(await role.isValid()).toBe(false);
    expect(role.errors.length).toBe(1);
    expect(role.errors[0].includes('URL')).toBe(true);
  });
});

describe('queries', () => {
  const originalQuery = ContributorRole.query;
  let mockQuery;
  let context;
  let mockRole;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQuery = jest.fn();
    (ContributorRole.insert as jest.Mock) = mockQuery;

    context = buildContext(logger, mockToken());

    mockRole = {
      id: casual.integer(1, 99),
      label: casual.word,
      url: casual.url
    };
  });

  afterEach(() => {
    ContributorRole.query = originalQuery;
  });

  it('all performs the expected query', async () => {
    const querySpy = jest.spyOn(ContributorRole, 'query').mockResolvedValueOnce([mockRole]);
    await ContributorRole.all('Testing', context);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const expectedSql = 'SELECT * FROM contributorRoles ORDER BY label';
    expect(querySpy).toHaveBeenLastCalledWith(context, expectedSql, [], 'Testing')
  });

  it('findById performs the expected query', async () => {
    const contributorRoleId = casual.integer(1, 999);
    const querySpy = jest.spyOn(ContributorRole, 'query').mockResolvedValueOnce([mockRole]);
    await ContributorRole.findById('Testing', context, contributorRoleId);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const expectedSql = 'SELECT * FROM contributorRoles WHERE id = ?';
    expect(querySpy).toHaveBeenLastCalledWith(context, expectedSql, [contributorRoleId.toString()], 'Testing')
  });

  it('findByURL performs the expected query', async () => {
    const contributorRoleUrl = casual.url;
    const querySpy = jest.spyOn(ContributorRole, 'query').mockResolvedValueOnce([mockRole]);
    await ContributorRole.findByURL('Testing', context, contributorRoleUrl);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const expectedSql = 'SELECT * FROM contributorRoles WHERE url = ?';
    expect(querySpy).toHaveBeenLastCalledWith(context, expectedSql, [contributorRoleUrl], 'Testing')
  });

  it('findByProjectContributorId should call query with correct params and return an array', async () => {
    const querySpy = jest.spyOn(ContributorRole, 'query');
    const contributorId = casual.integer(1, 999);
    await ContributorRole.findByProjectContributorId('testing', context, contributorId);
    let sql = 'SELECT cr.* FROM projectContributorRoles pcr INNER JOIN contributorRoles cr ON pcr.contributorRoleId = cr.id';
    sql = `${sql} WHERE pcr.projectContributorId = ?`;
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(context, sql, [contributorId.toString()], 'testing');
  });
});

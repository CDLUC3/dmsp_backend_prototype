import casual from "casual";
import { Affiliation, AffiliationSearch } from "../Affiliation";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";

let context;
jest.mock('../../context.ts');

describe('Affiliation', () => {
  let affiliation;
  const affiliationData = {
    uri: 'https://ror.org/01234',
    active: true,
    provenance: 'ROR',
    name: 'University of Virginia',
    displayName: 'University of Virginia (virginia.edu)',
    searchName: 'University of Virginia | virginia.edu | UVA ',
    funder: 1,
    fundrefId: 1000001234,
    homepage: 'http://www.virginia.edu/',
    acronyms: ["UVA"],
    aliases: [],
    types: ["Education"],
    contactName: 'Data Management Consulting Group',
    contactEmail: 'admin@virginia.edu',
    ssoEntityId: 'entity:virginia.edu',
    feedbackEnabled: 1,
    feedbackMessage: '<p>Will response to your request within 48 hours</p>',
    feedbackEmails: ["admin@virginia.edu"],
    managed: 1,
  }
  beforeEach(() => {
    affiliation = new Affiliation(affiliationData);
  });

  it('should initialize options as expected', () => {
    expect(affiliation.uri).toEqual(affiliationData.uri);
    expect(affiliation.active).toEqual(affiliationData.active);
    expect(affiliation.provenance).toEqual(affiliationData.provenance);
    expect(affiliation.name).toEqual(affiliationData.name);
    expect(affiliation.displayName).toEqual(affiliationData.displayName);
    expect(affiliation.searchName).toEqual(affiliationData.searchName);
    expect(affiliation.funder).toEqual(affiliationData.funder);
    expect(affiliation.fundrefId).toEqual(affiliationData.fundrefId);
    expect(affiliation.homepage).toEqual(affiliationData.homepage);
    expect(affiliation.acronyms).toEqual(affiliationData.acronyms);
    expect(affiliation.aliases).toEqual(affiliationData.aliases);
    expect(affiliation.types).toEqual(affiliationData.types);
    expect(affiliation.contactName).toEqual(affiliationData.contactName);
    expect(affiliation.contactEmail).toEqual(affiliationData.contactEmail);
    expect(affiliation.ssoEntityId).toEqual(affiliationData.ssoEntityId);
    expect(affiliation.feedbackEnabled).toEqual(affiliationData.feedbackEnabled);
    expect(affiliation.feedbackMessage).toEqual(affiliationData.feedbackMessage);
    expect(affiliation.feedbackEmails).toEqual(affiliationData.feedbackEmails);
    expect(affiliation.managed).toEqual(affiliationData.managed);
  });

  it('should add additional properties to uneditableProperties if provenance is ROR', async () => {
    expect(await affiliation.uneditableProperties).toEqual(['uri', 'provenance', 'searchName', 'name', 'funder', 'fundrefId', 'homepage', 'acronyms', 'aliases', 'types']);
  });
});

describe('create', () => {
  const originalInsert = Affiliation.insert;
  const originalFindById = Affiliation.findById;
  const originalFindByURI = Affiliation.findByURI;
  let insertQuery;
  let affiliation;

  beforeEach(() => {
    // jest.resetAllMocks();

    insertQuery = jest.fn();
    (Affiliation.insert as jest.Mock) = insertQuery;

    affiliation = new Affiliation({
      uri: 'https://ror.org/01234',
      active: true,
      provenance: 'ROR',
      name: 'University of Virginia',
      displayName: 'University of Virginia (virginia.edu)',
      searchName: 'University of Virginia | virginia.edu | UVA ',
      funder: 1,
      fundrefId: 1000001234,
      homepage: 'http://www.virginia.edu/',
      acronyms: ["UVA"],
      aliases: [],
      types: ["Education"],
      contactName: 'Data Management Consulting Group',
      contactEmail: 'admin@virginia.edu',
      ssoEntityId: 'entity:virginia.edu',
      feedbackEnabled: 1,
      feedbackMessage: '<p>Will response to your request within 48 hours</p>',
      feedbackEmails: ["admin@virginia.edu"],
      managed: 1,
    })
  });

  afterEach(() => {
    // jest.resetAllMocks();
    Affiliation.insert = originalInsert;
    Affiliation.findById = originalFindById;
    Affiliation.findByURI = originalFindByURI;
  });

  it('should return the newly added Affiliation', async () => {
    const mockFindByURI = jest.fn();
    (Affiliation.findByURI as jest.Mock) = mockFindByURI;
    mockFindByURI.mockResolvedValue(false);

    const mockFindById = jest.fn();
    (Affiliation.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(affiliation);

    const result = await affiliation.create(context);
    expect(mockFindByURI).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(affiliation);
  });

  it('should add an error if affiliation already exists', async () => {
    const mockFindByURI = jest.fn();
    (Affiliation.findByURI as jest.Mock) = mockFindByURI;
    mockFindByURI.mockResolvedValue(true);

    const mockFindById = jest.fn();
    (Affiliation.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(affiliation);

    const result = await affiliation.create(context);
    expect(affiliation.errors).toContain('That Affiliation already exists')
  });
});

describe('update', () => {
  const originalUpdate = Affiliation.update;
  let updateQuery;
  let affiliation;

  beforeEach(() => {
    // jest.resetAllMocks();

    affiliation = new Affiliation({
      uri: 'https://ror.org/01234',
      active: true,
      provenance: 'ROR',
      name: 'University of Virginia',
      displayName: 'University of Virginia (virginia.edu)',
      searchName: 'University of Virginia | virginia.edu | UVA ',
      funder: 1,
      fundrefId: 1000001234,
      homepage: 'http://www.virginia.edu/',
      acronyms: ["UVA"],
      aliases: [],
      types: ["Education"],
      contactName: 'Data Management Consulting Group',
      contactEmail: 'admin@virginia.edu',
      ssoEntityId: 'entity:virginia.edu',
      feedbackEnabled: 1,
      feedbackMessage: '<p>Will response to your request within 48 hours</p>',
      feedbackEmails: ["admin@virginia.edu"],
      managed: 1,
    })
    updateQuery = jest.fn().mockResolvedValue(affiliation);
    (Affiliation.update as jest.Mock) = updateQuery;
  });

  afterEach(() => {
    // jest.resetAllMocks();
    Affiliation.update = originalUpdate;
  });

  it('should return Affiliation with no errors if affiliation is valid', async () => {
    const localValidator = jest.fn();
    (affiliation.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    expect(await affiliation.update(context)).toBe(affiliation);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(affiliation.errors).not.toContain('The affiliation is not valid')
  });

  it('should set an error if there is no uri in the affiliation data', async () => {
    affiliation = new Affiliation({
      active: true,
      provenance: 'ROR',
      name: 'University of Virginia',
      displayName: 'University of Virginia (virginia.edu)',
      searchName: 'University of Virginia | virginia.edu | UVA ',
    });

    const localValidator = jest.fn();
    (affiliation.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    expect(await affiliation.update(context)).toBe(affiliation);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(affiliation.errors).toContain('Affiliation has never been saved');
  })
});

describe('delete', () => {
  const originalDelete = Affiliation.delete;
  let deleteQuery;
  let affiliation;

  beforeEach(() => {
    // jest.resetAllMocks();

    affiliation = new Affiliation({
      id: casual.integer(1, 99),
      uri: 'http://test.com',
      createdById: casual.integer(1, 999),
      ownerId: casual.url,
      name: casual.sentence,
    });
    deleteQuery = jest.fn().mockResolvedValue(affiliation);
    (Affiliation.delete as jest.Mock) = deleteQuery;
  });

  afterEach(() => {
    // jest.resetAllMocks();
    Affiliation.delete = originalDelete;
  });

  it('should return Affiliation if there is uri data', async () => {
    expect(await affiliation.delete(context)).toBe(affiliation);
    expect(affiliation.errors.length).toBe(0);
  });

  it('should return null if there is no uri data', async () => {
    affiliation = new Affiliation({
      id: casual.integer(1, 99),
      createdById: casual.integer(1, 999),
      ownerId: casual.url,
      name: casual.sentence,
    });

    expect(await affiliation.delete(context)).toBe(null);
  })
});

describe('findById', () => {
  const originalQuery = Affiliation.query;

  let localQuery;
  let context;
  let affiliation;

  beforeEach(() => {
    jest.clearAllMocks();

    context = buildContext(logger, mockToken());

    affiliation = new Affiliation({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      name: casual.sentence,
      ownerId: casual.url,
    })

    localQuery = jest.fn();
    (Affiliation.query as jest.Mock) = localQuery;
  });

  afterEach(() => {
    jest.resetAllMocks();
    Affiliation.query = originalQuery;
  });

  it('should return the Affiliation when findById gets a result', async () => {
    localQuery.mockResolvedValueOnce([affiliation]);

    const id = affiliation.id;
    const result = await Affiliation.findById('Test', context, affiliation.id);
    const expectedSql = 'SELECT * FROM affiliations WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'Test')
    expect(result).toEqual(affiliation);
  });

  it('should return null when findById has no results', async () => {
    localQuery.mockResolvedValueOnce([]);

    const id = affiliation.id;
    const result = await Affiliation.findById('Test', context, affiliation.id);
    expect(result).toEqual(null);
  });
});

describe('findByURI', () => {
  const originalQuery = Affiliation.query;

  let localQuery;
  let context;
  let affiliation;

  beforeEach(() => {
    jest.clearAllMocks();

    context = buildContext(logger, mockToken());

    affiliation = new Affiliation({
      id: casual.integer(1, 9),
      uri: 'http://test.com',
      createdById: casual.integer(1, 999),
      name: casual.sentence,
      ownerId: casual.url,
    })

    localQuery = jest.fn();
    (Affiliation.query as jest.Mock) = localQuery;
  });

  afterEach(() => {
    jest.resetAllMocks();
    Affiliation.query = originalQuery;
  });

  it('should return the Affiliation when findByURI gets a result', async () => {
    localQuery.mockResolvedValueOnce([affiliation]);

    const id = affiliation.uri;
    const result = await Affiliation.findByURI('Test', context, affiliation.uri);
    const expectedSql = 'SELECT * FROM affiliations WHERE uri = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id], 'Test')
    expect(result).toEqual(affiliation);
  });

  it('should return null when findByURI has no results', async () => {
    localQuery.mockResolvedValueOnce([]);

    const id = affiliation.id;
    const result = await Affiliation.findByURI('Test', context, affiliation.id);
    expect(result).toEqual(null);
  });
});

describe('AffiliationSearch', () => {
  let affiliationSearch;

  const affiliationSearchData = new AffiliationSearch({
    id: casual.integer(1, 9),
    uri: 'https://ror.org/01234',
    displayName: 'University of Virginia (virginia.edu)',
    funder: 1,
    types: ["Education"],
  });
  beforeEach(() => {
    affiliationSearch = new AffiliationSearch(affiliationSearchData);
  });

  it('should initialize AffiliationSerach options as expected', () => {
    expect(affiliationSearch.uri).toEqual(affiliationSearchData.uri);
    expect(affiliationSearch.id).toEqual(affiliationSearchData.id);
    expect(affiliationSearch.displayName).toEqual(affiliationSearchData.displayName);
    expect(affiliationSearch.funder).toEqual(affiliationSearchData.funder);
    expect(affiliationSearch.types).toEqual(affiliationSearchData.types);
  });
});

describe('search', () => {
  const originalQuery = Affiliation.query;

  let localQuery;
  let context;
  let affiliationSearch;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (Affiliation.query as jest.Mock) = localQuery;

    context = buildContext(logger, mockToken());

    affiliationSearch = new AffiliationSearch({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      name: casual.sentence,
      ownerId: casual.url,
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    Affiliation.query = originalQuery;
  });

  it('should call query with correct params and return the affiliation', async () => {
    localQuery.mockResolvedValueOnce([affiliationSearch]);
    const templateId = 1;
    const result = await AffiliationSearch.search(context, { name: 'test', funderOnly: true });
    const expectedSql = 'SELECT * FROM affiliations WHERE active = 1 AND LOWER(searchName) LIKE ? AND funder = 1';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, ['%test%'], 'AffiliationSearch.search')
    expect(result).toEqual([affiliationSearch]);
  });

  it('should return an empty array if it finds no affiliation', async () => {
    localQuery.mockResolvedValueOnce([]);
    const templateId = 1;
    const result = await AffiliationSearch.search(context, { name: 'test', funderOnly: true });
    expect(result).toEqual([]);
  });
});


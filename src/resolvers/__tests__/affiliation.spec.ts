import casual from "casual";
import {ApolloServer} from "@apollo/server";
import assert from "assert";
import {buildContext, MyContext} from "../../context";
import {logger} from "../../__mocks__/logger";
import {JWTAccessToken} from "../../services/tokenService";
import {User, UserRole} from "../../models/User";
import {
  Affiliation,
  AffiliationProvenance,
  AffiliationSearch,
  AffiliationType,
  DEFAULT_DMPTOOL_AFFILIATION_URL,
} from "../../models/Affiliation";
import {
  cleanUpAddedAffiliation,
  mockAffiliation,
  persistAffiliation,
  randomAffiliation
} from "../../models/__mocks__/Affiliation";
import {
  executeQuery,
  initErrorMessage,
  initTestServer,
  mockToken
} from "./resolverTestHelper";
import { cleanUpAddedUser, mockUser, persistUser } from "../../models/__mocks__/User";
import {MySQLConnection} from "../../datasources/mysql";
import {getRandomEnumValue} from "../../__tests__/helpers";
import {formatISO9075} from "date-fns";

jest.mock("../../datasources/dmphubAPI");

let mysqlInstance: MySQLConnection;
let testServer: ApolloServer;
let context: MyContext;
let researcher: User;
let researcherToken: JWTAccessToken;
let affiliations: Affiliation[];

let query: string;

beforeEach(async () => {
  jest.clearAllMocks();

  try {
    // Initialize the mysql connection pool
    mysqlInstance = new MySQLConnection();
    // Ensure the pool has finished initializing
    await mysqlInstance.initPromise;

    // Initialize the Apollo server
    testServer = initTestServer();
    await testServer.start();
  } catch (err) {
    console.error(initErrorMessage, err);
    process.exit(1);
  }

  // Build out the Apollo context
  context = buildContext(logger, null, null, mysqlInstance, null);

  // Get a random affiliation because a User needs one
  const initialAffiliation = await randomAffiliation(context);

  // Generate a researcher and a token
  const user = mockUser({
    affiliationId: initialAffiliation.uri,
    role: UserRole.RESEARCHER
  });
  researcher = await persistUser(context, user);
  researcherToken = mockToken(researcher);

  // Attach the researcher token to the Apollo context
  context.token = researcherToken;
});

afterEach(async () => {
  try {
    // Delete all the DB records that were persisted during the tests
    await cleanUpAddedUser(context, researcher.id);

    // Close the mysql connection pool
    await mysqlInstance.close();

    // Shutdown the test server
    await testServer.stop();
  } catch (err) {
    console.error('Error cleaning up after tests', err);
    process.exit(1);
  }
});

describe('affiliationTypes query', () => {
  beforeEach(async () => {
    // Persist some test Affiliations
    affiliations = [];
    for (let i = 0; i < 3; i++) {
      const affiliation = mockAffiliation({});
      const persistedAffiliation = await persistAffiliation(context, affiliation);
      affiliations.push(persistedAffiliation);
    }

    query = `
      query AffiliationTypes {
        affiliationTypes
      }
    `;
  });

  afterEach(async () => {
    for (const affiliation of affiliations) {
      await cleanUpAddedAffiliation(context, affiliation.id);
    }
  });

  it('returns the expected affiliation types', async () => {
    const resp = await executeQuery(testServer, context, query, {});

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliationTypes).toBeDefined();
    expect(resp.body.singleResult.data?.affiliationTypes.length).toBeGreaterThan(0);
    expect(resp.body.singleResult.data?.affiliationTypes).toContain(AffiliationType.EDUCATION);
  });
});


describe('affiliationById query', () => {
  beforeEach(async () => {
    // Persist some test Affiliations
    affiliations = [];
    for (let i = 0; i < 3; i++) {
      const affiliation = mockAffiliation({});
      const persistedAffiliation = await persistAffiliation(context, affiliation);
      affiliations.push(persistedAffiliation);
    }

    query = `
      query AffiliationById($affiliationId: Int!) {
        affiliationById (affiliationId: $affiliationId) {
          id
          createdById
          created
          modifiedById
          modified

          name
          uri
          funder
          types
          displayName
          searchName
          provenance
          homepage
          acronyms
          aliases
          fundrefId
          active

          managed
          logoURI
          logoName
          contactEmail
          contactName
          ssoEntityId
          feedbackEnabled
          feedbackMessage
          feedbackEmails
          apiTarget
        }
      }
    `;
  });

  afterEach(async () => {
    for (const affiliation of affiliations) {
      await cleanUpAddedAffiliation(context, affiliation.id);
    }
  })

  it('returns the affiliation when successful', async () => {
    const variables = { affiliationId: affiliations[1].id };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();

    // verify all the properties are returned
    expect(resp.body.singleResult.data?.affiliationById?.id).toEqual(affiliations[1].id);
    expect(resp.body.singleResult.data?.affiliationById?.name).toEqual(affiliations[1].name);
    expect(resp.body.singleResult.data?.affiliationById?.uri).toEqual(affiliations[1].uri);
    expect(resp.body.singleResult.data?.affiliationById?.funder).toEqual(Boolean(affiliations[1].funder));
    expect(resp.body.singleResult.data?.affiliationById?.types).toEqual(affiliations[1].types);
    expect(resp.body.singleResult.data?.affiliationById?.displayName).toEqual(affiliations[1].displayName);
    expect(resp.body.singleResult.data?.affiliationById?.searchName).toEqual(affiliations[1].searchName);
    expect(resp.body.singleResult.data?.affiliationById?.provenance).toEqual(affiliations[1].provenance);
    expect(resp.body.singleResult.data?.affiliationById?.homepage).toEqual(affiliations[1].homepage);
    expect(resp.body.singleResult.data?.affiliationById?.acronyms).toEqual(affiliations[1].acronyms);
    expect(resp.body.singleResult.data?.affiliationById?.aliases).toEqual(affiliations[1].aliases);
    expect(resp.body.singleResult.data?.affiliationById?.fundrefId).toEqual(affiliations[1].fundrefId);
    expect(resp.body.singleResult.data?.affiliationById?.active).toEqual(Boolean(affiliations[1].active));

    expect(resp.body.singleResult.data?.affiliationById?.managed).toEqual(Boolean(affiliations[1].managed));
    expect(resp.body.singleResult.data?.affiliationById?.logoURI).toEqual(affiliations[1].logoURI);
    expect(resp.body.singleResult.data?.affiliationById?.logoName).toEqual(affiliations[1].logoName);
    expect(resp.body.singleResult.data?.affiliationById?.contactEmail).toEqual(affiliations[1].contactEmail);
    expect(resp.body.singleResult.data?.affiliationById?.contactName).toEqual(affiliations[1].contactName);
    expect(resp.body.singleResult.data?.affiliationById?.ssoEntityId).toEqual(affiliations[1].ssoEntityId);
    expect(resp.body.singleResult.data?.affiliationById?.feedbackEnabled).toEqual(Boolean(affiliations[1].feedbackEnabled));
    expect(resp.body.singleResult.data?.affiliationById?.feedbackMessage).toEqual(affiliations[1].feedbackMessage);
    expect(resp.body.singleResult.data?.affiliationById?.feedbackEmails).toEqual(affiliations[1].feedbackEmails);
    expect(resp.body.singleResult.data?.affiliationById?.apiTarget).toEqual(affiliations[1].apiTarget);
  });

  it('returns null when no matching record is found', async () => {
    // Use an id that will not match any records
    const variables = { affiliationId: 99999 };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliationById).toBeNull();
  });

  it('returns a 500 when a fatal error occurs', async () => {
    const originalFindById = Affiliation.findById;
    jest.spyOn(Affiliation, 'findById').mockImplementation(() => {
      throw new Error('Error!')
    });

    const variables = { affiliationId: casual.integer(1, 9999) };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.affiliationById).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
    Affiliation.findById = originalFindById;
  });
});

describe('affiliations query', () => {
  beforeEach(async () => {
    // Persist some test Affiliations
    affiliations = [];
    for (let i = 0; i < 3; i++) {
      const affiliation = mockAffiliation({
        name: `Affiliation Query Test ${i}`,
        active: true,
        funder: i === 1
      });
      const persistedAffiliation = await persistAffiliation(context, affiliation);
      affiliations.push(persistedAffiliation);
    }

    query = `
      query Affiliations($name: String!, $funderOnly: Boolean, $paginationOptions: PaginationOptions) {
        affiliations (name: $name, funderOnly: $funderOnly, paginationOptions: $paginationOptions) {
          totalCount
          limit
          nextCursor
          currentOffset
          hasNextPage
          hasPreviousPage
          items {
            id
            uri
            displayName
            funder
            types
            apiTarget
          }
        }
      }
    `;
  });

  afterEach(async () => {
    for (const affiliation of affiliations) {
      await cleanUpAddedAffiliation(context, affiliation.id);
    }
  });

  it('returns the expected affiliations when successful', async () => {
    const variables = { name: affiliations[0].name };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();

    // Since we're not returning everything, verify the fields we are returning
    const affiliation = resp.body.singleResult.data?.affiliations.items[0];
    expect(affiliation?.id).toEqual(affiliations[0].id);
    expect(affiliation?.displayName).toEqual(affiliations[0].displayName);
    expect(affiliation?.uri).toEqual(affiliations[0].uri);
    expect(affiliation?.funder).toEqual(Boolean(affiliations[0].funder));
    expect(affiliation?.types).toEqual(affiliations[0].types);
    expect(affiliation?.apiTarget).toEqual(affiliations[0].apiTarget);
  });

  it('obeys the funderOnly flag', async () => {
    const variables = { name: 'affiliation query test', funderOnly: true };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();

    // Since we're not returning everything, verify the fields we are returning
    expect(resp.body.singleResult.data?.affiliations.items.length).toBe(1);
    expect(resp.body.singleResult.data?.affiliations.items[0].id).toEqual(affiliations[1].id);
  });

  it('handles cursor pagination successfuly', async () => {
    const variables = { name: 'Affiliation Query Test', paginationOptions: { cursor: null, limit: 2 } };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();

    expect(resp.body.singleResult.data?.affiliations.totalCount).toBe(3);
    expect(resp.body.singleResult.data?.affiliations.limit).toBe(2);
    expect(resp.body.singleResult.data?.affiliations.nextCursor).toBeTruthy();
    expect(resp.body.singleResult.data?.affiliations.currentOffset).toBeFalsy();
    expect(resp.body.singleResult.data?.affiliations.hasNextPage).toBeTruthy();
    expect(resp.body.singleResult.data?.affiliations.hasPreviousPage).toBeFalsy();

    const paginatedResults = resp.body.singleResult.data?.affiliations.items ?? [];
    expect(paginatedResults.length).toBe(2);
    expect(paginatedResults[0].id).toEqual(affiliations[0].id);
    expect(paginatedResults[1].id).toEqual(affiliations[1].id);

    // Bump the cursor and query again
    variables.paginationOptions.cursor = resp.body.singleResult.data?.affiliations.nextCursor;
    const resp2 = await executeQuery(testServer, context, query, variables);

    assert(resp2.body.kind === 'single');
    expect(resp2.body.singleResult.errors).toBeUndefined();
    expect(resp2.body.singleResult.data?.affiliations).toBeDefined();

    expect(resp2.body.singleResult.data?.affiliations.totalCount).toBe(3);
    expect(resp2.body.singleResult.data?.affiliations.limit).toBe(2);
    expect(resp2.body.singleResult.data?.affiliations.nextCursor).toBeFalsy();
    expect(resp2.body.singleResult.data?.affiliations.currentOffset).toBeFalsy();
    expect(resp2.body.singleResult.data?.affiliations.hasNextPage).toBeFalsy();
    expect(resp2.body.singleResult.data?.affiliations.hasPreviousPage).toBeFalsy();

    expect(resp2.body.singleResult.data?.affiliations.items.length).toBe(1);
    expect(resp2.body.singleResult.data?.affiliations.items[0].id).toEqual(affiliations[2].id);
  });

  it('handles offset pagination successfuly', async () => {
    const variables = {
      name: 'Affiliation Query Test',
      paginationOptions: { offset: 0, limit: 2, type: 'OFFSET' }
    };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();
    expect(resp.body.singleResult.data?.affiliations.totalCount).toBe(3);
    expect(resp.body.singleResult.data?.affiliations.limit).toBe(2);
    expect(resp.body.singleResult.data?.affiliations.nextCursor).toBeFalsy();
    expect(resp.body.singleResult.data?.affiliations.currentOffset).toBe(0);
    expect(resp.body.singleResult.data?.affiliations.hasNextPage).toBeTruthy();
    expect(resp.body.singleResult.data?.affiliations.hasPreviousPage).toBeFalsy();

    const paginatedResults = resp.body.singleResult.data?.affiliations.items ?? [];
    expect(paginatedResults.length).toBe(2);
    expect(paginatedResults[0].id).toEqual(affiliations[0].id);
    expect(paginatedResults[1].id).toEqual(affiliations[1].id);

    // Bump the cursor and query again
    variables.paginationOptions.offset = resp.body.singleResult.data?.affiliations.currentOffset + 2;
    const resp2 = await executeQuery(testServer, context, query, variables);

    assert(resp2.body.kind === 'single');
    expect(resp2.body.singleResult.errors).toBeUndefined();
    expect(resp2.body.singleResult.data?.affiliations).toBeDefined();

    expect(resp2.body.singleResult.data?.affiliations.totalCount).toBe(3);
    expect(resp2.body.singleResult.data?.affiliations.limit).toBe(2);
    expect(resp2.body.singleResult.data?.affiliations.nextCursor).toBeFalsy();
    expect(resp2.body.singleResult.data?.affiliations.currentOffset).toBe(2);
    expect(resp2.body.singleResult.data?.affiliations.hasNextPage).toBeFalsy();
    expect(resp2.body.singleResult.data?.affiliations.hasPreviousPage).toBeTruthy();

    expect(resp2.body.singleResult.data?.affiliations.items.length).toBe(1);
    expect(resp2.body.singleResult.data?.affiliations.items[0].id).toEqual(affiliations[2].id);
  });

  it('returns an empty array when no matches are found', async () => {
    // Use a series of number since it will never match one of the names
    const variables = { name: '1234567890' };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();
    expect(resp.body.singleResult.data.affiliations[0]).toEqual(undefined);
  });

  it('returns a 500 when a fatal error occurs', async () => {
    const originalSearch = AffiliationSearch.search;
    jest.spyOn(AffiliationSearch, 'search').mockImplementation(() => {
      throw new Error('Error!')
    });

    const variables = { name: casual.company_name };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data).toBeDefined();
    expect(resp.body.singleResult.data.affiliations).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
    AffiliationSearch.search = originalSearch;
  });
});

describe('affiliationByURI query', () => {
  beforeEach(async () => {
    // Persist a test Affiliation
    affiliations = [];
    const persistedAffiliation = await persistAffiliation(context,  mockAffiliation({}));
    affiliations.push(persistedAffiliation);

    query = `
      query affiliationByURI($uri: String!) {
        affiliationByURI (uri: $uri) {
          id
          name
          uri
        }
      }
    `;
  });

  afterEach(async () => {
    for (const affiliation of affiliations) {
      await cleanUpAddedAffiliation(context, affiliation.id);
    }
  });

  it('returns the affiliation when successful', async () => {
    const variables = { uri: affiliations[0].uri };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();

    // Since we're not returning everything, verify the fields we are returning
    expect(resp.body.singleResult.data?.affiliationByURI?.id).toEqual(affiliations[0].id);
    expect(resp.body.singleResult.data?.affiliationByURI?.name).toEqual(affiliations[0].name);
    expect(resp.body.singleResult.data?.affiliationByURI?.uri).toEqual(affiliations[0].uri);
  });

  it('returns null when no matching record is found', async () => {
    // Use a word since it will never match one of the URLs
    const variables = { uri: casual.word };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliationByURI).toBeNull();
  });

  it('returns a 500 when a fatal error occurs', async () => {
    const originalfindURI = Affiliation.findByURI;
    jest.spyOn(Affiliation, 'findByURI').mockImplementation(() => {
      throw new Error('Error!')
    });

    const variables = { uri: casual.url };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.affiliationByURI).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
    Affiliation.findByURI = originalfindURI;
  });
});

describe('addAffiliation mutation', () => {
  beforeEach(async () => {
    // Persist a test Affiliation
    affiliations = [];
    const persistedAffiliation = await persistAffiliation(context,  mockAffiliation({}));
    affiliations.push(persistedAffiliation);

    query = `
      mutation AddAffiliation($input: AffiliationInput!) {
        addAffiliation (input: $input) {
          id
          createdById
          created
          modifiedById
          modified
          errors {
            general
            uri
          }

          uri
          name
          searchName
          displayName
          acronyms
          aliases
          types
          provenance
          managed
          feedbackEnabled
          feedbackEmails
        }
      }
    `;
  });

  afterEach(async () => {
    for (const affiliation of affiliations) {
      await cleanUpAddedAffiliation(context, affiliation.id);
    }
  });

  it('creates a new affiliation when input is valid', async () => {
    const variables = {
      input: {
        name: `TEST - ${casual.company_name} - ${casual.integer(1, 9999)}`,
      },
    };

    const originalRecordCount = affiliations.length;
    const resp = await executeQuery(testServer, context, query, variables);
    // Put the newly added record into the array so we can clean it up afterward!
    affiliations.push(resp.body.singleResult.data?.addAffiliation);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeDefined();
    expect(affiliations.length).toEqual(originalRecordCount + 1);
    expect(resp.body.singleResult.data?.addAffiliation?.id).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.name).toEqual(variables.input.name);
    expect(resp.body.singleResult.data?.addAffiliation?.uri).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.provenance).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.searchName).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.displayName).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.acronyms).toEqual([]);
    expect(resp.body.singleResult.data?.addAffiliation?.aliases).toEqual([]);
    expect(resp.body.singleResult.data?.addAffiliation?.types).toEqual(['OTHER']);
    expect(resp.body.singleResult.data?.addAffiliation?.managed).toBeFalsy();
    expect(resp.body.singleResult.data?.addAffiliation?.feedbackEnabled).toBeFalsy();
    expect(resp.body.singleResult.data?.addAffiliation?.feedbackEmails).toEqual([]);
    expect(resp.body.singleResult.data?.addAffiliation?.createdById).toEqual(researcherToken.id);
    expect(resp.body.singleResult.data?.addAffiliation?.created).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.modifiedById).toEqual(researcherToken.id);
    expect(resp.body.singleResult.data?.addAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.errors?.general).toBeNull();
  });

  it('returns the existing affiliation with field level errors if it\'s a duplicate by the URI', async () => {
    const variables = {
      input: {
        name: casual.company_name,
        uri: affiliations[0].uri,
      },
    };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.id).toEqual(affiliations[0].id);
    expect(resp.body.singleResult.data?.addAffiliation?.name).toEqual(affiliations[0].name);
    expect(resp.body.singleResult.data?.addAffiliation?.modified).toBeDefined();
    // Verify the errors
    expect(resp.body.singleResult.data?.addAffiliation?.errors?.general).toBeDefined();
  });

  it('returns the existing affiliation with field level errors if it\'s a duplicate by the name', async () => {
    const variables = {
      input: {
        name: affiliations[0].name.toUpperCase(),
      },
    };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.id).toEqual(affiliations[0].id);
    expect(resp.body.singleResult.data?.addAffiliation?.name).toEqual(affiliations[0].name);
    // Verify the errors
    expect(resp.body.singleResult.data?.addAffiliation?.errors?.general).toBeDefined();
  });

  it('returns the affiliation with field level errors if it\'s invalid', async () => {
    const variables = {
      input: {
        name: casual.company_name,
        uri: '1234567890',
      },
    };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.id).toBeNull();
    expect(resp.body.singleResult.data?.addAffiliation?.name).toEqual(variables.input.name);
    // Verify the errors
    expect(resp.body.singleResult.data?.addAffiliation?.errors?.uri).toBeDefined();
  });

  it('returns a 500 when a fatal error occurs', async () => {
    const originalInsert = Affiliation.insert;
    jest.spyOn(Affiliation, 'insert').mockImplementation(() => {
      throw new Error('Error!')
    });

    const variables = {
      input: {
        name: 'Error Affiliation',
      },
    };
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
    Affiliation.insert = originalInsert;
  });
});

describe('updateAffiliation mutation', () => {
  beforeEach(async () => {
    // Persist a test Affiliation
    affiliations = [];
    const persistedAffiliation = await persistAffiliation(context,  mockAffiliation({}));
    affiliations.push(persistedAffiliation);

    query = `
      mutation UpdateAffiliation($input: AffiliationInput!) {
        updateAffiliation (input: $input) {
          id
          createdById
          created
          modifiedById
          modified
          errors {
            general
            uri
          }

          uri
          provenance
          name
          searchName
          displayName
          acronyms
          aliases
          types
          homepage
          funder
          fundrefId
          active
          managed
          contactEmail
          contactName
          ssoEntityId
          logoURI
          logoName
          feedbackEnabled
          feedbackMessage
          feedbackEmails
        }
      }
    `;
  });

  afterEach(async () => {
    for (const affiliation of affiliations) {
      await cleanUpAddedAffiliation(context, affiliation.id);
    }
  });

  it('allows a Super Admin to update other affiliations', async () => {
    // Make sure it's a DMP Tool managed affiliation
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.ROR
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);
    const originalRecord = { ...affiliations[1] };
    // Store the original record count and first record for comparison after the mutation occurs
    const originalRecordCount = affiliations.length;

    // Update a couple of fields and ensure the rest remain unchanged
    const variables = {
      input: {
        id: affiliations[1].id,
        name: `TEST - ${affiliations[1].name} - ${casual.integer(1, 9999)}`,

        uri: `${affiliations[1].uri}/TEST`,
        displayName: `TEST - ${casual.company_name} - ${casual.integer(1, 9999)}`,
        managed: true
      },
    };
    context.token.role = UserRole.SUPERADMIN;
    context.token.affiliationId = casual.url;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(affiliations.length).toEqual(originalRecordCount);
    // Verify fields that should not have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(originalRecord.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.uri).toEqual(originalRecord.uri);
    expect(resp.body.singleResult.data?.updateAffiliation?.name).toEqual(originalRecord.name);

    // Verify fields that should have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.displayName).toEqual(variables.input.displayName);
    expect(resp.body.singleResult.data?.updateAffiliation?.managed).toEqual(variables.input.managed);
    expect(resp.body.singleResult.data?.updateAffiliation?.modifiedById).toEqual(context.token.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeNull();
  });

  it('allows an Admin to update most fields when the affiliation is managed by the DMP Tool', async () => {
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.DMPTOOL
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);

    // Store the original record count and first record for comparison after the mutation occurs
    const originalRecordCount = affiliations.length;
    const originalRecord = { ...persistedAffiliation };

    // Update a couple of fields and ensure the rest remain unchanged
    const variables = {
      input: {
        id: persistedAffiliation.id,

        uri: casual.url,
        name: casual.company_name,
        displayName: casual.company_name,
        funder: true,
        fundrefId: casual.uuid,
        homepage: casual.url,
        acronyms: casual.array_of_words(2),
        aliases: casual.array_of_words(2),
        types: [getRandomEnumValue(AffiliationType)],
        logoURI: casual.url,
        logoName: casual.first_name.toLowerCase(),
        contactEmail: casual.email,
        contactName: casual.name,
        ssoEntityId: casual.uuid,
        feedbackEnabled: true,
        feedbackMessage: casual.sentences(2),
        feedbackEmails: [casual.email],
        managed: true,
        active: true,
      },
    };

    context.token.role = UserRole.ADMIN;
    context.token.affiliationId = persistedAffiliation.uri;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(affiliations.length).toEqual(originalRecordCount);
    // Verify fields that should not have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(originalRecord.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.uri).toEqual(originalRecord.uri);
    expect(resp.body.singleResult.data?.updateAffiliation?.provenance).toEqual(originalRecord.provenance);
    expect(resp.body.singleResult.data?.updateAffiliation?.createdById).toEqual(originalRecord.createdById);
    expect(resp.body.singleResult.data?.updateAffiliation?.created).toEqual(formatISO9075(originalRecord.created));

    // Verify fields that should have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.name).toEqual(variables.input.name);
    expect(resp.body.singleResult.data?.updateAffiliation?.displayName).toEqual(variables.input.displayName);
    expect(resp.body.singleResult.data?.updateAffiliation?.searchName).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.funder).toBe(true);
    expect(resp.body.singleResult.data?.updateAffiliation?.fundrefId).toEqual(variables.input.fundrefId);
    expect(resp.body.singleResult.data?.updateAffiliation?.homepage).toEqual(variables.input.homepage);
    expect(resp.body.singleResult.data?.updateAffiliation?.acronyms).toEqual(variables.input.acronyms);
    expect(resp.body.singleResult.data?.updateAffiliation?.aliases).toEqual(variables.input.aliases);
    expect(resp.body.singleResult.data?.updateAffiliation?.types).toEqual(variables.input.types);
    expect(resp.body.singleResult.data?.updateAffiliation?.logoURI).toEqual(variables.input.logoURI);
    expect(resp.body.singleResult.data?.updateAffiliation?.logoName).toEqual(variables.input.logoName);
    expect(resp.body.singleResult.data?.updateAffiliation?.contactEmail).toEqual(variables.input.contactEmail);
    expect(resp.body.singleResult.data?.updateAffiliation?.contactName).toEqual(variables.input.contactName);
    expect(resp.body.singleResult.data?.updateAffiliation?.ssoEntityId).toEqual(variables.input.ssoEntityId);
    expect(resp.body.singleResult.data?.updateAffiliation?.feedbackEnabled).toEqual(variables.input.feedbackEnabled);
    expect(resp.body.singleResult.data?.updateAffiliation?.feedbackMessage).toEqual(variables.input.feedbackMessage);
    expect(resp.body.singleResult.data?.updateAffiliation?.feedbackEmails).toEqual(variables.input.feedbackEmails);
    expect(resp.body.singleResult.data?.updateAffiliation?.managed).toBe(true);
    expect(resp.body.singleResult.data?.updateAffiliation?.active).toBe(true);
    expect(resp.body.singleResult.data?.updateAffiliation?.modifiedById).toEqual(context.token.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeNull();
  });

  it('does not allow some fields to be modified when the affiliation is NOT managed by the DMP Tool', async () => {
    // Make sure it's NOT a DMP Tool managed affiliation
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.ROR
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);
    const originalRecord = { ...affiliations[1] };
    // Store the original record count and first record for comparison after the mutation occurs
    const originalRecordCount = affiliations.length;

    // Update a couple of fields and ensure the rest remain unchanged
    const variables = {
      input: {
        id: affiliations[1].id,

        uri: casual.url,
        name: casual.company_name,
        displayName: casual.company_name,
        funder: true,
        fundrefId: casual.uuid,
        homepage: casual.url,
        acronyms: casual.array_of_words(2),
        aliases: casual.array_of_words(2),
        types: [getRandomEnumValue(AffiliationType)],
        logoURI: casual.url,
        logoName: casual.first_name.toLowerCase(),
        contactEmail: casual.email,
        contactName: casual.name,
        ssoEntityId: casual.uuid,
        feedbackEnabled: true,
        feedbackMessage: casual.sentences(2),
        feedbackEmails: [casual.email],
        managed: true,
        active: true,
      },
    };
    context.token.role = UserRole.ADMIN;
    context.token.affiliationId = affiliations[1].uri;

    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(affiliations.length).toEqual(originalRecordCount);
    // Verify fields that should not have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(originalRecord.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.provenance).toEqual(originalRecord.provenance);
    expect(resp.body.singleResult.data?.updateAffiliation?.createdById).toEqual(originalRecord.createdById);
    expect(resp.body.singleResult.data?.updateAffiliation?.created).toEqual(formatISO9075(originalRecord.created));
    expect(resp.body.singleResult.data?.updateAffiliation?.uri).toEqual(originalRecord.uri);
    expect(resp.body.singleResult.data?.updateAffiliation?.name).toEqual(originalRecord.name);
    expect(resp.body.singleResult.data?.updateAffiliation?.searchName).toEqual(originalRecord.searchName);
    expect(resp.body.singleResult.data?.updateAffiliation?.funder).toEqual(Boolean(originalRecord.funder));
    expect(resp.body.singleResult.data?.updateAffiliation?.fundrefId).toEqual(originalRecord.fundrefId);
    expect(resp.body.singleResult.data?.updateAffiliation?.homepage).toEqual(originalRecord.homepage);
    expect(resp.body.singleResult.data?.updateAffiliation?.acronyms).toEqual(originalRecord.acronyms);
    expect(resp.body.singleResult.data?.updateAffiliation?.aliases).toEqual(originalRecord.aliases);
    expect(resp.body.singleResult.data?.updateAffiliation?.types).toEqual(originalRecord.types);

    // Verify fields that should have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.displayName).toEqual(variables.input.displayName);
    expect(resp.body.singleResult.data?.updateAffiliation?.logoURI).toEqual(variables.input.logoURI);
    expect(resp.body.singleResult.data?.updateAffiliation?.logoName).toEqual(variables.input.logoName);
    expect(resp.body.singleResult.data?.updateAffiliation?.contactEmail).toEqual(variables.input.contactEmail);
    expect(resp.body.singleResult.data?.updateAffiliation?.contactName).toEqual(variables.input.contactName);
    expect(resp.body.singleResult.data?.updateAffiliation?.ssoEntityId).toEqual(variables.input.ssoEntityId);
    expect(resp.body.singleResult.data?.updateAffiliation?.feedbackEnabled).toEqual(Boolean(variables.input.feedbackEnabled));
    expect(resp.body.singleResult.data?.updateAffiliation?.feedbackMessage).toEqual(variables.input.feedbackMessage);
    expect(resp.body.singleResult.data?.updateAffiliation?.feedbackEmails).toEqual(variables.input.feedbackEmails);
    expect(resp.body.singleResult.data?.updateAffiliation?.managed).toBe(true);
    expect(resp.body.singleResult.data?.updateAffiliation?.active).toBe(true);
    expect(resp.body.singleResult.data?.updateAffiliation?.modifiedById).toEqual(context.token.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeNull();
  });

  it('returns the existing affiliation with field level errors if it\'s a duplicate by the URI', async () => {
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.DMPTOOL
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);

    const variables = {
      input: {
        id: affiliations[1].id,
        uri: affiliations[0].uri,
        name: affiliations[1].name,
      },
    };

    context.token.role = UserRole.ADMIN;
    context.token.affiliationId = affiliations[1].uri;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(affiliations[1].id);
    // Verify the errors
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeDefined();
  });

  it('returns the existing affiliation with field level errors if it\'s a duplicate by the name', async () => {
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.DMPTOOL
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);

    const variables = {
      input: {
        id: affiliations[1].id,
        name: affiliations[0].name,
      },
    };
    context.token.role = UserRole.ADMIN;
    context.token.affiliationId = affiliations[1].uri;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(affiliations[1].id);
    // Verify the errors
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeDefined();
  });

  it('returns the affiliation with field level errors if it\'s invalid', async () => {
    const variables = {
      input: {
        id: affiliations[0].id,
        name: '',
      },
    };
    context.token.role = UserRole.ADMIN;
    context.token.affiliationId = affiliations[0].uri;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(affiliations[0].id);
    // Verify the errors
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.uri).toBeDefined();
  });

  it('returns a 404 when the affiliation does not exist', async () => {
    const variables = {
      input: {
        id: affiliations[0].id + 999,
        uri: '123',
        name: casual.company_name,
      },
    };
    context.token.role = UserRole.ADMIN;
    context.token.affiliationId = affiliations[0].uri;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('NOT_FOUND');
  });

  it('returns a 500 when a fatal error occurs', async () => {
    const originalUpdate = Affiliation.update;
    jest.spyOn(Affiliation, 'update').mockImplementation(() => {
      throw new Error('Error!')
    });

    const variables = {
      input: {
        id: affiliations[0].id,
        name: casual.company_name,
      },
    };
    context.token.role = UserRole.ADMIN;
    context.token.affiliationId = affiliations[0].uri;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
    Affiliation.update = originalUpdate;
  });
});

describe('deleteAffiliation mutation', () => {
  beforeEach(async () => {
    affiliations = [];
    const persistedAffiliation = await persistAffiliation(context, mockAffiliation({}));
    affiliations.push(persistedAffiliation);

    query = `
      mutation RemoveAffiliation($affiliationId: Int!) {
        removeAffiliation (affiliationId: $affiliationId) {
          id
        }
      }
    `;
  });

  afterEach(async () => {
    for (const affiliation of affiliations) {
      await cleanUpAddedAffiliation(context, affiliation.id);
    }
  });

  it('deletes an affiliation when the user is a SuperAdmin and the affiliation is managed by the DMP Tool', async () => {
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.DMPTOOL
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);

    const variables = { affiliationId: affiliations[1].id };
    context.token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.removeAffiliation?.id).toEqual(affiliations[1].id);
  });

  it('does not allow an affiliation that is NOT managed by the DMP Tool to be deleted', async () => {
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.ROR
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);

    const variables = { affiliationId: affiliations[1].id };
    context.token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });


  it('does not allow a non-SuperAdmin to delete an affiliation', async () => {
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.DMPTOOL
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);
    const variables = { affiliationId: affiliations[1].id };

    context.token.role = UserRole.ADMIN;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('returns a 404 when the affiliation does not exist', async () => {
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.DMPTOOL
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);
    const variables = { affiliationId: affiliations[1].id + 999 };

    context.token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('NOT_FOUND');
  });

  it('returns a 500 when a fatal error occurs', async () => {
    const originalDelete = Affiliation.delete;
    jest.spyOn(Affiliation, 'delete').mockImplementation(() => {
      throw new Error('Error!')
    });
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.DMPTOOL
    });
    const persistedAffiliation = await persistAffiliation(context,  managedAffiliation);
    affiliations.push(persistedAffiliation);

    const variables = { affiliationId: affiliations[1].id };
    context.token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(testServer, context, query, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
    Affiliation.delete = originalDelete;
  });
});

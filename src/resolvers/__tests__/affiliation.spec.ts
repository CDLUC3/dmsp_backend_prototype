import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../../schema";
import { resolvers } from "../../resolver";
import casual from "casual";
import assert from "assert";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { JWTAccessToken } from "../../services/tokenService";

import { Affiliation, AffiliationProvenance, AffiliationSearch, AffiliationType, DEFAULT_DMPTOOL_AFFILIATION_URL, DEFAULT_ROR_AFFILIATION_URL } from "../../models/Affiliation";
import { UserRole } from "../../models/User";
import { getRandomEnumValue } from "../../__tests__/helpers";
import { clearAffiliationStore, initAffiliationStore, mockAffiliationSearch, mockDeleteAffiliation, mockFindAffiliationById, mockFindAffiliationByName, mockFindAffiliationByURI, mockInsertAffiliation, mockUpdateAffiliation } from "../../models/__mocks__/Affiliation";

jest.mock('../../context.ts');
jest.mock('../../datasources/cache');

let testServer: ApolloServer;
let affiliationStore: Affiliation[];
let superAdminToken: JWTAccessToken;
let query: string;

// Proxy call to the Apollo server test server
async function executeQuery (
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any,
  token: JWTAccessToken
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  token = token ?? mockToken();
  const context = buildContext(logger, token, null);

  return await testServer.executeOperation(
    { query, variables },
    { contextValue: context },
  );
}

beforeEach(() => {
  jest.resetAllMocks();

  // Initialize the Apollo server
  testServer = new ApolloServer({
    typeDefs, resolvers
  });

  // Add initial data to the mock database
  affiliationStore = initAffiliationStore(3);

  // Use the mocks to replace the actual queries
  jest.spyOn(AffiliationSearch, 'search').mockImplementation(mockAffiliationSearch);
  jest.spyOn(Affiliation, 'findById').mockImplementation(mockFindAffiliationById);
  jest.spyOn(Affiliation, 'findByURI').mockImplementation(mockFindAffiliationByURI);
  jest.spyOn(Affiliation, 'findByName').mockImplementation(mockFindAffiliationByName);

  // Use the mocks to replace the actual mutations
  jest.spyOn(Affiliation, 'insert').mockImplementation(mockInsertAffiliation);
  jest.spyOn(Affiliation, 'update').mockImplementation(mockUpdateAffiliation);
  jest.spyOn(Affiliation, 'delete').mockImplementation(mockDeleteAffiliation);

  superAdminToken = mockToken();
  superAdminToken.role = UserRole.SUPERADMIN;
});

afterEach(() => {
  jest.clearAllMocks();

  // Reset the mock database
  clearAffiliationStore();
});

describe('affiliationTypes query', () => {
  beforeEach(() => {
    query = `
      query AffiliationTypes {
        affiliationTypes
      }
    `;
  });

  it('returns the expected affiliation types', async () => {
    const resp = await executeQuery(query, {}, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliationTypes).toBeDefined();
    expect(resp.body.singleResult.data?.affiliationTypes.length).toBeGreaterThan(0);
    expect(resp.body.singleResult.data?.affiliationTypes).toContain(AffiliationType.EDUCATION);
  });
});

describe('affiliationById query', () => {
  beforeEach(() => {
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

  it('returns the affiliation when successful', async () => {
    const variables = { affiliationId: affiliationStore[1].id };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    // verify all the properties are returned
    expect(resp.body.singleResult.data?.affiliationById?.id).toEqual(affiliationStore[1].id);
    expect(resp.body.singleResult.data?.affiliationById?.name).toEqual(affiliationStore[1].name);
    expect(resp.body.singleResult.data?.affiliationById?.uri).toEqual(affiliationStore[1].uri);
    expect(resp.body.singleResult.data?.affiliationById?.funder).toEqual(affiliationStore[1].funder);
    expect(resp.body.singleResult.data?.affiliationById?.types).toEqual(affiliationStore[1].types);
    expect(resp.body.singleResult.data?.affiliationById?.displayName).toEqual(affiliationStore[1].displayName);
    expect(resp.body.singleResult.data?.affiliationById?.searchName).toEqual(affiliationStore[1].searchName);
    expect(resp.body.singleResult.data?.affiliationById?.provenance).toEqual(affiliationStore[1].provenance);
    expect(resp.body.singleResult.data?.affiliationById?.homepage).toEqual(affiliationStore[1].homepage);
    expect(resp.body.singleResult.data?.affiliationById?.acronyms).toEqual(affiliationStore[1].acronyms);
    expect(resp.body.singleResult.data?.affiliationById?.aliases).toEqual(affiliationStore[1].aliases);
    expect(resp.body.singleResult.data?.affiliationById?.fundrefId).toEqual(affiliationStore[1].fundrefId);
    expect(resp.body.singleResult.data?.affiliationById?.active).toEqual(affiliationStore[1].active);

    expect(resp.body.singleResult.data?.affiliationById?.managed).toEqual(affiliationStore[1].managed);
    expect(resp.body.singleResult.data?.affiliationById?.logoURI).toEqual(affiliationStore[1].logoURI);
    expect(resp.body.singleResult.data?.affiliationById?.logoName).toEqual(affiliationStore[1].logoName);
    expect(resp.body.singleResult.data?.affiliationById?.contactEmail).toEqual(affiliationStore[1].contactEmail);
    expect(resp.body.singleResult.data?.affiliationById?.contactName).toEqual(affiliationStore[1].contactName);
    expect(resp.body.singleResult.data?.affiliationById?.ssoEntityId).toEqual(affiliationStore[1].ssoEntityId);
    expect(resp.body.singleResult.data?.affiliationById?.feedbackEnabled).toEqual(affiliationStore[1].feedbackEnabled);
    expect(resp.body.singleResult.data?.affiliationById?.feedbackMessage).toEqual(affiliationStore[1].feedbackMessage);
    expect(resp.body.singleResult.data?.affiliationById?.feedbackEmails).toEqual(affiliationStore[1].feedbackEmails);
    expect(resp.body.singleResult.data?.affiliationById?.apiTarget).toEqual(affiliationStore[1].apiTarget);
  });

  it('returns null when no matching record is found', async () => {
    // Use an id that will not match any records
    const variables = { affiliationId: 99999 };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliationById).toBeNull();
  });

  it('returns a 500 when a fatal error occurs', async () => {
    jest.spyOn(Affiliation, 'findById').mockImplementation(() => { throw new Error('Error!') });

    const variables = { affiliationId: casual.integer(1, 9999) };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.affiliationById).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  });
});

describe('affiliations query', () => {
  beforeEach(() => {
    query = `
      query Affiliations($term: String!, $funderOnly: Boolean, $paginationOptions: PaginationOptions) {
        affiliations (term: $term, funderOnly: $funderOnly, paginationOptions: $paginationOptions) {
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

  it('returns the expected affiliations when successful', async () => {
    const variables = { term: affiliationStore[0].name };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();

    // Since we're not returning everything, verify the fields we are returning
    const affiliation = resp.body.singleResult.data?.affiliations.items[0];
    expect(affiliation?.id).toEqual(affiliationStore[0].id);
    expect(affiliation?.displayName).toEqual(affiliationStore[0].displayName);
    expect(affiliation?.uri).toEqual(affiliationStore[0].uri);
    expect(affiliation?.funder).toEqual(affiliationStore[0].funder);
    expect(affiliation?.types).toEqual(affiliationStore[0].types);
    expect(affiliation?.apiTarget).toEqual(affiliationStore[0].apiTarget);
  });

  it('obeys the funderOnly flag', async () => {
    affiliationStore[0].funder = true;
    affiliationStore[1].funder = false;
    affiliationStore[2].funder = true;

    const variables = { term: '', funderOnly: true };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();

    // Since we're not returning everything, verify the fields we are returning
    expect(resp.body.singleResult.data?.affiliations.items.length).toBe(2);
    expect(resp.body.singleResult.data?.affiliations.items[0]).toEqual(affiliationStore[0]);
    expect(resp.body.singleResult.data?.affiliations.items[1]).toEqual(affiliationStore[2]);
  });

  it('handles cursor pagination successfuly', async () => {
    const variables = { term: '', paginationOptions: { cursor: null, limit: 2 } };
    let resp = await executeQuery(query, variables, mockToken());

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
    expect(paginatedResults[0].id).toEqual(affiliationStore[0].id);
    expect(paginatedResults[1].id).toEqual(affiliationStore[1].id);

    // Bump the cursor and query again
    variables.paginationOptions.cursor = resp.body.singleResult.data?.affiliations.nextCursor;
    resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();

    expect(resp.body.singleResult.data?.affiliations.totalCount).toBe(3);
    expect(resp.body.singleResult.data?.affiliations.limit).toBe(2);
    expect(resp.body.singleResult.data?.affiliations.nextCursor).toBeFalsy();
    expect(resp.body.singleResult.data?.affiliations.currentOffset).toBeFalsy();
    expect(resp.body.singleResult.data?.affiliations.hasNextPage).toBeFalsy();
    expect(resp.body.singleResult.data?.affiliations.hasPreviousPage).toBeTruthy();

    expect(resp.body.singleResult.data?.affiliations.items.length).toBe(1);
    expect(resp.body.singleResult.data?.affiliations.items[0].id).toEqual(affiliationStore[2].id);
  });

  it.only('handles offset pagination successfuly', async () => {
    const variables = { term: '', paginationOptions: { offset: 0, limit: 2 } };
    let resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();

    expect(resp.body.singleResult.data?.affiliations.totalCount).toBe(3);
    expect(resp.body.singleResult.data?.affiliations.limit).toBe(2);
    expect(resp.body.singleResult.data?.affiliations.nextCursor).toBeFalsy();
    expect(resp.body.singleResult.data?.affiliations.currentOffset).toBeTruthy();
    expect(resp.body.singleResult.data?.affiliations.hasNextPage).toBeTruthy();
    expect(resp.body.singleResult.data?.affiliations.hasPreviousPage).toBeFalsy();

    const paginatedResults = resp.body.singleResult.data?.affiliations.items ?? [];
    expect(paginatedResults.length).toBe(2);
    expect(paginatedResults[0].id).toEqual(affiliationStore[0].id);
    expect(paginatedResults[1].id).toEqual(affiliationStore[1].id);

    // Bump the cursor and query again
    variables.paginationOptions.offset = resp.body.singleResult.data?.affiliations.currentOffset + 2;
    resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();

    expect(resp.body.singleResult.data?.affiliations.totalCount).toBe(3);
    expect(resp.body.singleResult.data?.affiliations.limit).toBe(2);
    expect(resp.body.singleResult.data?.affiliations.nextCursor).toBeFalsy();
    expect(resp.body.singleResult.data?.affiliations.currentOffset).toBeTruthy();
    expect(resp.body.singleResult.data?.affiliations.hasNextPage).toBeFalsy();
    expect(resp.body.singleResult.data?.affiliations.hasPreviousPage).toBeTruthy();

    expect(resp.body.singleResult.data?.affiliations.items.length).toBe(1);
    expect(resp.body.singleResult.data?.affiliations.items[0].id).toEqual(affiliationStore[2].id);
  });

  it('returns an empty array when no matches are found', async () => {
    // Use a series of number since it will never match one of the names
    const variables = { term: '1234567890' };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliations).toBeDefined();
    expect(resp.body.singleResult.data.affiliations[0]).toEqual(undefined);
  });

  it('returns a 500 when a fatal error occurs', async () => {
    jest.spyOn(AffiliationSearch, 'search').mockImplementation(() => { throw new Error('Error!') });

    const variables = { term: casual.company_name };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data).toBeDefined();
    expect(resp.body.singleResult.data.affiliations).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  });
});

describe('affiliationByURI query', () => {
  beforeEach(() => {
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

  it('returns the affiliation when successful', async () => {
    const variables = { uri: affiliationStore[2].uri };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    // Since we're not returning everything, verify the fields we are returning
    expect(resp.body.singleResult.data?.affiliationByURI?.id).toEqual(affiliationStore[2].id);
    expect(resp.body.singleResult.data?.affiliationByURI?.name).toEqual(affiliationStore[2].name);
    expect(resp.body.singleResult.data?.affiliationByURI?.uri).toEqual(affiliationStore[2].uri);
  });

  it('returns null when no matching record is found', async () => {
    // Use a word since it will never match one of the URLs
    const variables = { uri: casual.word };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliationByURI).toBeNull();
  });

  it('returns a 500 when a fatal error occurs', async () => {
    jest.spyOn(Affiliation, 'findByURI').mockImplementation(() => { throw new Error('Error!') });

    const variables = { uri: casual.url };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.affiliationByURI).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  });
});

describe('addAffiliation mutation', () => {
  beforeEach(() => {
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

  it('creates a new affiliation when input is valid', async () => {
    const variables = {
      input: {
        name: casual.company_name,
      },
    };

    const originalRecordCount = affiliationStore.length;
    const token = mockToken();
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeDefined();
    expect(affiliationStore.length).toEqual(originalRecordCount + 1);
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
    expect(resp.body.singleResult.data?.addAffiliation?.createdById).toEqual(token.id);
    expect(resp.body.singleResult.data?.addAffiliation?.created).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.modifiedById).toEqual(token.id);
    expect(resp.body.singleResult.data?.addAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.errors?.general).toBeNull();
  });

  it('returns the existing affiliation with field level errors if it\'s a duplicate by the URI', async () => {
    const variables = {
      input: {
        name: casual.company_name,
        uri: affiliationStore[0].uri,
      },
    };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.id).toEqual(affiliationStore[0].id);
    expect(resp.body.singleResult.data?.addAffiliation?.name).toEqual(affiliationStore[0].name);
    expect(resp.body.singleResult.data?.addAffiliation?.modified).toBeDefined();
    // Verify the errors
    expect(resp.body.singleResult.data?.addAffiliation?.errors?.general).toBeDefined();
  });

  it('returns the existing affiliation with field level errors if it\'s a duplicate by the name', async () => {
    const variables = {
      input: {
        name: affiliationStore[0].name.toUpperCase(),
      },
    };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.id).toEqual(affiliationStore[0].id);
    expect(resp.body.singleResult.data?.addAffiliation?.name).toEqual(affiliationStore[0].name);
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
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation?.id).toBeNull();
    expect(resp.body.singleResult.data?.addAffiliation?.name).toEqual(variables.input.name);
    // Verify the errors
    expect(resp.body.singleResult.data?.addAffiliation?.errors?.uri).toBeDefined();
  });

  it('returns a 500 when a fatal error occurs', async () => {
    jest.spyOn(Affiliation, 'insert').mockImplementation(() => { throw new Error('Error!') });

    const variables = {
      input: {
        name: casual.company_name,
      },
    };
    const resp = await executeQuery(query, variables, mockToken());

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.addAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  });
});

describe('updateAffiliation mutation', () => {
  beforeEach(() => {
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

  it('allows a Super Admin to update other affiliations', async () => {
    // Store the original record count and first record for comparison after the mutation occurs
    const originalRecordCount = affiliationStore.length;

    // Make sure it's a DMP Tool managed affiliation
    affiliationStore[0].uri = `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`;
    affiliationStore[0].provenance = AffiliationProvenance.DMPTOOL;
    const originalRecord = { ...affiliationStore[0] };

    // Update a couple of fields and ensure the rest remain unchanged
    const variables = {
      input: {
        id: affiliationStore[0].id,
        name: affiliationStore[0].name,

        uri: casual.url,
        displayName: casual.company_name,
        managed: true
      },
    };
    const token = mockToken();
    token.role = UserRole.SUPERADMIN;
    token.affiliationId = casual.url;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(affiliationStore.length).toEqual(originalRecordCount);
    // Verify fields that should not have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(originalRecord.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.name).toEqual(originalRecord.name);

    // Verify fields that should have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.uri).toEqual(variables.input.uri);
    expect(resp.body.singleResult.data?.updateAffiliation?.displayName).toEqual(variables.input.displayName);
    expect(resp.body.singleResult.data?.updateAffiliation?.managed).toEqual(variables.input.managed);
    expect(resp.body.singleResult.data?.updateAffiliation?.modifiedById).toEqual(token.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeNull();
  });

  it('allows an Admin to update most fields when the affiliation is managed by the DMP Tool', async () => {
    // Store the original record count and first record for comparison after the mutation occurs
    const originalRecordCount = affiliationStore.length;

    // Make sure it's a DMP Tool managed affiliation
    affiliationStore[0].uri = `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`;
    affiliationStore[0].provenance = AffiliationProvenance.DMPTOOL;

    const originalRecord = { ...affiliationStore[0] };

    // Update a couple of fields and ensure the rest remain unchanged
    const variables = {
      input: {
        id: affiliationStore[0].id,

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
    const token = mockToken();
    token.role = UserRole.ADMIN;
    token.affiliationId = affiliationStore[0].uri;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(affiliationStore.length).toEqual(originalRecordCount);
    // Verify fields that should not have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(originalRecord.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.provenance).toEqual(originalRecord.provenance);
    expect(resp.body.singleResult.data?.updateAffiliation?.createdById).toEqual(originalRecord.createdById);
    expect(resp.body.singleResult.data?.updateAffiliation?.created).toEqual(originalRecord.created);

    // Verify fields that should have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.uri).toEqual(variables.input.uri);
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
    expect(resp.body.singleResult.data?.updateAffiliation?.modifiedById).toEqual(token.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeNull();
  });

  it('does not allow some fields to be modified when the affiliation is NOT managed by the DMP Tool', async () => {
    // Store the original record count and first record for comparison after the mutation occurs
    const originalRecordCount = affiliationStore.length;

    // Make sure it's NOT a DMP Tool managed affiliation
    affiliationStore[0].uri = `${DEFAULT_ROR_AFFILIATION_URL}${casual.integer(1, 1000000)}`;
    affiliationStore[0].provenance = AffiliationProvenance.ROR;
    const originalRecord = { ...affiliationStore[0] };

    // Update a couple of fields and ensure the rest remain unchanged
    const variables = {
      input: {
        id: affiliationStore[0].id,

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
    const token = mockToken();
    token.role = UserRole.ADMIN;
    token.affiliationId = affiliationStore[0].uri;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(affiliationStore.length).toEqual(originalRecordCount);
    // Verify fields that should not have changed
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(originalRecord.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.provenance).toEqual(originalRecord.provenance);
    expect(resp.body.singleResult.data?.updateAffiliation?.createdById).toEqual(originalRecord.createdById);
    expect(resp.body.singleResult.data?.updateAffiliation?.created).toEqual(originalRecord.created);
    expect(resp.body.singleResult.data?.updateAffiliation?.uri).toEqual(originalRecord.uri);
    expect(resp.body.singleResult.data?.updateAffiliation?.name).toEqual(originalRecord.name);
    expect(resp.body.singleResult.data?.updateAffiliation?.searchName).toEqual(originalRecord.searchName);
    expect(resp.body.singleResult.data?.updateAffiliation?.funder).toEqual(originalRecord.funder);
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
    expect(resp.body.singleResult.data?.updateAffiliation?.feedbackEnabled).toEqual(variables.input.feedbackEnabled);
    expect(resp.body.singleResult.data?.updateAffiliation?.feedbackMessage).toEqual(variables.input.feedbackMessage);
    expect(resp.body.singleResult.data?.updateAffiliation?.feedbackEmails).toEqual(variables.input.feedbackEmails);
    expect(resp.body.singleResult.data?.updateAffiliation?.managed).toBe(true);
    expect(resp.body.singleResult.data?.updateAffiliation?.active).toBe(true);
    expect(resp.body.singleResult.data?.updateAffiliation?.modifiedById).toEqual(token.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeNull();
  });

  it('returns the existing affiliation with field level errors if it\'s a duplicate by the URI', async () => {
    const variables = {
      input: {
        id: affiliationStore[0].id,
        uri: affiliationStore[1].uri,
        name: affiliationStore[0].name,
      },
    };

    const token = mockToken();
    token.role = UserRole.ADMIN;
    token.affiliationId = affiliationStore[0].uri;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(affiliationStore[0].id);
    // Verify the errors
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeDefined();
  });

  it('returns the existing affiliation with field level errors if it\'s a duplicate by the name', async () => {
    const variables = {
      input: {
        id: affiliationStore[0].id,
        name: affiliationStore[1].name,
      },
    };
    const token = mockToken();
    token.role = UserRole.ADMIN;
    token.affiliationId = affiliationStore[0].uri;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(affiliationStore[0].id);
    // Verify the errors
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeDefined();
  });

  it('returns the affiliation with field level errors if it\'s invalid', async () => {
    const variables = {
      input: {
        id: affiliationStore[0].id,
        uri: '123',
        name: affiliationStore[0].name
      },
    };
    const token = mockToken();
    token.role = UserRole.ADMIN;
    token.affiliationId = affiliationStore[0].uri;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(affiliationStore[0].id);
    // Verify the errors
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.uri).toBeDefined();
  });

  it('returns a 404 when the affiliation does not exist', async () => {
    const variables = {
      input: {
        id: affiliationStore[0].id + 999,
        uri: '123',
        name: casual.company_name,
      },
    };
    const token = mockToken();
    token.role = UserRole.ADMIN;
    token.affiliationId = affiliationStore[0].uri;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('NOT_FOUND');
  });

  it('returns a 500 when a fatal error occurs', async () => {
    jest.spyOn(Affiliation, 'update').mockImplementation(() => { throw new Error('Error!') });

    const variables = {
      input: {
        id: affiliationStore[0].id,
        name: casual.company_name,
      },
    };
    const token = mockToken();
    token.role = UserRole.ADMIN;
    token.affiliationId = affiliationStore[0].uri;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  });
});

describe('deleteAffiliation mutation', () => {
  beforeEach(() => {
    query = `
      mutation RemoveAffiliation($affiliationId: Int!) {
        removeAffiliation (affiliationId: $affiliationId) {
          id
        }
      }
    `;
  });

  it('deletes an affiliation when the user is a SuperAdmin and the affiliation is managed by the DMP Tool', async () => {
    const affiliationId = affiliationStore[0].id;
    affiliationStore[0].uri = `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`;
    affiliationStore[0].provenance = AffiliationProvenance.DMPTOOL;

    const variables = { affiliationId: affiliationId };
    const token = mockToken();
    token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(query, variables, token);



    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.removeAffiliation?.id).toEqual(affiliationId);
  });

  it('does not allow an affiliation that is NOT managed by the DMP Tool to be deleted', async () => {
    const affiliationId = affiliationStore[0].id;
    affiliationStore[0].uri = `${DEFAULT_ROR_AFFILIATION_URL}${casual.integer(1, 1000000)}`;
    affiliationStore[0].provenance = AffiliationProvenance.ROR;

    const variables = { affiliationId: affiliationId };
    const token = mockToken();
    token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });


  it('does not allow a non-SuperAdmin to delete an affiliation', async () => {
    const variables = { affiliationId: affiliationStore[0].id };
    affiliationStore[0].uri = `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`;
    affiliationStore[0].provenance = AffiliationProvenance.DMPTOOL;

    const token = mockToken();
    token.role = UserRole.ADMIN;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('returns a 404 when the affiliation does not exist', async () => {
    const variables = { affiliationId: affiliationStore[0].id + 999 };
    affiliationStore[0].uri = `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`;
    affiliationStore[0].provenance = AffiliationProvenance.DMPTOOL;

    const token = mockToken();
    token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('NOT_FOUND');
  });

  it('returns a 500 when a fatal error occurs', async () => {
    jest.spyOn(Affiliation, 'delete').mockImplementation(() => { throw new Error('Error!') });
    affiliationStore[0].uri = `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`;
    affiliationStore[0].provenance = AffiliationProvenance.DMPTOOL;

    const variables = { affiliationId: affiliationStore[0].id };
    const token = mockToken();
    token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(query, variables, token);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  });
});

import casual from "casual";
import assert from "assert";
import { UserRole } from "../../models/User";
import {
  Affiliation,
  AffiliationProvenance,
  AffiliationType,
  DEFAULT_DMPTOOL_AFFILIATION_URL,
} from "../../models/Affiliation";
import {
  mockAffiliation,
  persistAffiliation,
} from "../../models/__mocks__/Affiliation";
import {
  addTableForTeardown,
  executeQuery,
  initResolverTest,
  mockToken,
  ResolverTest,
  teardownResolverTest,
  testNotFound,
  testStandardErrors
} from "./resolverTestHelper";
import {getRandomEnumValue} from "../../__tests__/helpers";
import {formatISO9075} from "date-fns";

// Mock and then import the logger (this has jest pick up and use src/__mocks__/logger.ts)
jest.mock('../../logger');
jest.mock("../../datasources/dmphubAPI");

let resolverTest: ResolverTest;
let affiliations: Affiliation[];

beforeEach(async () => {
  jest.clearAllMocks();

  // Start up the Apollo server and initialize some test Affiliations and Users
  //
  // Be sure to add the table names of any objects you persist in your tests to
  // the resolverTest.tablesToCleanUp list. The teardownResolverTest will purge
  // any persisted records for you.
  resolverTest = await initResolverTest();

  // Persist some test Affiliations
  affiliations = [];
  for (let i = 0; i < 3; i++) {
    const affiliation = mockAffiliation({});
    affiliations.push(await persistAffiliation(
      resolverTest.context,
      mockAffiliation({ name: `AffilTest - ${casual.integer(1, 9999)}` })
    ));
  }
  addTableForTeardown(Affiliation.tableName);
});

afterEach(async () => {
  jest.resetAllMocks();

  // Purge all test records from the test DB and shutdown the Apollo server
  await teardownResolverTest();
});

describe('affiliationTypes query', () => {
  const query = `
    query AffiliationTypes {
      affiliationTypes
    }
  `;

  it('returns the expected affiliation types', async () => {
    const resp = await executeQuery(query, {});

    const expectedTypes = affiliations.map(a => a.types).flat();

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.affiliationTypes).toEqual(expectedTypes);
  });
});


describe('affiliationById query', () => {
  const query = `
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

  const queryById = `
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

  const queryByURI = `
    query affiliationByURI($uri: String!) {
      affiliationByURI (uri: $uri) {
        id
        name
        uri
      }
    }
  `;

  const addMutation = `
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

  const updateMutation = `
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

  const removeMutation = `
    mutation RemoveAffiliation($affiliationId: Int!) {
      removeAffiliation (affiliationId: $affiliationId) {
        id
      }
    }
  `;

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryUpdateRemoveAccess(errContext: string): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = {name: affiliations[0].name};
    const queryVariablesFunder = {name: resolverTest.funder.name};
    const queryByIdVariables = {affiliationId: affiliations[0].id};
    const queryByURIVariables = {uri: affiliations[0].uri};

    const qryResp = await executeQuery(query, queryVariables);
    const qryRespFunder = await executeQuery(query, queryVariablesFunder);
    const qryRespId = await executeQuery(query, queryByIdVariables);
    const qryRespURI = await executeQuery(query, queryByURIVariables);

    assert(qryResp.body.kind === 'single');
    expect(qryResp.body.singleResult.errors, msg).toBeUndefined();
    expect(qryResp.body.singleResult.data.affiliations[0].id).toEqual(affiliations[0].id);

    assert(qryRespFunder.body.kind === 'single');
    expect(qryRespFunder.body.singleResult.errors, msg).toBeUndefined();
    expect(qryRespFunder.body.singleResult.data.affiliations[0].id).toEqual(resolverTest.funder.id);

    assert(qryRespId.body.kind === 'single');
    expect(qryRespId.body.singleResult.errors, msg).toBeUndefined();
    expect(qryRespId.body.singleResult.data.affiliations[0].id).toEqual(affiliations[0].id);

    assert(qryRespURI.body.kind === 'single');
    expect(qryRespURI.body.singleResult.errors, msg).toBeUndefined();
    expect(qryRespURI.body.singleResult.data.affiliations[0].id).toEqual(affiliations[0].id);

    const addVariables = {
      input: {
        name: `TEST - ${casual.company_name} - ${casual.integer(1, 9999)}`,
      }
    };

    // Should be able to add
    const addResp = await executeQuery(addMutation, addVariables);

    assert(addResp.body.kind === 'single');
    expect(addResp.body.singleResult.errors).toBeUndefined();
    expect(addResp.body.singleResult.data?.addAffiliation).toBeDefined();
    expect(addResp.body.singleResult.data?.addAffiliation?.id).toBeDefined();
    expect(addResp.body.singleResult.data?.addAffiliation?.name).toEqual(addVariables.input.name);
    expect(addResp.body.singleResult.data?.addAffiliation?.uri).toBeDefined();
    expect(addResp.body.singleResult.data?.addAffiliation?.provenance).toBeDefined();
    expect(addResp.body.singleResult.data?.addAffiliation?.searchName).toBeDefined();
    expect(addResp.body.singleResult.data?.addAffiliation?.displayName).toBeDefined();
    expect(addResp.body.singleResult.data?.addAffiliation?.acronyms).toEqual([]);
    expect(addResp.body.singleResult.data?.addAffiliation?.aliases).toEqual([]);
    expect(addResp.body.singleResult.data?.addAffiliation?.types).toEqual(['OTHER']);
    expect(addResp.body.singleResult.data?.addAffiliation?.managed).toBeFalsy();
    expect(addResp.body.singleResult.data?.addAffiliation?.feedbackEnabled).toBeFalsy();
    expect(addResp.body.singleResult.data?.addAffiliation?.feedbackEmails).toEqual([]);
    expect(addResp.body.singleResult.data?.addAffiliation?.createdById).toEqual(resolverTest.context.token.id);
    expect(addResp.body.singleResult.data?.addAffiliation?.created).toBeDefined();
    expect(addResp.body.singleResult.data?.addAffiliation?.modifiedById).toEqual(resolverTest.context.token.id);
    expect(addResp.body.singleResult.data?.addAffiliation?.modified).toBeDefined();
    expect(addResp.body.singleResult.data?.addAffiliation?.errors?.general).toBeNull();
  }

  it('handles cursor pagination successfully', async () => {
    const variables = { name: 'Affiliation Query Test', paginationOptions: { cursor: null, limit: 2 } };
    const resp = await executeQuery(query, variables);

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
    const resp2 = await executeQuery(query, variables);

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

  it('handles offset pagination successfully', async () => {
    const variables = {
      name: 'Affiliation Query Test',
      paginationOptions: { offset: 0, limit: 2, type: 'OFFSET' }
    };
    const resp = await executeQuery(query, variables);

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
    const resp2 = await executeQuery(query, variables);

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

  it('allows a Super Admin to update other affiliations', async () => {
    // Make sure it's a DMP Tool managed affiliation
    const persistedAffiliation = await persistAffiliation(
      resolverTest.context,
      mockAffiliation({
        uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
        provenance: AffiliationProvenance.ROR
      })
    );
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
    resolverTest.context.token.role = UserRole.SUPERADMIN;
    resolverTest.context.token.affiliationId = casual.url;
    const resp = await executeQuery(updateMutation, variables);

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
    expect(resp.body.singleResult.data?.updateAffiliation?.modifiedById).toEqual(resolverTest.context.token.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeNull();
  });

  it('allows an Admin to update most fields when the affiliation is managed by the DMP Tool', async () => {
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.DMPTOOL
    });
    const persistedAffiliation = await persistAffiliation(resolverTest.context,  managedAffiliation);
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

    resolverTest.context.token.role = UserRole.ADMIN;
    resolverTest.context.token.affiliationId = persistedAffiliation.uri;
    const resp = await executeQuery(updateMutation, variables);

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
    expect(resp.body.singleResult.data?.updateAffiliation?.modifiedById).toEqual(resolverTest.context.token.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeNull();
  });

  it('does not allow some fields to be modified when the affiliation is NOT managed by the DMP Tool', async () => {
    // Make sure it's NOT a DMP Tool managed affiliation
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.ROR
    });
    const persistedAffiliation = await persistAffiliation(resolverTest.context,  managedAffiliation);
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
    resolverTest.context.token.role = UserRole.ADMIN;
    resolverTest.context.token.affiliationId = affiliations[1].uri;

    const resp = await executeQuery(updateMutation, variables);

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
    expect(resp.body.singleResult.data?.updateAffiliation?.modifiedById).toEqual(resolverTest.context.token.id);
    expect(resp.body.singleResult.data?.updateAffiliation?.modified).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.general).toBeNull();
  });

  it('returns the existing affiliation with field level errors if it\'s a duplicate by the URI', async () => {
    const managedAffiliation = mockAffiliation({
      uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
      provenance: AffiliationProvenance.DMPTOOL
    });
    const persistedAffiliation = await persistAffiliation(resolverTest.context,  managedAffiliation);
    affiliations.push(persistedAffiliation);

    const variables = {
      input: {
        id: affiliations[1].id,
        uri: affiliations[0].uri,
        name: affiliations[1].name,
      },
    };

    resolverTest.context.token.role = UserRole.ADMIN;
    resolverTest.context.token.affiliationId = affiliations[1].uri;
    const resp = await executeQuery(updateMutation, variables);

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
    const persistedAffiliation = await persistAffiliation(resolverTest.context,  managedAffiliation);
    affiliations.push(persistedAffiliation);

    const variables = {
      input: {
        id: affiliations[1].id,
        name: affiliations[0].name,
      },
    };
    resolverTest.context.token.role = UserRole.ADMIN;
    resolverTest.context.token.affiliationId = affiliations[1].uri;
    const resp = await executeQuery(updateMutation, variables);

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
    resolverTest.context.token.role = UserRole.ADMIN;
    resolverTest.context.token.affiliationId = affiliations[0].uri;
    const resp = await executeQuery(updateMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.updateAffiliation).toBeDefined();
    expect(resp.body.singleResult.data?.updateAffiliation?.id).toEqual(affiliations[0].id);
    // Verify the errors
    expect(resp.body.singleResult.data?.updateAffiliation?.errors?.uri).toBeDefined();
  });

  it('deletes an affiliation when the user is a SuperAdmin and the affiliation is managed by the DMP Tool', async () => {
    const persistedAffiliation = await persistAffiliation(
      resolverTest.context,
      mockAffiliation({
        uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
        provenance: AffiliationProvenance.DMPTOOL
      })
    );
    affiliations.push(persistedAffiliation);

    const variables = { affiliationId: affiliations[1].id };
    resolverTest.context.token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(removeMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.removeAffiliation?.id).toEqual(affiliations[1].id);
  });

  it('does not allow an affiliation that is NOT managed by the DMP Tool to be deleted', async () => {
    const persistedAffiliation = await persistAffiliation(
      resolverTest.context,
      mockAffiliation({
        uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
        provenance: AffiliationProvenance.ROR
      })
    );
    affiliations.push(persistedAffiliation);

    const variables = { affiliationId: affiliations[1].id };
    resolverTest.context.token.role = UserRole.SUPERADMIN;
    const resp = await executeQuery(removeMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('does not allow a non-SuperAdmin to delete an affiliation', async () => {
    const persistedAffiliation = await persistAffiliation(
      resolverTest.context,
      mockAffiliation({
        uri: `${DEFAULT_DMPTOOL_AFFILIATION_URL}${casual.integer(1, 1000000)}`,
        provenance: AffiliationProvenance.DMPTOOL
      })
    );
    affiliations.push(persistedAffiliation);
    const variables = { affiliationId: affiliations[1].id };

    resolverTest.context.token.role = UserRole.ADMIN;
    const resp = await executeQuery(removeMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.removeAffiliation).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('Throws a 404 if the template does not exist', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    await testNotFound(queryById, { id: 99999999 });
    await testNotFound(queryByURI, { uri: 'http://missing.affiliation.org' });
    await testNotFound(updateMutation, { input: { id: 99999999, name: 'TEST' } });
    await testNotFound(removeMutation, { id: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: query,
      variables: { affiliationId: affiliations[0].id },
      spyOnClass: Affiliation,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    await testStandardErrors({
      graphQL: queryById,
      variables: { id: affiliations[0].id },
      spyOnClass: Affiliation,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    await testStandardErrors({
      graphQL: queryByURI,
      variables: { uri: affiliations[0].uri },
      spyOnClass: Affiliation,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    await testStandardErrors({
      graphQL: query,
      variables: { name: casual.sentence },
      spyOnClass: Affiliation,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    await testStandardErrors({
      graphQL: query,
      variables: { input: { id: affiliations[0].id, name: 'TEST' } },
      spyOnClass: Affiliation,
      spyOnFunction: 'update',
      mustBeAuthenticated: true
    });

    await testStandardErrors({
      graphQL: query,
      variables: { id: affiliations[0].id },
      spyOnClass: Affiliation,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});

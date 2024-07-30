import gql from "graphql-tag";
import assert from "assert";
import server from '../../__tests__/mockApolloServer';
import { AffiliationSearch } from '../../types';

describe('Affiliations search queries', () => {
  test('fetches a list of affiliations if funderOnly flag is omitted', async () => {
    /*
     * TODO: Update this once we implement user auth so that it:
     *       - does not return a list of users if the current user is a RESEARCHER
     *       - returns a list of users that belong to the current user's org if they are an ADMIN
     *       - returns a list of all users if the current user is a SUPERADMIN
     */
    const res = await server.executeOperation(
      {
        query: gql`
          query affiliations($name: String!) {
            affiliations(name: $name) {
              id
              name
              funder
              fundref
              aliases
              countryCode
              countryName
              links
            }
          }
        `,
        variables: { name: "alaska" }
      },
    );

    // Validate that Apollo returned a result
    assert(res.body.kind === 'single');
    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.singleResult.data).toBeDefined();
    expect(res.body.singleResult.data?.affiliations).toBeDefined();

    const result = res.body.singleResult.data?.affiliations as [AffiliationSearch];
    expect(result instanceof Array).toBe(true);
    expect(result.length > 0).toBe(true);
  });

  test('fetches a list of affiliations if funderOnly flag is included', async () => {
    /*
     * TODO: Update this once we implement user auth so that it:
     *       - does not return a list of users if the current user is a RESEARCHER
     *       - returns a list of users that belong to the current user's org if they are an ADMIN
     *       - returns a list of all users if the current user is a SUPERADMIN
     */
    const res = await server.executeOperation(
      {
        query: gql`
          query affiliations($name: String!, $funderOnly: Boolean) {
            affiliations(name: $name, funderOnly: $funderOnly) {
              id
              name
              funder
              fundref
              aliases
              countryCode
              countryName
              links
            }
          }
        `,
        variables: { name: "alaska", funderOnly: true }
      },
    );

    // Validate that Apollo returned a result
    assert(res.body.kind === 'single');
    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.singleResult.data).toBeDefined();
    expect(res.body.singleResult.data?.affiliations).toBeDefined();

    const result = res.body.singleResult.data?.affiliations as [AffiliationSearch];
    expect(result instanceof Array).toBe(true);
    expect(result.length > 0).toBe(true);
  });
});

describe('Affiliation fetch queries', () => {
  test('fetches an affiliations', async () => {
    /*
     * TODO: Update this once we implement user auth so that it:
     *       - does not return a list of users if the current user is a RESEARCHER
     *       - returns a list of users that belong to the current user's org if they are an ADMIN
     *       - returns a list of all users if the current user is a SUPERADMIN
     */
    const res = await server.executeOperation(
      {
        query: gql`
          query affiliation($affiliationId: String!) {
            affiliation(affiliationId: $affiliationId) {
              id
              active
              name
              displayName
              funder
              fundref
              acronyms
              aliases
              domain
              countryCode
              countryName
              links
              types
              wikipediaURL
              relationships {
                id
                type
                name
              }
              addresses {
                city
                state
                stateCode
                countryGeonamesId
                lat
                lng
              }
              externalIds {
                type
                id
              }
              provenance
              provenanceSyncDate
            }
          }
        `,
        variables: { affiliationId: "abc123def" }
      }
    );

    // Validate that Apollo returned a result
    assert(res.body.kind === 'single');
    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.singleResult.data).toBeDefined();
    expect(res.body.singleResult.data?.affiliation).toBeDefined();
  });
});

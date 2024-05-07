import gql from "graphql-tag";
import assert from "assert";

import { server} from './setup';
import { assertEmailAddress, assertOrcid, assertTimestamp } from './helpers';

import { User } from '../src/types';

describe('User queries', () => {
  test('fetches a list of users', async () => {
    /*
     * TODO: Update this once we implement user auth so that it:
     *       - does not return a list of users if the current user is a RESEARCHER
     *       - returns a list of users that belong to the current user's org if they are an ADMIN
     *       - returns a list of all users if the current user is a SUPERADMIN
     */
    const res = await server.executeOperation(
      {
        query: gql`
          query getUsers {
            users {
              id
              givenName
              surName
              email
              role
              orcid
              created
              modified
            }
          }
        `,
      },
    );
    // Validate that Apollo returned a result
    assert(res.body.kind === 'single');
    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.singleResult.data).toBeDefined();
    expect(res.body.singleResult.data?.users).toBeDefined();

    const result = res.body.singleResult.data?.users as [User];
    expect(result instanceof Array).toBe(true);
    expect(result.length > 0).toBe(true);
  });

  test('fetches the current User', async () => {
    // run the query against the server and snapshot the output
    const res = await server.executeOperation(
      {
        query: gql`
          query getCurrentUser {
            me {
              id
              givenName
              surName
              email
              role
              orcid
              created
              modified
            }
          }
        `,
      },
    );
    // Validate that Apollo returned a result
    assert(res.body.kind === 'single');
    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.singleResult.data).toBeDefined();
    expect(res.body.singleResult.data?.me).toBeDefined();

    // Now validate the User that was returned
    const result = res.body.singleResult.data?.me as User;
    // console.log(result);

    // Validate that all of the required fields are included
    expect(result.id).toBeGreaterThan(0);
    expect(result.givenName.length).toBeGreaterThan(0);
    expect(result.surName.length).toBeGreaterThan(0);
    expect(assertEmailAddress(result.email)).toBe(true);
    expect(['RESEARCHER', 'ADMIN', 'SUPERADMIN']).toContain(result.role);
    expect(assertTimestamp(result.created)).toBe(true);
    expect(assertTimestamp(result.modified)).toBe(true);
  });

  test.todo('it returns an errors properly')
});

// TODO: Look into having Jest clear the cache each time

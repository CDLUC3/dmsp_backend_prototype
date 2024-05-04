import gql from "graphql-tag";
import assert from "assert";

import { server} from './setup';
import { assertEmailAddress, assertOrcid, assertTimestamp } from './helpers';

import { User } from '../src/types';

it('fetches the current User', async () => {
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

  expect(result.id).toBeGreaterThan(0);
  expect(result.givenName.length).toBeGreaterThan(0);
  expect(result.surName.length).toBeGreaterThan(0);
  expect(assertEmailAddress(result.email)).toBe(true);
  expect(assertOrcid(result.orcid)).toBe(true);
  expect(['RESEARCHER', 'ADMIN', 'SUPERADMIN']).toContain(result.role);
  expect(assertTimestamp(result.created)).toBe(true);
  expect(assertTimestamp(result.modified)).toBe(true);
});
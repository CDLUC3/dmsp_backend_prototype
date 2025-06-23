import casual from 'casual';
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../../schema";
import { resolvers } from "../../resolver";
import { MyContext } from '../../context';
import { JWTAccessToken } from '../../services/tokenService';
import { User } from '../../models/User';
import assert from "assert";

export const initErrorMessage = 'Failed to initialize test. You need to ' +
  'run docker-compose in another window to make the test DB available!'

// Generate a mock JWT
export const mockToken = (user: User): JWTAccessToken => {
  return {
    id: user.id,
    email: user.email,
    givenName: user.givenName,
    surName: user.surName,
    affiliationId: user.affiliationId,
    role: user.role,
    languageId: 'en-US',
    jti: casual.integer(1, 999999).toString(),
    expiresIn: casual.integer(1, 999999999),
  }
}

// Initialize the Apollo server
export function initTestServer(): ApolloServer {
  return new ApolloServer({
    typeDefs, resolvers
  });
}

// Proxy call to the Apollo server test server
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeQuery (server: ApolloServer, context: MyContext, query: string, variables: any): Promise<any> {
  return await server.executeOperation(
    { query, variables },
    { contextValue: context },
  );
}

export interface standardErrorTestInput {
  server: ApolloServer,
  context: MyContext,
  graphQL: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any,
  mustBeAuthenticated: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spyOnClass: any,
  spyOnFunction: string
}

export interface tokenTestInput {
  server: ApolloServer,
  context: MyContext,
  graphQL: string,
  candidates: {
    user: User,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: any,
    shouldPass: boolean,
    context?: string,
  }[],
}

// Tests for Not Found error handling
export async function testNotFound (
  server: ApolloServer,
  context: MyContext,
  graphQL: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any
): Promise<void> {
  const resp = await executeQuery(server, context, graphQL, variables);
  // Test 500 Internal Server error handling
  assert(resp.body.kind === 'single');
  expect(resp.body.singleResult.errors).toBeDefined();
  expect(resp.body.singleResult.data[Object.keys(resp.body.singleResult.data)[0]]).toBeNull();
  expect(resp.body.singleResult.errors[0].extensions.code).toEqual('NOT_FOUND');
}

// Test out Unauthenticated and Internal Server errors
export async function testStandardErrors (input: standardErrorTestInput): Promise<void> {
  const originalToken = input.context.token;

  // Keep track of the original function and then add a spy
  const originalFunction = input.spyOnClass[input.spyOnFunction];
  jest.spyOn(input.spyOnClass, input.spyOnFunction).mockImplementation(async () => {
    throw new Error('Test Error');
  });

  const resp = await executeQuery(input.server, input.context, input.graphQL, input.variables);

  // Test 500 Internal Server error handling
  assert(resp.body.kind === 'single');
  expect(resp.body.singleResult.errors).toBeDefined();
  expect(resp.body.singleResult.data[Object.keys(resp.body.singleResult.data)[0]]).toBeNull();
  expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  // Restore the original function
  input.spyOnClass[input.spyOnFunction] = originalFunction;

  // If authentication is required
  if (input.mustBeAuthenticated) {
    // Test missing token handler
    input.context.token = null;

    const resp2 = await executeQuery(input.server, input.context, input.graphQL, input.variables);

    assert(resp2.body.kind === 'single');
    expect(resp2.body.singleResult.errors).toBeDefined();
    expect(resp2.body.singleResult.data[Object.keys(resp2.body.singleResult.data)[0]]).toBeNull();
    expect(resp2.body.singleResult.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
  }
  input.context.token = originalToken;
}

// Test out authorization handling
export async function testAccessForAllTokenTypes (input: tokenTestInput): Promise<void> {
  for (const candidate of input.candidates) {
    const testUser = candidate.user;
    input.context.token = mockToken(testUser);

    const resp = await executeQuery(input.server, input.context, input.graphQL, candidate.variables);

    const msg = candidate.context ?? `user (id: ${testUser.id}, role: ${testUser.role})`;
    if (candidate.shouldPass) {
      assert(resp.body.kind === 'single');
      expect(resp.body.singleResult.errors, `Expected ${msg} to have access.`).toBeUndefined();
    } else {
      assert(resp.body.kind === 'single');
      expect(resp.body.singleResult.errors, `Expected ${msg} to be denied access.`).toBeDefined();
      expect(resp.body.singleResult.errors[0].extensions.code, `Expected ${msg}`).toEqual('FORBIDDEN');
    }
  }
}

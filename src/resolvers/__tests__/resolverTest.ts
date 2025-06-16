import casual from 'casual';
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../../schema";
import { resolvers } from "../../resolver";
import { MyContext } from '../../context';
import { JWTAccessToken } from '../../services/tokenService';
import { User } from '../../models/User';

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

// Shutdown the Apollo server
export async function shutdownTestServer(server: ApolloServer): Promise<void> {
  await server.stop();
}

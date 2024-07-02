import { GraphQLError } from 'graphql';
import {
  AuthenticationError,
  AUTHENTICATION_ERROR_CODE,
  DEFAULT_AUNAUTHORIZED_MESSAGE,
  DEFAULT_FORBIDDEN_MESSAGE,
  ForbiddenError,
  FORBIDDEN_ERROR_CODE,
} from '../graphQLErrors';

describe('Authentication error', () => {
  test('returns a GraphQLError with the default error message', () => {
    const err = AuthenticationError();
    expect(err).toBeInstanceOf(GraphQLError);
    expect(err.message).toEqual(DEFAULT_AUNAUTHORIZED_MESSAGE);
    expect(err.extensions?.code).toEqual(AUTHENTICATION_ERROR_CODE);
  });

  test('it uses the error message provided', () => {
    const err = ForbiddenError();
    expect(err).toBeInstanceOf(GraphQLError);
    expect(err.message).toEqual(DEFAULT_FORBIDDEN_MESSAGE);
    expect(err.extensions?.code).toEqual(FORBIDDEN_ERROR_CODE);
  });
});

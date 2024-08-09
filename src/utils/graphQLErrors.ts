import {  GraphQLError } from 'graphql';

export const AUTHENTICATION_ERROR_CODE = 'UNAUTHENTICATED';
export const FORBIDDEN_ERROR_CODE = 'FORBIDDEN';

export const DEFAULT_AUNAUTHORIZED_MESSAGE = 'Unauthorized';
export const DEFAULT_FORBIDDEN_MESSAGE = 'Forbidden';

export function AuthenticationError(errMessage = DEFAULT_AUNAUTHORIZED_MESSAGE) {
  return new GraphQLError(errMessage, {
    extensions: {
      code: AUTHENTICATION_ERROR_CODE,
    },
  });
};

export function ForbiddenError(errMessage = DEFAULT_FORBIDDEN_MESSAGE) {
  return new GraphQLError(errMessage, {
    extensions: {
      code: FORBIDDEN_ERROR_CODE,
    },
  });
};

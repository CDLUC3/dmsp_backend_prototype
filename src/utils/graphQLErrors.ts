import {  GraphQLError } from 'graphql';

export const AUTHENTICATION_ERROR_CODE: string = 'UNAUTHENTICATED';
export const FORBIDDEN_ERROR_CODE: string = 'FORBIDDEN';

export const DEFAULT_AUNAUTHORIZED_MESSAGE: string = 'Unauthorized';
export const DEFAULT_FORBIDDEN_MESSAGE: string = 'Forbidden';

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

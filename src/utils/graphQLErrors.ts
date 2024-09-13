import {  GraphQLError } from 'graphql';

export const AUTHENTICATION_ERROR_CODE = 'UNAUTHENTICATED';
export const BAD_REQUEST_ERROR_CODE = 'BAD_REQUEST';
export const FORBIDDEN_ERROR_CODE = 'FORBIDDEN';
export const INTERNAL_SERVER_ERROR_CODE = 'INTERNAL_SERVER';
export const NOT_FOUND_ERROR_CODE = 'NOT_FOUND';

export const DEFAULT_UNAUTHORIZED_MESSAGE = 'Unauthorized';
export const DEFAULT_BAD_REQUEST_MESSAGE = 'Bad Request';
export const DEFAULT_FORBIDDEN_MESSAGE = 'Forbidden';
export const DEFAULT_INTERNAL_SERVER_MESSAGE = 'Internal Server Error';
export const DEFAULT_NOT_FOUND_MESSAGE = 'Not Found';

export function AuthenticationError(errMessage = DEFAULT_UNAUTHORIZED_MESSAGE) {
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

export function NotFoundError(errMessage = DEFAULT_NOT_FOUND_MESSAGE) {
  return new GraphQLError(errMessage, {
    extensions: {
      code: NOT_FOUND_ERROR_CODE,
    },
  });
};

export function BadRequestError(errMessage = DEFAULT_BAD_REQUEST_MESSAGE) {
  return new GraphQLError(errMessage, {
    extensions: {
      code: BAD_REQUEST_ERROR_CODE,
    }
  })
};

export function InternalServerError(errMessage = DEFAULT_INTERNAL_SERVER_MESSAGE) {
  return new GraphQLError(errMessage, {
    extensions: {
      code: INTERNAL_SERVER_ERROR_CODE,
    }
  })
};

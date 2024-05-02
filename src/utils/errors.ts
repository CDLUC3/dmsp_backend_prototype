import {  GraphQLError } from 'graphql';

export function AuthenticationError() {
  const authErrMessage = '*** you must be logged in ***';
  return new GraphQLError(authErrMessage, {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  });
};

export function ForbiddenError(errMessage) {
  return new GraphQLError(errMessage, {
    extensions: {
      code: 'FORBIDDEN',
    },
  });
};

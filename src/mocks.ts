import { resolvers as userMock } from './mocks/user';
import { resolvers as contributorRoleMock } from './mocks/contributorRole';

// Gather all of the mock defintions
export const mocks = {
  // ...scalarMocks,
  ...contributorRoleMock,
  ...userMock
};

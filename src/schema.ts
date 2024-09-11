import { mergeTypeDefs } from '@graphql-tools/merge';

import { typeDefs as baseTypeDefs } from './schemas/base';
import { typeDefs as affiliationTypeDefs } from './schemas/affiliation';
import { typeDefs as collaboratorTypeDefs } from './schemas/collaborator';
import { typeDefs as contributorRoleTypeDefs } from './schemas/contributorRole';
import { typeDefs as sectionTypeDefs } from './schemas/section';
import { typeDefs as tagTypeDefs } from './schemas/tag';
import { typeDefs as dmspTypeDefs } from './schemas/dmsp';
import { typeDefs as templateTypeDefs } from './schemas/template';
import { typeDefs as userTypeDefs } from './schemas/user';
import { typeDefs as versionedTemplateTypeDefs } from './schemas/versionedTemplate';

export const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  affiliationTypeDefs,
  collaboratorTypeDefs,
  sectionTypeDefs,
  tagTypeDefs,
  contributorRoleTypeDefs,
  dmspTypeDefs,
  templateTypeDefs,
  userTypeDefs,
  versionedTemplateTypeDefs,
]);


import { mergeTypeDefs } from '@graphql-tools/merge';

import { typeDefs as baseTypeDefs } from './schemas/base';
import { typeDefs as affiliationTypeDefs } from './schemas/affiliation';
import { typeDefs as collaboratorTypeDefs } from './schemas/collaborator';
import { typeDefs as contributorRoleTypeDefs } from './schemas/contributorRole';
import { typeDefs as dmspTypeDefs } from './schemas/dmsp';
import { typeDefs as questionTypeDefs } from './schemas/question';
import { typeDefs as questionConditionTypeDefs } from './schemas/questionCondition';
import { typeDefs as questionTypeTypeDefs } from './schemas/questionType';
import { typeDefs as sectionTypeDefs } from './schemas/section';
import { typeDefs as tagTypeDefs } from './schemas/tag';
import { typeDefs as templateTypeDefs } from './schemas/template';
import { typeDefs as userTypeDefs } from './schemas/user';
import { typeDefs as versionedQuestionTypeDefs } from './schemas/versionedQuestion';
import { typeDefs as versionedQuestionConditionTypeDefs } from './schemas/versionedQuestionCondition';
import { typeDefs as versionedSectionTypeDefs } from './schemas/versionedSection';
import { typeDefs as versionedTemplateTypeDefs } from './schemas/versionedTemplate';

export const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  affiliationTypeDefs,
  collaboratorTypeDefs,
  contributorRoleTypeDefs,
  dmspTypeDefs,
  questionTypeDefs,
  questionConditionTypeDefs,
  questionTypeTypeDefs,
  sectionTypeDefs,
  tagTypeDefs,
  templateTypeDefs,
  userTypeDefs,
  versionedQuestionTypeDefs,
  versionedQuestionConditionTypeDefs,
  versionedSectionTypeDefs,
  versionedTemplateTypeDefs,
]);


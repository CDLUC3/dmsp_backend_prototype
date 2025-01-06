import { mergeTypeDefs } from '@graphql-tools/merge';

import { typeDefs as baseTypeDefs } from './schemas/base';
import { typeDefs as affiliationTypeDefs } from './schemas/affiliation';
import { typeDefs as answerTypeDefs } from './schemas/answer';
import { typeDefs as collaboratorTypeDefs } from './schemas/collaborator';
import { typeDefs as contributorTypeDefs } from './schemas/contributor';
import { typeDefs as contributorRoleTypeDefs } from './schemas/contributorRole';
import { typeDefs as feedbackTypeDefs } from './schemas/feedback';
import { typeDefs as languageTypeDefs } from './schemas/language';
import { typeDefs as planTypeDefs } from './schemas/plan';
import { typeDefs as projectTypeDefs } from './schemas/project';
import { typeDefs as projectFunderTypeDefs } from './schemas/projectFunder';
import { typeDefs as questionTypeDefs } from './schemas/question';
import { typeDefs as questionConditionTypeDefs } from './schemas/questionCondition';
import { typeDefs as questionTypeTypeDefs } from './schemas/questionType';
import { typeDefs as researchDomainTypeDefs } from './schemas/researchDomain';
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
  answerTypeDefs,
  collaboratorTypeDefs,
  feedbackTypeDefs,
  languageTypeDefs,
  planTypeDefs,
  projectTypeDefs,
  projectFunderTypeDefs,
  sectionTypeDefs,
  tagTypeDefs,
  versionedSectionTypeDefs,
  contributorRoleTypeDefs,
  contributorTypeDefs,
  questionTypeDefs,
  questionConditionTypeDefs,
  questionTypeTypeDefs,
  researchDomainTypeDefs,
  sectionTypeDefs,
  tagTypeDefs,
  templateTypeDefs,
  userTypeDefs,
  versionedQuestionTypeDefs,
  versionedQuestionConditionTypeDefs,
  versionedSectionTypeDefs,
  versionedTemplateTypeDefs,
]);

import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';

import { dmspIdScalar } from './resolvers/scalars/dmspId';
import { orcidScalar } from './resolvers/scalars/orcid';
import { rorScalar } from './resolvers/scalars/ror';

import { resolvers as affiliationResolvers } from './resolvers/affiliation';
import { resolvers as collaboratorResolvers } from './resolvers/collaborator';
import { resolvers as contributorRoleResolvers } from './resolvers/contributorRole';
import { resolvers as languageResolvers } from './resolvers/language';
import { resolvers as questionResolvers } from './resolvers/question';
import { resolvers as questionConditionResolvers } from './resolvers/questionCondition';
import { resolvers as questionTypeResolvers } from './resolvers/questionType';
import { resolvers as templateResolvers } from './resolvers/template';
import { resolvers as sectionResolvers } from './resolvers/section';
import { resolvers as tagResolvers } from './resolvers/tag';
import { resolvers as userResolvers } from './resolvers/user';
import { resolvers as versionedQuestionResolvers } from './resolvers/versionedQuestion';
import { resolvers as versionedQuestionConditionResolvers } from './resolvers/versionedQuestionCondition';
import { resolvers as versionedSectionResolvers } from './resolvers/versionedSection';
import { resolvers as versionedTemplateResolvers } from './resolvers/versionedTemplate';

const scalarResolvers = {
  DmspId: dmspIdScalar,
  Orcid: orcidScalar,
  Ror: rorScalar
}

export const resolvers: IResolvers = mergeResolvers([
  scalarResolvers,
  affiliationResolvers,
  collaboratorResolvers,
  languageResolvers,
  contributorRoleResolvers,
  questionResolvers,
  questionConditionResolvers,
  questionTypeResolvers,
  templateResolvers,
  sectionResolvers,
  tagResolvers,
  userResolvers,
  versionedQuestionResolvers,
  versionedQuestionConditionResolvers,
  versionedSectionResolvers,
  versionedTemplateResolvers,
]);

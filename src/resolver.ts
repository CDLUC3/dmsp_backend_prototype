import { mergeResolvers } from '@graphql-tools/merge';
import { IResolvers } from '@graphql-tools/utils';

import { dmspIdScalar } from './resolvers/scalars/dmspId';
import { orcidScalar } from './resolvers/scalars/orcid';
import { rorScalar } from './resolvers/scalars/ror';

import { resolvers as affiliationResolvers } from './resolvers/affiliation';
import { resolvers as collaboratorResolvers } from './resolvers/collaborator';
import { resolvers as memberResolvers } from './resolvers/member';
import { resolvers as memberRoleResolvers } from './resolvers/memberRole';
import { resolvers as fundingResolvers } from './resolvers/funding';
import { resolvers as languageResolvers } from './resolvers/language';
import { resolvers as licenseResolvers } from './resolvers/license';
import { resolvers as metadataStandardResolvers } from './resolvers/metadataStandard';
import { resolvers as outputResolvers } from './resolvers/output';
import { resolvers as planResolvers } from './resolvers/plan';
import { resolvers as projectResolvers } from './resolvers/project';
import { resolvers as questionResolvers } from './resolvers/question';
import { resolvers as questionConditionResolvers } from './resolvers/questionCondition';
import { resolvers as questionTypeResolvers } from './resolvers/questionType';
import { resolvers as templateResolvers } from './resolvers/template';
import { resolvers as repositoryResolvers } from './resolvers/repository';
import { resolvers as researchDomainResolvers } from './resolvers/researchDomain';
import { resolvers as sectionResolvers } from './resolvers/section';
import { resolvers as superAdminResolvers } from './resolvers/superAdmin';
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
  memberResolvers,
  memberRoleResolvers,
  fundingResolvers,
  languageResolvers,
  licenseResolvers,
  metadataStandardResolvers,
  outputResolvers,
  planResolvers,
  projectResolvers,
  questionResolvers,
  questionConditionResolvers,
  questionTypeResolvers,
  repositoryResolvers,
  researchDomainResolvers,
  templateResolvers,
  sectionResolvers,
  superAdminResolvers,
  tagResolvers,
  userResolvers,
  versionedQuestionResolvers,
  versionedQuestionConditionResolvers,
  versionedSectionResolvers,
  versionedTemplateResolvers,
]);

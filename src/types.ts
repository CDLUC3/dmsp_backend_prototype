import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { MyContext } from './context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTimeISO: { input: any; output: any; }
  DmspId: { input: any; output: any; }
  EmailAddress: { input: any; output: any; }
  Orcid: { input: any; output: any; }
  Ror: { input: any; output: any; }
  URL: { input: any; output: any; }
};

/** The status of the funding */
export type AccessLevel =
  /** Access requests must be reviewed and then permitted */
  | 'CONTROLLED'
  /** Any other type of access level */
  | 'OTHER'
  /** Access to the output will be public/open */
  | 'UNRESTRICTED';

export type AddMetadataStandardInput = {
  /** A description of the metadata standard */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Keywords to assist in finding the metadata standard */
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the metadata standard */
  name: Scalars['String']['input'];
  /** Research domains associated with the metadata standard */
  researchDomainIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The taxonomy URL (do not make this up! should resolve to an HTML/JSON representation of the object) */
  uri?: InputMaybe<Scalars['String']['input']>;
};

export type AddProjectFundingInput = {
  /** The funder URI */
  affiliationId: Scalars['String']['input'];
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: InputMaybe<Scalars['String']['input']>;
  /** The project */
  projectId: Scalars['Int']['input'];
  /** The status of the funding resquest */
  status?: InputMaybe<ProjectFundingStatus>;
};

export type AddProjectMemberInput = {
  /** The Member's affiliation URI */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The Member's email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The Member's first/given name */
  givenName?: InputMaybe<Scalars['String']['input']>;
  /** The roles the Member has on the research project */
  memberRoleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The Member's ORCID */
  orcid?: InputMaybe<Scalars['String']['input']>;
  /** The research project */
  projectId: Scalars['Int']['input'];
  /** The Member's last/sur name */
  surName?: InputMaybe<Scalars['String']['input']>;
};

export type AddProjectOutputInput = {
  /** The date the output is expected to be deposited (YYYY-MM-DD format) */
  anticipatedReleaseDate?: InputMaybe<Scalars['String']['input']>;
  /** A description of the output */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The initial access level that will be allowed for the output */
  initialAccessLevel?: InputMaybe<Scalars['String']['input']>;
  /** The initial license that will apply to the output */
  initialLicenseId?: InputMaybe<Scalars['Int']['input']>;
  /** Whether or not the output may contain personally identifying information (PII) */
  mayContainPII?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether or not the output may contain sensitive data */
  mayContainSensitiveInformation?: InputMaybe<Scalars['Boolean']['input']>;
  /** The metadata standards that will be used to describe the output */
  metadataStandardIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The type of output */
  outputTypeId: Scalars['Int']['input'];
  /** The id of the project you are adding the output to */
  projectId: Scalars['Int']['input'];
  /** The repositories the output will be deposited in */
  respositoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The title/name of the output */
  title: Scalars['String']['input'];
};

/** Input for adding a new QuestionCondition */
export type AddQuestionConditionInput = {
  /** The action to take on a QuestionCondition */
  action: QuestionConditionActionType;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: InputMaybe<Scalars['String']['input']>;
  /** The type of condition in which to take the action */
  conditionType: QuestionConditionCondition;
  /** The id of the question that the QuestionCondition belongs to */
  questionId: Scalars['Int']['input'];
  /** The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise) */
  target: Scalars['String']['input'];
};

export type AddQuestionInput = {
  /** The display order of the question */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** Guidance to complete the question */
  guidanceText?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not the Question has had any changes since it was last published */
  isDirty?: InputMaybe<Scalars['Boolean']['input']>;
  /** The JSON representation of the question type */
  json?: InputMaybe<Scalars['String']['input']>;
  /** This will be used as a sort of title for the Question */
  questionText?: InputMaybe<Scalars['String']['input']>;
  /** To indicate whether the question is required to be completed */
  required?: InputMaybe<Scalars['Boolean']['input']>;
  /** Requirements associated with the Question */
  requirementText?: InputMaybe<Scalars['String']['input']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: InputMaybe<Scalars['String']['input']>;
  /** The unique id of the Section that the question belongs to */
  sectionId: Scalars['Int']['input'];
  /** The unique id of the Template that the question belongs to */
  templateId: Scalars['Int']['input'];
  /** Boolean indicating whether we should use content from sampleText as the default answer */
  useSampleTextAsDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AddRelatedWorkInput = {
  __typename?: 'AddRelatedWorkInput';
  /** The citation for the related work */
  citation?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the work (e.g. DOI, URL, etc. */
  identifier: Scalars['String']['output'];
  /** The project that the related work is associated with */
  projectId: Scalars['Int']['output'];
  /** The related work's relationship to the research project (e.g. references, isReferencedBy, etc.) */
  relationDescriptor: RelatedWorkDescriptor;
  /** The type of the related work (e.g. dataset, software, etc.) */
  workType: RelatedWorkType;
};

export type AddRepositoryInput = {
  /** A description of the repository */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Keywords to assist in finding the repository */
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the repository */
  name: Scalars['String']['input'];
  /** The Categories/Types of the repository */
  repositoryTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Research domains associated with the repository */
  researchDomainIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The taxonomy URL (do not make this up! should resolve to an HTML/JSON representation of the object) */
  uri?: InputMaybe<Scalars['String']['input']>;
  /** The website URL */
  website?: InputMaybe<Scalars['String']['input']>;
};

/** Input for adding a new section */
export type AddSectionInput = {
  /** The Section you want to copy from */
  copyFromVersionedSectionId?: InputMaybe<Scalars['Int']['input']>;
  /** The order in which the section will be displayed in the template */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** The guidance to help user with section */
  guidance?: InputMaybe<Scalars['String']['input']>;
  /** The section introduction */
  introduction?: InputMaybe<Scalars['String']['input']>;
  /** The section name */
  name: Scalars['String']['input'];
  /** Requirements that a user must consider in this section */
  requirements?: InputMaybe<Scalars['String']['input']>;
  /** The Tags associated with this section. A section might not have any tags */
  tags?: InputMaybe<Array<TagInput>>;
  /** The id of the template that the section belongs to */
  templateId: Scalars['Int']['input'];
};

/** A respresentation of an institution, organization or company */
export type Affiliation = {
  __typename?: 'Affiliation';
  /** Acronyms for the affiliation */
  acronyms?: Maybe<Array<Scalars['String']['output']>>;
  /** Whether or not the affiliation is active. Inactive records should not appear in typeaheads! */
  active: Scalars['Boolean']['output'];
  /** Alias names for the affiliation */
  aliases?: Maybe<Array<Scalars['String']['output']>>;
  /** The API URL that can be used to search for project/award information */
  apiTarget?: Maybe<Scalars['String']['output']>;
  /** The primary contact email */
  contactEmail?: Maybe<Scalars['String']['output']>;
  /** The primary contact name */
  contactName?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName: Scalars['String']['output'];
  /** Any errors with the Object */
  errors?: Maybe<AffiliationErrors>;
  /** The email address(es) to notify when feedback has been requested (stored as JSON array) */
  feedbackEmails?: Maybe<Array<Scalars['String']['output']>>;
  /** Whether or not the affiliation wants to use the feedback workflow */
  feedbackEnabled: Scalars['Boolean']['output'];
  /** The message to display to users when they request feedback */
  feedbackMessage?: Maybe<Scalars['String']['output']>;
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The Crossref Funder id */
  fundrefId?: Maybe<Scalars['String']['output']>;
  /** The official homepage for the affiliation */
  homepage?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the affiliation (assigned by the Database) */
  id?: Maybe<Scalars['Int']['output']>;
  /** The logo file name */
  logoName?: Maybe<Scalars['String']['output']>;
  /** The URI of the logo */
  logoURI?: Maybe<Scalars['String']['output']>;
  /** Whether or not the affiliation is allowed to have administrators */
  managed: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The official name for the affiliation (defined by the system of provenance) */
  name: Scalars['String']['output'];
  /** The system the affiliation's data came from (e.g. ROR, DMPTool, etc.) */
  provenance: Scalars['String']['output'];
  /** The combined name, homepage, aliases and acronyms to facilitate search */
  searchName: Scalars['String']['output'];
  /** The email domains associated with the affiliation (for SSO) */
  ssoEmailDomains?: Maybe<Array<AffiliationEmailDomain>>;
  /** The SSO entityId */
  ssoEntityId?: Maybe<Scalars['String']['output']>;
  /** The links the affiliation's users can use to get help */
  subHeaderLinks?: Maybe<Array<AffiliationLink>>;
  /** The types of the affiliation (e.g. Company, Education, Government, etc.) */
  types: Array<AffiliationType>;
  /** The properties of this object that are NOT editable. Determined by the record's provenance */
  uneditableProperties: Array<Scalars['String']['output']>;
  /** The unique identifer for the affiliation (assigned by the provenance e.g. https://ror.org/12345) */
  uri: Scalars['String']['output'];
};

/** Email domains linked to the affiliation for purposes of determining if SSO is applicable */
export type AffiliationEmailDomain = {
  __typename?: 'AffiliationEmailDomain';
  /** The email domain (e.g. example.com, law.example.com, etc.) */
  domain: Scalars['String']['output'];
  /** Unique identifier for the email domain */
  id: Scalars['Int']['output'];
};

/** Input for email domains linked to the affiliation for purposes of determining if SSO is applicable */
export type AffiliationEmailDomainInput = {
  /** The email domain (e.g. example.com, law.example.com, etc.) */
  domain: Scalars['String']['input'];
  /** Unique identifier for the email domain */
  id: Scalars['Int']['input'];
};

/** A collection of errors related to the Answer */
export type AffiliationErrors = {
  __typename?: 'AffiliationErrors';
  acronyms?: Maybe<Scalars['String']['output']>;
  aliases?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  feedbackEmails?: Maybe<Scalars['String']['output']>;
  feedbackMessage?: Maybe<Scalars['String']['output']>;
  fundrefId?: Maybe<Scalars['String']['output']>;
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
  homepage?: Maybe<Scalars['String']['output']>;
  json?: Maybe<Scalars['String']['output']>;
  logoName?: Maybe<Scalars['String']['output']>;
  logoURI?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
  provenance?: Maybe<Scalars['String']['output']>;
  searchName?: Maybe<Scalars['String']['output']>;
  ssoEntityId?: Maybe<Scalars['String']['output']>;
  subHeaderLinks?: Maybe<Scalars['String']['output']>;
  types?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
  versionedQuestionId?: Maybe<Scalars['String']['output']>;
  versionedSectionId?: Maybe<Scalars['String']['output']>;
};

/** Input options for adding an Affiliation */
export type AffiliationInput = {
  /** Acronyms for the affiliation */
  acronyms?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Whether or not the Affiliation is active and available in search results */
  active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Alias names for the affiliation */
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The primary contact email */
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  /** The primary contact name */
  contactName?: InputMaybe<Scalars['String']['input']>;
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName?: InputMaybe<Scalars['String']['input']>;
  /** The email address(es) to notify when feedback has been requested (stored as JSON array) */
  feedbackEmails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Whether or not the affiliation wants to use the feedback workflow */
  feedbackEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** The message to display to users when they request feedback */
  feedbackMessage?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not this affiliation is a funder */
  funder?: InputMaybe<Scalars['Boolean']['input']>;
  /** The Crossref Funder id */
  fundrefId?: InputMaybe<Scalars['String']['input']>;
  /** The official homepage for the affiliation */
  homepage?: InputMaybe<Scalars['String']['input']>;
  /** The id of the affiliation */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The logo file name */
  logoName?: InputMaybe<Scalars['String']['input']>;
  /** The URI of the logo */
  logoURI?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not the affiliation is allowed to have administrators */
  managed?: InputMaybe<Scalars['Boolean']['input']>;
  /** The official name for the affiliation (defined by the system of provenance) */
  name: Scalars['String']['input'];
  /** The email domains associated with the affiliation (for SSO) */
  ssoEmailDomains?: InputMaybe<Array<AffiliationEmailDomainInput>>;
  /** The SSO entityId */
  ssoEntityId?: InputMaybe<Scalars['String']['input']>;
  /** The links the affiliation's users can use to get help */
  subHeaderLinks?: InputMaybe<Array<AffiliationLinkInput>>;
  /** The types of the affiliation (e.g. Company, Education, Government, etc.) */
  types?: InputMaybe<Array<AffiliationType>>;
  /** The unique identifer for the affiliation (Not editable!) */
  uri?: InputMaybe<Scalars['String']['input']>;
};

/** A hyperlink displayed in the sub-header of the UI for the afiliation's users */
export type AffiliationLink = {
  __typename?: 'AffiliationLink';
  /** Unique identifier for the link */
  id: Scalars['Int']['output'];
  /** The text to display (e.g. Helpdesk, Grants Office, etc.) */
  text?: Maybe<Scalars['String']['output']>;
  /** The URL */
  url: Scalars['String']['output'];
};

/** Input for a hyperlink displayed in the sub-header of the UI for the afiliation's users */
export type AffiliationLinkInput = {
  /** Unique identifier for the link */
  id: Scalars['Int']['input'];
  /** The text to display (e.g. Helpdesk, Grants Office, etc.) */
  text?: InputMaybe<Scalars['String']['input']>;
  /** The URL */
  url: Scalars['String']['input'];
};

/** The provenance of an Affiliation record */
export type AffiliationProvenance =
  /** Created and managed within the DMPTool */
  | 'DMPTOOL'
  /** Created and managed by the Research Organization Registry (ROR) https://ror.org */
  | 'ROR';

/** Search result - An abbreviated version of an Affiliation */
export type AffiliationSearch = {
  __typename?: 'AffiliationSearch';
  /** Has an API that be used to search for project/award information */
  apiTarget?: Maybe<Scalars['String']['output']>;
  /** The official display name */
  displayName: Scalars['String']['output'];
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The unique identifer for the affiliation */
  id: Scalars['Int']['output'];
  /** The categories the Affiliation belongs to */
  types?: Maybe<Array<AffiliationType>>;
  /** The URI of the affiliation (typically the ROR id) */
  uri: Scalars['String']['output'];
};

export type AffiliationSearchResults = PaginatedQueryResults & {
  __typename?: 'AffiliationSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<AffiliationSearch>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Categories for Affiliation */
export type AffiliationType =
  | 'ARCHIVE'
  | 'COMPANY'
  | 'EDUCATION'
  | 'FACILITY'
  | 'GOVERNMENT'
  | 'HEALTHCARE'
  | 'NONPROFIT'
  | 'OTHER';

/** An answer to a question on a Data Managament Plan (DMP) */
export type Answer = {
  __typename?: 'Answer';
  /** The comments associated with the answer */
  comments?: Maybe<Array<AnswerComment>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<AffiliationErrors>;
  /** The feedback comments associated with the answer */
  feedbackComments?: Maybe<Array<PlanFeedbackComment>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The answer to the question */
  json?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The DMP that the answer belongs to */
  plan?: Maybe<Plan>;
  /** The question in the template the answer is for */
  versionedQuestion?: Maybe<VersionedQuestion>;
  /** The question in the template the answer is for */
  versionedSection?: Maybe<VersionedSection>;
};

export type AnswerComment = {
  __typename?: 'AnswerComment';
  /** The answer the comment is associated with */
  answerId: Scalars['Int']['output'];
  /** The comment */
  commentText: Scalars['String']['output'];
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<AnswerCommentErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** User who made the comment */
  user?: Maybe<User>;
};

/** A collection of errors related to the Answer Comment */
export type AnswerCommentErrors = {
  __typename?: 'AnswerCommentErrors';
  answerId?: Maybe<Scalars['String']['output']>;
  commentText?: Maybe<Scalars['String']['output']>;
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
};

/** The result of the findCollaborator query */
export type CollaboratorSearchResult = {
  __typename?: 'CollaboratorSearchResult';
  /** The collaborator's affiliation */
  affiliation?: Maybe<Affiliation>;
  /** The collaborator's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The collaborator's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The collaborator's last/sur name */
  surName?: Maybe<Scalars['String']['output']>;
};

export type ExternalFunding = {
  __typename?: 'ExternalFunding';
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: Maybe<Scalars['String']['output']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: Maybe<Scalars['String']['output']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: Maybe<Scalars['String']['output']>;
};

export type ExternalMember = {
  __typename?: 'ExternalMember';
  /** The ROR ID of the member's institution */
  affiliationId?: Maybe<Scalars['String']['output']>;
  /** The member's email address */
  email?: Maybe<Scalars['String']['output']>;
  /** The member's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The member's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The member's last/sur name */
  surName?: Maybe<Scalars['String']['output']>;
};

/** External Project type */
export type ExternalProject = {
  __typename?: 'ExternalProject';
  /** The project description */
  abstractText?: Maybe<Scalars['String']['output']>;
  /** The project end date */
  endDate?: Maybe<Scalars['String']['output']>;
  /** Funding information for this project */
  fundings?: Maybe<Array<ExternalFunding>>;
  /** Member information for this project */
  members?: Maybe<Array<ExternalMember>>;
  /** The project start date */
  startDate?: Maybe<Scalars['String']['output']>;
  /** The project title */
  title?: Maybe<Scalars['String']['output']>;
};

export type ExternalSearchInput = {
  /** The URI of the funder we are using to search for projects */
  affiliationId: Scalars['String']['input'];
  /** The funder award/grant id/url (optional) */
  awardId?: InputMaybe<Scalars['String']['input']>;
  /** The funder award/grant name (optional) */
  awardName?: InputMaybe<Scalars['String']['input']>;
  /** The funder award/grant year (optional) as YYYY */
  awardYear?: InputMaybe<Scalars['String']['input']>;
  /** The principal investigator names (optional) can be any combination of first/middle/last names */
  piNames?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** A result of the most popular funders */
export type FunderPopularityResult = {
  __typename?: 'FunderPopularityResult';
  /** The apiTarget for the affiliation (if available) */
  apiTarget?: Maybe<Scalars['String']['output']>;
  /** The official display name */
  displayName: Scalars['String']['output'];
  /** The unique identifer for the affiliation */
  id: Scalars['Int']['output'];
  /** The number of plans associated with this funder in the past year */
  nbrPlans: Scalars['Int']['output'];
  /** The URI of the affiliation (typically the ROR id) */
  uri: Scalars['String']['output'];
};

/** Output type for the initializePlanVersion mutation */
export type InitializePlanVersionOutput = {
  __typename?: 'InitializePlanVersionOutput';
  /** The number of PlanVersion records that were created */
  count: Scalars['Int']['output'];
  /** The ids of the Plans that were processed */
  planIds?: Maybe<Array<Scalars['Int']['output']>>;
};

/** The types of object a User can be invited to Collaborate on */
export type InvitedToType =
  | 'PLAN'
  | 'TEMPLATE';

/** A Language supported by the system */
export type Language = {
  __typename?: 'Language';
  /** The unique identifer for the Language using the 2 character (ISO 639-1) language code and optionally the 2 character (ISO 3166-1) country code */
  id: Scalars['String']['output'];
  /** Whether or not the language is the default */
  isDefault: Scalars['Boolean']['output'];
  /** A displayable name for the language */
  name: Scalars['String']['output'];
};

/** A license associated with a research output (e.g. CC0, MIT, etc.) */
export type License = {
  __typename?: 'License';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the license */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<LicenseErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the license */
  name: Scalars['String']['output'];
  /** Whether or not the license is recommended */
  recommended: Scalars['Boolean']['output'];
  /** The taxonomy URL of the license */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the License */
export type LicenseErrors = {
  __typename?: 'LicenseErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type LicenseSearchResults = PaginatedQueryResults & {
  __typename?: 'LicenseSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<License>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type MemberRole = {
  __typename?: 'MemberRole';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A longer description of the member role useful for tooltips */
  description?: Maybe<Scalars['String']['output']>;
  /** The order in which to display these items when displayed in the UI */
  displayOrder: Scalars['Int']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<MemberRoleErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The Ui label to display for the member role */
  label: Scalars['String']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The taxonomy URL for the member role */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the member role */
export type MemberRoleErrors = {
  __typename?: 'MemberRoleErrors';
  description?: Maybe<Scalars['String']['output']>;
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

/** A metadata standard used when describing a research output */
export type MetadataStandard = {
  __typename?: 'MetadataStandard';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the metadata standard */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<MetadataStandardErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Keywords to assist in finding the metadata standard */
  keywords?: Maybe<Array<Scalars['String']['output']>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the metadata standard */
  name: Scalars['String']['output'];
  /** Research domains associated with the metadata standard */
  researchDomains?: Maybe<Array<ResearchDomain>>;
  /** The taxonomy URL of the metadata standard */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the MetadataStandard */
export type MetadataStandardErrors = {
  __typename?: 'MetadataStandardErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  keywords?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  researchDomainIds?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type MetadataStandardSearchResults = PaginatedQueryResults & {
  __typename?: 'MetadataStandardSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<MetadataStandard>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Reactivate the specified user Account (Admin only) */
  activateUser?: Maybe<User>;
  /** Create a new Affiliation */
  addAffiliation?: Maybe<Affiliation>;
  /** Answer a question */
  addAnswer?: Maybe<Answer>;
  /** Add comment for an answer  */
  addAnswerComment?: Maybe<AnswerComment>;
  /** Add feedback comment for an answer within a round of feedback */
  addFeedbackComment?: Maybe<PlanFeedbackComment>;
  /** Add a new License (don't make the URI up! should resolve to an taxonomy HTML/JSON representation of the object) */
  addLicense?: Maybe<License>;
  /** Add a new member role (URL and label must be unique!) */
  addMemberRole?: Maybe<MemberRole>;
  /** Add a new MetadataStandard */
  addMetadataStandard?: Maybe<MetadataStandard>;
  /** Create a plan */
  addPlan?: Maybe<Plan>;
  /** Add a Funding information to a Plan */
  addPlanFunding?: Maybe<PlanFunding>;
  /** Add a Member to a Plan */
  addPlanMember?: Maybe<PlanMember>;
  /** Create a project */
  addProject?: Maybe<Project>;
  /** Add a collaborator to a Plan */
  addProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Add Funding information to a research project */
  addProjectFunding?: Maybe<ProjectFunding>;
  /** Add a Member to a research project */
  addProjectMember?: Maybe<ProjectMember>;
  /** Add an output to a research project */
  addProjectOutput?: Maybe<ProjectOutput>;
  /** Create a new Question */
  addQuestion: Question;
  /** Create a new QuestionCondition associated with a question */
  addQuestionCondition: QuestionCondition;
  /** Add a related work to a research project */
  addRelatedWork?: Maybe<RelatedWork>;
  /** Add a new Repository */
  addRepository?: Maybe<Repository>;
  /** Create a new Section. Leave the 'copyFromVersionedSectionId' blank to create a new section from scratch */
  addSection: Section;
  /** Add a new tag to available list of tags */
  addTag?: Maybe<Tag>;
  /** Create a new Template. Leave the 'copyFromTemplateId' blank to create a new template from scratch */
  addTemplate?: Maybe<Template>;
  /** Add a collaborator to a Template */
  addTemplateCollaborator?: Maybe<TemplateCollaborator>;
  /** Add an email address for the current user */
  addUserEmail?: Maybe<UserEmail>;
  /** Archive a plan */
  archivePlan?: Maybe<Plan>;
  /** Download the plan */
  archiveProject?: Maybe<Project>;
  /** Archive a Template (unpublishes any associated PublishedTemplate */
  archiveTemplate?: Maybe<Template>;
  /** Mark the feedback round as complete */
  completeFeedback?: Maybe<PlanFeedback>;
  /** Publish the template or save as a draft */
  createTemplateVersion?: Maybe<Template>;
  /** Deactivate the specified user Account (Admin only) */
  deactivateUser?: Maybe<User>;
  /** Merge two licenses */
  mergeLicenses?: Maybe<License>;
  /** Merge two metadata standards */
  mergeMetadataStandards?: Maybe<MetadataStandard>;
  /** Merge two repositories */
  mergeRepositories?: Maybe<Repository>;
  /** Merge the 2 user accounts (Admin only) */
  mergeUsers?: Maybe<User>;
  /** Import a project from an external source */
  projectImport?: Maybe<Project>;
  /** Publish a plan (changes status to PUBLISHED) */
  publishPlan?: Maybe<Plan>;
  /** Delete an Affiliation (only applicable to AffiliationProvenance == DMPTOOL) */
  removeAffiliation?: Maybe<Affiliation>;
  /** Remove answer comment */
  removeAnswerComment?: Maybe<AnswerComment>;
  /** Remove feedback comment for an answer within a round of feedback */
  removeFeedbackComment?: Maybe<PlanFeedbackComment>;
  /** Delete a License */
  removeLicense?: Maybe<License>;
  /** Delete the member role */
  removeMemberRole?: Maybe<MemberRole>;
  /** Delete a MetadataStandard */
  removeMetadataStandard?: Maybe<MetadataStandard>;
  /** Remove a Funding from a Plan */
  removePlanFunding?: Maybe<PlanFunding>;
  /** Remove a PlanMember from a Plan */
  removePlanMember?: Maybe<PlanMember>;
  /** Remove a ProjectCollaborator from a Plan */
  removeProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Remove Funding from the research project */
  removeProjectFunding?: Maybe<ProjectFunding>;
  /** Remove a research project Member */
  removeProjectMember?: Maybe<ProjectMember>;
  /** Remove a research project output */
  removeProjectOutput?: Maybe<ProjectOutput>;
  /** Remove an Output from a Plan */
  removeProjectOutputFromPlan?: Maybe<ProjectOutput>;
  /** Delete a Question */
  removeQuestion?: Maybe<Question>;
  /** Remove a QuestionCondition using a specific QuestionCondition id */
  removeQuestionCondition?: Maybe<QuestionCondition>;
  /** Remove a related work from a research project */
  removeRelatedWork?: Maybe<RelatedWork>;
  /** Delete a Repository */
  removeRepository?: Maybe<Repository>;
  /** Delete a section */
  removeSection: Section;
  /** Delete a tag */
  removeTag?: Maybe<Tag>;
  /** Remove a TemplateCollaborator from a Template */
  removeTemplateCollaborator?: Maybe<TemplateCollaborator>;
  /** Anonymize the current user's account (essentially deletes their account without orphaning things) */
  removeUser?: Maybe<User>;
  /** Remove an email address from the current user */
  removeUserEmail?: Maybe<UserEmail>;
  /** Request a round of admin feedback */
  requestFeedback?: Maybe<PlanFeedback>;
  /** Resend an invite to a ProjectCollaborator */
  resendInviteToProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Add an Output to a Plan */
  selectProjectOutputForPlan?: Maybe<ProjectOutput>;
  /** Designate the email as the current user's primary email address */
  setPrimaryUserEmail?: Maybe<Array<Maybe<UserEmail>>>;
  /** Set the user's ORCID */
  setUserOrcid?: Maybe<User>;
  /** Initialize an PLanVersion record in the DynamoDB for all Plans that do not have one */
  superInitializePlanVersions: InitializePlanVersionOutput;
  /** Update an Affiliation */
  updateAffiliation?: Maybe<Affiliation>;
  /** Edit an answer */
  updateAnswer?: Maybe<Answer>;
  /** Update comment for an answer  */
  updateAnswerComment?: Maybe<AnswerComment>;
  /** Update feedback comment for an answer within a round of feedback */
  updateFeedbackComment?: Maybe<PlanFeedbackComment>;
  /** Update a License record */
  updateLicense?: Maybe<License>;
  /** Update the member role */
  updateMemberRole?: Maybe<MemberRole>;
  /** Update a MetadataStandard record */
  updateMetadataStandard?: Maybe<MetadataStandard>;
  /** Change the current user's password */
  updatePassword?: Maybe<User>;
  /** Update multiple Plan Fundings passing in an array of projectFundingIds */
  updatePlanFunding?: Maybe<Array<Maybe<PlanFunding>>>;
  /** Chnage a Member's accessLevel on a Plan */
  updatePlanMember?: Maybe<PlanMember>;
  /** Change the plan's status */
  updatePlanStatus?: Maybe<Plan>;
  /** Change the plan's title */
  updatePlanTitle?: Maybe<Plan>;
  /** Edit a project */
  updateProject?: Maybe<Project>;
  /** Change a collaborator's accessLevel on a Plan */
  updateProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Update Funding information on the research project */
  updateProjectFunding?: Maybe<ProjectFunding>;
  /** Update a Member on the research project */
  updateProjectMember?: Maybe<ProjectMember>;
  /** Update an output on the research project */
  updateProjectOutput?: Maybe<ProjectOutput>;
  /** Update a Question */
  updateQuestion: Question;
  /** Update a QuestionCondition for a specific QuestionCondition id */
  updateQuestionCondition?: Maybe<QuestionCondition>;
  /** Change the question's display order */
  updateQuestionDisplayOrder: ReorderQuestionsResult;
  /** Update a related work on the research project */
  updateRelatedWork?: Maybe<RelatedWork>;
  /** Update a Repository record */
  updateRepository?: Maybe<Repository>;
  /** Update a Section */
  updateSection: Section;
  /** Change the section's display order */
  updateSectionDisplayOrder: ReorderSectionsResult;
  /** Update a tag */
  updateTag?: Maybe<Tag>;
  /** Update a Template */
  updateTemplate?: Maybe<Template>;
  /** Update the current user's email notifications */
  updateUserNotifications?: Maybe<User>;
  /** Update the current user's information */
  updateUserProfile?: Maybe<User>;
  /** Upload a plan */
  uploadPlan?: Maybe<Plan>;
};


export type MutationActivateUserArgs = {
  userId: Scalars['Int']['input'];
};


export type MutationAddAffiliationArgs = {
  input: AffiliationInput;
};


export type MutationAddAnswerArgs = {
  json?: InputMaybe<Scalars['String']['input']>;
  planId: Scalars['Int']['input'];
  versionedQuestionId: Scalars['Int']['input'];
  versionedSectionId: Scalars['Int']['input'];
};


export type MutationAddAnswerCommentArgs = {
  answerId: Scalars['Int']['input'];
  commentText: Scalars['String']['input'];
};


export type MutationAddFeedbackCommentArgs = {
  answerId: Scalars['Int']['input'];
  commentText: Scalars['String']['input'];
  planFeedbackId: Scalars['Int']['input'];
  planId: Scalars['Int']['input'];
};


export type MutationAddLicenseArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  recommended?: InputMaybe<Scalars['Boolean']['input']>;
  uri?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddMemberRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationAddMetadataStandardArgs = {
  input: AddMetadataStandardInput;
};


export type MutationAddPlanArgs = {
  projectId: Scalars['Int']['input'];
  versionedTemplateId: Scalars['Int']['input'];
};


export type MutationAddPlanFundingArgs = {
  planId: Scalars['Int']['input'];
  projectFundingId: Scalars['Int']['input'];
};


export type MutationAddPlanMemberArgs = {
  planId: Scalars['Int']['input'];
  projectMemberId: Scalars['Int']['input'];
  roleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type MutationAddProjectArgs = {
  isTestProject?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};


export type MutationAddProjectCollaboratorArgs = {
  accessLevel?: InputMaybe<ProjectCollaboratorAccessLevel>;
  email: Scalars['String']['input'];
  projectId: Scalars['Int']['input'];
};


export type MutationAddProjectFundingArgs = {
  input: AddProjectFundingInput;
};


export type MutationAddProjectMemberArgs = {
  input: AddProjectMemberInput;
};


export type MutationAddProjectOutputArgs = {
  input: AddProjectOutputInput;
};


export type MutationAddQuestionArgs = {
  input: AddQuestionInput;
};


export type MutationAddQuestionConditionArgs = {
  input: AddQuestionConditionInput;
};


export type MutationAddRelatedWorkArgs = {
  input: AddRelatedWorkInput;
};


export type MutationAddRepositoryArgs = {
  input?: InputMaybe<AddRepositoryInput>;
};


export type MutationAddSectionArgs = {
  input: AddSectionInput;
};


export type MutationAddTagArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationAddTemplateArgs = {
  copyFromTemplateId?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};


export type MutationAddTemplateCollaboratorArgs = {
  email: Scalars['String']['input'];
  templateId: Scalars['Int']['input'];
};


export type MutationAddUserEmailArgs = {
  email: Scalars['String']['input'];
  isPrimary: Scalars['Boolean']['input'];
};


export type MutationArchivePlanArgs = {
  planId: Scalars['Int']['input'];
};


export type MutationArchiveProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationArchiveTemplateArgs = {
  templateId: Scalars['Int']['input'];
};


export type MutationCompleteFeedbackArgs = {
  planFeedbackId: Scalars['Int']['input'];
  planId: Scalars['Int']['input'];
  summaryText?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateTemplateVersionArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  latestPublishVisibility: TemplateVisibility;
  templateId: Scalars['Int']['input'];
  versionType?: InputMaybe<TemplateVersionType>;
};


export type MutationDeactivateUserArgs = {
  userId: Scalars['Int']['input'];
};


export type MutationMergeLicensesArgs = {
  licenseToKeepId: Scalars['Int']['input'];
  licenseToRemoveId: Scalars['Int']['input'];
};


export type MutationMergeMetadataStandardsArgs = {
  metadataStandardToKeepId: Scalars['Int']['input'];
  metadataStandardToRemoveId: Scalars['Int']['input'];
};


export type MutationMergeRepositoriesArgs = {
  repositoryToKeepId: Scalars['Int']['input'];
  repositoryToRemoveId: Scalars['Int']['input'];
};


export type MutationMergeUsersArgs = {
  userIdToBeMerged: Scalars['Int']['input'];
  userIdToKeep: Scalars['Int']['input'];
};


export type MutationProjectImportArgs = {
  input?: InputMaybe<ProjectImportInput>;
};


export type MutationPublishPlanArgs = {
  planId: Scalars['Int']['input'];
  visibility?: InputMaybe<PlanVisibility>;
};


export type MutationRemoveAffiliationArgs = {
  affiliationId: Scalars['Int']['input'];
};


export type MutationRemoveAnswerCommentArgs = {
  answerCommentId: Scalars['Int']['input'];
  answerId: Scalars['Int']['input'];
};


export type MutationRemoveFeedbackCommentArgs = {
  planFeedbackCommentId: Scalars['Int']['input'];
  planId: Scalars['Int']['input'];
};


export type MutationRemoveLicenseArgs = {
  uri: Scalars['String']['input'];
};


export type MutationRemoveMemberRoleArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveMetadataStandardArgs = {
  uri: Scalars['String']['input'];
};


export type MutationRemovePlanFundingArgs = {
  planFundingId: Scalars['Int']['input'];
};


export type MutationRemovePlanMemberArgs = {
  planMemberId: Scalars['Int']['input'];
};


export type MutationRemoveProjectCollaboratorArgs = {
  projectCollaboratorId: Scalars['Int']['input'];
};


export type MutationRemoveProjectFundingArgs = {
  projectFundingId: Scalars['Int']['input'];
};


export type MutationRemoveProjectMemberArgs = {
  projectMemberId: Scalars['Int']['input'];
};


export type MutationRemoveProjectOutputArgs = {
  projectOutputId: Scalars['Int']['input'];
};


export type MutationRemoveProjectOutputFromPlanArgs = {
  planId: Scalars['Int']['input'];
  projectOutputId: Scalars['Int']['input'];
};


export type MutationRemoveQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type MutationRemoveQuestionConditionArgs = {
  questionConditionId: Scalars['Int']['input'];
};


export type MutationRemoveRelatedWorkArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveRepositoryArgs = {
  repositoryId: Scalars['Int']['input'];
};


export type MutationRemoveSectionArgs = {
  sectionId: Scalars['Int']['input'];
};


export type MutationRemoveTagArgs = {
  tagId: Scalars['Int']['input'];
};


export type MutationRemoveTemplateCollaboratorArgs = {
  email: Scalars['String']['input'];
  templateId: Scalars['Int']['input'];
};


export type MutationRemoveUserEmailArgs = {
  email: Scalars['String']['input'];
};


export type MutationRequestFeedbackArgs = {
  planId: Scalars['Int']['input'];
};


export type MutationResendInviteToProjectCollaboratorArgs = {
  projectCollaboratorId: Scalars['Int']['input'];
};


export type MutationSelectProjectOutputForPlanArgs = {
  planId: Scalars['Int']['input'];
  projectOutputId: Scalars['Int']['input'];
};


export type MutationSetPrimaryUserEmailArgs = {
  email: Scalars['String']['input'];
};


export type MutationSetUserOrcidArgs = {
  orcid: Scalars['String']['input'];
};


export type MutationUpdateAffiliationArgs = {
  input: AffiliationInput;
};


export type MutationUpdateAnswerArgs = {
  answerId: Scalars['Int']['input'];
  json?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateAnswerCommentArgs = {
  answerCommentId: Scalars['Int']['input'];
  answerId: Scalars['Int']['input'];
  commentText: Scalars['String']['input'];
};


export type MutationUpdateFeedbackCommentArgs = {
  commentText: Scalars['String']['input'];
  planFeedbackCommentId: Scalars['Int']['input'];
  planId: Scalars['Int']['input'];
};


export type MutationUpdateLicenseArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  recommended?: InputMaybe<Scalars['Boolean']['input']>;
  uri: Scalars['String']['input'];
};


export type MutationUpdateMemberRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationUpdateMetadataStandardArgs = {
  input: UpdateMetadataStandardInput;
};


export type MutationUpdatePasswordArgs = {
  email: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationUpdatePlanFundingArgs = {
  planId: Scalars['Int']['input'];
  projectFundingIds: Array<Scalars['Int']['input']>;
};


export type MutationUpdatePlanMemberArgs = {
  isPrimaryContact?: InputMaybe<Scalars['Boolean']['input']>;
  memberRoleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  planId: Scalars['Int']['input'];
  planMemberId: Scalars['Int']['input'];
};


export type MutationUpdatePlanStatusArgs = {
  planId: Scalars['Int']['input'];
  status: PlanStatus;
};


export type MutationUpdatePlanTitleArgs = {
  planId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};


export type MutationUpdateProjectArgs = {
  input?: InputMaybe<UpdateProjectInput>;
};


export type MutationUpdateProjectCollaboratorArgs = {
  accessLevel: ProjectCollaboratorAccessLevel;
  projectCollaboratorId: Scalars['Int']['input'];
};


export type MutationUpdateProjectFundingArgs = {
  input: UpdateProjectFundingInput;
};


export type MutationUpdateProjectMemberArgs = {
  input: UpdateProjectMemberInput;
};


export type MutationUpdateProjectOutputArgs = {
  input: UpdateProjectOutputInput;
};


export type MutationUpdateQuestionArgs = {
  input: UpdateQuestionInput;
};


export type MutationUpdateQuestionConditionArgs = {
  input: UpdateQuestionConditionInput;
};


export type MutationUpdateQuestionDisplayOrderArgs = {
  newDisplayOrder: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
};


export type MutationUpdateRelatedWorkArgs = {
  input: UpdateRelatedWorkInput;
};


export type MutationUpdateRepositoryArgs = {
  input?: InputMaybe<UpdateRepositoryInput>;
};


export type MutationUpdateSectionArgs = {
  input: UpdateSectionInput;
};


export type MutationUpdateSectionDisplayOrderArgs = {
  newDisplayOrder: Scalars['Int']['input'];
  sectionId: Scalars['Int']['input'];
};


export type MutationUpdateTagArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  tagId: Scalars['Int']['input'];
};


export type MutationUpdateTemplateArgs = {
  bestPractice?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  templateId: Scalars['Int']['input'];
};


export type MutationUpdateUserNotificationsArgs = {
  input: UpdateUserNotificationsInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};


export type MutationUploadPlanArgs = {
  fileContent?: InputMaybe<Scalars['String']['input']>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['Int']['input'];
};

/** A result from searching the ORCID API */
export type OrcidUserSearchResult = {
  __typename?: 'OrcidUserSearchResult';
  /** The user's organizational affiliation */
  affiliationName?: Maybe<Scalars['String']['output']>;
  /** The affiliation's ROR ID */
  affiliationRORId?: Maybe<Scalars['String']['output']>;
  /** The affiliation's URL */
  affiliationURL?: Maybe<Scalars['String']['output']>;
  /** The user's primary email */
  email?: Maybe<Scalars['String']['output']>;
  /** The user's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The user's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The user's last/family name */
  surName?: Maybe<Scalars['String']['output']>;
};

/** An output collected/produced during or as a result of a research project */
export type OutputType = {
  __typename?: 'OutputType';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the type of output to be collected/generated during the project */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<OutputTypeErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the output type */
  name: Scalars['String']['output'];
  /** The taxonomy URL of the output type */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the OutputType */
export type OutputTypeErrors = {
  __typename?: 'OutputTypeErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type PaginatedQueryResults = {
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination only!) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page (standard offset pagination only!) */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more only!) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Pagination options, either cursor-based (inifite-scroll) or offset-based pagination (standard first, next, etc.) */
export type PaginationOptions = {
  /** Request just the bestPractice templates */
  bestPractice?: InputMaybe<Scalars['Boolean']['input']>;
  /** The cursor to start the pagination from (used for cursor infinite scroll/load more only!) */
  cursor?: InputMaybe<Scalars['String']['input']>;
  /** The number of items to return */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** The number of items to skip before starting the pagination (used for standard offset pagination only!) */
  offset?: InputMaybe<Scalars['Int']['input']>;
  /** Request templates whose ownerIds match the provided array of ownerURIs */
  selectOwnerURIs?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** The sort order (used for standard offset pagination only!) */
  sortDir?: InputMaybe<Scalars['String']['input']>;
  /** The sort field (used for standard offset pagination only!) */
  sortField?: InputMaybe<Scalars['String']['input']>;
  /** The type of pagination to use (cursor or offset) */
  type?: InputMaybe<Scalars['String']['input']>;
};

export type PaginationType =
  /** Cursor-based pagination (infinite scroll/load more) */
  | 'CURSOR'
  /** Standard pagination using offsets (first, next, previous, last) */
  | 'OFFSET';

/** A Data Managament Plan (DMP) */
export type Plan = {
  __typename?: 'Plan';
  /** Answers associated with the plan */
  answers?: Maybe<Array<Answer>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The DMP ID/DOI for the plan */
  dmpId?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanErrors>;
  /** Whether or not the plan is featured on the public plans page */
  featured?: Maybe<Scalars['Boolean']['output']>;
  /** Feedback associated with the plan */
  feedback?: Maybe<Array<PlanFeedback>>;
  /** The funding for the plan */
  fundings?: Maybe<Array<PlanFunding>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The language of the plan */
  languageId?: Maybe<Scalars['String']['output']>;
  /** The members for the plan */
  members?: Maybe<Array<PlanMember>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Anticipated research outputs */
  outputs?: Maybe<Array<PlanOutput>>;
  /** The progress the user has made within the plan */
  progress?: Maybe<PlanProgress>;
  /** The project the plan is associated with */
  project?: Maybe<Project>;
  /** The timestamp for when the Plan was registered */
  registered?: Maybe<Scalars['String']['output']>;
  /** The individual who registered the plan */
  registeredById?: Maybe<Scalars['Int']['output']>;
  /** The status/state of the plan */
  status?: Maybe<PlanStatus>;
  /** The title of the plan */
  title?: Maybe<Scalars['String']['output']>;
  /** The section search results */
  versionedSections?: Maybe<Array<PlanSectionProgress>>;
  /** The template the plan is based on */
  versionedTemplate?: Maybe<VersionedTemplate>;
  /** Prior versions of the plan */
  versions?: Maybe<Array<PlanVersion>>;
  /** The visibility/privacy setting for the plan */
  visibility?: Maybe<PlanVisibility>;
};

export type PlanDownloadFormat =
  | 'CSV'
  | 'DOCX'
  | 'HTML'
  | 'JSON'
  | 'PDF'
  | 'TEXT';

/** The error messages for the plan */
export type PlanErrors = {
  __typename?: 'PlanErrors';
  dmp_id?: Maybe<Scalars['String']['output']>;
  featured?: Maybe<Scalars['String']['output']>;
  general?: Maybe<Scalars['String']['output']>;
  languageId?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  registered?: Maybe<Scalars['String']['output']>;
  registeredById?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  versionedTemplateId?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** A round of administrative feedback for a Data Managament Plan (DMP) */
export type PlanFeedback = {
  __typename?: 'PlanFeedback';
  /** The timestamp that the feedback was marked as complete */
  completed?: Maybe<Scalars['String']['output']>;
  /** The admin who completed the feedback round */
  completedBy?: Maybe<User>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanFeedbackErrors>;
  /** The specific contextual commentary */
  feedbackComments?: Maybe<Array<PlanFeedbackComment>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The plan the user wants feedback on */
  plan?: Maybe<Plan>;
  /** The timestamp of when the user requested the feedback */
  requested?: Maybe<Scalars['String']['output']>;
  /** The user who requested the round of feedback */
  requestedBy?: Maybe<User>;
  /** An overall summary that can be sent to the user upon completion */
  summaryText?: Maybe<Scalars['String']['output']>;
};

export type PlanFeedbackComment = {
  __typename?: 'PlanFeedbackComment';
  /** The round of plan feedback the comment belongs to */
  PlanFeedback?: Maybe<PlanFeedback>;
  /** The answerId the comment is related to */
  answerId?: Maybe<Scalars['Int']['output']>;
  /** The comment */
  commentText?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanFeedbackCommentErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** User who made the comment */
  user?: Maybe<User>;
};

/** A collection of errors related to the PlanFeedbackComment */
export type PlanFeedbackCommentErrors = {
  __typename?: 'PlanFeedbackCommentErrors';
  answer?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  planFeedback?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the PlanFeedback */
export type PlanFeedbackErrors = {
  __typename?: 'PlanFeedbackErrors';
  completedById?: Maybe<Scalars['String']['output']>;
  feedbackComments?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
  requestedById?: Maybe<Scalars['String']['output']>;
  summaryText?: Maybe<Scalars['String']['output']>;
};

/** Funding associated with a plan */
export type PlanFunding = {
  __typename?: 'PlanFunding';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanFundingErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The plan that is seeking (or has aquired) funding */
  plan?: Maybe<Plan>;
  /** The project funder */
  projectFunding?: Maybe<ProjectFunding>;
};

/** A collection of errors related to the PlanFunding */
export type PlanFundingErrors = {
  __typename?: 'PlanFundingErrors';
  ProjectFundingId?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
};

/** A Member associated with a plan */
export type PlanMember = {
  __typename?: 'PlanMember';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanMemberErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Member the primary contact for the Plan */
  isPrimaryContact?: Maybe<Scalars['Boolean']['output']>;
  /** The roles associated with the Member */
  memberRoles?: Maybe<Array<MemberRole>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The plan that the Member is associated with */
  plan?: Maybe<Plan>;
  /** The project Member */
  projectMember?: Maybe<ProjectMember>;
};

/** A collection of errors related to the PlanMember */
export type PlanMemberErrors = {
  __typename?: 'PlanMemberErrors';
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
  /** The roles associated with the Member */
  memberRoleIds?: Maybe<Scalars['String']['output']>;
  /** The isPrimaryContact flag */
  primaryContact?: Maybe<Scalars['String']['output']>;
  /** The project that the Member is associated with */
  projectId?: Maybe<Scalars['String']['output']>;
  /** The project Member */
  projectMemberId?: Maybe<Scalars['String']['output']>;
};

export type PlanOutput = {
  __typename?: 'PlanOutput';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanOutputErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
};

/** A collection of errors related to the PlanOutput */
export type PlanOutputErrors = {
  __typename?: 'PlanOutputErrors';
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
};

export type PlanProgress = {
  __typename?: 'PlanProgress';
  /** The total number of questions the user has answered */
  answeredQuestions: Scalars['Int']['output'];
  /** The percentage of questions the user has answered */
  percentComplete: Scalars['Float']['output'];
  /** The total number of questions in the plan */
  totalQuestions: Scalars['Int']['output'];
};

export type PlanSearchResult = {
  __typename?: 'PlanSearchResult';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdBy?: Maybe<Scalars['String']['output']>;
  /** The DMP ID/DOI for the plan */
  dmpId?: Maybe<Scalars['String']['output']>;
  /** The funding information for the plan */
  funding?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The names of the members */
  members?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedBy?: Maybe<Scalars['String']['output']>;
  /** The timestamp for when the Plan was registered/published */
  registered?: Maybe<Scalars['String']['output']>;
  /** The person who published/registered the plan */
  registeredBy?: Maybe<Scalars['String']['output']>;
  /** The current status of the plan */
  status?: Maybe<PlanStatus>;
  /** The name of the template the plan is based on */
  templateTitle?: Maybe<Scalars['String']['output']>;
  /** The title of the plan */
  title?: Maybe<Scalars['String']['output']>;
  /** The section search results */
  versionedSections?: Maybe<Array<PlanSectionProgress>>;
  /** The visibility/permission setting */
  visibility?: Maybe<PlanVisibility>;
};

/** The progress the user has made within a section of the plan */
export type PlanSectionProgress = {
  __typename?: 'PlanSectionProgress';
  /** The number of questions the user has answered */
  answeredQuestions: Scalars['Int']['output'];
  /** The display order of the section */
  displayOrder: Scalars['Int']['output'];
  /** The title of the section */
  title: Scalars['String']['output'];
  /** The number of questions in the section */
  totalQuestions: Scalars['Int']['output'];
  /** The id of the Section */
  versionedSectionId: Scalars['Int']['output'];
};

/** The status/state of the plan */
export type PlanStatus =
  /** The Plan has been archived */
  | 'ARCHIVED'
  /** The Plan is ready for submission or download */
  | 'COMPLETE'
  /** The Plan is still being written and reviewed */
  | 'DRAFT';

/** A version of the plan */
export type PlanVersion = {
  __typename?: 'PlanVersion';
  /** The timestamp of the version, equates to the plan's modified date */
  timestamp?: Maybe<Scalars['String']['output']>;
  /** The DMPHub URL for the version */
  url?: Maybe<Scalars['String']['output']>;
};

/** The visibility/privacy setting for the plan */
export type PlanVisibility =
  /** Visible only to people at the user's (or editor's) affiliation */
  | 'ORGANIZATIONAL'
  /** Visible only to people who have been invited to collaborate (or provide feedback) */
  | 'PRIVATE'
  /** Visible to anyone */
  | 'PUBLIC';

/** DMP Tool Project type */
export type Project = {
  __typename?: 'Project';
  /** The research project abstract */
  abstractText?: Maybe<Scalars['String']['output']>;
  /** People who have access to modify or comment on the Project */
  collaborators?: Maybe<Array<ProjectCollaborator>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The estimated date the research project will end (use YYYY-MM-DD format) */
  endDate?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectErrors>;
  /** The funders who are supporting the research project */
  fundings?: Maybe<Array<ProjectFunding>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is test/mock research project */
  isTestProject?: Maybe<Scalars['Boolean']['output']>;
  /** People who are contributing to the research project (not just the DMP) */
  members?: Maybe<Array<ProjectMember>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The outputs that will be/were created as a reult of the research project */
  outputs?: Maybe<Array<ProjectOutput>>;
  /** The plans that are associated with the research project */
  plans?: Maybe<Array<PlanSearchResult>>;
  /** The type of research being done */
  researchDomain?: Maybe<ResearchDomain>;
  /** The estimated date the research project will begin (use YYYY-MM-DD format) */
  startDate?: Maybe<Scalars['String']['output']>;
  /** The name/title of the research project */
  title: Scalars['String']['output'];
};

/** A user that that belongs to a different affiliation that can edit the Plan */
export type ProjectCollaborator = {
  __typename?: 'ProjectCollaborator';
  /** The user's access level */
  accessLevel?: Maybe<ProjectCollaboratorAccessLevel>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The collaborator's email */
  email: Scalars['String']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<ProjectCollaboratorErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The user who invited the collaborator */
  invitedBy?: Maybe<User>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The project the collaborator may edit */
  project?: Maybe<Project>;
  /** The project member id */
  projectMemberId?: Maybe<Scalars['Int']['output']>;
  /** The collaborator (if they have an account) */
  user?: Maybe<User>;
};

export type ProjectCollaboratorAccessLevel =
  /** The user is ONLY able to comment on the Plan's answers */
  | 'COMMENT'
  /** The user is able to perform most actions on a Project/Plan except (publish, mark as complete and change access) */
  | 'EDIT'
  /** The user is able to perform all actions on a Plan (typically restricted to the owner/creator) */
  | 'OWN';

/** A collection of errors related to the ProjectCollaborator */
export type ProjectCollaboratorErrors = {
  __typename?: 'ProjectCollaboratorErrors';
  accessLevel?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
  invitedById?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the Project */
export type ProjectErrors = {
  __typename?: 'ProjectErrors';
  abstractText?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  fundingIds?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  memberIds?: Maybe<Scalars['String']['output']>;
  outputIds?: Maybe<Scalars['String']['output']>;
  researchDomainId?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

/** Project search filter options */
export type ProjectFilterOptions = {
  /** Filter results by the plan's status */
  status?: InputMaybe<PlanStatus>;
};

/** Funding that is supporting a research project */
export type ProjectFunding = {
  __typename?: 'ProjectFunding';
  /** The funder */
  affiliation?: Maybe<Affiliation>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectFundingErrors>;
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: Maybe<Scalars['String']['output']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: Maybe<Scalars['String']['output']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The project that is seeking (or has aquired) funding */
  project?: Maybe<Project>;
  /** The status of the funding resquest */
  status?: Maybe<ProjectFundingStatus>;
};

/** A collection of errors related to the ProjectFunding */
export type ProjectFundingErrors = {
  __typename?: 'ProjectFundingErrors';
  affiliationId?: Maybe<Scalars['String']['output']>;
  funderOpportunityNumber?: Maybe<Scalars['String']['output']>;
  funderProjectNumber?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  grantId?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

/** The status of the funding */
export type ProjectFundingStatus =
  /** The funder did not award the project */
  | 'DENIED'
  /** The funding has been awarded to the project */
  | 'GRANTED'
  /** The project will be submitting a grant, or has not yet heard back from the funder */
  | 'PLANNED';

export type ProjectImportInput = {
  /** The external funding data */
  funding?: InputMaybe<Array<AddProjectFundingInput>>;
  /** The external member data */
  members?: InputMaybe<Array<AddProjectMemberInput>>;
  /** The external project data */
  project: UpdateProjectInput;
};

/** A person involved with a research project */
export type ProjectMember = {
  __typename?: 'ProjectMember';
  /** The Member's affiliation */
  affiliation?: Maybe<Affiliation>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The Member's email address */
  email?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectMemberErrors>;
  /** The Member's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Member the primary contact for the Plan */
  isPrimaryContact?: Maybe<Scalars['Boolean']['output']>;
  /** The roles the Member has on the research project */
  memberRoles?: Maybe<Array<MemberRole>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The Member's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The research project */
  project?: Maybe<Project>;
  /** The Member's last/sur name */
  surName?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the ProjectMember */
export type ProjectMemberErrors = {
  __typename?: 'ProjectMemberErrors';
  affiliationId?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  givenName?: Maybe<Scalars['String']['output']>;
  memberRoleIds?: Maybe<Scalars['String']['output']>;
  orcid?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  surName?: Maybe<Scalars['String']['output']>;
};

/** Something produced/collected as part of (or as a result of) a research project */
export type ProjectOutput = {
  __typename?: 'ProjectOutput';
  /** The date the output is expected to be deposited (YYYY-MM-DD format) */
  anticipatedReleaseDate?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the output */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectOutputErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The initial access level that will be allowed for the output */
  initialAccessLevel: AccessLevel;
  /** The initial license that will apply to the output */
  initialLicense?: Maybe<License>;
  /** Whether or not the output may contain personally identifying information (PII) */
  mayContainPII?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not the output may contain sensitive data */
  mayContainSensitiveInformation?: Maybe<Scalars['Boolean']['output']>;
  /** The metadata standards that will be used to describe the output */
  metadataStandards?: Maybe<Array<MetadataStandard>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The type of output */
  outputType?: Maybe<OutputType>;
  /** The project associated with the output */
  project?: Maybe<Project>;
  /** The repositories the output will be deposited in */
  repositories?: Maybe<Array<Repository>>;
  /** The title/name of the output */
  title: Scalars['String']['output'];
};

/** A collection of errors related to the ProjectOutput */
export type ProjectOutputErrors = {
  __typename?: 'ProjectOutputErrors';
  anticipatedReleaseDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  initialAccessLevel?: Maybe<Scalars['String']['output']>;
  initialLicenseId?: Maybe<Scalars['String']['output']>;
  metadataStandardIds?: Maybe<Scalars['String']['output']>;
  outputTypeId?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  repositoryIds?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResult = {
  __typename?: 'ProjectSearchResult';
  /** The research project abstract */
  abstractText?: Maybe<Scalars['String']['output']>;
  /** The names and access levels of the collaborators */
  collaborators?: Maybe<Array<ProjectSearchResultCollaborator>>;
  /** The timestamp when the project was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The id of the person who created the project */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The name of the person who created the project */
  createdByName?: Maybe<Scalars['String']['output']>;
  /** The estimated date the research project will end (use YYYY-MM-DD format) */
  endDate?: Maybe<Scalars['String']['output']>;
  /** Search results errors */
  errors?: Maybe<ProjectErrors>;
  /** The names of the funders */
  fundings?: Maybe<Array<ProjectSearchResultFunding>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is test/mock research project */
  isTestProject?: Maybe<Scalars['Boolean']['output']>;
  /** The names and roles of the members */
  members?: Maybe<Array<ProjectSearchResultMember>>;
  /** The timestamp when the project was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The id of the person who last modified the project */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the person who last modified the project */
  modifiedByName?: Maybe<Scalars['String']['output']>;
  /** The type of research being done */
  researchDomain?: Maybe<Scalars['String']['output']>;
  /** The estimated date the research project will begin (use YYYY-MM-DD format) */
  startDate?: Maybe<Scalars['String']['output']>;
  /** The name/title of the research project */
  title?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResultCollaborator = {
  __typename?: 'ProjectSearchResultCollaborator';
  /** The access level of the collaborator */
  accessLevel?: Maybe<Scalars['String']['output']>;
  /** The name of the collaborator */
  name?: Maybe<Scalars['String']['output']>;
  /** The ORCiD ID */
  orcid?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResultFunding = {
  __typename?: 'ProjectSearchResultFunding';
  /** The grant id/url */
  grantId?: Maybe<Scalars['String']['output']>;
  /** The name of the funder */
  name?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResultMember = {
  __typename?: 'ProjectSearchResultMember';
  /** The name of the member */
  name?: Maybe<Scalars['String']['output']>;
  /** The ORCiD ID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The role of the member */
  role?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResults = PaginatedQueryResults & {
  __typename?: 'ProjectSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<ProjectSearchResult>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PublishedTemplateMetaDataResults = {
  __typename?: 'PublishedTemplateMetaDataResults';
  /** The available affiliations in the result set */
  availableAffiliations?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Whether the result set includes bestPractice templates */
  hasBestPracticeTemplates?: Maybe<Scalars['Boolean']['output']>;
};

export type PublishedTemplateSearchResults = PaginatedQueryResults & {
  __typename?: 'PublishedTemplateSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<VersionedTemplateSearchResult>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Retrieve a specific Affiliation by its ID */
  affiliationById?: Maybe<Affiliation>;
  /** Retrieve a specific Affiliation by its URI */
  affiliationByURI?: Maybe<Affiliation>;
  /** Retrieve all of the valid Affiliation types */
  affiliationTypes?: Maybe<Array<Scalars['String']['output']>>;
  /** Perform a search for Affiliations matching the specified name */
  affiliations?: Maybe<AffiliationSearchResults>;
  /** Get the specific answer */
  answer?: Maybe<Answer>;
  /** Get an answer by versionedQuestionId */
  answerByVersionedQuestionId?: Maybe<Answer>;
  /** Get all answers for the given project and plan and section */
  answers?: Maybe<Array<Maybe<Answer>>>;
  /** Get all of the best practice VersionedSection */
  bestPracticeSections?: Maybe<Array<Maybe<VersionedSection>>>;
  /** Get all of the research domains related to the specified top level domain (more nuanced ones) */
  childResearchDomains?: Maybe<Array<Maybe<ResearchDomain>>>;
  /** Search for a User to add as a collaborator */
  findCollaborator?: Maybe<Array<Maybe<CollaboratorSearchResult>>>;
  /** Get all of the supported Languages */
  languages?: Maybe<Array<Maybe<Language>>>;
  /** Fetch a specific license */
  license?: Maybe<License>;
  /** Search for a license */
  licenses?: Maybe<LicenseSearchResults>;
  /** Returns the currently logged in user's information */
  me?: Maybe<User>;
  /** Get the member role by it's id */
  memberRoleById?: Maybe<MemberRole>;
  /** Get the member role by it's URL */
  memberRoleByURL?: Maybe<MemberRole>;
  /** Get all of the member role types */
  memberRoles?: Maybe<Array<Maybe<MemberRole>>>;
  /** Fetch a specific metadata standard */
  metadataStandard?: Maybe<MetadataStandard>;
  /** Search for a metadata standard */
  metadataStandards?: Maybe<MetadataStandardSearchResults>;
  /** Get all of the user's projects */
  myProjects?: Maybe<ProjectSearchResults>;
  /** Get the Templates that belong to the current user's affiliation (user must be an Admin) */
  myTemplates?: Maybe<TemplateSearchResults>;
  /** Get the VersionedTemplates that belong to the current user's affiliation (user must be an Admin) */
  myVersionedTemplates?: Maybe<Array<Maybe<VersionedTemplateSearchResult>>>;
  /** Get a specific plan */
  plan?: Maybe<Plan>;
  /** Get all rounds of admin feedback for the plan */
  planFeedback?: Maybe<Array<Maybe<PlanFeedback>>>;
  /** Get all of the comments associated with the round of admin feedback */
  planFeedbackComments?: Maybe<Array<Maybe<PlanFeedbackComment>>>;
  /** Get all of the Funding information for the specific Plan */
  planFundings?: Maybe<Array<Maybe<PlanFunding>>>;
  /** Get all of the Users that are Members for the specific Plan */
  planMembers?: Maybe<Array<Maybe<PlanMember>>>;
  /** The subset of project outputs associated with the sepcified Plan */
  planOutputs?: Maybe<Array<Maybe<ProjectOutput>>>;
  /** Get all plans for the research project */
  plans?: Maybe<Array<PlanSearchResult>>;
  /** Returns a list of the top 20 funders ranked by popularity (nbr of plans) for the past year */
  popularFunders?: Maybe<Array<Maybe<FunderPopularityResult>>>;
  /** Get a specific project */
  project?: Maybe<Project>;
  /** Get all of the Users that are collaborators for the Project */
  projectCollaborators?: Maybe<Array<Maybe<ProjectCollaborator>>>;
  /** Get a specific ProjectFunding */
  projectFunding?: Maybe<ProjectFunding>;
  /** Get all of the Funding information for the research project */
  projectFundings?: Maybe<Array<Maybe<ProjectFunding>>>;
  /** Get a specific Member on the research project */
  projectMember?: Maybe<ProjectMember>;
  /** Get all of the Users that a Members to the research project */
  projectMembers?: Maybe<Array<Maybe<ProjectMember>>>;
  /** Fetch a single project output */
  projectOutput?: Maybe<ProjectOutput>;
  /** Get all the research output types */
  projectOutputTypes?: Maybe<Array<Maybe<OutputType>>>;
  /** Get all of the outputs for the research project */
  projectOutputs?: Maybe<Array<Maybe<ProjectOutput>>>;
  /** Search for VersionedQuestions that belong to Section specified by sectionId */
  publishedConditionsForQuestion?: Maybe<Array<Maybe<VersionedQuestionCondition>>>;
  /** Get a specific VersionedQuestion based on versionedQuestionId */
  publishedQuestion?: Maybe<VersionedQuestion>;
  /** Search for VersionedQuestions that belong to Section specified by sectionId and answer status for a plan */
  publishedQuestions?: Maybe<Array<Maybe<VersionedQuestionWithFilled>>>;
  /** Fetch a specific VersionedSection */
  publishedSection?: Maybe<VersionedSection>;
  /** Search for VersionedSection whose name contains the search term */
  publishedSections?: Maybe<VersionedSectionSearchResults>;
  /** Search for VersionedTemplate whose name or owning Org's name contains the search term */
  publishedTemplates?: Maybe<PublishedTemplateSearchResults>;
  /** Search for templates for lightweight info on what unique affiliations are in the data set, and whether any of them have best practice */
  publishedTemplatesMetaData?: Maybe<PublishedTemplateMetaDataResults>;
  /** Get the specific Question based on questionId */
  question?: Maybe<Question>;
  /** Get the QuestionConditions that belong to a specific question */
  questionConditions?: Maybe<Array<Maybe<QuestionCondition>>>;
  /** Get the Questions that belong to the associated sectionId */
  questions?: Maybe<Array<Maybe<Question>>>;
  /** Return the recommended Licenses */
  recommendedLicenses?: Maybe<Array<Maybe<License>>>;
  /** Fetch a specific related work */
  relatedWork?: Maybe<RelatedWork>;
  /** Get all the realted works for the Project */
  relatedWorks?: Maybe<Array<Maybe<RelatedWork>>>;
  /** Search for a repository */
  repositories?: Maybe<RepositorySearchResults>;
  /** Fetch a specific repository */
  repository?: Maybe<Repository>;
  /** Search for projects within external APIs */
  searchExternalProjects?: Maybe<Array<Maybe<ExternalProject>>>;
  /** Get the specified section */
  section?: Maybe<Section>;
  /** Get all of the VersionedSection for the specified Section ID */
  sectionVersions?: Maybe<Array<Maybe<VersionedSection>>>;
  /** Get the Sections that belong to the associated templateId */
  sections?: Maybe<Array<Maybe<Section>>>;
  /** Fetch the DynamoDB PlanVersion record for a specific plan and version timestamp (leave blank for the latest) */
  superInspectPlanVersion?: Maybe<Scalars['String']['output']>;
  /** Get all available tags to display */
  tags: Array<Tag>;
  tagsBySectionId?: Maybe<Array<Maybe<Tag>>>;
  /** Get the specified Template (user must be an Admin) */
  template?: Maybe<Template>;
  /** Get all of the Users that belong to another affiliation that can edit the Template */
  templateCollaborators?: Maybe<Array<Maybe<TemplateCollaborator>>>;
  /** Get all of the VersionedTemplate for the specified Template (a.k. the Template history) */
  templateVersions?: Maybe<Array<Maybe<VersionedTemplate>>>;
  /** Get all of the top level research domains (the most generic ones) */
  topLevelResearchDomains?: Maybe<Array<Maybe<ResearchDomain>>>;
  /** Returns the specified user (Admin only) */
  user?: Maybe<User>;
  /** Look up a user by their ORCID iD */
  userByOrcid?: Maybe<OrcidUserSearchResult>;
  /** Returns all of the users associated with the current admin's affiliation (Super admins get everything) */
  users?: Maybe<UserSearchResults>;
};


export type QueryAffiliationByIdArgs = {
  affiliationId: Scalars['Int']['input'];
};


export type QueryAffiliationByUriArgs = {
  uri: Scalars['String']['input'];
};


export type QueryAffiliationsArgs = {
  funderOnly?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  paginationOptions?: InputMaybe<PaginationOptions>;
};


export type QueryAnswerArgs = {
  answerId: Scalars['Int']['input'];
  projectId: Scalars['Int']['input'];
};


export type QueryAnswerByVersionedQuestionIdArgs = {
  planId: Scalars['Int']['input'];
  projectId: Scalars['Int']['input'];
  versionedQuestionId: Scalars['Int']['input'];
};


export type QueryAnswersArgs = {
  planId: Scalars['Int']['input'];
  projectId: Scalars['Int']['input'];
  versionedSectionId: Scalars['Int']['input'];
};


export type QueryChildResearchDomainsArgs = {
  parentResearchDomainId: Scalars['Int']['input'];
};


export type QueryFindCollaboratorArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLicenseArgs = {
  uri: Scalars['String']['input'];
};


export type QueryLicensesArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMemberRoleByIdArgs = {
  memberRoleId: Scalars['Int']['input'];
};


export type QueryMemberRoleByUrlArgs = {
  memberRoleURL: Scalars['URL']['input'];
};


export type QueryMetadataStandardArgs = {
  uri: Scalars['String']['input'];
};


export type QueryMetadataStandardsArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  researchDomainId?: InputMaybe<Scalars['Int']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyProjectsArgs = {
  filterOptions?: InputMaybe<ProjectFilterOptions>;
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyTemplatesArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlanArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanFeedbackArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanFeedbackCommentsArgs = {
  planFeedbackId: Scalars['Int']['input'];
  planId: Scalars['Int']['input'];
};


export type QueryPlanFundingsArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanMembersArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanOutputsArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlansArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectCollaboratorsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectFundingArgs = {
  projectFundingId: Scalars['Int']['input'];
};


export type QueryProjectFundingsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectMemberArgs = {
  projectMemberId: Scalars['Int']['input'];
};


export type QueryProjectMembersArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectOutputArgs = {
  projectOutputId: Scalars['Int']['input'];
};


export type QueryProjectOutputsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryPublishedConditionsForQuestionArgs = {
  versionedQuestionId: Scalars['Int']['input'];
};


export type QueryPublishedQuestionArgs = {
  versionedQuestionId: Scalars['Int']['input'];
};


export type QueryPublishedQuestionsArgs = {
  planId: Scalars['Int']['input'];
  versionedSectionId: Scalars['Int']['input'];
};


export type QueryPublishedSectionArgs = {
  versionedSectionId: Scalars['Int']['input'];
};


export type QueryPublishedSectionsArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term: Scalars['String']['input'];
};


export type QueryPublishedTemplatesArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPublishedTemplatesMetaDataArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type QueryQuestionConditionsArgs = {
  questionId: Scalars['Int']['input'];
};


export type QueryQuestionsArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QueryRecommendedLicensesArgs = {
  recommended: Scalars['Boolean']['input'];
};


export type QueryRelatedWorkArgs = {
  id: Scalars['Int']['input'];
};


export type QueryRelatedWorksArgs = {
  projectId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRepositoriesArgs = {
  input: RepositorySearchInput;
};


export type QueryRepositoryArgs = {
  uri: Scalars['String']['input'];
};


export type QuerySearchExternalProjectsArgs = {
  input: ExternalSearchInput;
};


export type QuerySectionArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QuerySectionVersionsArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QuerySectionsArgs = {
  templateId: Scalars['Int']['input'];
};


export type QuerySuperInspectPlanVersionArgs = {
  modified?: InputMaybe<Scalars['String']['input']>;
  planId: Scalars['Int']['input'];
};


export type QueryTagsBySectionIdArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QueryTemplateArgs = {
  templateId: Scalars['Int']['input'];
};


export type QueryTemplateCollaboratorsArgs = {
  templateId: Scalars['Int']['input'];
};


export type QueryTemplateVersionsArgs = {
  templateId: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  userId: Scalars['Int']['input'];
};


export type QueryUserByOrcidArgs = {
  orcid: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};

/** Question always belongs to a Section, which always belongs to a Template */
export type Question = {
  __typename?: 'Question';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The display order of the question */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<QuestionErrors>;
  /** Guidance to complete the question */
  guidanceText?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Question has had any changes since the related template was last published */
  isDirty?: Maybe<Scalars['Boolean']['output']>;
  /** The JSON representation of the question type */
  json?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The conditional logic triggered by this question */
  questionConditions?: Maybe<Array<QuestionCondition>>;
  /** This will be used as a sort of title for the Question */
  questionText?: Maybe<Scalars['String']['output']>;
  /** To indicate whether the question is required to be completed */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** Requirements associated with the Question */
  requirementText?: Maybe<Scalars['String']['output']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: Maybe<Scalars['String']['output']>;
  /** The unique id of the Section that the question belongs to */
  sectionId: Scalars['Int']['output'];
  /** The original question id if this question is a copy of another */
  sourceQestionId?: Maybe<Scalars['Int']['output']>;
  /** The unique id of the Template that the question belongs to */
  templateId: Scalars['Int']['output'];
  /** Boolean indicating whether we should use content from sampleText as the default answer */
  useSampleTextAsDefault?: Maybe<Scalars['Boolean']['output']>;
};

/**
 * if [Question content] [condition] [conditionMatch] then [action] on [target] so
 * for example if 'Yes' EQUAL 'Yes' then 'SHOW_Question' 123
 */
export type QuestionCondition = {
  __typename?: 'QuestionCondition';
  /** The action to take on a QuestionCondition */
  action: QuestionConditionActionType;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: Maybe<Scalars['String']['output']>;
  /** The type of condition in which to take the action */
  conditionType: QuestionConditionCondition;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<QuestionConditionErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The question id that the QuestionCondition belongs to */
  questionId: Scalars['Int']['output'];
  /** The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise) */
  target: Scalars['String']['output'];
};

/** QuestionCondition action */
export type QuestionConditionActionType =
  /** Hide the question */
  | 'HIDE_QUESTION'
  /** Send email */
  | 'SEND_EMAIL'
  /** Show the question */
  | 'SHOW_QUESTION';

/** QuestionCondition types */
export type QuestionConditionCondition =
  /** When a question does not equal a specific value */
  | 'DOES_NOT_EQUAL'
  /** When a question equals a specific value */
  | 'EQUAL'
  /** When a question has an answer */
  | 'HAS_ANSWER'
  /** When a question includes a specific value */
  | 'INCLUDES';

/** A collection of errors related to the QuestionCondition */
export type QuestionConditionErrors = {
  __typename?: 'QuestionConditionErrors';
  action?: Maybe<Scalars['String']['output']>;
  conditionMatch?: Maybe<Scalars['String']['output']>;
  conditionType?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  questionId?: Maybe<Scalars['String']['output']>;
  target?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the Question */
export type QuestionErrors = {
  __typename?: 'QuestionErrors';
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  guidanceText?: Maybe<Scalars['String']['output']>;
  json?: Maybe<Scalars['String']['output']>;
  questionConditionIds?: Maybe<Scalars['String']['output']>;
  questionText?: Maybe<Scalars['String']['output']>;
  requirementText?: Maybe<Scalars['String']['output']>;
  sampleText?: Maybe<Scalars['String']['output']>;
  sectionId?: Maybe<Scalars['String']['output']>;
  sourceQestionId?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
};

/** A metadata standard used when describing a research output */
export type RelatedWork = {
  __typename?: 'RelatedWork';
  /** The citation for the related work */
  citation?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<RelatedWorkErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The unique identifier for the work (e.g. DOI, URL, etc. */
  identifier?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The projectId that the related work is associated with */
  projectId?: Maybe<Scalars['Int']['output']>;
  /** The related work's relationship to the research project (e.g. references, isReferencedBy, etc.) */
  relationDescriptor?: Maybe<RelatedWorkDescriptor>;
  /** The type of the related work (e.g. dataset, software, etc.) */
  workType?: Maybe<RelatedWorkType>;
};

/** Relationship types between a plan and a related work (derived from the DataCite metadata schema */
export type RelatedWorkDescriptor =
  | 'CITES'
  | 'COLLECTS'
  | 'COMPILES'
  | 'CONTINUES'
  | 'DESCRIBES'
  | 'DOCUMENTS'
  | 'HAS_METADATA'
  | 'HAS_PART'
  | 'HAS_TRANSLATION'
  | 'HAS_VERSION'
  | 'IS_CITED_BY'
  | 'IS_COLLECTED_BY'
  | 'IS_COMPILED_BY'
  | 'IS_CONTINUED_BY'
  | 'IS_DERIVED_FROM'
  | 'IS_DESCRIBED_BY'
  | 'IS_DOCUMENTED_BY'
  | 'IS_IDENTICAL_TO'
  | 'IS_METADATA_FOR'
  | 'IS_NEW_VERSION_OF'
  | 'IS_OBSOLETED_BY'
  | 'IS_ORIGINAL_FORM_OF'
  | 'IS_PART_OF'
  | 'IS_PREVIOUS_VERSION_OF'
  | 'IS_PUBLISHED_IN'
  | 'IS_REFERENCED_BY'
  | 'IS_REQUIRED_BY'
  | 'IS_REVIEWED_BY'
  | 'IS_SOURCE_OF'
  | 'IS_SUPPLEMENTED_BY'
  | 'IS_SUPPLEMENT_TO'
  | 'IS_TRANSLATION_OF'
  | 'IS_VARIANT_FORM_OF'
  | 'IS_VERSION_OF'
  | 'OBSOLETES'
  | 'REFERENCES'
  | 'REQUIRES'
  | 'REVIEWS';

/** A collection of errors related to the MetadataStandard */
export type RelatedWorkErrors = {
  __typename?: 'RelatedWorkErrors';
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  relationDescriptor?: Maybe<Scalars['String']['output']>;
  workType?: Maybe<Scalars['String']['output']>;
};

/** The type of work that is related to the plan (derived from the DataCite metadata schema) */
export type RelatedWorkType =
  | 'AUDIOVISUAL'
  | 'BOOK'
  | 'BOOK_CHAPTER'
  | 'COLLECTION'
  | 'COMPUTATIONAL_NOTEBOOK'
  | 'CONFERENCE_PAPER'
  | 'CONFERENCE_PROCEEDING'
  | 'DATASET'
  | 'DATA_PAPER'
  | 'DISSERTATION'
  | 'EVENT'
  | 'IMAGE'
  | 'INSTRUMENT'
  | 'INTERACTIVE_RESOURCE'
  | 'JOURNAL'
  | 'JOURNAL_ARTICLE'
  | 'MODEL'
  | 'OTHER'
  | 'OUTPUT_MANAGEMENT_PLAN'
  | 'PEER_REVIEW'
  | 'PHYSICAL_OBJECT'
  | 'PREPRINT'
  | 'PROJECT'
  | 'REPORT'
  | 'SERVICE'
  | 'SOFTWARE'
  | 'SOUND'
  | 'STANDARD'
  | 'STUDY_REGISTRATION'
  | 'TEXT'
  | 'WORKFLOW';

/** The results of reordering the questions */
export type ReorderQuestionsResult = {
  __typename?: 'ReorderQuestionsResult';
  /** Error messages */
  errors?: Maybe<QuestionErrors>;
  /** The reordered sections */
  questions?: Maybe<Array<Question>>;
};

/** The results of reordering the sections */
export type ReorderSectionsResult = {
  __typename?: 'ReorderSectionsResult';
  /** Error messages */
  errors?: Maybe<SectionErrors>;
  /** The reordered sections */
  sections?: Maybe<Array<Section>>;
};

/** A repository where research outputs are preserved */
export type Repository = {
  __typename?: 'Repository';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the repository */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<RepositoryErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Keywords to assist in finding the repository */
  keywords?: Maybe<Array<Scalars['String']['output']>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the repository */
  name: Scalars['String']['output'];
  /** The Categories/Types of the repository */
  repositoryTypes?: Maybe<Array<RepositoryType>>;
  /** Research domains associated with the repository */
  researchDomains?: Maybe<Array<ResearchDomain>>;
  /** The taxonomy URL of the repository */
  uri: Scalars['String']['output'];
  /** The website URL */
  website?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the Repository */
export type RepositoryErrors = {
  __typename?: 'RepositoryErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  keywords?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  repositoryTypes?: Maybe<Scalars['String']['output']>;
  researchDomainIds?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type RepositorySearchInput = {
  /** The pagination options */
  paginationOptions?: InputMaybe<PaginationOptions>;
  /** The repository category/type */
  repositoryType?: InputMaybe<Scalars['String']['input']>;
  /** The research domain associated with the repository */
  researchDomainId?: InputMaybe<Scalars['Int']['input']>;
  /** The search term */
  term?: InputMaybe<Scalars['String']['input']>;
};

export type RepositorySearchResults = PaginatedQueryResults & {
  __typename?: 'RepositorySearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<Repository>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type RepositoryType =
  /** A discipline specific repository (e.g. GeneCards, Arctic Data Centre, etc.) */
  | 'DISCIPLINARY'
  /** A generalist repository (e.g. Zenodo, Dryad) */
  | 'GENERALIST'
  /** An institution specific repository (e.g. ASU Library Research Data Repository, etc.) */
  | 'INSTITUTIONAL';

/** An aread of research (e.g. Electrical Engineering, Cellular biology, etc.) */
export type ResearchDomain = {
  __typename?: 'ResearchDomain';
  /** The child research domains (if applicable) */
  childResearchDomains?: Maybe<Array<ResearchDomain>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the type of research covered by the domain */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ResearchDomainErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the domain */
  name: Scalars['String']['output'];
  /** The parent research domain (if applicable). If this is blank then it is a top level domain. */
  parentResearchDomain?: Maybe<ResearchDomain>;
  /** The ID of the parent research domain (if applicable) */
  parentResearchDomainId?: Maybe<Scalars['Int']['output']>;
  /** The taxonomy URL of the research domain */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the ResearchDomain */
export type ResearchDomainErrors = {
  __typename?: 'ResearchDomainErrors';
  childResearchDomainIds?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentResearchDomainId?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type ResearchDomainSearchResults = PaginatedQueryResults & {
  __typename?: 'ResearchDomainSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<ResearchDomain>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** A Section that contains a list of questions in a template */
export type Section = {
  __typename?: 'Section';
  /** Whether or not this Section is designated as a 'Best Practice' section */
  bestPractice?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The order in which the section will be displayed in the template */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<SectionErrors>;
  /** The guidance to help user with section */
  guidance?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The section introduction */
  introduction?: Maybe<Scalars['String']['output']>;
  /** Indicates whether or not the section has changed since the template was last published */
  isDirty: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The section title */
  name: Scalars['String']['output'];
  /** The questions associated with this section */
  questions?: Maybe<Array<Question>>;
  /** Requirements that a user must consider in this section */
  requirements?: Maybe<Scalars['String']['output']>;
  /** The Tags associated with this section. A section might not have any tags */
  tags?: Maybe<Array<Maybe<Tag>>>;
  /** The template that the section is associated with */
  template?: Maybe<Template>;
};

/** A collection of errors related to the Section */
export type SectionErrors = {
  __typename?: 'SectionErrors';
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  guidance?: Maybe<Scalars['String']['output']>;
  introduction?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  questionIds?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
};

/** Section version type */
export type SectionVersionType =
  /** Draft - saved state for internal review */
  | 'DRAFT'
  /** Published - saved state for use when creating DMPs */
  | 'PUBLISHED';

/** A Tag is a way to group similar types of categories together */
export type Tag = {
  __typename?: 'Tag';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The tag description */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<TagErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The tag name */
  name: Scalars['String']['output'];
};

/** A collection of errors related to the Tag */
export type TagErrors = {
  __typename?: 'TagErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

/** Input for Tag operations */
export type TagInput = {
  /** The description of the Tag */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The unique identifier for the Tag */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The name of the Tag */
  name: Scalars['String']['input'];
};

/** A Template used to create DMPs */
export type Template = {
  __typename?: 'Template';
  /** Admin users associated with the template's owner */
  admins?: Maybe<Array<User>>;
  /** Whether or not this Template is designated as a 'Best Practice' template */
  bestPractice: Scalars['Boolean']['output'];
  /** Users from different affiliations who have been invited to collaborate on this template */
  collaborators?: Maybe<Array<TemplateCollaborator>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the purpose of the template */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<TemplateErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Template has had any changes since it was last published */
  isDirty: Scalars['Boolean']['output'];
  /** The template's language */
  languageId: Scalars['String']['output'];
  /** The last published date */
  latestPublishDate?: Maybe<Scalars['String']['output']>;
  /** The last published version */
  latestPublishVersion?: Maybe<Scalars['String']['output']>;
  /** Visibility set for the last published template */
  latestPublishVisibility?: Maybe<TemplateVisibility>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name/title of the template */
  name: Scalars['String']['output'];
  /** The affiliation that the template belongs to */
  owner?: Maybe<Affiliation>;
  /** The Sections associated with the template */
  sections?: Maybe<Array<Maybe<Section>>>;
  /** The template that this one was derived from */
  sourceTemplateId?: Maybe<Scalars['Int']['output']>;
};

/** A user that that belongs to a different affiliation that can edit the Template */
export type TemplateCollaborator = {
  __typename?: 'TemplateCollaborator';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The collaborator's email */
  email: Scalars['String']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<TemplateCollaboratorErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The user who invited the collaborator */
  invitedBy?: Maybe<User>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The template the collaborator may edit */
  template?: Maybe<Template>;
  /** The collaborator (if they have an account) */
  user?: Maybe<User>;
};

/** A collection of errors related to the TemplateCollaborator */
export type TemplateCollaboratorErrors = {
  __typename?: 'TemplateCollaboratorErrors';
  email?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  invitedById?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the Template */
export type TemplateErrors = {
  __typename?: 'TemplateErrors';
  collaboratorIds?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  languageId?: Maybe<Scalars['String']['output']>;
  latestPublishVersion?: Maybe<Scalars['String']['output']>;
  latestPublishVisibility?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ownerId?: Maybe<Scalars['String']['output']>;
  sectionIds?: Maybe<Scalars['String']['output']>;
  sourceTemplateId?: Maybe<Scalars['String']['output']>;
};

/** A search result for templates */
export type TemplateSearchResult = {
  __typename?: 'TemplateSearchResult';
  /** Whether or not this Template is designated as a 'Best Practice' template */
  bestPractice?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Template was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The id of the person who created the template */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** the name of the person who created the template */
  createdByName?: Maybe<Scalars['String']['output']>;
  /** A description of the purpose of the template */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Template has had any changes since it was last published */
  isDirty?: Maybe<Scalars['Boolean']['output']>;
  /** The last published date */
  latestPublishDate?: Maybe<Scalars['String']['output']>;
  /** The last published version */
  latestPublishVersion?: Maybe<Scalars['String']['output']>;
  /** Visibility set for the last published template */
  latestPublishVisibility?: Maybe<TemplateVisibility>;
  /** The timestamp when the Template was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The id of the person who last modified the template */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the person who last modified the template */
  modifiedByName?: Maybe<Scalars['String']['output']>;
  /** The name/title of the template */
  name?: Maybe<Scalars['String']['output']>;
  /** The display name of the affiliation that owns the Template */
  ownerDisplayName?: Maybe<Scalars['String']['output']>;
  /** The id of the affiliation that owns the Template */
  ownerId?: Maybe<Scalars['String']['output']>;
};

/** Paginated results of a search for templates */
export type TemplateSearchResults = PaginatedQueryResults & {
  __typename?: 'TemplateSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<TemplateSearchResult>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Template version type */
export type TemplateVersionType =
  /** Draft - saved state for internal review */
  | 'DRAFT'
  /** Published - saved state for use when creating DMPs */
  | 'PUBLISHED';

/** Template visibility */
export type TemplateVisibility =
  /** Visible only to users of your institution/affiliation */
  | 'ORGANIZATION'
  /** Visible to all users */
  | 'PUBLIC';

export type UpdateMetadataStandardInput = {
  /** A description of the metadata standard */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The id of the MetadataStandard */
  id: Scalars['Int']['input'];
  /** Keywords to assist in finding the metadata standard */
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the metadata standard */
  name: Scalars['String']['input'];
  /** Research domains associated with the metadata standard */
  researchDomainIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The taxonomy URL (do not make this up! should resolve to an HTML/JSON representation of the object) */
  uri?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectFundingInput = {
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: InputMaybe<Scalars['String']['input']>;
  /** The project funder */
  projectFundingId: Scalars['Int']['input'];
  /** The status of the funding resquest */
  status?: InputMaybe<ProjectFundingStatus>;
};

export type UpdateProjectInput = {
  /** The research project description/abstract */
  abstractText?: InputMaybe<Scalars['String']['input']>;
  /** The actual or anticipated end date of the project */
  endDate?: InputMaybe<Scalars['String']['input']>;
  /** The project's id */
  id: Scalars['Int']['input'];
  /** Whether or not the project is a mock/test */
  isTestProject?: InputMaybe<Scalars['Boolean']['input']>;
  /** The id of the research domain */
  researchDomainId?: InputMaybe<Scalars['Int']['input']>;
  /** The actual or anticipated start date for the project */
  startDate?: InputMaybe<Scalars['String']['input']>;
  /** The title of the research project */
  title: Scalars['String']['input'];
};

export type UpdateProjectMemberInput = {
  /** The Member's affiliation URI */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The Member's email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The Member's first/given name */
  givenName?: InputMaybe<Scalars['String']['input']>;
  /** The roles the Member has on the research project */
  memberRoleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The Member's ORCID */
  orcid?: InputMaybe<Scalars['String']['input']>;
  /** The project Member */
  projectMemberId: Scalars['Int']['input'];
  /** The Member's last/sur name */
  surName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectOutputInput = {
  /** The date the output is expected to be deposited (YYYY-MM-DD format) */
  anticipatedReleaseDate?: InputMaybe<Scalars['String']['input']>;
  /** A description of the output */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The initial access level that will be allowed for the output */
  initialAccessLevel?: InputMaybe<Scalars['String']['input']>;
  /** The initial license that will apply to the output */
  initialLicenseId?: InputMaybe<Scalars['Int']['input']>;
  /** Whether or not the output may contain personally identifying information (PII) */
  mayContainPII?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether or not the output may contain sensitive data */
  mayContainSensitiveInformation?: InputMaybe<Scalars['Boolean']['input']>;
  /** The metadata standards that will be used to describe the output */
  metadataStandardIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The type of output */
  outputTypeId: Scalars['Int']['input'];
  /** The id of the output */
  projectOutputId: Scalars['Int']['input'];
  /** The repositories the output will be deposited in */
  respositoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The title/name of the output */
  title: Scalars['String']['input'];
};

/** Input for updating a new QuestionCondition based on a QuestionCondition id */
export type UpdateQuestionConditionInput = {
  /** The action to take on a QuestionCondition */
  action: QuestionConditionActionType;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: InputMaybe<Scalars['String']['input']>;
  /** The type of condition in which to take the action */
  conditionType: QuestionConditionCondition;
  /** The id of the QuestionCondition that will be updated */
  questionConditionId: Scalars['Int']['input'];
  /** The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise) */
  target: Scalars['String']['input'];
};

export type UpdateQuestionInput = {
  /** The display order of the Question */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** Guidance to complete the question */
  guidanceText?: InputMaybe<Scalars['String']['input']>;
  /** The JSON representation of the question type */
  json?: InputMaybe<Scalars['String']['input']>;
  /** The unique identifier for the Question */
  questionId: Scalars['Int']['input'];
  /** This will be used as a sort of title for the Question */
  questionText?: InputMaybe<Scalars['String']['input']>;
  /** To indicate whether the question is required to be completed */
  required?: InputMaybe<Scalars['Boolean']['input']>;
  /** Requirements associated with the Question */
  requirementText?: InputMaybe<Scalars['String']['input']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: InputMaybe<Scalars['String']['input']>;
  /** Boolean indicating whether we should use content from sampleText as the default answer */
  useSampleTextAsDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateRelatedWorkInput = {
  __typename?: 'UpdateRelatedWorkInput';
  /** The citation for the related work */
  citation?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the work (e.g. DOI, URL, etc. */
  identifier?: Maybe<Scalars['String']['output']>;
  /** The related work */
  relatedWorkId: Scalars['Int']['output'];
  /** The related work's relationship to the research project (e.g. references, isReferencedBy, etc.) */
  relationDescriptor?: Maybe<RelatedWorkDescriptor>;
  /** The type of the related work (e.g. dataset, software, etc.) */
  workType?: Maybe<RelatedWorkType>;
};

export type UpdateRepositoryInput = {
  /** A description of the repository */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The Repository id */
  id: Scalars['Int']['input'];
  /** Keywords to assist in finding the repository */
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the repository */
  name: Scalars['String']['input'];
  /** The Categories/Types of the repository */
  repositoryTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Research domains associated with the repository */
  researchDomainIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The website URL */
  website?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating a section */
export type UpdateSectionInput = {
  /** Whether or not this Section is designated as a 'Best Practice' section */
  bestPractice?: InputMaybe<Scalars['Boolean']['input']>;
  /** The order in which the section will be displayed in the template */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** The guidance to help user with section */
  guidance?: InputMaybe<Scalars['String']['input']>;
  /** The section introduction */
  introduction?: InputMaybe<Scalars['String']['input']>;
  /** The section name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Requirements that a user must consider in this section */
  requirements?: InputMaybe<Scalars['String']['input']>;
  /** The unique identifer for the Section */
  sectionId: Scalars['Int']['input'];
  /** The Tags associated with this section. A section might not have any tags */
  tags?: InputMaybe<Array<TagInput>>;
};

export type UpdateUserNotificationsInput = {
  /** Whether or not email notifications are on for when a Plan has a new comment */
  notify_on_comment_added: Scalars['Boolean']['input'];
  /** Whether or not email notifications are on for when feedback on a Plan is completed */
  notify_on_feedback_complete: Scalars['Boolean']['input'];
  /** Whether or not email notifications are on for when a Plan is shared with the user */
  notify_on_plan_shared: Scalars['Boolean']['input'];
  /** Whether or not email notifications are on for Plan visibility changes */
  notify_on_plan_visibility_change: Scalars['Boolean']['input'];
  /** Whether or not email notifications are on for when a Template is shared with the User (Admin only) */
  notify_on_template_shared: Scalars['Boolean']['input'];
};

export type UpdateUserProfileInput = {
  /** The id of the affiliation if the user selected one from the typeahead list */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The user's first/given name */
  givenName: Scalars['String']['input'];
  /** The user's preferred language */
  languageId?: InputMaybe<Scalars['String']['input']>;
  /** The name of the affiliation if the user did not select one from the typeahead list */
  otherAffiliationName?: InputMaybe<Scalars['String']['input']>;
  /** The user's last/family name */
  surName: Scalars['String']['input'];
};

/** A user of the DMPTool */
export type User = {
  __typename?: 'User';
  /** Whether the user has accepted the terms and conditions of having an account */
  acceptedTerms?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not account is active */
  active?: Maybe<Scalars['Boolean']['output']>;
  /** The user's organizational affiliation */
  affiliation?: Maybe<Affiliation>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The user's primary email address */
  email?: Maybe<Scalars['String']['output']>;
  /** The user's email addresses */
  emails?: Maybe<Array<Maybe<UserEmail>>>;
  /** Errors associated with the Object */
  errors?: Maybe<UserErrors>;
  /** The number of failed login attempts */
  failed_sign_in_attempts?: Maybe<Scalars['Int']['output']>;
  /** The user's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The user's preferred language */
  languageId: Scalars['String']['output'];
  /** The timestamp of the last login */
  last_sign_in?: Maybe<Scalars['String']['output']>;
  /** The method user for the last login: PASSWORD or SSO */
  last_sign_in_via?: Maybe<Scalars['String']['output']>;
  /** Whether or not the account is locked from failed login attempts */
  locked?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Whether or not email notifications are on for when a Plan has a new comment */
  notify_on_comment_added?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not email notifications are on for when feedback on a Plan is completed */
  notify_on_feedback_complete?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not email notifications are on for when a Plan is shared with the user */
  notify_on_plan_shared?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not email notifications are on for Plan visibility changes */
  notify_on_plan_visibility_change?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not email notifications are on for when a Template is shared with the User (Admin only) */
  notify_on_template_shared?: Maybe<Scalars['Boolean']['output']>;
  /** The user's ORCID */
  orcid?: Maybe<Scalars['Orcid']['output']>;
  /** The user's role within the DMPTool */
  role: UserRole;
  /** The user's SSO ID */
  ssoId?: Maybe<Scalars['String']['output']>;
  /** The user's last/family name */
  surName?: Maybe<Scalars['String']['output']>;
};

export type UserEmail = {
  __typename?: 'UserEmail';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The email address */
  email: Scalars['String']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<UserEmailErrors>;
  /** The unique identifier for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the email address has been confirmed */
  isConfirmed: Scalars['Boolean']['output'];
  /** Whether or not this is the primary email address */
  isPrimary: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The user the email belongs to */
  userId: Scalars['Int']['output'];
};

/** A collection of errors related to the UserEmail */
export type UserEmailErrors = {
  __typename?: 'UserEmailErrors';
  email?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the User */
export type UserErrors = {
  __typename?: 'UserErrors';
  affiliationId?: Maybe<Scalars['String']['output']>;
  confirmPassword?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailIds?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  givenName?: Maybe<Scalars['String']['output']>;
  languageId?: Maybe<Scalars['String']['output']>;
  orcid?: Maybe<Scalars['String']['output']>;
  otherAffiliationName?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  ssoId?: Maybe<Scalars['String']['output']>;
  surName?: Maybe<Scalars['String']['output']>;
};

/** The types of roles supported by the DMPTool */
export type UserRole =
  | 'ADMIN'
  | 'RESEARCHER'
  | 'SUPERADMIN';

export type UserSearchResults = PaginatedQueryResults & {
  __typename?: 'UserSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<User>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** A snapshot of a Question when it became published. */
export type VersionedQuestion = {
  __typename?: 'VersionedQuestion';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The display order of the VersionedQuestion */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<VersionedQuestionErrors>;
  /** Guidance to complete the question */
  guidanceText?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The JSON representation of the question type */
  json?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Id of the original question that was versioned */
  questionId: Scalars['Int']['output'];
  /** This will be used as a sort of title for the Question */
  questionText?: Maybe<Scalars['String']['output']>;
  /** To indicate whether the question is required to be completed */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** Requirements associated with the Question */
  requirementText?: Maybe<Scalars['String']['output']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: Maybe<Scalars['String']['output']>;
  /** Whether or not the sample text should be used as the default answer for this question */
  useSampleTextAsDefault?: Maybe<Scalars['Boolean']['output']>;
  /** The conditional logic associated with this VersionedQuestion */
  versionedQuestionConditions?: Maybe<Array<VersionedQuestionCondition>>;
  /** The unique id of the VersionedSection that the VersionedQuestion belongs to */
  versionedSectionId: Scalars['Int']['output'];
  /** The unique id of the VersionedTemplate that the VersionedQuestion belongs to */
  versionedTemplateId: Scalars['Int']['output'];
};

export type VersionedQuestionCondition = {
  __typename?: 'VersionedQuestionCondition';
  /** The action to take on a QuestionCondition */
  action: VersionedQuestionConditionActionType;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: Maybe<Scalars['String']['output']>;
  /** The type of condition in which to take the action */
  conditionType: VersionedQuestionConditionCondition;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<VersionedQuestionConditionErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Id of the original QuestionCondition */
  questionConditionId: Scalars['Int']['output'];
  /** The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise) */
  target: Scalars['String']['output'];
  /** The versionedQuestion id that the QuestionCondition belongs to */
  versionedQuestionId: Scalars['Int']['output'];
};

/** VersionedQuestionCondition action */
export type VersionedQuestionConditionActionType =
  /** Hide the question */
  | 'HIDE_QUESTION'
  /** Send email */
  | 'SEND_EMAIL'
  /** Show the question */
  | 'SHOW_QUESTION';

/** VersionedQuestionCondition types */
export type VersionedQuestionConditionCondition =
  /** When a question does not equal a specific value */
  | 'DOES_NOT_EQUAL'
  /** When a question equals a specific value */
  | 'EQUAL'
  /** When a question has an answer */
  | 'HAS_ANSWER'
  /** When a question includes a specific value */
  | 'INCLUDES';

/** A collection of errors related to the VersionedQuestionCondition */
export type VersionedQuestionConditionErrors = {
  __typename?: 'VersionedQuestionConditionErrors';
  action?: Maybe<Scalars['String']['output']>;
  conditionMatch?: Maybe<Scalars['String']['output']>;
  conditionType?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  questionConditionId?: Maybe<Scalars['String']['output']>;
  target?: Maybe<Scalars['String']['output']>;
  versionedQuestionId?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the VersionedQuestion */
export type VersionedQuestionErrors = {
  __typename?: 'VersionedQuestionErrors';
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  guidanceText?: Maybe<Scalars['String']['output']>;
  json?: Maybe<Scalars['String']['output']>;
  questionId?: Maybe<Scalars['String']['output']>;
  questionText?: Maybe<Scalars['String']['output']>;
  requirementText?: Maybe<Scalars['String']['output']>;
  sampleText?: Maybe<Scalars['String']['output']>;
  versionedQuestionConditionIds?: Maybe<Scalars['String']['output']>;
  versionedSectionId?: Maybe<Scalars['String']['output']>;
  versionedTemplateId?: Maybe<Scalars['String']['output']>;
};

/** A snapshot of a Question when it became published, but includes extra information about if answer is filled. */
export type VersionedQuestionWithFilled = {
  __typename?: 'VersionedQuestionWithFilled';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The display order of the VersionedQuestion */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<VersionedQuestionErrors>;
  /** Guidance to complete the question */
  guidanceText?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the question has an answer */
  hasAnswer?: Maybe<Scalars['Boolean']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The JSON representation of the question type */
  json?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Id of the original question that was versioned */
  questionId: Scalars['Int']['output'];
  /** This will be used as a sort of title for the Question */
  questionText?: Maybe<Scalars['String']['output']>;
  /** To indicate whether the question is required to be completed */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** Requirements associated with the Question */
  requirementText?: Maybe<Scalars['String']['output']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: Maybe<Scalars['String']['output']>;
  /** Whether or not the sample text should be used as the default answer for this question */
  useSampleTextAsDefault?: Maybe<Scalars['Boolean']['output']>;
  /** The conditional logic associated with this VersionedQuestion */
  versionedQuestionConditions?: Maybe<Array<VersionedQuestionCondition>>;
  /** The unique id of the VersionedSection that the VersionedQuestion belongs to */
  versionedSectionId: Scalars['Int']['output'];
  /** The unique id of the VersionedTemplate that the VersionedQuestion belongs to */
  versionedTemplateId: Scalars['Int']['output'];
};

/** A snapshot of a Section when it became published. */
export type VersionedSection = {
  __typename?: 'VersionedSection';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The displayOrder of this VersionedSection */
  displayOrder: Scalars['Int']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<VersionedSectionErrors>;
  /** The guidance to help user with VersionedSection */
  guidance?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The VersionedSection introduction */
  introduction?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The VersionedSection name/title */
  name: Scalars['String']['output'];
  /** Requirements that a user must consider in this VersionedSection */
  requirements?: Maybe<Scalars['String']['output']>;
  /** The section that this is a snapshot of */
  section?: Maybe<Section>;
  /** The Tags associated with this VersionedSection */
  tags?: Maybe<Array<Maybe<Tag>>>;
  /** The questions associated with this VersionedSection */
  versionedQuestions?: Maybe<Array<VersionedQuestion>>;
  /** The parent VersionedTemplate */
  versionedTemplate: VersionedTemplate;
};

/** A collection of errors related to the VersionedSection */
export type VersionedSectionErrors = {
  __typename?: 'VersionedSectionErrors';
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  guidance?: Maybe<Scalars['String']['output']>;
  introduction?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Scalars['String']['output']>;
  sectionId?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Scalars['String']['output']>;
  versionedQuestionIds?: Maybe<Scalars['String']['output']>;
  versionedTemplateId?: Maybe<Scalars['String']['output']>;
};

export type VersionedSectionSearchResult = {
  __typename?: 'VersionedSectionSearchResult';
  /** Whether or not this VersionedSection is designated as a 'Best Practice' section */
  bestPractice?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The displayOrder of this VersionedSection */
  displayOrder: Scalars['Int']['output'];
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The VersionedSection introduction */
  introduction?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The VersionedSection name/title */
  name: Scalars['String']['output'];
  /** The number of questions associated with this VersionedSection */
  versionedQuestionCount?: Maybe<Scalars['Int']['output']>;
  /** The id of the VersionedTemplate that this VersionedSection belongs to */
  versionedTemplateId?: Maybe<Scalars['Int']['output']>;
  /** The name of the VersionedTemplate that this VersionedSection belongs to */
  versionedTemplateName?: Maybe<Scalars['String']['output']>;
};

export type VersionedSectionSearchResults = PaginatedQueryResults & {
  __typename?: 'VersionedSectionSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The SectionSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<VersionedSectionSearchResult>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** A snapshot of a Template when it became published. DMPs are created from published templates */
export type VersionedTemplate = {
  __typename?: 'VersionedTemplate';
  /** Whether or not this is the version provided when users create a new DMP (default: false) */
  active: Scalars['Boolean']['output'];
  /** Whether or not this Template is designated as a 'Best Practice' template */
  bestPractice: Scalars['Boolean']['output'];
  /** A comment/note the user enters when publishing the Template */
  comment?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the purpose of the template */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<VersionedTemplateErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name/title of the template */
  name: Scalars['String']['output'];
  /** The owner of the Template */
  owner?: Maybe<Affiliation>;
  /** The template that this published version stems from */
  template?: Maybe<Template>;
  /** The major.minor semantic version */
  version: Scalars['String']['output'];
  /** The type of version: Published or Draft (default: Draft) */
  versionType?: Maybe<TemplateVersionType>;
  /** The publisher of the Template */
  versionedBy?: Maybe<User>;
  /** The VersionedSections that go with the VersionedTemplate */
  versionedSections?: Maybe<Array<VersionedSection>>;
  /** The template's availability setting: Public is available to everyone, Private only your affiliation */
  visibility: TemplateVisibility;
};

/** A collection of errors related to the VersionedTemplate */
export type VersionedTemplateErrors = {
  __typename?: 'VersionedTemplateErrors';
  comment?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ownerId?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
  versionType?: Maybe<Scalars['String']['output']>;
  versionedById?: Maybe<Scalars['String']['output']>;
  versionedSectionIds?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** An abbreviated view of a Template for pages that allow search/filtering of published Templates */
export type VersionedTemplateSearchResult = {
  __typename?: 'VersionedTemplateSearchResult';
  /** Whether or not this Template is designated as a 'Best Practice' template */
  bestPractice?: Maybe<Scalars['Boolean']['output']>;
  /** A description of the purpose of the template */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Template was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The name of the last person who modified the Template */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the last person who modified the Template */
  modifiedByName?: Maybe<Scalars['String']['output']>;
  /** The name/title of the template */
  name?: Maybe<Scalars['String']['output']>;
  /** The display name of the affiliation that owns the Template */
  ownerDisplayName?: Maybe<Scalars['String']['output']>;
  /** The id of the affiliation that owns the Template */
  ownerId?: Maybe<Scalars['Int']['output']>;
  /** The search name of the affiliation that owns the Template */
  ownerSearchName?: Maybe<Scalars['String']['output']>;
  /** The URI of the affiliation that owns the Template */
  ownerURI?: Maybe<Scalars['String']['output']>;
  /** The id of the template that this version is based on */
  templateId?: Maybe<Scalars['Int']['output']>;
  /** The major.minor semantic version */
  version?: Maybe<Scalars['String']['output']>;
  /** The template's availability setting: Public is available to everyone, Private only your affiliation */
  visibility?: Maybe<TemplateVisibility>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  PaginatedQueryResults: ( AffiliationSearchResults ) | ( LicenseSearchResults ) | ( MetadataStandardSearchResults ) | ( ProjectSearchResults ) | ( PublishedTemplateSearchResults ) | ( RepositorySearchResults ) | ( ResearchDomainSearchResults ) | ( TemplateSearchResults ) | ( UserSearchResults ) | ( VersionedSectionSearchResults );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AccessLevel: AccessLevel;
  AddMetadataStandardInput: AddMetadataStandardInput;
  AddProjectFundingInput: AddProjectFundingInput;
  AddProjectMemberInput: AddProjectMemberInput;
  AddProjectOutputInput: AddProjectOutputInput;
  AddQuestionConditionInput: AddQuestionConditionInput;
  AddQuestionInput: AddQuestionInput;
  AddRelatedWorkInput: ResolverTypeWrapper<AddRelatedWorkInput>;
  AddRepositoryInput: AddRepositoryInput;
  AddSectionInput: AddSectionInput;
  Affiliation: ResolverTypeWrapper<Affiliation>;
  AffiliationEmailDomain: ResolverTypeWrapper<AffiliationEmailDomain>;
  AffiliationEmailDomainInput: AffiliationEmailDomainInput;
  AffiliationErrors: ResolverTypeWrapper<AffiliationErrors>;
  AffiliationInput: AffiliationInput;
  AffiliationLink: ResolverTypeWrapper<AffiliationLink>;
  AffiliationLinkInput: AffiliationLinkInput;
  AffiliationProvenance: AffiliationProvenance;
  AffiliationSearch: ResolverTypeWrapper<AffiliationSearch>;
  AffiliationSearchResults: ResolverTypeWrapper<AffiliationSearchResults>;
  AffiliationType: AffiliationType;
  Answer: ResolverTypeWrapper<Answer>;
  AnswerComment: ResolverTypeWrapper<AnswerComment>;
  AnswerCommentErrors: ResolverTypeWrapper<AnswerCommentErrors>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CollaboratorSearchResult: ResolverTypeWrapper<CollaboratorSearchResult>;
  DateTimeISO: ResolverTypeWrapper<Scalars['DateTimeISO']['output']>;
  DmspId: ResolverTypeWrapper<Scalars['DmspId']['output']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  ExternalFunding: ResolverTypeWrapper<ExternalFunding>;
  ExternalMember: ResolverTypeWrapper<ExternalMember>;
  ExternalProject: ResolverTypeWrapper<ExternalProject>;
  ExternalSearchInput: ExternalSearchInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FunderPopularityResult: ResolverTypeWrapper<FunderPopularityResult>;
  InitializePlanVersionOutput: ResolverTypeWrapper<InitializePlanVersionOutput>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvitedToType: InvitedToType;
  Language: ResolverTypeWrapper<Language>;
  License: ResolverTypeWrapper<License>;
  LicenseErrors: ResolverTypeWrapper<LicenseErrors>;
  LicenseSearchResults: ResolverTypeWrapper<LicenseSearchResults>;
  MemberRole: ResolverTypeWrapper<MemberRole>;
  MemberRoleErrors: ResolverTypeWrapper<MemberRoleErrors>;
  MetadataStandard: ResolverTypeWrapper<MetadataStandard>;
  MetadataStandardErrors: ResolverTypeWrapper<MetadataStandardErrors>;
  MetadataStandardSearchResults: ResolverTypeWrapper<MetadataStandardSearchResults>;
  Mutation: ResolverTypeWrapper<{}>;
  Orcid: ResolverTypeWrapper<Scalars['Orcid']['output']>;
  OrcidUserSearchResult: ResolverTypeWrapper<OrcidUserSearchResult>;
  OutputType: ResolverTypeWrapper<OutputType>;
  OutputTypeErrors: ResolverTypeWrapper<OutputTypeErrors>;
  PaginatedQueryResults: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['PaginatedQueryResults']>;
  PaginationOptions: PaginationOptions;
  PaginationType: PaginationType;
  Plan: ResolverTypeWrapper<Plan>;
  PlanDownloadFormat: PlanDownloadFormat;
  PlanErrors: ResolverTypeWrapper<PlanErrors>;
  PlanFeedback: ResolverTypeWrapper<PlanFeedback>;
  PlanFeedbackComment: ResolverTypeWrapper<PlanFeedbackComment>;
  PlanFeedbackCommentErrors: ResolverTypeWrapper<PlanFeedbackCommentErrors>;
  PlanFeedbackErrors: ResolverTypeWrapper<PlanFeedbackErrors>;
  PlanFunding: ResolverTypeWrapper<PlanFunding>;
  PlanFundingErrors: ResolverTypeWrapper<PlanFundingErrors>;
  PlanMember: ResolverTypeWrapper<PlanMember>;
  PlanMemberErrors: ResolverTypeWrapper<PlanMemberErrors>;
  PlanOutput: ResolverTypeWrapper<PlanOutput>;
  PlanOutputErrors: ResolverTypeWrapper<PlanOutputErrors>;
  PlanProgress: ResolverTypeWrapper<PlanProgress>;
  PlanSearchResult: ResolverTypeWrapper<PlanSearchResult>;
  PlanSectionProgress: ResolverTypeWrapper<PlanSectionProgress>;
  PlanStatus: PlanStatus;
  PlanVersion: ResolverTypeWrapper<PlanVersion>;
  PlanVisibility: PlanVisibility;
  Project: ResolverTypeWrapper<Project>;
  ProjectCollaborator: ResolverTypeWrapper<ProjectCollaborator>;
  ProjectCollaboratorAccessLevel: ProjectCollaboratorAccessLevel;
  ProjectCollaboratorErrors: ResolverTypeWrapper<ProjectCollaboratorErrors>;
  ProjectErrors: ResolverTypeWrapper<ProjectErrors>;
  ProjectFilterOptions: ProjectFilterOptions;
  ProjectFunding: ResolverTypeWrapper<ProjectFunding>;
  ProjectFundingErrors: ResolverTypeWrapper<ProjectFundingErrors>;
  ProjectFundingStatus: ProjectFundingStatus;
  ProjectImportInput: ProjectImportInput;
  ProjectMember: ResolverTypeWrapper<ProjectMember>;
  ProjectMemberErrors: ResolverTypeWrapper<ProjectMemberErrors>;
  ProjectOutput: ResolverTypeWrapper<ProjectOutput>;
  ProjectOutputErrors: ResolverTypeWrapper<ProjectOutputErrors>;
  ProjectSearchResult: ResolverTypeWrapper<ProjectSearchResult>;
  ProjectSearchResultCollaborator: ResolverTypeWrapper<ProjectSearchResultCollaborator>;
  ProjectSearchResultFunding: ResolverTypeWrapper<ProjectSearchResultFunding>;
  ProjectSearchResultMember: ResolverTypeWrapper<ProjectSearchResultMember>;
  ProjectSearchResults: ResolverTypeWrapper<ProjectSearchResults>;
  PublishedTemplateMetaDataResults: ResolverTypeWrapper<PublishedTemplateMetaDataResults>;
  PublishedTemplateSearchResults: ResolverTypeWrapper<PublishedTemplateSearchResults>;
  Query: ResolverTypeWrapper<{}>;
  Question: ResolverTypeWrapper<Question>;
  QuestionCondition: ResolverTypeWrapper<QuestionCondition>;
  QuestionConditionActionType: QuestionConditionActionType;
  QuestionConditionCondition: QuestionConditionCondition;
  QuestionConditionErrors: ResolverTypeWrapper<QuestionConditionErrors>;
  QuestionErrors: ResolverTypeWrapper<QuestionErrors>;
  RelatedWork: ResolverTypeWrapper<RelatedWork>;
  RelatedWorkDescriptor: RelatedWorkDescriptor;
  RelatedWorkErrors: ResolverTypeWrapper<RelatedWorkErrors>;
  RelatedWorkType: RelatedWorkType;
  ReorderQuestionsResult: ResolverTypeWrapper<ReorderQuestionsResult>;
  ReorderSectionsResult: ResolverTypeWrapper<ReorderSectionsResult>;
  Repository: ResolverTypeWrapper<Repository>;
  RepositoryErrors: ResolverTypeWrapper<RepositoryErrors>;
  RepositorySearchInput: RepositorySearchInput;
  RepositorySearchResults: ResolverTypeWrapper<RepositorySearchResults>;
  RepositoryType: RepositoryType;
  ResearchDomain: ResolverTypeWrapper<ResearchDomain>;
  ResearchDomainErrors: ResolverTypeWrapper<ResearchDomainErrors>;
  ResearchDomainSearchResults: ResolverTypeWrapper<ResearchDomainSearchResults>;
  Ror: ResolverTypeWrapper<Scalars['Ror']['output']>;
  Section: ResolverTypeWrapper<Section>;
  SectionErrors: ResolverTypeWrapper<SectionErrors>;
  SectionVersionType: SectionVersionType;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Tag: ResolverTypeWrapper<Tag>;
  TagErrors: ResolverTypeWrapper<TagErrors>;
  TagInput: TagInput;
  Template: ResolverTypeWrapper<Template>;
  TemplateCollaborator: ResolverTypeWrapper<TemplateCollaborator>;
  TemplateCollaboratorErrors: ResolverTypeWrapper<TemplateCollaboratorErrors>;
  TemplateErrors: ResolverTypeWrapper<TemplateErrors>;
  TemplateSearchResult: ResolverTypeWrapper<TemplateSearchResult>;
  TemplateSearchResults: ResolverTypeWrapper<TemplateSearchResults>;
  TemplateVersionType: TemplateVersionType;
  TemplateVisibility: TemplateVisibility;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  UpdateMetadataStandardInput: UpdateMetadataStandardInput;
  UpdateProjectFundingInput: UpdateProjectFundingInput;
  UpdateProjectInput: UpdateProjectInput;
  UpdateProjectMemberInput: UpdateProjectMemberInput;
  UpdateProjectOutputInput: UpdateProjectOutputInput;
  UpdateQuestionConditionInput: UpdateQuestionConditionInput;
  UpdateQuestionInput: UpdateQuestionInput;
  UpdateRelatedWorkInput: ResolverTypeWrapper<UpdateRelatedWorkInput>;
  UpdateRepositoryInput: UpdateRepositoryInput;
  UpdateSectionInput: UpdateSectionInput;
  UpdateUserNotificationsInput: UpdateUserNotificationsInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  User: ResolverTypeWrapper<User>;
  UserEmail: ResolverTypeWrapper<UserEmail>;
  UserEmailErrors: ResolverTypeWrapper<UserEmailErrors>;
  UserErrors: ResolverTypeWrapper<UserErrors>;
  UserRole: UserRole;
  UserSearchResults: ResolverTypeWrapper<UserSearchResults>;
  VersionedQuestion: ResolverTypeWrapper<VersionedQuestion>;
  VersionedQuestionCondition: ResolverTypeWrapper<VersionedQuestionCondition>;
  VersionedQuestionConditionActionType: VersionedQuestionConditionActionType;
  VersionedQuestionConditionCondition: VersionedQuestionConditionCondition;
  VersionedQuestionConditionErrors: ResolverTypeWrapper<VersionedQuestionConditionErrors>;
  VersionedQuestionErrors: ResolverTypeWrapper<VersionedQuestionErrors>;
  VersionedQuestionWithFilled: ResolverTypeWrapper<VersionedQuestionWithFilled>;
  VersionedSection: ResolverTypeWrapper<VersionedSection>;
  VersionedSectionErrors: ResolverTypeWrapper<VersionedSectionErrors>;
  VersionedSectionSearchResult: ResolverTypeWrapper<VersionedSectionSearchResult>;
  VersionedSectionSearchResults: ResolverTypeWrapper<VersionedSectionSearchResults>;
  VersionedTemplate: ResolverTypeWrapper<VersionedTemplate>;
  VersionedTemplateErrors: ResolverTypeWrapper<VersionedTemplateErrors>;
  VersionedTemplateSearchResult: ResolverTypeWrapper<VersionedTemplateSearchResult>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddMetadataStandardInput: AddMetadataStandardInput;
  AddProjectFundingInput: AddProjectFundingInput;
  AddProjectMemberInput: AddProjectMemberInput;
  AddProjectOutputInput: AddProjectOutputInput;
  AddQuestionConditionInput: AddQuestionConditionInput;
  AddQuestionInput: AddQuestionInput;
  AddRelatedWorkInput: AddRelatedWorkInput;
  AddRepositoryInput: AddRepositoryInput;
  AddSectionInput: AddSectionInput;
  Affiliation: Affiliation;
  AffiliationEmailDomain: AffiliationEmailDomain;
  AffiliationEmailDomainInput: AffiliationEmailDomainInput;
  AffiliationErrors: AffiliationErrors;
  AffiliationInput: AffiliationInput;
  AffiliationLink: AffiliationLink;
  AffiliationLinkInput: AffiliationLinkInput;
  AffiliationSearch: AffiliationSearch;
  AffiliationSearchResults: AffiliationSearchResults;
  Answer: Answer;
  AnswerComment: AnswerComment;
  AnswerCommentErrors: AnswerCommentErrors;
  Boolean: Scalars['Boolean']['output'];
  CollaboratorSearchResult: CollaboratorSearchResult;
  DateTimeISO: Scalars['DateTimeISO']['output'];
  DmspId: Scalars['DmspId']['output'];
  EmailAddress: Scalars['EmailAddress']['output'];
  ExternalFunding: ExternalFunding;
  ExternalMember: ExternalMember;
  ExternalProject: ExternalProject;
  ExternalSearchInput: ExternalSearchInput;
  Float: Scalars['Float']['output'];
  FunderPopularityResult: FunderPopularityResult;
  InitializePlanVersionOutput: InitializePlanVersionOutput;
  Int: Scalars['Int']['output'];
  Language: Language;
  License: License;
  LicenseErrors: LicenseErrors;
  LicenseSearchResults: LicenseSearchResults;
  MemberRole: MemberRole;
  MemberRoleErrors: MemberRoleErrors;
  MetadataStandard: MetadataStandard;
  MetadataStandardErrors: MetadataStandardErrors;
  MetadataStandardSearchResults: MetadataStandardSearchResults;
  Mutation: {};
  Orcid: Scalars['Orcid']['output'];
  OrcidUserSearchResult: OrcidUserSearchResult;
  OutputType: OutputType;
  OutputTypeErrors: OutputTypeErrors;
  PaginatedQueryResults: ResolversInterfaceTypes<ResolversParentTypes>['PaginatedQueryResults'];
  PaginationOptions: PaginationOptions;
  Plan: Plan;
  PlanErrors: PlanErrors;
  PlanFeedback: PlanFeedback;
  PlanFeedbackComment: PlanFeedbackComment;
  PlanFeedbackCommentErrors: PlanFeedbackCommentErrors;
  PlanFeedbackErrors: PlanFeedbackErrors;
  PlanFunding: PlanFunding;
  PlanFundingErrors: PlanFundingErrors;
  PlanMember: PlanMember;
  PlanMemberErrors: PlanMemberErrors;
  PlanOutput: PlanOutput;
  PlanOutputErrors: PlanOutputErrors;
  PlanProgress: PlanProgress;
  PlanSearchResult: PlanSearchResult;
  PlanSectionProgress: PlanSectionProgress;
  PlanVersion: PlanVersion;
  Project: Project;
  ProjectCollaborator: ProjectCollaborator;
  ProjectCollaboratorErrors: ProjectCollaboratorErrors;
  ProjectErrors: ProjectErrors;
  ProjectFilterOptions: ProjectFilterOptions;
  ProjectFunding: ProjectFunding;
  ProjectFundingErrors: ProjectFundingErrors;
  ProjectImportInput: ProjectImportInput;
  ProjectMember: ProjectMember;
  ProjectMemberErrors: ProjectMemberErrors;
  ProjectOutput: ProjectOutput;
  ProjectOutputErrors: ProjectOutputErrors;
  ProjectSearchResult: ProjectSearchResult;
  ProjectSearchResultCollaborator: ProjectSearchResultCollaborator;
  ProjectSearchResultFunding: ProjectSearchResultFunding;
  ProjectSearchResultMember: ProjectSearchResultMember;
  ProjectSearchResults: ProjectSearchResults;
  PublishedTemplateMetaDataResults: PublishedTemplateMetaDataResults;
  PublishedTemplateSearchResults: PublishedTemplateSearchResults;
  Query: {};
  Question: Question;
  QuestionCondition: QuestionCondition;
  QuestionConditionErrors: QuestionConditionErrors;
  QuestionErrors: QuestionErrors;
  RelatedWork: RelatedWork;
  RelatedWorkErrors: RelatedWorkErrors;
  ReorderQuestionsResult: ReorderQuestionsResult;
  ReorderSectionsResult: ReorderSectionsResult;
  Repository: Repository;
  RepositoryErrors: RepositoryErrors;
  RepositorySearchInput: RepositorySearchInput;
  RepositorySearchResults: RepositorySearchResults;
  ResearchDomain: ResearchDomain;
  ResearchDomainErrors: ResearchDomainErrors;
  ResearchDomainSearchResults: ResearchDomainSearchResults;
  Ror: Scalars['Ror']['output'];
  Section: Section;
  SectionErrors: SectionErrors;
  String: Scalars['String']['output'];
  Tag: Tag;
  TagErrors: TagErrors;
  TagInput: TagInput;
  Template: Template;
  TemplateCollaborator: TemplateCollaborator;
  TemplateCollaboratorErrors: TemplateCollaboratorErrors;
  TemplateErrors: TemplateErrors;
  TemplateSearchResult: TemplateSearchResult;
  TemplateSearchResults: TemplateSearchResults;
  URL: Scalars['URL']['output'];
  UpdateMetadataStandardInput: UpdateMetadataStandardInput;
  UpdateProjectFundingInput: UpdateProjectFundingInput;
  UpdateProjectInput: UpdateProjectInput;
  UpdateProjectMemberInput: UpdateProjectMemberInput;
  UpdateProjectOutputInput: UpdateProjectOutputInput;
  UpdateQuestionConditionInput: UpdateQuestionConditionInput;
  UpdateQuestionInput: UpdateQuestionInput;
  UpdateRelatedWorkInput: UpdateRelatedWorkInput;
  UpdateRepositoryInput: UpdateRepositoryInput;
  UpdateSectionInput: UpdateSectionInput;
  UpdateUserNotificationsInput: UpdateUserNotificationsInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  User: User;
  UserEmail: UserEmail;
  UserEmailErrors: UserEmailErrors;
  UserErrors: UserErrors;
  UserSearchResults: UserSearchResults;
  VersionedQuestion: VersionedQuestion;
  VersionedQuestionCondition: VersionedQuestionCondition;
  VersionedQuestionConditionErrors: VersionedQuestionConditionErrors;
  VersionedQuestionErrors: VersionedQuestionErrors;
  VersionedQuestionWithFilled: VersionedQuestionWithFilled;
  VersionedSection: VersionedSection;
  VersionedSectionErrors: VersionedSectionErrors;
  VersionedSectionSearchResult: VersionedSectionSearchResult;
  VersionedSectionSearchResults: VersionedSectionSearchResults;
  VersionedTemplate: VersionedTemplate;
  VersionedTemplateErrors: VersionedTemplateErrors;
  VersionedTemplateSearchResult: VersionedTemplateSearchResult;
};

export type AddRelatedWorkInputResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AddRelatedWorkInput'] = ResolversParentTypes['AddRelatedWorkInput']> = {
  citation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  identifier?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  projectId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  relationDescriptor?: Resolver<ResolversTypes['RelatedWorkDescriptor'], ParentType, ContextType>;
  workType?: Resolver<ResolversTypes['RelatedWorkType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Affiliation'] = ResolversParentTypes['Affiliation']> = {
  acronyms?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  aliases?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  apiTarget?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['AffiliationErrors']>, ParentType, ContextType>;
  feedbackEmails?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  feedbackEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  feedbackMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funder?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fundrefId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  homepage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  logoName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logoURI?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  managed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provenance?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  searchName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ssoEmailDomains?: Resolver<Maybe<Array<ResolversTypes['AffiliationEmailDomain']>>, ParentType, ContextType>;
  ssoEntityId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subHeaderLinks?: Resolver<Maybe<Array<ResolversTypes['AffiliationLink']>>, ParentType, ContextType>;
  types?: Resolver<Array<ResolversTypes['AffiliationType']>, ParentType, ContextType>;
  uneditableProperties?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationEmailDomainResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AffiliationEmailDomain'] = ResolversParentTypes['AffiliationEmailDomain']> = {
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AffiliationErrors'] = ResolversParentTypes['AffiliationErrors']> = {
  acronyms?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  aliases?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  feedbackEmails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  feedbackMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fundrefId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  homepage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  json?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logoName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logoURI?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  provenance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  searchName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ssoEntityId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subHeaderLinks?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  types?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedQuestionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedSectionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationLinkResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AffiliationLink'] = ResolversParentTypes['AffiliationLink']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationSearchResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AffiliationSearch'] = ResolversParentTypes['AffiliationSearch']> = {
  apiTarget?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  funder?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  types?: Resolver<Maybe<Array<ResolversTypes['AffiliationType']>>, ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationSearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AffiliationSearchResults'] = ResolversParentTypes['AffiliationSearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['AffiliationSearch']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnswerResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Answer'] = ResolversParentTypes['Answer']> = {
  comments?: Resolver<Maybe<Array<ResolversTypes['AnswerComment']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['AffiliationErrors']>, ParentType, ContextType>;
  feedbackComments?: Resolver<Maybe<Array<ResolversTypes['PlanFeedbackComment']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  json?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType>;
  versionedQuestion?: Resolver<Maybe<ResolversTypes['VersionedQuestion']>, ParentType, ContextType>;
  versionedSection?: Resolver<Maybe<ResolversTypes['VersionedSection']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnswerCommentResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AnswerComment'] = ResolversParentTypes['AnswerComment']> = {
  answerId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commentText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['AnswerCommentErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnswerCommentErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AnswerCommentErrors'] = ResolversParentTypes['AnswerCommentErrors']> = {
  answerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  commentText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CollaboratorSearchResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['CollaboratorSearchResult'] = ResolversParentTypes['CollaboratorSearchResult']> = {
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeIsoScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTimeISO'], any> {
  name: 'DateTimeISO';
}

export interface DmspIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DmspId'], any> {
  name: 'DmspId';
}

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type ExternalFundingResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ExternalFunding'] = ResolversParentTypes['ExternalFunding']> = {
  funderOpportunityNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funderProjectNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  grantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExternalMemberResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ExternalMember'] = ResolversParentTypes['ExternalMember']> = {
  affiliationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExternalProjectResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ExternalProject'] = ResolversParentTypes['ExternalProject']> = {
  abstractText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fundings?: Resolver<Maybe<Array<ResolversTypes['ExternalFunding']>>, ParentType, ContextType>;
  members?: Resolver<Maybe<Array<ResolversTypes['ExternalMember']>>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FunderPopularityResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['FunderPopularityResult'] = ResolversParentTypes['FunderPopularityResult']> = {
  apiTarget?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nbrPlans?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InitializePlanVersionOutputResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['InitializePlanVersionOutput'] = ResolversParentTypes['InitializePlanVersionOutput']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  planIds?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LanguageResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Language'] = ResolversParentTypes['Language']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isDefault?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LicenseResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['License'] = ResolversParentTypes['License']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['LicenseErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recommended?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LicenseErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['LicenseErrors'] = ResolversParentTypes['LicenseErrors']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LicenseSearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['LicenseSearchResults'] = ResolversParentTypes['LicenseSearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['License']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MemberRoleResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['MemberRole'] = ResolversParentTypes['MemberRole']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['MemberRoleErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MemberRoleErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['MemberRoleErrors'] = ResolversParentTypes['MemberRoleErrors']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MetadataStandardResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['MetadataStandard'] = ResolversParentTypes['MetadataStandard']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['MetadataStandardErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  keywords?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  researchDomains?: Resolver<Maybe<Array<ResolversTypes['ResearchDomain']>>, ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MetadataStandardErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['MetadataStandardErrors'] = ResolversParentTypes['MetadataStandardErrors']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  keywords?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  researchDomainIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MetadataStandardSearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['MetadataStandardSearchResults'] = ResolversParentTypes['MetadataStandardSearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['MetadataStandard']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  activateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationActivateUserArgs, 'userId'>>;
  addAffiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<MutationAddAffiliationArgs, 'input'>>;
  addAnswer?: Resolver<Maybe<ResolversTypes['Answer']>, ParentType, ContextType, RequireFields<MutationAddAnswerArgs, 'planId' | 'versionedQuestionId' | 'versionedSectionId'>>;
  addAnswerComment?: Resolver<Maybe<ResolversTypes['AnswerComment']>, ParentType, ContextType, RequireFields<MutationAddAnswerCommentArgs, 'answerId' | 'commentText'>>;
  addFeedbackComment?: Resolver<Maybe<ResolversTypes['PlanFeedbackComment']>, ParentType, ContextType, RequireFields<MutationAddFeedbackCommentArgs, 'answerId' | 'commentText' | 'planFeedbackId' | 'planId'>>;
  addLicense?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<MutationAddLicenseArgs, 'name'>>;
  addMemberRole?: Resolver<Maybe<ResolversTypes['MemberRole']>, ParentType, ContextType, RequireFields<MutationAddMemberRoleArgs, 'displayOrder' | 'label' | 'url'>>;
  addMetadataStandard?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<MutationAddMetadataStandardArgs, 'input'>>;
  addPlan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationAddPlanArgs, 'projectId' | 'versionedTemplateId'>>;
  addPlanFunding?: Resolver<Maybe<ResolversTypes['PlanFunding']>, ParentType, ContextType, RequireFields<MutationAddPlanFundingArgs, 'planId' | 'projectFundingId'>>;
  addPlanMember?: Resolver<Maybe<ResolversTypes['PlanMember']>, ParentType, ContextType, RequireFields<MutationAddPlanMemberArgs, 'planId' | 'projectMemberId'>>;
  addProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationAddProjectArgs, 'title'>>;
  addProjectCollaborator?: Resolver<Maybe<ResolversTypes['ProjectCollaborator']>, ParentType, ContextType, RequireFields<MutationAddProjectCollaboratorArgs, 'email' | 'projectId'>>;
  addProjectFunding?: Resolver<Maybe<ResolversTypes['ProjectFunding']>, ParentType, ContextType, RequireFields<MutationAddProjectFundingArgs, 'input'>>;
  addProjectMember?: Resolver<Maybe<ResolversTypes['ProjectMember']>, ParentType, ContextType, RequireFields<MutationAddProjectMemberArgs, 'input'>>;
  addProjectOutput?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationAddProjectOutputArgs, 'input'>>;
  addQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationAddQuestionArgs, 'input'>>;
  addQuestionCondition?: Resolver<ResolversTypes['QuestionCondition'], ParentType, ContextType, RequireFields<MutationAddQuestionConditionArgs, 'input'>>;
  addRelatedWork?: Resolver<Maybe<ResolversTypes['RelatedWork']>, ParentType, ContextType, RequireFields<MutationAddRelatedWorkArgs, 'input'>>;
  addRepository?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, Partial<MutationAddRepositoryArgs>>;
  addSection?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationAddSectionArgs, 'input'>>;
  addTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationAddTagArgs, 'name'>>;
  addTemplate?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationAddTemplateArgs, 'name'>>;
  addTemplateCollaborator?: Resolver<Maybe<ResolversTypes['TemplateCollaborator']>, ParentType, ContextType, RequireFields<MutationAddTemplateCollaboratorArgs, 'email' | 'templateId'>>;
  addUserEmail?: Resolver<Maybe<ResolversTypes['UserEmail']>, ParentType, ContextType, RequireFields<MutationAddUserEmailArgs, 'email' | 'isPrimary'>>;
  archivePlan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationArchivePlanArgs, 'planId'>>;
  archiveProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationArchiveProjectArgs, 'projectId'>>;
  archiveTemplate?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationArchiveTemplateArgs, 'templateId'>>;
  completeFeedback?: Resolver<Maybe<ResolversTypes['PlanFeedback']>, ParentType, ContextType, RequireFields<MutationCompleteFeedbackArgs, 'planFeedbackId' | 'planId'>>;
  createTemplateVersion?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationCreateTemplateVersionArgs, 'latestPublishVisibility' | 'templateId'>>;
  deactivateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationDeactivateUserArgs, 'userId'>>;
  mergeLicenses?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<MutationMergeLicensesArgs, 'licenseToKeepId' | 'licenseToRemoveId'>>;
  mergeMetadataStandards?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<MutationMergeMetadataStandardsArgs, 'metadataStandardToKeepId' | 'metadataStandardToRemoveId'>>;
  mergeRepositories?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, RequireFields<MutationMergeRepositoriesArgs, 'repositoryToKeepId' | 'repositoryToRemoveId'>>;
  mergeUsers?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationMergeUsersArgs, 'userIdToBeMerged' | 'userIdToKeep'>>;
  projectImport?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, Partial<MutationProjectImportArgs>>;
  publishPlan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationPublishPlanArgs, 'planId'>>;
  removeAffiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<MutationRemoveAffiliationArgs, 'affiliationId'>>;
  removeAnswerComment?: Resolver<Maybe<ResolversTypes['AnswerComment']>, ParentType, ContextType, RequireFields<MutationRemoveAnswerCommentArgs, 'answerCommentId' | 'answerId'>>;
  removeFeedbackComment?: Resolver<Maybe<ResolversTypes['PlanFeedbackComment']>, ParentType, ContextType, RequireFields<MutationRemoveFeedbackCommentArgs, 'planFeedbackCommentId' | 'planId'>>;
  removeLicense?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<MutationRemoveLicenseArgs, 'uri'>>;
  removeMemberRole?: Resolver<Maybe<ResolversTypes['MemberRole']>, ParentType, ContextType, RequireFields<MutationRemoveMemberRoleArgs, 'id'>>;
  removeMetadataStandard?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<MutationRemoveMetadataStandardArgs, 'uri'>>;
  removePlanFunding?: Resolver<Maybe<ResolversTypes['PlanFunding']>, ParentType, ContextType, RequireFields<MutationRemovePlanFundingArgs, 'planFundingId'>>;
  removePlanMember?: Resolver<Maybe<ResolversTypes['PlanMember']>, ParentType, ContextType, RequireFields<MutationRemovePlanMemberArgs, 'planMemberId'>>;
  removeProjectCollaborator?: Resolver<Maybe<ResolversTypes['ProjectCollaborator']>, ParentType, ContextType, RequireFields<MutationRemoveProjectCollaboratorArgs, 'projectCollaboratorId'>>;
  removeProjectFunding?: Resolver<Maybe<ResolversTypes['ProjectFunding']>, ParentType, ContextType, RequireFields<MutationRemoveProjectFundingArgs, 'projectFundingId'>>;
  removeProjectMember?: Resolver<Maybe<ResolversTypes['ProjectMember']>, ParentType, ContextType, RequireFields<MutationRemoveProjectMemberArgs, 'projectMemberId'>>;
  removeProjectOutput?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationRemoveProjectOutputArgs, 'projectOutputId'>>;
  removeProjectOutputFromPlan?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationRemoveProjectOutputFromPlanArgs, 'planId' | 'projectOutputId'>>;
  removeQuestion?: Resolver<Maybe<ResolversTypes['Question']>, ParentType, ContextType, RequireFields<MutationRemoveQuestionArgs, 'questionId'>>;
  removeQuestionCondition?: Resolver<Maybe<ResolversTypes['QuestionCondition']>, ParentType, ContextType, RequireFields<MutationRemoveQuestionConditionArgs, 'questionConditionId'>>;
  removeRelatedWork?: Resolver<Maybe<ResolversTypes['RelatedWork']>, ParentType, ContextType, RequireFields<MutationRemoveRelatedWorkArgs, 'id'>>;
  removeRepository?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, RequireFields<MutationRemoveRepositoryArgs, 'repositoryId'>>;
  removeSection?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationRemoveSectionArgs, 'sectionId'>>;
  removeTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationRemoveTagArgs, 'tagId'>>;
  removeTemplateCollaborator?: Resolver<Maybe<ResolversTypes['TemplateCollaborator']>, ParentType, ContextType, RequireFields<MutationRemoveTemplateCollaboratorArgs, 'email' | 'templateId'>>;
  removeUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  removeUserEmail?: Resolver<Maybe<ResolversTypes['UserEmail']>, ParentType, ContextType, RequireFields<MutationRemoveUserEmailArgs, 'email'>>;
  requestFeedback?: Resolver<Maybe<ResolversTypes['PlanFeedback']>, ParentType, ContextType, RequireFields<MutationRequestFeedbackArgs, 'planId'>>;
  resendInviteToProjectCollaborator?: Resolver<Maybe<ResolversTypes['ProjectCollaborator']>, ParentType, ContextType, RequireFields<MutationResendInviteToProjectCollaboratorArgs, 'projectCollaboratorId'>>;
  selectProjectOutputForPlan?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationSelectProjectOutputForPlanArgs, 'planId' | 'projectOutputId'>>;
  setPrimaryUserEmail?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserEmail']>>>, ParentType, ContextType, RequireFields<MutationSetPrimaryUserEmailArgs, 'email'>>;
  setUserOrcid?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSetUserOrcidArgs, 'orcid'>>;
  superInitializePlanVersions?: Resolver<ResolversTypes['InitializePlanVersionOutput'], ParentType, ContextType>;
  updateAffiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<MutationUpdateAffiliationArgs, 'input'>>;
  updateAnswer?: Resolver<Maybe<ResolversTypes['Answer']>, ParentType, ContextType, RequireFields<MutationUpdateAnswerArgs, 'answerId'>>;
  updateAnswerComment?: Resolver<Maybe<ResolversTypes['AnswerComment']>, ParentType, ContextType, RequireFields<MutationUpdateAnswerCommentArgs, 'answerCommentId' | 'answerId' | 'commentText'>>;
  updateFeedbackComment?: Resolver<Maybe<ResolversTypes['PlanFeedbackComment']>, ParentType, ContextType, RequireFields<MutationUpdateFeedbackCommentArgs, 'commentText' | 'planFeedbackCommentId' | 'planId'>>;
  updateLicense?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<MutationUpdateLicenseArgs, 'name' | 'uri'>>;
  updateMemberRole?: Resolver<Maybe<ResolversTypes['MemberRole']>, ParentType, ContextType, RequireFields<MutationUpdateMemberRoleArgs, 'displayOrder' | 'id' | 'label' | 'url'>>;
  updateMetadataStandard?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<MutationUpdateMetadataStandardArgs, 'input'>>;
  updatePassword?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdatePasswordArgs, 'email' | 'newPassword' | 'oldPassword'>>;
  updatePlanFunding?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanFunding']>>>, ParentType, ContextType, RequireFields<MutationUpdatePlanFundingArgs, 'planId' | 'projectFundingIds'>>;
  updatePlanMember?: Resolver<Maybe<ResolversTypes['PlanMember']>, ParentType, ContextType, RequireFields<MutationUpdatePlanMemberArgs, 'planId' | 'planMemberId'>>;
  updatePlanStatus?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationUpdatePlanStatusArgs, 'planId' | 'status'>>;
  updatePlanTitle?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationUpdatePlanTitleArgs, 'planId' | 'title'>>;
  updateProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, Partial<MutationUpdateProjectArgs>>;
  updateProjectCollaborator?: Resolver<Maybe<ResolversTypes['ProjectCollaborator']>, ParentType, ContextType, RequireFields<MutationUpdateProjectCollaboratorArgs, 'accessLevel' | 'projectCollaboratorId'>>;
  updateProjectFunding?: Resolver<Maybe<ResolversTypes['ProjectFunding']>, ParentType, ContextType, RequireFields<MutationUpdateProjectFundingArgs, 'input'>>;
  updateProjectMember?: Resolver<Maybe<ResolversTypes['ProjectMember']>, ParentType, ContextType, RequireFields<MutationUpdateProjectMemberArgs, 'input'>>;
  updateProjectOutput?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationUpdateProjectOutputArgs, 'input'>>;
  updateQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationUpdateQuestionArgs, 'input'>>;
  updateQuestionCondition?: Resolver<Maybe<ResolversTypes['QuestionCondition']>, ParentType, ContextType, RequireFields<MutationUpdateQuestionConditionArgs, 'input'>>;
  updateQuestionDisplayOrder?: Resolver<ResolversTypes['ReorderQuestionsResult'], ParentType, ContextType, RequireFields<MutationUpdateQuestionDisplayOrderArgs, 'newDisplayOrder' | 'questionId'>>;
  updateRelatedWork?: Resolver<Maybe<ResolversTypes['RelatedWork']>, ParentType, ContextType, RequireFields<MutationUpdateRelatedWorkArgs, 'input'>>;
  updateRepository?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, Partial<MutationUpdateRepositoryArgs>>;
  updateSection?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationUpdateSectionArgs, 'input'>>;
  updateSectionDisplayOrder?: Resolver<ResolversTypes['ReorderSectionsResult'], ParentType, ContextType, RequireFields<MutationUpdateSectionDisplayOrderArgs, 'newDisplayOrder' | 'sectionId'>>;
  updateTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationUpdateTagArgs, 'name' | 'tagId'>>;
  updateTemplate?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationUpdateTemplateArgs, 'name' | 'templateId'>>;
  updateUserNotifications?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserNotificationsArgs, 'input'>>;
  updateUserProfile?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserProfileArgs, 'input'>>;
  uploadPlan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationUploadPlanArgs, 'projectId'>>;
};

export interface OrcidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Orcid'], any> {
  name: 'Orcid';
}

export type OrcidUserSearchResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['OrcidUserSearchResult'] = ResolversParentTypes['OrcidUserSearchResult']> = {
  affiliationName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  affiliationRORId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  affiliationURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OutputTypeResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['OutputType'] = ResolversParentTypes['OutputType']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['OutputTypeErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OutputTypeErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['OutputTypeErrors'] = ResolversParentTypes['OutputTypeErrors']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedQueryResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PaginatedQueryResults'] = ResolversParentTypes['PaginatedQueryResults']> = {
  __resolveType: TypeResolveFn<'AffiliationSearchResults' | 'LicenseSearchResults' | 'MetadataStandardSearchResults' | 'ProjectSearchResults' | 'PublishedTemplateSearchResults' | 'RepositorySearchResults' | 'ResearchDomainSearchResults' | 'TemplateSearchResults' | 'UserSearchResults' | 'VersionedSectionSearchResults', ParentType, ContextType>;
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type PlanResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Plan'] = ResolversParentTypes['Plan']> = {
  answers?: Resolver<Maybe<Array<ResolversTypes['Answer']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  dmpId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanErrors']>, ParentType, ContextType>;
  featured?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  feedback?: Resolver<Maybe<Array<ResolversTypes['PlanFeedback']>>, ParentType, ContextType>;
  fundings?: Resolver<Maybe<Array<ResolversTypes['PlanFunding']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  languageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  members?: Resolver<Maybe<Array<ResolversTypes['PlanMember']>>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  outputs?: Resolver<Maybe<Array<ResolversTypes['PlanOutput']>>, ParentType, ContextType>;
  progress?: Resolver<Maybe<ResolversTypes['PlanProgress']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  registered?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registeredById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['PlanStatus']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedSections?: Resolver<Maybe<Array<ResolversTypes['PlanSectionProgress']>>, ParentType, ContextType>;
  versionedTemplate?: Resolver<Maybe<ResolversTypes['VersionedTemplate']>, ParentType, ContextType>;
  versions?: Resolver<Maybe<Array<ResolversTypes['PlanVersion']>>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['PlanVisibility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanErrors'] = ResolversParentTypes['PlanErrors']> = {
  dmp_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  featured?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  languageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registered?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registeredById?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedTemplateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFeedbackResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFeedback'] = ResolversParentTypes['PlanFeedback']> = {
  completed?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanFeedbackErrors']>, ParentType, ContextType>;
  feedbackComments?: Resolver<Maybe<Array<ResolversTypes['PlanFeedbackComment']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType>;
  requested?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requestedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  summaryText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFeedbackCommentResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFeedbackComment'] = ResolversParentTypes['PlanFeedbackComment']> = {
  PlanFeedback?: Resolver<Maybe<ResolversTypes['PlanFeedback']>, ParentType, ContextType>;
  answerId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  commentText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanFeedbackCommentErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFeedbackCommentErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFeedbackCommentErrors'] = ResolversParentTypes['PlanFeedbackCommentErrors']> = {
  answer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planFeedback?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFeedbackErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFeedbackErrors'] = ResolversParentTypes['PlanFeedbackErrors']> = {
  completedById?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  feedbackComments?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requestedById?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  summaryText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFundingResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFunding'] = ResolversParentTypes['PlanFunding']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanFundingErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType>;
  projectFunding?: Resolver<Maybe<ResolversTypes['ProjectFunding']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFundingErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFundingErrors'] = ResolversParentTypes['PlanFundingErrors']> = {
  ProjectFundingId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanMemberResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanMember'] = ResolversParentTypes['PlanMember']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanMemberErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isPrimaryContact?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  memberRoles?: Resolver<Maybe<Array<ResolversTypes['MemberRole']>>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType>;
  projectMember?: Resolver<Maybe<ResolversTypes['ProjectMember']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanMemberErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanMemberErrors'] = ResolversParentTypes['PlanMemberErrors']> = {
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  memberRoleIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  primaryContact?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectMemberId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanOutputResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanOutput'] = ResolversParentTypes['PlanOutput']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanOutputErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanOutputErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanOutputErrors'] = ResolversParentTypes['PlanOutputErrors']> = {
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanProgressResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanProgress'] = ResolversParentTypes['PlanProgress']> = {
  answeredQuestions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  percentComplete?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalQuestions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanSearchResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanSearchResult'] = ResolversParentTypes['PlanSearchResult']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dmpId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funding?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  members?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registered?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registeredBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['PlanStatus']>, ParentType, ContextType>;
  templateTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedSections?: Resolver<Maybe<Array<ResolversTypes['PlanSectionProgress']>>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['PlanVisibility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanSectionProgressResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanSectionProgress'] = ResolversParentTypes['PlanSectionProgress']> = {
  answeredQuestions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  displayOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalQuestions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  versionedSectionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanVersionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanVersion'] = ResolversParentTypes['PlanVersion']> = {
  timestamp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = {
  abstractText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  collaborators?: Resolver<Maybe<Array<ResolversTypes['ProjectCollaborator']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ProjectErrors']>, ParentType, ContextType>;
  fundings?: Resolver<Maybe<Array<ResolversTypes['ProjectFunding']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTestProject?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  members?: Resolver<Maybe<Array<ResolversTypes['ProjectMember']>>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  outputs?: Resolver<Maybe<Array<ResolversTypes['ProjectOutput']>>, ParentType, ContextType>;
  plans?: Resolver<Maybe<Array<ResolversTypes['PlanSearchResult']>>, ParentType, ContextType>;
  researchDomain?: Resolver<Maybe<ResolversTypes['ResearchDomain']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectCollaboratorResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectCollaborator'] = ResolversParentTypes['ProjectCollaborator']> = {
  accessLevel?: Resolver<Maybe<ResolversTypes['ProjectCollaboratorAccessLevel']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ProjectCollaboratorErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  invitedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectMemberId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectCollaboratorErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectCollaboratorErrors'] = ResolversParentTypes['ProjectCollaboratorErrors']> = {
  accessLevel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invitedById?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectErrors'] = ResolversParentTypes['ProjectErrors']> = {
  abstractText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fundingIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  memberIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  outputIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  researchDomainId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectFundingResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectFunding'] = ResolversParentTypes['ProjectFunding']> = {
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ProjectFundingErrors']>, ParentType, ContextType>;
  funderOpportunityNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funderProjectNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  grantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['ProjectFundingStatus']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectFundingErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectFundingErrors'] = ResolversParentTypes['ProjectFundingErrors']> = {
  affiliationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funderOpportunityNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funderProjectNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  grantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectMemberResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectMember'] = ResolversParentTypes['ProjectMember']> = {
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ProjectMemberErrors']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isPrimaryContact?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  memberRoles?: Resolver<Maybe<Array<ResolversTypes['MemberRole']>>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectMemberErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectMemberErrors'] = ResolversParentTypes['ProjectMemberErrors']> = {
  affiliationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  memberRoleIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectOutputResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectOutput'] = ResolversParentTypes['ProjectOutput']> = {
  anticipatedReleaseDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ProjectOutputErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  initialAccessLevel?: Resolver<ResolversTypes['AccessLevel'], ParentType, ContextType>;
  initialLicense?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType>;
  mayContainPII?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  mayContainSensitiveInformation?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  metadataStandards?: Resolver<Maybe<Array<ResolversTypes['MetadataStandard']>>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  outputType?: Resolver<Maybe<ResolversTypes['OutputType']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  repositories?: Resolver<Maybe<Array<ResolversTypes['Repository']>>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectOutputErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectOutputErrors'] = ResolversParentTypes['ProjectOutputErrors']> = {
  anticipatedReleaseDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  initialAccessLevel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  initialLicenseId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  metadataStandardIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  outputTypeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  repositoryIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectSearchResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectSearchResult'] = ResolversParentTypes['ProjectSearchResult']> = {
  abstractText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  collaborators?: Resolver<Maybe<Array<ResolversTypes['ProjectSearchResultCollaborator']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdByName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ProjectErrors']>, ParentType, ContextType>;
  fundings?: Resolver<Maybe<Array<ResolversTypes['ProjectSearchResultFunding']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTestProject?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  members?: Resolver<Maybe<Array<ResolversTypes['ProjectSearchResultMember']>>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modifiedByName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  researchDomain?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectSearchResultCollaboratorResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectSearchResultCollaborator'] = ResolversParentTypes['ProjectSearchResultCollaborator']> = {
  accessLevel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectSearchResultFundingResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectSearchResultFunding'] = ResolversParentTypes['ProjectSearchResultFunding']> = {
  grantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectSearchResultMemberResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectSearchResultMember'] = ResolversParentTypes['ProjectSearchResultMember']> = {
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectSearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectSearchResults'] = ResolversParentTypes['ProjectSearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectSearchResult']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PublishedTemplateMetaDataResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PublishedTemplateMetaDataResults'] = ResolversParentTypes['PublishedTemplateMetaDataResults']> = {
  availableAffiliations?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  hasBestPracticeTemplates?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PublishedTemplateSearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PublishedTemplateSearchResults'] = ResolversParentTypes['PublishedTemplateSearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedTemplateSearchResult']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  affiliationById?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<QueryAffiliationByIdArgs, 'affiliationId'>>;
  affiliationByURI?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<QueryAffiliationByUriArgs, 'uri'>>;
  affiliationTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  affiliations?: Resolver<Maybe<ResolversTypes['AffiliationSearchResults']>, ParentType, ContextType, RequireFields<QueryAffiliationsArgs, 'name'>>;
  answer?: Resolver<Maybe<ResolversTypes['Answer']>, ParentType, ContextType, RequireFields<QueryAnswerArgs, 'answerId' | 'projectId'>>;
  answerByVersionedQuestionId?: Resolver<Maybe<ResolversTypes['Answer']>, ParentType, ContextType, RequireFields<QueryAnswerByVersionedQuestionIdArgs, 'planId' | 'projectId' | 'versionedQuestionId'>>;
  answers?: Resolver<Maybe<Array<Maybe<ResolversTypes['Answer']>>>, ParentType, ContextType, RequireFields<QueryAnswersArgs, 'planId' | 'projectId' | 'versionedSectionId'>>;
  bestPracticeSections?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedSection']>>>, ParentType, ContextType>;
  childResearchDomains?: Resolver<Maybe<Array<Maybe<ResolversTypes['ResearchDomain']>>>, ParentType, ContextType, RequireFields<QueryChildResearchDomainsArgs, 'parentResearchDomainId'>>;
  findCollaborator?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollaboratorSearchResult']>>>, ParentType, ContextType, Partial<QueryFindCollaboratorArgs>>;
  languages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Language']>>>, ParentType, ContextType>;
  license?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<QueryLicenseArgs, 'uri'>>;
  licenses?: Resolver<Maybe<ResolversTypes['LicenseSearchResults']>, ParentType, ContextType, Partial<QueryLicensesArgs>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  memberRoleById?: Resolver<Maybe<ResolversTypes['MemberRole']>, ParentType, ContextType, RequireFields<QueryMemberRoleByIdArgs, 'memberRoleId'>>;
  memberRoleByURL?: Resolver<Maybe<ResolversTypes['MemberRole']>, ParentType, ContextType, RequireFields<QueryMemberRoleByUrlArgs, 'memberRoleURL'>>;
  memberRoles?: Resolver<Maybe<Array<Maybe<ResolversTypes['MemberRole']>>>, ParentType, ContextType>;
  metadataStandard?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<QueryMetadataStandardArgs, 'uri'>>;
  metadataStandards?: Resolver<Maybe<ResolversTypes['MetadataStandardSearchResults']>, ParentType, ContextType, Partial<QueryMetadataStandardsArgs>>;
  myProjects?: Resolver<Maybe<ResolversTypes['ProjectSearchResults']>, ParentType, ContextType, Partial<QueryMyProjectsArgs>>;
  myTemplates?: Resolver<Maybe<ResolversTypes['TemplateSearchResults']>, ParentType, ContextType, Partial<QueryMyTemplatesArgs>>;
  myVersionedTemplates?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedTemplateSearchResult']>>>, ParentType, ContextType>;
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<QueryPlanArgs, 'planId'>>;
  planFeedback?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanFeedback']>>>, ParentType, ContextType, RequireFields<QueryPlanFeedbackArgs, 'planId'>>;
  planFeedbackComments?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanFeedbackComment']>>>, ParentType, ContextType, RequireFields<QueryPlanFeedbackCommentsArgs, 'planFeedbackId' | 'planId'>>;
  planFundings?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanFunding']>>>, ParentType, ContextType, RequireFields<QueryPlanFundingsArgs, 'planId'>>;
  planMembers?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanMember']>>>, ParentType, ContextType, RequireFields<QueryPlanMembersArgs, 'planId'>>;
  planOutputs?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectOutput']>>>, ParentType, ContextType, RequireFields<QueryPlanOutputsArgs, 'planId'>>;
  plans?: Resolver<Maybe<Array<ResolversTypes['PlanSearchResult']>>, ParentType, ContextType, RequireFields<QueryPlansArgs, 'projectId'>>;
  popularFunders?: Resolver<Maybe<Array<Maybe<ResolversTypes['FunderPopularityResult']>>>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<QueryProjectArgs, 'projectId'>>;
  projectCollaborators?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectCollaborator']>>>, ParentType, ContextType, RequireFields<QueryProjectCollaboratorsArgs, 'projectId'>>;
  projectFunding?: Resolver<Maybe<ResolversTypes['ProjectFunding']>, ParentType, ContextType, RequireFields<QueryProjectFundingArgs, 'projectFundingId'>>;
  projectFundings?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectFunding']>>>, ParentType, ContextType, RequireFields<QueryProjectFundingsArgs, 'projectId'>>;
  projectMember?: Resolver<Maybe<ResolversTypes['ProjectMember']>, ParentType, ContextType, RequireFields<QueryProjectMemberArgs, 'projectMemberId'>>;
  projectMembers?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectMember']>>>, ParentType, ContextType, RequireFields<QueryProjectMembersArgs, 'projectId'>>;
  projectOutput?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<QueryProjectOutputArgs, 'projectOutputId'>>;
  projectOutputTypes?: Resolver<Maybe<Array<Maybe<ResolversTypes['OutputType']>>>, ParentType, ContextType>;
  projectOutputs?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectOutput']>>>, ParentType, ContextType, RequireFields<QueryProjectOutputsArgs, 'projectId'>>;
  publishedConditionsForQuestion?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedQuestionCondition']>>>, ParentType, ContextType, RequireFields<QueryPublishedConditionsForQuestionArgs, 'versionedQuestionId'>>;
  publishedQuestion?: Resolver<Maybe<ResolversTypes['VersionedQuestion']>, ParentType, ContextType, RequireFields<QueryPublishedQuestionArgs, 'versionedQuestionId'>>;
  publishedQuestions?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedQuestionWithFilled']>>>, ParentType, ContextType, RequireFields<QueryPublishedQuestionsArgs, 'planId' | 'versionedSectionId'>>;
  publishedSection?: Resolver<Maybe<ResolversTypes['VersionedSection']>, ParentType, ContextType, RequireFields<QueryPublishedSectionArgs, 'versionedSectionId'>>;
  publishedSections?: Resolver<Maybe<ResolversTypes['VersionedSectionSearchResults']>, ParentType, ContextType, RequireFields<QueryPublishedSectionsArgs, 'term'>>;
  publishedTemplates?: Resolver<Maybe<ResolversTypes['PublishedTemplateSearchResults']>, ParentType, ContextType, Partial<QueryPublishedTemplatesArgs>>;
  publishedTemplatesMetaData?: Resolver<Maybe<ResolversTypes['PublishedTemplateMetaDataResults']>, ParentType, ContextType, Partial<QueryPublishedTemplatesMetaDataArgs>>;
  question?: Resolver<Maybe<ResolversTypes['Question']>, ParentType, ContextType, RequireFields<QueryQuestionArgs, 'questionId'>>;
  questionConditions?: Resolver<Maybe<Array<Maybe<ResolversTypes['QuestionCondition']>>>, ParentType, ContextType, RequireFields<QueryQuestionConditionsArgs, 'questionId'>>;
  questions?: Resolver<Maybe<Array<Maybe<ResolversTypes['Question']>>>, ParentType, ContextType, RequireFields<QueryQuestionsArgs, 'sectionId'>>;
  recommendedLicenses?: Resolver<Maybe<Array<Maybe<ResolversTypes['License']>>>, ParentType, ContextType, RequireFields<QueryRecommendedLicensesArgs, 'recommended'>>;
  relatedWork?: Resolver<Maybe<ResolversTypes['RelatedWork']>, ParentType, ContextType, RequireFields<QueryRelatedWorkArgs, 'id'>>;
  relatedWorks?: Resolver<Maybe<Array<Maybe<ResolversTypes['RelatedWork']>>>, ParentType, ContextType, Partial<QueryRelatedWorksArgs>>;
  repositories?: Resolver<Maybe<ResolversTypes['RepositorySearchResults']>, ParentType, ContextType, RequireFields<QueryRepositoriesArgs, 'input'>>;
  repository?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, RequireFields<QueryRepositoryArgs, 'uri'>>;
  searchExternalProjects?: Resolver<Maybe<Array<Maybe<ResolversTypes['ExternalProject']>>>, ParentType, ContextType, RequireFields<QuerySearchExternalProjectsArgs, 'input'>>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<QuerySectionArgs, 'sectionId'>>;
  sectionVersions?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedSection']>>>, ParentType, ContextType, RequireFields<QuerySectionVersionsArgs, 'sectionId'>>;
  sections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Section']>>>, ParentType, ContextType, RequireFields<QuerySectionsArgs, 'templateId'>>;
  superInspectPlanVersion?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QuerySuperInspectPlanVersionArgs, 'planId'>>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  tagsBySectionId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType, RequireFields<QueryTagsBySectionIdArgs, 'sectionId'>>;
  template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<QueryTemplateArgs, 'templateId'>>;
  templateCollaborators?: Resolver<Maybe<Array<Maybe<ResolversTypes['TemplateCollaborator']>>>, ParentType, ContextType, RequireFields<QueryTemplateCollaboratorsArgs, 'templateId'>>;
  templateVersions?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedTemplate']>>>, ParentType, ContextType, RequireFields<QueryTemplateVersionsArgs, 'templateId'>>;
  topLevelResearchDomains?: Resolver<Maybe<Array<Maybe<ResolversTypes['ResearchDomain']>>>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'userId'>>;
  userByOrcid?: Resolver<Maybe<ResolversTypes['OrcidUserSearchResult']>, ParentType, ContextType, RequireFields<QueryUserByOrcidArgs, 'orcid'>>;
  users?: Resolver<Maybe<ResolversTypes['UserSearchResults']>, ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export type QuestionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Question'] = ResolversParentTypes['Question']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['QuestionErrors']>, ParentType, ContextType>;
  guidanceText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDirty?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  json?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionConditions?: Resolver<Maybe<Array<ResolversTypes['QuestionCondition']>>, ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  required?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sectionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sourceQestionId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  templateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  useSampleTextAsDefault?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuestionConditionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['QuestionCondition'] = ResolversParentTypes['QuestionCondition']> = {
  action?: Resolver<ResolversTypes['QuestionConditionActionType'], ParentType, ContextType>;
  conditionMatch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  conditionType?: Resolver<ResolversTypes['QuestionConditionCondition'], ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['QuestionConditionErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuestionConditionErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['QuestionConditionErrors'] = ResolversParentTypes['QuestionConditionErrors']> = {
  action?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  conditionMatch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  conditionType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  target?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuestionErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['QuestionErrors'] = ResolversParentTypes['QuestionErrors']> = {
  displayOrder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  guidanceText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  json?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionConditionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sectionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sourceQestionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  templateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RelatedWorkResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['RelatedWork'] = ResolversParentTypes['RelatedWork']> = {
  citation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['RelatedWorkErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  identifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  relationDescriptor?: Resolver<Maybe<ResolversTypes['RelatedWorkDescriptor']>, ParentType, ContextType>;
  workType?: Resolver<Maybe<ResolversTypes['RelatedWorkType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RelatedWorkErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['RelatedWorkErrors'] = ResolversParentTypes['RelatedWorkErrors']> = {
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  identifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  relationDescriptor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  workType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReorderQuestionsResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ReorderQuestionsResult'] = ResolversParentTypes['ReorderQuestionsResult']> = {
  errors?: Resolver<Maybe<ResolversTypes['QuestionErrors']>, ParentType, ContextType>;
  questions?: Resolver<Maybe<Array<ResolversTypes['Question']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReorderSectionsResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ReorderSectionsResult'] = ResolversParentTypes['ReorderSectionsResult']> = {
  errors?: Resolver<Maybe<ResolversTypes['SectionErrors']>, ParentType, ContextType>;
  sections?: Resolver<Maybe<Array<ResolversTypes['Section']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RepositoryResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Repository'] = ResolversParentTypes['Repository']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['RepositoryErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  keywords?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  repositoryTypes?: Resolver<Maybe<Array<ResolversTypes['RepositoryType']>>, ParentType, ContextType>;
  researchDomains?: Resolver<Maybe<Array<ResolversTypes['ResearchDomain']>>, ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RepositoryErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['RepositoryErrors'] = ResolversParentTypes['RepositoryErrors']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  keywords?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  repositoryTypes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  researchDomainIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RepositorySearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['RepositorySearchResults'] = ResolversParentTypes['RepositorySearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['Repository']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ResearchDomainResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ResearchDomain'] = ResolversParentTypes['ResearchDomain']> = {
  childResearchDomains?: Resolver<Maybe<Array<ResolversTypes['ResearchDomain']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ResearchDomainErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentResearchDomain?: Resolver<Maybe<ResolversTypes['ResearchDomain']>, ParentType, ContextType>;
  parentResearchDomainId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ResearchDomainErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ResearchDomainErrors'] = ResolversParentTypes['ResearchDomainErrors']> = {
  childResearchDomainIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentResearchDomainId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ResearchDomainSearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ResearchDomainSearchResults'] = ResolversParentTypes['ResearchDomainSearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['ResearchDomain']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface RorScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Ror'], any> {
  name: 'Ror';
}

export type SectionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = {
  bestPractice?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['SectionErrors']>, ParentType, ContextType>;
  guidance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  introduction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isDirty?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  questions?: Resolver<Maybe<Array<ResolversTypes['Question']>>, ParentType, ContextType>;
  requirements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType>;
  template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SectionErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['SectionErrors'] = ResolversParentTypes['SectionErrors']> = {
  displayOrder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  guidance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  introduction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requirements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  templateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['TagErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['TagErrors'] = ResolversParentTypes['TagErrors']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Template'] = ResolversParentTypes['Template']> = {
  admins?: Resolver<Maybe<Array<ResolversTypes['User']>>, ParentType, ContextType>;
  bestPractice?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  collaborators?: Resolver<Maybe<Array<ResolversTypes['TemplateCollaborator']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['TemplateErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDirty?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  languageId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  latestPublishDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latestPublishVersion?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latestPublishVisibility?: Resolver<Maybe<ResolversTypes['TemplateVisibility']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  sections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Section']>>>, ParentType, ContextType>;
  sourceTemplateId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateCollaboratorResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['TemplateCollaborator'] = ResolversParentTypes['TemplateCollaborator']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['TemplateCollaboratorErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  invitedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateCollaboratorErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['TemplateCollaboratorErrors'] = ResolversParentTypes['TemplateCollaboratorErrors']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invitedById?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  templateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['TemplateErrors'] = ResolversParentTypes['TemplateErrors']> = {
  collaboratorIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  languageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latestPublishVersion?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latestPublishVisibility?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sectionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sourceTemplateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateSearchResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['TemplateSearchResult'] = ResolversParentTypes['TemplateSearchResult']> = {
  bestPractice?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdByName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDirty?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  latestPublishDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latestPublishVersion?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latestPublishVisibility?: Resolver<Maybe<ResolversTypes['TemplateVisibility']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modifiedByName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerDisplayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateSearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['TemplateSearchResults'] = ResolversParentTypes['TemplateSearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['TemplateSearchResult']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type UpdateRelatedWorkInputResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['UpdateRelatedWorkInput'] = ResolversParentTypes['UpdateRelatedWorkInput']> = {
  citation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  identifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  relatedWorkId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  relationDescriptor?: Resolver<Maybe<ResolversTypes['RelatedWorkDescriptor']>, ParentType, ContextType>;
  workType?: Resolver<Maybe<ResolversTypes['RelatedWorkType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  acceptedTerms?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emails?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserEmail']>>>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['UserErrors']>, ParentType, ContextType>;
  failed_sign_in_attempts?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  languageId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  last_sign_in?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last_sign_in_via?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  notify_on_comment_added?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  notify_on_feedback_complete?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  notify_on_plan_shared?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  notify_on_plan_visibility_change?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  notify_on_template_shared?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['Orcid']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  ssoId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserEmailResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['UserEmail'] = ResolversParentTypes['UserEmail']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['UserEmailErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isConfirmed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPrimary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserEmailErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['UserEmailErrors'] = ResolversParentTypes['UserEmailErrors']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['UserErrors'] = ResolversParentTypes['UserErrors']> = {
  affiliationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  confirmPassword?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  languageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  otherAffiliationName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  password?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ssoId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['UserSearchResults'] = ResolversParentTypes['UserSearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedQuestionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedQuestion'] = ResolversParentTypes['VersionedQuestion']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['VersionedQuestionErrors']>, ParentType, ContextType>;
  guidanceText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  json?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  required?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  useSampleTextAsDefault?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  versionedQuestionConditions?: Resolver<Maybe<Array<ResolversTypes['VersionedQuestionCondition']>>, ParentType, ContextType>;
  versionedSectionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  versionedTemplateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedQuestionConditionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedQuestionCondition'] = ResolversParentTypes['VersionedQuestionCondition']> = {
  action?: Resolver<ResolversTypes['VersionedQuestionConditionActionType'], ParentType, ContextType>;
  conditionMatch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  conditionType?: Resolver<ResolversTypes['VersionedQuestionConditionCondition'], ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['VersionedQuestionConditionErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionConditionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  versionedQuestionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedQuestionConditionErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedQuestionConditionErrors'] = ResolversParentTypes['VersionedQuestionConditionErrors']> = {
  action?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  conditionMatch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  conditionType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionConditionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  target?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedQuestionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedQuestionErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedQuestionErrors'] = ResolversParentTypes['VersionedQuestionErrors']> = {
  displayOrder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  guidanceText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  json?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedQuestionConditionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedSectionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedTemplateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedQuestionWithFilledResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedQuestionWithFilled'] = ResolversParentTypes['VersionedQuestionWithFilled']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['VersionedQuestionErrors']>, ParentType, ContextType>;
  guidanceText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasAnswer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  json?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  required?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  useSampleTextAsDefault?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  versionedQuestionConditions?: Resolver<Maybe<Array<ResolversTypes['VersionedQuestionCondition']>>, ParentType, ContextType>;
  versionedSectionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  versionedTemplateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedSectionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedSection'] = ResolversParentTypes['VersionedSection']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['VersionedSectionErrors']>, ParentType, ContextType>;
  guidance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  introduction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requirements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType>;
  versionedQuestions?: Resolver<Maybe<Array<ResolversTypes['VersionedQuestion']>>, ParentType, ContextType>;
  versionedTemplate?: Resolver<ResolversTypes['VersionedTemplate'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedSectionErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedSectionErrors'] = ResolversParentTypes['VersionedSectionErrors']> = {
  displayOrder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  guidance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  introduction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requirements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sectionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tagIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedQuestionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedTemplateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedSectionSearchResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedSectionSearchResult'] = ResolversParentTypes['VersionedSectionSearchResult']> = {
  bestPractice?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  introduction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  versionedQuestionCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  versionedTemplateId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  versionedTemplateName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedSectionSearchResultsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedSectionSearchResults'] = ResolversParentTypes['VersionedSectionSearchResults']> = {
  availableSortFields?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  currentOffset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedSectionSearchResult']>>>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedTemplateResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedTemplate'] = ResolversParentTypes['VersionedTemplate']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  bestPractice?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['VersionedTemplateErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType>;
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  versionType?: Resolver<Maybe<ResolversTypes['TemplateVersionType']>, ParentType, ContextType>;
  versionedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  versionedSections?: Resolver<Maybe<Array<ResolversTypes['VersionedSection']>>, ParentType, ContextType>;
  visibility?: Resolver<ResolversTypes['TemplateVisibility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedTemplateErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedTemplateErrors'] = ResolversParentTypes['VersionedTemplateErrors']> = {
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  templateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedById?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedSectionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedTemplateSearchResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedTemplateSearchResult'] = ResolversParentTypes['VersionedTemplateSearchResult']> = {
  bestPractice?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modifiedByName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerDisplayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ownerSearchName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerURI?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  templateId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['TemplateVisibility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = MyContext> = {
  AddRelatedWorkInput?: AddRelatedWorkInputResolvers<ContextType>;
  Affiliation?: AffiliationResolvers<ContextType>;
  AffiliationEmailDomain?: AffiliationEmailDomainResolvers<ContextType>;
  AffiliationErrors?: AffiliationErrorsResolvers<ContextType>;
  AffiliationLink?: AffiliationLinkResolvers<ContextType>;
  AffiliationSearch?: AffiliationSearchResolvers<ContextType>;
  AffiliationSearchResults?: AffiliationSearchResultsResolvers<ContextType>;
  Answer?: AnswerResolvers<ContextType>;
  AnswerComment?: AnswerCommentResolvers<ContextType>;
  AnswerCommentErrors?: AnswerCommentErrorsResolvers<ContextType>;
  CollaboratorSearchResult?: CollaboratorSearchResultResolvers<ContextType>;
  DateTimeISO?: GraphQLScalarType;
  DmspId?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  ExternalFunding?: ExternalFundingResolvers<ContextType>;
  ExternalMember?: ExternalMemberResolvers<ContextType>;
  ExternalProject?: ExternalProjectResolvers<ContextType>;
  FunderPopularityResult?: FunderPopularityResultResolvers<ContextType>;
  InitializePlanVersionOutput?: InitializePlanVersionOutputResolvers<ContextType>;
  Language?: LanguageResolvers<ContextType>;
  License?: LicenseResolvers<ContextType>;
  LicenseErrors?: LicenseErrorsResolvers<ContextType>;
  LicenseSearchResults?: LicenseSearchResultsResolvers<ContextType>;
  MemberRole?: MemberRoleResolvers<ContextType>;
  MemberRoleErrors?: MemberRoleErrorsResolvers<ContextType>;
  MetadataStandard?: MetadataStandardResolvers<ContextType>;
  MetadataStandardErrors?: MetadataStandardErrorsResolvers<ContextType>;
  MetadataStandardSearchResults?: MetadataStandardSearchResultsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Orcid?: GraphQLScalarType;
  OrcidUserSearchResult?: OrcidUserSearchResultResolvers<ContextType>;
  OutputType?: OutputTypeResolvers<ContextType>;
  OutputTypeErrors?: OutputTypeErrorsResolvers<ContextType>;
  PaginatedQueryResults?: PaginatedQueryResultsResolvers<ContextType>;
  Plan?: PlanResolvers<ContextType>;
  PlanErrors?: PlanErrorsResolvers<ContextType>;
  PlanFeedback?: PlanFeedbackResolvers<ContextType>;
  PlanFeedbackComment?: PlanFeedbackCommentResolvers<ContextType>;
  PlanFeedbackCommentErrors?: PlanFeedbackCommentErrorsResolvers<ContextType>;
  PlanFeedbackErrors?: PlanFeedbackErrorsResolvers<ContextType>;
  PlanFunding?: PlanFundingResolvers<ContextType>;
  PlanFundingErrors?: PlanFundingErrorsResolvers<ContextType>;
  PlanMember?: PlanMemberResolvers<ContextType>;
  PlanMemberErrors?: PlanMemberErrorsResolvers<ContextType>;
  PlanOutput?: PlanOutputResolvers<ContextType>;
  PlanOutputErrors?: PlanOutputErrorsResolvers<ContextType>;
  PlanProgress?: PlanProgressResolvers<ContextType>;
  PlanSearchResult?: PlanSearchResultResolvers<ContextType>;
  PlanSectionProgress?: PlanSectionProgressResolvers<ContextType>;
  PlanVersion?: PlanVersionResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  ProjectCollaborator?: ProjectCollaboratorResolvers<ContextType>;
  ProjectCollaboratorErrors?: ProjectCollaboratorErrorsResolvers<ContextType>;
  ProjectErrors?: ProjectErrorsResolvers<ContextType>;
  ProjectFunding?: ProjectFundingResolvers<ContextType>;
  ProjectFundingErrors?: ProjectFundingErrorsResolvers<ContextType>;
  ProjectMember?: ProjectMemberResolvers<ContextType>;
  ProjectMemberErrors?: ProjectMemberErrorsResolvers<ContextType>;
  ProjectOutput?: ProjectOutputResolvers<ContextType>;
  ProjectOutputErrors?: ProjectOutputErrorsResolvers<ContextType>;
  ProjectSearchResult?: ProjectSearchResultResolvers<ContextType>;
  ProjectSearchResultCollaborator?: ProjectSearchResultCollaboratorResolvers<ContextType>;
  ProjectSearchResultFunding?: ProjectSearchResultFundingResolvers<ContextType>;
  ProjectSearchResultMember?: ProjectSearchResultMemberResolvers<ContextType>;
  ProjectSearchResults?: ProjectSearchResultsResolvers<ContextType>;
  PublishedTemplateMetaDataResults?: PublishedTemplateMetaDataResultsResolvers<ContextType>;
  PublishedTemplateSearchResults?: PublishedTemplateSearchResultsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Question?: QuestionResolvers<ContextType>;
  QuestionCondition?: QuestionConditionResolvers<ContextType>;
  QuestionConditionErrors?: QuestionConditionErrorsResolvers<ContextType>;
  QuestionErrors?: QuestionErrorsResolvers<ContextType>;
  RelatedWork?: RelatedWorkResolvers<ContextType>;
  RelatedWorkErrors?: RelatedWorkErrorsResolvers<ContextType>;
  ReorderQuestionsResult?: ReorderQuestionsResultResolvers<ContextType>;
  ReorderSectionsResult?: ReorderSectionsResultResolvers<ContextType>;
  Repository?: RepositoryResolvers<ContextType>;
  RepositoryErrors?: RepositoryErrorsResolvers<ContextType>;
  RepositorySearchResults?: RepositorySearchResultsResolvers<ContextType>;
  ResearchDomain?: ResearchDomainResolvers<ContextType>;
  ResearchDomainErrors?: ResearchDomainErrorsResolvers<ContextType>;
  ResearchDomainSearchResults?: ResearchDomainSearchResultsResolvers<ContextType>;
  Ror?: GraphQLScalarType;
  Section?: SectionResolvers<ContextType>;
  SectionErrors?: SectionErrorsResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  TagErrors?: TagErrorsResolvers<ContextType>;
  Template?: TemplateResolvers<ContextType>;
  TemplateCollaborator?: TemplateCollaboratorResolvers<ContextType>;
  TemplateCollaboratorErrors?: TemplateCollaboratorErrorsResolvers<ContextType>;
  TemplateErrors?: TemplateErrorsResolvers<ContextType>;
  TemplateSearchResult?: TemplateSearchResultResolvers<ContextType>;
  TemplateSearchResults?: TemplateSearchResultsResolvers<ContextType>;
  URL?: GraphQLScalarType;
  UpdateRelatedWorkInput?: UpdateRelatedWorkInputResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserEmail?: UserEmailResolvers<ContextType>;
  UserEmailErrors?: UserEmailErrorsResolvers<ContextType>;
  UserErrors?: UserErrorsResolvers<ContextType>;
  UserSearchResults?: UserSearchResultsResolvers<ContextType>;
  VersionedQuestion?: VersionedQuestionResolvers<ContextType>;
  VersionedQuestionCondition?: VersionedQuestionConditionResolvers<ContextType>;
  VersionedQuestionConditionErrors?: VersionedQuestionConditionErrorsResolvers<ContextType>;
  VersionedQuestionErrors?: VersionedQuestionErrorsResolvers<ContextType>;
  VersionedQuestionWithFilled?: VersionedQuestionWithFilledResolvers<ContextType>;
  VersionedSection?: VersionedSectionResolvers<ContextType>;
  VersionedSectionErrors?: VersionedSectionErrorsResolvers<ContextType>;
  VersionedSectionSearchResult?: VersionedSectionSearchResultResolvers<ContextType>;
  VersionedSectionSearchResults?: VersionedSectionSearchResultsResolvers<ContextType>;
  VersionedTemplate?: VersionedTemplateResolvers<ContextType>;
  VersionedTemplateErrors?: VersionedTemplateErrorsResolvers<ContextType>;
  VersionedTemplateSearchResult?: VersionedTemplateSearchResultResolvers<ContextType>;
};


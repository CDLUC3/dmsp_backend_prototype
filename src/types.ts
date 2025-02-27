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

export type AddProjectContributorInput = {
  /** The contributor's affiliation URI */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The roles the contributor has on the research project */
  contributorRoleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The contributor's email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's first/given name */
  givenName?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's ORCID */
  orcid?: InputMaybe<Scalars['String']['input']>;
  /** The research project */
  projectId: Scalars['Int']['input'];
  /** The contributor's last/sur name */
  surName?: InputMaybe<Scalars['String']['input']>;
};

export type AddProjectFunderInput = {
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
  status?: InputMaybe<ProjectFunderStatus>;
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
  /** Add options for a question type, like radio buttons */
  questionOptions?: InputMaybe<Array<InputMaybe<QuestionOptionInput>>>;
  /** This will be used as a sort of title for the Question */
  questionText?: InputMaybe<Scalars['String']['input']>;
  /** The type of question, such as text field, select box, radio buttons, etc */
  questionTypeId?: InputMaybe<Scalars['Int']['input']>;
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

export type AddQuestionOptionInput = {
  /** Whether the option is the default selected one */
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  /** The option order number */
  orderNumber: Scalars['Int']['input'];
  /** The question id that the QuestionOption belongs to */
  questionId: Scalars['Int']['input'];
  /** The option text */
  text: Scalars['String']['input'];
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
  answerText?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  feedbackEmails?: Maybe<Scalars['String']['output']>;
  feedbackMessage?: Maybe<Scalars['String']['output']>;
  fundrefId?: Maybe<Scalars['String']['output']>;
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
  homepage?: Maybe<Scalars['String']['output']>;
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
  /** The official display name */
  displayName: Scalars['String']['output'];
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The unique identifer for the affiliation (typically the ROR id) */
  id: Scalars['Int']['output'];
  /** The categories the Affiliation belongs to */
  types: Array<AffiliationType>;
  /** The URI of the affiliation */
  uri: Scalars['String']['output'];
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
  /** The answer to the question */
  answerText?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The DMP that the answer belongs to */
  plan: Plan;
  /** The question in the template the answer is for */
  versionedQuestion: VersionedQuestion;
  /** The question in the template the answer is for */
  versionedSection: VersionedSection;
};

export type AnswerComment = {
  __typename?: 'AnswerComment';
  /** The answer the comment is associated with */
  answer: Answer;
  /** The comment */
  commentText: Scalars['String']['output'];
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
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
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The collaborator's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The collaborator's last/sur name */
  surName?: Maybe<Scalars['String']['output']>;
};

export type ContributorRole = {
  __typename?: 'ContributorRole';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A longer description of the contributor role useful for tooltips */
  description?: Maybe<Scalars['String']['output']>;
  /** The order in which to display these items when displayed in the UI */
  displayOrder: Scalars['Int']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<ContributorRoleErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The Ui label to display for the contributor role */
  label: Scalars['String']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The taxonomy URL for the contributor role */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the ContributorRole */
export type ContributorRoleErrors = {
  __typename?: 'ContributorRoleErrors';
  description?: Maybe<Scalars['String']['output']>;
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
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

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Reactivate the specified user Account (Admin only) */
  activateUser?: Maybe<User>;
  /** Create a new Affiliation */
  addAffiliation?: Maybe<Affiliation>;
  /** Add a new contributor role (URL and label must be unique!) */
  addContributorRole?: Maybe<ContributorRole>;
  /** Add a comment to an answer within a round of feedback */
  addFeedbackComment?: Maybe<PlanFeedbackComment>;
  /** Add a new License (don't make the URI up! should resolve to an taxonomy HTML/JSON representation of the object) */
  addLicense?: Maybe<License>;
  /** Add a new MetadataStandard */
  addMetadataStandard?: Maybe<MetadataStandard>;
  /** Create a plan */
  addPlan?: Maybe<Plan>;
  /** Answer a question */
  addPlanAnswer?: Maybe<Answer>;
  /** Add a Contributor to a Plan */
  addPlanContributor?: Maybe<PlanContributor>;
  /** Create a project */
  addProject?: Maybe<Project>;
  /** Add a collaborator to a Plan */
  addProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Add a contributor to a research project */
  addProjectContributor?: Maybe<ProjectContributor>;
  /** Add a Funder to a research project */
  addProjectFunder?: Maybe<ProjectFunder>;
  /** Add an output to a research project */
  addProjectOutput?: Maybe<ProjectOutput>;
  /** Create a new Question */
  addQuestion: Question;
  /** Create a new QuestionCondition associated with a question */
  addQuestionCondition: QuestionCondition;
  /** Create a new QuestionOption */
  addQuestionOption: QuestionOption;
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
  /** Change the plan's status to COMPLETE (cannot be done once the plan is PUBLISHED) */
  markPlanComplete?: Maybe<Plan>;
  /** Change the plan's status to DRAFT (cannot be done once the plan is PUBLISHED) */
  markPlanDraft?: Maybe<Plan>;
  /** Merge two licenses */
  mergeLicenses?: Maybe<License>;
  /** Merge two metadata standards */
  mergeMetadataStandards?: Maybe<MetadataStandard>;
  /** Merge two repositories */
  mergeRepositories?: Maybe<Repository>;
  /** Merge the 2 user accounts (Admin only) */
  mergeUsers?: Maybe<User>;
  /** Publish a plan (changes status to PUBLISHED) */
  publishPlan?: Maybe<Plan>;
  /** Delete an Affiliation (only applicable to AffiliationProvenance == DMPTOOL) */
  removeAffiliation?: Maybe<Affiliation>;
  /** Delete the contributor role */
  removeContributorRole?: Maybe<ContributorRole>;
  /** Remove a comment to an answer within a round of feedback */
  removeFeedbackComment?: Maybe<PlanFeedbackComment>;
  /** Delete a License */
  removeLicense?: Maybe<License>;
  /** Delete a MetadataStandard */
  removeMetadataStandard?: Maybe<MetadataStandard>;
  /** Remove a PlanContributor from a Plan */
  removePlanContributor?: Maybe<PlanContributor>;
  /** Remove a ProjectCollaborator from a Plan */
  removeProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Remove a research project contributor */
  removeProjectContributor?: Maybe<ProjectContributor>;
  /** Remove a research project Funder */
  removeProjectFunder?: Maybe<ProjectFunder>;
  /** Remove a PlanFunder from a Plan */
  removeProjectFunderFromPlan?: Maybe<ProjectFunder>;
  /** Remove a research project output */
  removeProjectOutput?: Maybe<ProjectOutput>;
  /** Remove an Output from a Plan */
  removeProjectOutputFromPlan?: Maybe<ProjectOutput>;
  /** Delete a Question */
  removeQuestion?: Maybe<Question>;
  /** Remove a QuestionCondition using a specific QuestionCondition id */
  removeQuestionCondition?: Maybe<QuestionCondition>;
  /** Delete a QuestionOption */
  removeQuestionOption?: Maybe<QuestionOption>;
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
  /** Add a Funder to a Plan */
  selectProjectFunderForPlan?: Maybe<ProjectFunder>;
  /** Add an Output to a Plan */
  selectProjectOutputForPlan?: Maybe<ProjectOutput>;
  /** Designate the email as the current user's primary email address */
  setPrimaryUserEmail?: Maybe<Array<Maybe<UserEmail>>>;
  /** Set the user's ORCID */
  setUserOrcid?: Maybe<User>;
  /** Update an Affiliation */
  updateAffiliation?: Maybe<Affiliation>;
  /** Update the contributor role */
  updateContributorRole?: Maybe<ContributorRole>;
  /** Update a License record */
  updateLicense?: Maybe<License>;
  /** Update a MetadataStandard record */
  updateMetadataStandard?: Maybe<MetadataStandard>;
  /** Change the current user's password */
  updatePassword?: Maybe<User>;
  /** Edit an answer */
  updatePlanAnswer?: Maybe<Answer>;
  /** Chnage a Contributor's accessLevel on a Plan */
  updatePlanContributor?: Maybe<PlanContributor>;
  /** Edit a project */
  updateProject?: Maybe<Project>;
  /** Chnage a collaborator's accessLevel on a Plan */
  updateProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Update a contributor on the research project */
  updateProjectContributor?: Maybe<ProjectContributor>;
  /** Update a Funder on the research project */
  updateProjectFunder?: Maybe<ProjectFunder>;
  /** Update an output on the research project */
  updateProjectOutput?: Maybe<ProjectOutput>;
  /** Update a Question */
  updateQuestion: Question;
  /** Update a QuestionCondition for a specific QuestionCondition id */
  updateQuestionCondition?: Maybe<QuestionCondition>;
  /** Update a QuestionOption */
  updateQuestionOption: QuestionOption;
  /** Update a Repository record */
  updateRepository?: Maybe<Repository>;
  /** Update a Section */
  updateSection: Section;
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


export type MutationAddContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationAddFeedbackCommentArgs = {
  answerId: Scalars['Int']['input'];
  commentText: Scalars['String']['input'];
  planFeedbackId: Scalars['Int']['input'];
};


export type MutationAddLicenseArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  recommended?: InputMaybe<Scalars['Boolean']['input']>;
  uri?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddMetadataStandardArgs = {
  input: AddMetadataStandardInput;
};


export type MutationAddPlanArgs = {
  projectId: Scalars['Int']['input'];
  versionedTemplateId: Scalars['Int']['input'];
};


export type MutationAddPlanAnswerArgs = {
  answerText?: InputMaybe<Scalars['String']['input']>;
  planId: Scalars['Int']['input'];
  versionedQuestionId: Scalars['Int']['input'];
  versionedSectionId: Scalars['Int']['input'];
};


export type MutationAddPlanContributorArgs = {
  planId: Scalars['Int']['input'];
  projectContributorId: Scalars['Int']['input'];
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationAddProjectArgs = {
  isTestProject?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};


export type MutationAddProjectCollaboratorArgs = {
  email: Scalars['String']['input'];
  planId: Scalars['Int']['input'];
};


export type MutationAddProjectContributorArgs = {
  input: AddProjectContributorInput;
};


export type MutationAddProjectFunderArgs = {
  input: AddProjectFunderInput;
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


export type MutationAddQuestionOptionArgs = {
  input: AddQuestionOptionInput;
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
  dmp_id: Scalars['String']['input'];
};


export type MutationArchiveProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationArchiveTemplateArgs = {
  templateId: Scalars['Int']['input'];
};


export type MutationCompleteFeedbackArgs = {
  planFeedbackId: Scalars['Int']['input'];
  summaryText?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateTemplateVersionArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  templateId: Scalars['Int']['input'];
  versionType?: InputMaybe<TemplateVersionType>;
  visibility: TemplateVisibility;
};


export type MutationDeactivateUserArgs = {
  userId: Scalars['Int']['input'];
};


export type MutationMarkPlanCompleteArgs = {
  dmp_id: Scalars['String']['input'];
};


export type MutationMarkPlanDraftArgs = {
  dmp_id: Scalars['String']['input'];
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


export type MutationPublishPlanArgs = {
  dmp_id: Scalars['String']['input'];
  visibility?: InputMaybe<PlanVisibility>;
};


export type MutationRemoveAffiliationArgs = {
  affiliationId: Scalars['Int']['input'];
};


export type MutationRemoveContributorRoleArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveFeedbackCommentArgs = {
  PlanFeedbackCommentId: Scalars['Int']['input'];
};


export type MutationRemoveLicenseArgs = {
  uri: Scalars['String']['input'];
};


export type MutationRemoveMetadataStandardArgs = {
  uri: Scalars['String']['input'];
};


export type MutationRemovePlanContributorArgs = {
  planContributorId: Scalars['Int']['input'];
};


export type MutationRemoveProjectCollaboratorArgs = {
  projectCollaboratorId: Scalars['Int']['input'];
};


export type MutationRemoveProjectContributorArgs = {
  projectContributorId: Scalars['Int']['input'];
};


export type MutationRemoveProjectFunderArgs = {
  projectFunderId: Scalars['Int']['input'];
};


export type MutationRemoveProjectFunderFromPlanArgs = {
  planId: Scalars['Int']['input'];
  projectFunderId: Scalars['Int']['input'];
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


export type MutationRemoveQuestionOptionArgs = {
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


export type MutationSelectProjectFunderForPlanArgs = {
  planId: Scalars['Int']['input'];
  projectFunderId: Scalars['Int']['input'];
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


export type MutationUpdateContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationUpdateLicenseArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  recommended?: InputMaybe<Scalars['Boolean']['input']>;
  uri: Scalars['String']['input'];
};


export type MutationUpdateMetadataStandardArgs = {
  input: UpdateMetadataStandardInput;
};


export type MutationUpdatePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationUpdatePlanAnswerArgs = {
  answerId: Scalars['Int']['input'];
  answerText?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdatePlanContributorArgs = {
  planContributorId: Scalars['Int']['input'];
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateProjectArgs = {
  input?: InputMaybe<UpdateProjectInput>;
};


export type MutationUpdateProjectCollaboratorArgs = {
  accessLevel: ProjectCollaboratorAccessLevel;
  projectCollaboratorId: Scalars['Int']['input'];
};


export type MutationUpdateProjectContributorArgs = {
  input: UpdateProjectContributorInput;
};


export type MutationUpdateProjectFunderArgs = {
  input: UpdateProjectFunderInput;
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


export type MutationUpdateQuestionOptionArgs = {
  input: UpdateQuestionOptionInput;
};


export type MutationUpdateRepositoryArgs = {
  input?: InputMaybe<UpdateRepositoryInput>;
};


export type MutationUpdateSectionArgs = {
  input: UpdateSectionInput;
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
  visibility: TemplateVisibility;
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

/** A Data Managament Plan (DMP) */
export type Plan = {
  __typename?: 'Plan';
  /** The contributors for the plan */
  contributors?: Maybe<Array<PlanContributor>>;
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
  /** The funders for the plan */
  funders?: Maybe<Array<PlanFunder>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The language of the plan */
  languageId?: Maybe<Scalars['String']['output']>;
  /** The last time the plan was synced with the DMPHub */
  lastSynced?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Anticipated research outputs */
  outputs?: Maybe<Array<PlanOutput>>;
  /** The project the plan is associated with */
  project?: Maybe<Project>;
  /** The timestamp for when the Plan was registered */
  registered?: Maybe<Scalars['String']['output']>;
  /** The individual who registered the plan */
  registeredById?: Maybe<Scalars['Int']['output']>;
  /** The status/state of the plan */
  status?: Maybe<PlanStatus>;
  /** The template the plan is based on */
  versionedTemplate?: Maybe<VersionedTemplate>;
  /** Prior versions of the plan */
  versions?: Maybe<Array<PlanVersion>>;
  /** The visibility/privacy setting for the plan */
  visibility?: Maybe<PlanVisibility>;
};

/** A contributor associated with a plan */
export type PlanContributor = {
  __typename?: 'PlanContributor';
  /** The roles associated with the contributor */
  contributorRoles?: Maybe<Array<ContributorRole>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanContributorErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the contributor the primary contact for the Plan */
  isPrimaryContact?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The plan that the contributor is associated with */
  plan?: Maybe<Plan>;
  /** The project contributor */
  projectContributor?: Maybe<ProjectContributor>;
};

/** A collection of errors related to the PlanContributor */
export type PlanContributorErrors = {
  __typename?: 'PlanContributorErrors';
  /** The roles associated with the contributor */
  contributorRoleIds?: Maybe<Scalars['String']['output']>;
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
  /** The isPrimaryContact flag */
  primaryContact?: Maybe<Scalars['String']['output']>;
  /** The project contributor */
  projectContributorId?: Maybe<Scalars['String']['output']>;
  /** The project that the contributor is associated with */
  projectId?: Maybe<Scalars['String']['output']>;
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
  lastSynced?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  registered?: Maybe<Scalars['String']['output']>;
  registeredById?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  versionedTemplateId?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** A round of administrative feedback for a Data Managament Plan (DMP) */
export type PlanFeedback = {
  __typename?: 'PlanFeedback';
  /** An overall summary that can be sent to the user upon completion */
  adminSummary?: Maybe<Scalars['String']['output']>;
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
  plan: Plan;
  /** The timestamp of when the user requested the feedback */
  requested: Scalars['String']['output'];
  /** The user who requested the round of feedback */
  requestedBy: User;
};

export type PlanFeedbackComment = {
  __typename?: 'PlanFeedbackComment';
  /** The round of plan feedback the comment belongs to */
  PlanFeedback?: Maybe<PlanFeedback>;
  /** The answer the comment is related to */
  answer?: Maybe<Answer>;
  /** The comment */
  comment?: Maybe<Scalars['String']['output']>;
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
  adminSummary?: Maybe<Scalars['String']['output']>;
  completedById?: Maybe<Scalars['String']['output']>;
  feedbackComments?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
  requestedById?: Maybe<Scalars['String']['output']>;
};

/** A funder associated with a plan */
export type PlanFunder = {
  __typename?: 'PlanFunder';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanFunderErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The project that is seeking (or has aquired) funding */
  project?: Maybe<Project>;
  /** The project funder */
  projectFunder?: Maybe<ProjectFunder>;
};

/** A collection of errors related to the PlanFunder */
export type PlanFunderErrors = {
  __typename?: 'PlanFunderErrors';
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  projectFunderId?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
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

export type PlanSearchResult = {
  __typename?: 'PlanSearchResult';
  /** The names of the contributors */
  contributors: Scalars['String']['output'];
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdBy?: Maybe<Scalars['String']['output']>;
  /** The DMP ID/DOI for the plan */
  dmpId?: Maybe<Scalars['String']['output']>;
  /** The name of the funder */
  funder?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
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
  /** The title of the plan */
  title?: Maybe<Scalars['String']['output']>;
  /** The template the plan is based on */
  versionedTemplateId: Scalars['Int']['output'];
  /** The visibility/permission setting */
  visibility?: Maybe<PlanVisibility>;
};

/** The status/state of the plan */
export type PlanStatus =
  /** The Plan is ready for submission or download */
  | 'COMPLETE'
  /** The Plan is still being written and reviewed */
  | 'DRAFT'
  /** The Plan's DMP ID (DOI) has been registered */
  | 'PUBLISHED';

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

export type Project = {
  __typename?: 'Project';
  /** The research project abstract */
  abstractText?: Maybe<Scalars['String']['output']>;
  /** People who are contributing to the research project (not just the DMP) */
  contributors?: Maybe<Array<ProjectContributor>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The estimated date the research project will end (use YYYY-MM-DD format) */
  endDate?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectErrors>;
  /** The funders who are supporting the research project */
  funders?: Maybe<Array<ProjectFunder>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is test/mock research project */
  isTestProject?: Maybe<Scalars['Boolean']['output']>;
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
  /** The plan the collaborator may edit */
  plan?: Maybe<Plan>;
  /** The ProjectContributor id */
  projectContributorId?: Maybe<Scalars['Int']['output']>;
  /** The collaborator (if they have an account) */
  user?: Maybe<User>;
};

export type ProjectCollaboratorAccessLevel =
  /** The user is able to perform all actions on a Plan (typically restricted to the owner/creator) */
  | 'ADMIN'
  /** The user is ONLY able to comment on the Plan's answers */
  | 'COMMENTER'
  /** The user is able to comment and edit the Plan's answers, add/edit/delete contributors and research outputs */
  | 'EDITOR';

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

/** A person involved with a research project */
export type ProjectContributor = {
  __typename?: 'ProjectContributor';
  /** The contributor's affiliation */
  affiliation?: Maybe<Affiliation>;
  /** The roles the contributor has on the research project */
  contributorRoles?: Maybe<Array<ContributorRole>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The contributor's email address */
  email?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectContributorErrors>;
  /** The contributor's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The contributor's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The research project */
  project?: Maybe<Project>;
  /** The contributor's last/sur name */
  surName?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the ProjectContributor */
export type ProjectContributorErrors = {
  __typename?: 'ProjectContributorErrors';
  affiliationId?: Maybe<Scalars['String']['output']>;
  contributorRoleIds?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  givenName?: Maybe<Scalars['String']['output']>;
  orcid?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  surName?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the Project */
export type ProjectErrors = {
  __typename?: 'ProjectErrors';
  abstractText?: Maybe<Scalars['String']['output']>;
  contributorIds?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  funderIds?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  outputIds?: Maybe<Scalars['String']['output']>;
  researchDomainId?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

/** A funder affiliation that is supporting a research project */
export type ProjectFunder = {
  __typename?: 'ProjectFunder';
  /** The funder */
  affiliation?: Maybe<Affiliation>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectFunderErrors>;
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
  status?: Maybe<ProjectFunderStatus>;
};

/** A collection of errors related to the ProjectFunder */
export type ProjectFunderErrors = {
  __typename?: 'ProjectFunderErrors';
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
export type ProjectFunderStatus =
  /** The funder did not award the project */
  | 'DENIED'
  /** The funding has been awarded to the project */
  | 'GRANTED'
  /** The project will be submitting a grant, or has not yet heard back from the funder */
  | 'PLANNED';

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
  affiliations?: Maybe<Array<Maybe<AffiliationSearch>>>;
  /** Get all of the research domains related to the specified top level domain (more nuanced ones) */
  childResearchDomains?: Maybe<Array<Maybe<ResearchDomain>>>;
  /** Get the contributor role by it's id */
  contributorRoleById?: Maybe<ContributorRole>;
  /** Get the contributor role by it's URL */
  contributorRoleByURL?: Maybe<ContributorRole>;
  /** Get all of the contributor role types */
  contributorRoles?: Maybe<Array<Maybe<ContributorRole>>>;
  /** Search for a User to add as a collaborator */
  findCollaborator?: Maybe<Array<Maybe<CollaboratorSearchResult>>>;
  /** Get all of the supported Languages */
  languages?: Maybe<Array<Maybe<Language>>>;
  /** Fetch a specific license */
  license?: Maybe<License>;
  /** Search for a license */
  licenses?: Maybe<Array<Maybe<License>>>;
  /** Returns the currently logged in user's information */
  me?: Maybe<User>;
  /** Fetch a specific metadata standard */
  metadataStandard?: Maybe<MetadataStandard>;
  /** Search for a metadata standard */
  metadataStandards?: Maybe<Array<Maybe<MetadataStandard>>>;
  /** Get all of the user's projects */
  myProjects?: Maybe<Array<Maybe<Project>>>;
  /** Get the Templates that belong to the current user's affiliation (user must be an Admin) */
  myTemplates?: Maybe<Array<Maybe<Template>>>;
  /** Get the VersionedTemplates that belong to the current user's affiliation (user must be an Admin) */
  myVersionedTemplates?: Maybe<Array<Maybe<VersionedTemplate>>>;
  /** Get all the research output types */
  outputTypes?: Maybe<Array<Maybe<OutputType>>>;
  /** Get a specific plan */
  plan?: Maybe<Plan>;
  /** Get all of the Users that are collaborators for the Plan */
  planCollaborators?: Maybe<Array<Maybe<ProjectCollaborator>>>;
  /** Get all of the Users that are contributors for the specific Plan */
  planContributors?: Maybe<Array<Maybe<PlanContributor>>>;
  /** Get all rounds of admin feedback for the plan */
  planFeedback?: Maybe<Array<Maybe<PlanFeedback>>>;
  /** Get all of the comments associated with the round of admin feedback */
  planFeedbackComments?: Maybe<Array<Maybe<PlanFeedbackComment>>>;
  /** Get all of the Funders for the specific Plan */
  planFunders?: Maybe<Array<Maybe<PlanFunder>>>;
  /** The subset of project outputs associated with the sepcified Plan */
  planOutputs?: Maybe<Array<Maybe<ProjectOutput>>>;
  /** Get all of the comments associated with the round of admin feedback */
  planQuestionAnswer?: Maybe<Answer>;
  /** Get all rounds of admin feedback for the plan */
  planSectionAnswers?: Maybe<Array<Maybe<Answer>>>;
  /** Get all plans for the research project */
  plans?: Maybe<Array<PlanSearchResult>>;
  /** Get a specific project */
  project?: Maybe<Project>;
  /** Get a specific contributor on the research project */
  projectContributor?: Maybe<ProjectContributor>;
  /** Get all of the Users that a contributors to the research project */
  projectContributors?: Maybe<Array<Maybe<ProjectContributor>>>;
  /** Get a specific ProjectFunder */
  projectFunder?: Maybe<ProjectFunder>;
  /** Get all of the Users that a Funders to the research project */
  projectFunders?: Maybe<Array<Maybe<ProjectFunder>>>;
  /** Fetch a single project output */
  projectOutput?: Maybe<ProjectOutput>;
  /** Get all of the outputs for the research project */
  projectOutputs?: Maybe<Array<Maybe<ProjectOutput>>>;
  /** Search for VersionedQuestions that belong to Section specified by sectionId */
  publishedConditionsForQuestion?: Maybe<Array<Maybe<VersionedQuestionCondition>>>;
  /** Search for VersionedQuestions that belong to Section specified by sectionId */
  publishedQuestions?: Maybe<Array<Maybe<VersionedQuestion>>>;
  /** Search for VersionedSection whose name contains the search term */
  publishedSections?: Maybe<Array<Maybe<VersionedSection>>>;
  /** Search for VersionedTemplate whose name or owning Org's name contains the search term */
  publishedTemplates?: Maybe<Array<Maybe<VersionedTemplate>>>;
  /** Get the specific Question based on questionId */
  question?: Maybe<Question>;
  /** Get the QuestionConditions that belong to a specific question */
  questionConditions?: Maybe<Array<Maybe<QuestionCondition>>>;
  /** Get the specific Question Option based on question option id */
  questionOption?: Maybe<QuestionOption>;
  /** Get the Question Options that belong to the associated questionId */
  questionOptions?: Maybe<Array<Maybe<QuestionOption>>>;
  /** Get all the QuestionTypes */
  questionTypes?: Maybe<Array<Maybe<QuestionType>>>;
  /** Get the Questions that belong to the associated sectionId */
  questions?: Maybe<Array<Maybe<Question>>>;
  /** Return the recommended Licenses */
  recommendedLicenses?: Maybe<Array<Maybe<License>>>;
  /** Fetch a specific related work */
  relatedWork?: Maybe<RelatedWork>;
  /** Search for a related work */
  relatedWorks?: Maybe<Array<Maybe<RelatedWork>>>;
  /** Search for a repository */
  repositories?: Maybe<Array<Maybe<Repository>>>;
  /** Fetch a specific repository */
  repository?: Maybe<Repository>;
  /** Get the specified section */
  section?: Maybe<Section>;
  /** Get all of the VersionedSection for the specified Section ID */
  sectionVersions?: Maybe<Array<Maybe<VersionedSection>>>;
  /** Get the Sections that belong to the associated templateId */
  sections?: Maybe<Array<Maybe<Section>>>;
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
  /** Returns all of the users associated with the current user's affiliation (Admin only) */
  users?: Maybe<Array<Maybe<User>>>;
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
};


export type QueryChildResearchDomainsArgs = {
  parentResearchDomainId: Scalars['Int']['input'];
};


export type QueryContributorRoleByIdArgs = {
  contributorRoleId: Scalars['Int']['input'];
};


export type QueryContributorRoleByUrlArgs = {
  contributorRoleURL: Scalars['URL']['input'];
};


export type QueryFindCollaboratorArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLicenseArgs = {
  uri: Scalars['String']['input'];
};


export type QueryLicensesArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMetadataStandardArgs = {
  uri: Scalars['String']['input'];
};


export type QueryMetadataStandardsArgs = {
  researchDomainId?: InputMaybe<Scalars['Int']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlanArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanCollaboratorsArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanContributorsArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanFeedbackArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanFeedbackCommentsArgs = {
  planFeedbackId: Scalars['Int']['input'];
};


export type QueryPlanFundersArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanOutputsArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanQuestionAnswerArgs = {
  answerId: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
};


export type QueryPlanSectionAnswersArgs = {
  planId: Scalars['Int']['input'];
  sectionId: Scalars['Int']['input'];
};


export type QueryPlansArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectContributorArgs = {
  projectContributorId: Scalars['Int']['input'];
};


export type QueryProjectContributorsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectFunderArgs = {
  projectFunderId: Scalars['Int']['input'];
};


export type QueryProjectFundersArgs = {
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


export type QueryPublishedQuestionsArgs = {
  versionedSectionId: Scalars['Int']['input'];
};


export type QueryPublishedSectionsArgs = {
  term: Scalars['String']['input'];
};


export type QueryPublishedTemplatesArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type QueryQuestionConditionsArgs = {
  questionId: Scalars['Int']['input'];
};


export type QueryQuestionOptionArgs = {
  id: Scalars['Int']['input'];
};


export type QueryQuestionOptionsArgs = {
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


export type QuerySectionArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QuerySectionVersionsArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QuerySectionsArgs = {
  templateId: Scalars['Int']['input'];
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
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The conditional logic triggered by this question */
  questionConditions?: Maybe<Array<QuestionCondition>>;
  /** The question options associated with this question */
  questionOptions?: Maybe<Array<QuestionOption>>;
  /** This will be used as a sort of title for the Question */
  questionText?: Maybe<Scalars['String']['output']>;
  /** The type of question, such as text field, select box, radio buttons, etc */
  questionTypeId?: Maybe<Scalars['Int']['output']>;
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
  questionConditionIds?: Maybe<Scalars['String']['output']>;
  questionOptionIds?: Maybe<Scalars['String']['output']>;
  questionText?: Maybe<Scalars['String']['output']>;
  questionTypeId?: Maybe<Scalars['String']['output']>;
  requirementText?: Maybe<Scalars['String']['output']>;
  sampleText?: Maybe<Scalars['String']['output']>;
  sectionId?: Maybe<Scalars['String']['output']>;
  sourceQestionId?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
};

/** QuestionOption always belongs to a Question */
export type QuestionOption = {
  __typename?: 'QuestionOption';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<QuestionOptionErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether the option is the default selected one */
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The option order number */
  orderNumber: Scalars['Int']['output'];
  /** The question id that the QuestionOption belongs to */
  questionId: Scalars['Int']['output'];
  /** The option text */
  text: Scalars['String']['output'];
};

/** A collection of errors related to the QuestionOption */
export type QuestionOptionErrors = {
  __typename?: 'QuestionOptionErrors';
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  orderNumber?: Maybe<Scalars['String']['output']>;
  questionId?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

/** Input for Question options operations */
export type QuestionOptionInput = {
  /** Whether the question option is the default selected one */
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  /** The order of the question option */
  orderNumber?: InputMaybe<Scalars['Int']['input']>;
  /** The text for the question option */
  text?: InputMaybe<Scalars['String']['input']>;
};

/** The type of Question, such as text field, radio buttons, etc */
export type QuestionType = {
  __typename?: 'QuestionType';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<QuestionTypeErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is the default question type */
  isDefault: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the QuestionType, like 'Short text question' */
  name: Scalars['String']['output'];
  /** The description of the QuestionType */
  usageDescription: Scalars['String']['output'];
};

/** A collection of errors related to the QuestionType */
export type QuestionTypeErrors = {
  __typename?: 'QuestionTypeErrors';
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  usageDescription?: Maybe<Scalars['String']['output']>;
};

/** A metadata standard used when describing a research output */
export type RelatedWork = {
  __typename?: 'RelatedWork';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The related work's relationship to the research project (e.g. references, isReferencedBy, etc.) */
  descriptor?: Maybe<RelatedWorkDescriptor>;
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
  descriptor?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
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
  /** The repository category/type */
  repositoryType?: InputMaybe<Scalars['String']['input']>;
  /** The research domain associated with the repository */
  researchDomainId?: InputMaybe<Scalars['Int']['input']>;
  /** The search term */
  term?: InputMaybe<Scalars['String']['input']>;
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
  /** The template's availability setting: Public is available to everyone, Private only your affiliation */
  visibility: TemplateVisibility;
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
  name?: Maybe<Scalars['String']['output']>;
  ownerId?: Maybe<Scalars['String']['output']>;
  sectionIds?: Maybe<Scalars['String']['output']>;
  sourceTemplateId?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** Template version type */
export type TemplateVersionType =
  /** Draft - saved state for internal review */
  | 'DRAFT'
  /** Published - saved state for use when creating DMPs */
  | 'PUBLISHED';

/** Template visibility */
export type TemplateVisibility =
  /** Visible only to users of your institution */
  | 'PRIVATE'
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
  /** The unique identifier for the Question */
  questionId: Scalars['Int']['input'];
  /** Update options for a question type like radio buttons */
  questionOptions?: InputMaybe<Array<InputMaybe<UpdateQuestionOptionInput>>>;
  /** This will be used as a sort of title for the Question */
  questionText?: InputMaybe<Scalars['String']['input']>;
  /** The type of question, such as text field, select box, radio buttons, etc */
  questionTypeId?: InputMaybe<Scalars['Int']['input']>;
  /** To indicate whether the question is required to be completed */
  required?: InputMaybe<Scalars['Boolean']['input']>;
  /** Requirements associated with the Question */
  requirementText?: InputMaybe<Scalars['String']['input']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: InputMaybe<Scalars['String']['input']>;
  /** Boolean indicating whether we should use content from sampleText as the default answer */
  useSampleTextAsDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateQuestionOptionInput = {
  /** The id of the QuestionOption */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Whether the option is the default selected one */
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  /** The option order number */
  orderNumber: Scalars['Int']['input'];
  /** id of parent question */
  questionId?: InputMaybe<Scalars['Int']['input']>;
  /** The option text */
  text: Scalars['String']['input'];
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
  email: Scalars['EmailAddress']['output'];
  /** The user's email addresses */
  emails?: Maybe<Array<Maybe<UserEmail>>>;
  /** Errors associated with the Object */
  errors?: Maybe<UserErrors>;
  /** The number of failed login attempts */
  failed_sign_in_attemps?: Maybe<Scalars['Int']['output']>;
  /** The user's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The user's preferred language */
  languageId: Scalars['String']['output'];
  /** The timestamp of the last login */
  last_sign_in?: Maybe<Scalars['String']['output']>;
  /** The method user for the last login: PASSWORD or SSO */
  last_sign_in_via?: Maybe<Scalars['String']['output']>;
  /** Whether or not the account is locked from failed login attempts */
  locked?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was last modifed */
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
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the email address has been confirmed */
  isConfirmed: Scalars['Boolean']['output'];
  /** Whether or not this is the primary email address */
  isPrimary: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modifed */
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
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Id of the original question that was versioned */
  questionId: Scalars['Int']['output'];
  /** This will be used as a sort of title for the Question */
  questionText?: Maybe<Scalars['String']['output']>;
  /** The type of question, such as text field, select box, radio buttons, etc */
  questionTypeId?: Maybe<Scalars['Int']['output']>;
  /** To indicate whether the question is required to be completed */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** Requirements associated with the Question */
  requirementText?: Maybe<Scalars['String']['output']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: Maybe<Scalars['String']['output']>;
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
  questionId?: Maybe<Scalars['String']['output']>;
  questionText?: Maybe<Scalars['String']['output']>;
  questionTypeId?: Maybe<Scalars['String']['output']>;
  requirementText?: Maybe<Scalars['String']['output']>;
  sampleText?: Maybe<Scalars['String']['output']>;
  versionedQuestionConditionIds?: Maybe<Scalars['String']['output']>;
  versionedSectionId?: Maybe<Scalars['String']['output']>;
  versionedTemplateId?: Maybe<Scalars['String']['output']>;
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

export type UpdateProjectContributorInput = {
  /** The contributor's affiliation URI */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The roles the contributor has on the research project */
  contributorRoleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The contributor's email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's first/given name */
  givenName?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's ORCID */
  orcid?: InputMaybe<Scalars['String']['input']>;
  /** The project contributor */
  projectContributorId: Scalars['Int']['input'];
  /** The contributor's last/sur name */
  surName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectFunderInput = {
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: InputMaybe<Scalars['String']['input']>;
  /** The project funder */
  projectFunderId: Scalars['Int']['input'];
  /** The status of the funding resquest */
  status?: InputMaybe<ProjectFunderStatus>;
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



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AccessLevel: AccessLevel;
  AddMetadataStandardInput: AddMetadataStandardInput;
  AddProjectContributorInput: AddProjectContributorInput;
  AddProjectFunderInput: AddProjectFunderInput;
  AddProjectOutputInput: AddProjectOutputInput;
  AddQuestionConditionInput: AddQuestionConditionInput;
  AddQuestionInput: AddQuestionInput;
  AddQuestionOptionInput: AddQuestionOptionInput;
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
  AffiliationType: AffiliationType;
  Answer: ResolverTypeWrapper<Answer>;
  AnswerComment: ResolverTypeWrapper<AnswerComment>;
  AnswerCommentErrors: ResolverTypeWrapper<AnswerCommentErrors>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CollaboratorSearchResult: ResolverTypeWrapper<CollaboratorSearchResult>;
  ContributorRole: ResolverTypeWrapper<ContributorRole>;
  ContributorRoleErrors: ResolverTypeWrapper<ContributorRoleErrors>;
  DateTimeISO: ResolverTypeWrapper<Scalars['DateTimeISO']['output']>;
  DmspId: ResolverTypeWrapper<Scalars['DmspId']['output']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvitedToType: InvitedToType;
  Language: ResolverTypeWrapper<Language>;
  License: ResolverTypeWrapper<License>;
  LicenseErrors: ResolverTypeWrapper<LicenseErrors>;
  MetadataStandard: ResolverTypeWrapper<MetadataStandard>;
  MetadataStandardErrors: ResolverTypeWrapper<MetadataStandardErrors>;
  Mutation: ResolverTypeWrapper<{}>;
  Orcid: ResolverTypeWrapper<Scalars['Orcid']['output']>;
  OutputType: ResolverTypeWrapper<OutputType>;
  OutputTypeErrors: ResolverTypeWrapper<OutputTypeErrors>;
  Plan: ResolverTypeWrapper<Plan>;
  PlanContributor: ResolverTypeWrapper<PlanContributor>;
  PlanContributorErrors: ResolverTypeWrapper<PlanContributorErrors>;
  PlanDownloadFormat: PlanDownloadFormat;
  PlanErrors: ResolverTypeWrapper<PlanErrors>;
  PlanFeedback: ResolverTypeWrapper<PlanFeedback>;
  PlanFeedbackComment: ResolverTypeWrapper<PlanFeedbackComment>;
  PlanFeedbackCommentErrors: ResolverTypeWrapper<PlanFeedbackCommentErrors>;
  PlanFeedbackErrors: ResolverTypeWrapper<PlanFeedbackErrors>;
  PlanFunder: ResolverTypeWrapper<PlanFunder>;
  PlanFunderErrors: ResolverTypeWrapper<PlanFunderErrors>;
  PlanOutput: ResolverTypeWrapper<PlanOutput>;
  PlanOutputErrors: ResolverTypeWrapper<PlanOutputErrors>;
  PlanSearchResult: ResolverTypeWrapper<PlanSearchResult>;
  PlanStatus: PlanStatus;
  PlanVersion: ResolverTypeWrapper<PlanVersion>;
  PlanVisibility: PlanVisibility;
  Project: ResolverTypeWrapper<Project>;
  ProjectCollaborator: ResolverTypeWrapper<ProjectCollaborator>;
  ProjectCollaboratorAccessLevel: ProjectCollaboratorAccessLevel;
  ProjectCollaboratorErrors: ResolverTypeWrapper<ProjectCollaboratorErrors>;
  ProjectContributor: ResolverTypeWrapper<ProjectContributor>;
  ProjectContributorErrors: ResolverTypeWrapper<ProjectContributorErrors>;
  ProjectErrors: ResolverTypeWrapper<ProjectErrors>;
  ProjectFunder: ResolverTypeWrapper<ProjectFunder>;
  ProjectFunderErrors: ResolverTypeWrapper<ProjectFunderErrors>;
  ProjectFunderStatus: ProjectFunderStatus;
  ProjectOutput: ResolverTypeWrapper<ProjectOutput>;
  ProjectOutputErrors: ResolverTypeWrapper<ProjectOutputErrors>;
  Query: ResolverTypeWrapper<{}>;
  Question: ResolverTypeWrapper<Question>;
  QuestionCondition: ResolverTypeWrapper<QuestionCondition>;
  QuestionConditionActionType: QuestionConditionActionType;
  QuestionConditionCondition: QuestionConditionCondition;
  QuestionConditionErrors: ResolverTypeWrapper<QuestionConditionErrors>;
  QuestionErrors: ResolverTypeWrapper<QuestionErrors>;
  QuestionOption: ResolverTypeWrapper<QuestionOption>;
  QuestionOptionErrors: ResolverTypeWrapper<QuestionOptionErrors>;
  QuestionOptionInput: QuestionOptionInput;
  QuestionType: ResolverTypeWrapper<QuestionType>;
  QuestionTypeErrors: ResolverTypeWrapper<QuestionTypeErrors>;
  RelatedWork: ResolverTypeWrapper<RelatedWork>;
  RelatedWorkDescriptor: RelatedWorkDescriptor;
  RelatedWorkErrors: ResolverTypeWrapper<RelatedWorkErrors>;
  RelatedWorkType: RelatedWorkType;
  Repository: ResolverTypeWrapper<Repository>;
  RepositoryErrors: ResolverTypeWrapper<RepositoryErrors>;
  RepositorySearchInput: RepositorySearchInput;
  RepositoryType: RepositoryType;
  ResearchDomain: ResolverTypeWrapper<ResearchDomain>;
  ResearchDomainErrors: ResolverTypeWrapper<ResearchDomainErrors>;
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
  TemplateVersionType: TemplateVersionType;
  TemplateVisibility: TemplateVisibility;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  UpdateMetadataStandardInput: UpdateMetadataStandardInput;
  UpdateProjectInput: UpdateProjectInput;
  UpdateProjectOutputInput: UpdateProjectOutputInput;
  UpdateQuestionConditionInput: UpdateQuestionConditionInput;
  UpdateQuestionInput: UpdateQuestionInput;
  UpdateQuestionOptionInput: UpdateQuestionOptionInput;
  UpdateRepositoryInput: UpdateRepositoryInput;
  UpdateSectionInput: UpdateSectionInput;
  User: ResolverTypeWrapper<User>;
  UserEmail: ResolverTypeWrapper<UserEmail>;
  UserEmailErrors: ResolverTypeWrapper<UserEmailErrors>;
  UserErrors: ResolverTypeWrapper<UserErrors>;
  UserRole: UserRole;
  VersionedQuestion: ResolverTypeWrapper<VersionedQuestion>;
  VersionedQuestionCondition: ResolverTypeWrapper<VersionedQuestionCondition>;
  VersionedQuestionConditionActionType: VersionedQuestionConditionActionType;
  VersionedQuestionConditionCondition: VersionedQuestionConditionCondition;
  VersionedQuestionConditionErrors: ResolverTypeWrapper<VersionedQuestionConditionErrors>;
  VersionedQuestionErrors: ResolverTypeWrapper<VersionedQuestionErrors>;
  VersionedSection: ResolverTypeWrapper<VersionedSection>;
  VersionedSectionErrors: ResolverTypeWrapper<VersionedSectionErrors>;
  VersionedTemplate: ResolverTypeWrapper<VersionedTemplate>;
  VersionedTemplateErrors: ResolverTypeWrapper<VersionedTemplateErrors>;
  updateProjectContributorInput: UpdateProjectContributorInput;
  updateProjectFunderInput: UpdateProjectFunderInput;
  updateUserNotificationsInput: UpdateUserNotificationsInput;
  updateUserProfileInput: UpdateUserProfileInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddMetadataStandardInput: AddMetadataStandardInput;
  AddProjectContributorInput: AddProjectContributorInput;
  AddProjectFunderInput: AddProjectFunderInput;
  AddProjectOutputInput: AddProjectOutputInput;
  AddQuestionConditionInput: AddQuestionConditionInput;
  AddQuestionInput: AddQuestionInput;
  AddQuestionOptionInput: AddQuestionOptionInput;
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
  Answer: Answer;
  AnswerComment: AnswerComment;
  AnswerCommentErrors: AnswerCommentErrors;
  Boolean: Scalars['Boolean']['output'];
  CollaboratorSearchResult: CollaboratorSearchResult;
  ContributorRole: ContributorRole;
  ContributorRoleErrors: ContributorRoleErrors;
  DateTimeISO: Scalars['DateTimeISO']['output'];
  DmspId: Scalars['DmspId']['output'];
  EmailAddress: Scalars['EmailAddress']['output'];
  Int: Scalars['Int']['output'];
  Language: Language;
  License: License;
  LicenseErrors: LicenseErrors;
  MetadataStandard: MetadataStandard;
  MetadataStandardErrors: MetadataStandardErrors;
  Mutation: {};
  Orcid: Scalars['Orcid']['output'];
  OutputType: OutputType;
  OutputTypeErrors: OutputTypeErrors;
  Plan: Plan;
  PlanContributor: PlanContributor;
  PlanContributorErrors: PlanContributorErrors;
  PlanErrors: PlanErrors;
  PlanFeedback: PlanFeedback;
  PlanFeedbackComment: PlanFeedbackComment;
  PlanFeedbackCommentErrors: PlanFeedbackCommentErrors;
  PlanFeedbackErrors: PlanFeedbackErrors;
  PlanFunder: PlanFunder;
  PlanFunderErrors: PlanFunderErrors;
  PlanOutput: PlanOutput;
  PlanOutputErrors: PlanOutputErrors;
  PlanSearchResult: PlanSearchResult;
  PlanVersion: PlanVersion;
  Project: Project;
  ProjectCollaborator: ProjectCollaborator;
  ProjectCollaboratorErrors: ProjectCollaboratorErrors;
  ProjectContributor: ProjectContributor;
  ProjectContributorErrors: ProjectContributorErrors;
  ProjectErrors: ProjectErrors;
  ProjectFunder: ProjectFunder;
  ProjectFunderErrors: ProjectFunderErrors;
  ProjectOutput: ProjectOutput;
  ProjectOutputErrors: ProjectOutputErrors;
  Query: {};
  Question: Question;
  QuestionCondition: QuestionCondition;
  QuestionConditionErrors: QuestionConditionErrors;
  QuestionErrors: QuestionErrors;
  QuestionOption: QuestionOption;
  QuestionOptionErrors: QuestionOptionErrors;
  QuestionOptionInput: QuestionOptionInput;
  QuestionType: QuestionType;
  QuestionTypeErrors: QuestionTypeErrors;
  RelatedWork: RelatedWork;
  RelatedWorkErrors: RelatedWorkErrors;
  Repository: Repository;
  RepositoryErrors: RepositoryErrors;
  RepositorySearchInput: RepositorySearchInput;
  ResearchDomain: ResearchDomain;
  ResearchDomainErrors: ResearchDomainErrors;
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
  URL: Scalars['URL']['output'];
  UpdateMetadataStandardInput: UpdateMetadataStandardInput;
  UpdateProjectInput: UpdateProjectInput;
  UpdateProjectOutputInput: UpdateProjectOutputInput;
  UpdateQuestionConditionInput: UpdateQuestionConditionInput;
  UpdateQuestionInput: UpdateQuestionInput;
  UpdateQuestionOptionInput: UpdateQuestionOptionInput;
  UpdateRepositoryInput: UpdateRepositoryInput;
  UpdateSectionInput: UpdateSectionInput;
  User: User;
  UserEmail: UserEmail;
  UserEmailErrors: UserEmailErrors;
  UserErrors: UserErrors;
  VersionedQuestion: VersionedQuestion;
  VersionedQuestionCondition: VersionedQuestionCondition;
  VersionedQuestionConditionErrors: VersionedQuestionConditionErrors;
  VersionedQuestionErrors: VersionedQuestionErrors;
  VersionedSection: VersionedSection;
  VersionedSectionErrors: VersionedSectionErrors;
  VersionedTemplate: VersionedTemplate;
  VersionedTemplateErrors: VersionedTemplateErrors;
  updateProjectContributorInput: UpdateProjectContributorInput;
  updateProjectFunderInput: UpdateProjectFunderInput;
  updateUserNotificationsInput: UpdateUserNotificationsInput;
  updateUserProfileInput: UpdateUserProfileInput;
};

export type AffiliationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Affiliation'] = ResolversParentTypes['Affiliation']> = {
  acronyms?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  aliases?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
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
  answerText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  feedbackEmails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  feedbackMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fundrefId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  homepage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  funder?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  types?: Resolver<Array<ResolversTypes['AffiliationType']>, ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnswerResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Answer'] = ResolversParentTypes['Answer']> = {
  answerText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  plan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType>;
  versionedQuestion?: Resolver<ResolversTypes['VersionedQuestion'], ParentType, ContextType>;
  versionedSection?: Resolver<ResolversTypes['VersionedSection'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnswerCommentResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AnswerComment'] = ResolversParentTypes['AnswerComment']> = {
  answer?: Resolver<ResolversTypes['Answer'], ParentType, ContextType>;
  commentText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type ContributorRoleResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ContributorRole'] = ResolversParentTypes['ContributorRole']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ContributorRoleErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContributorRoleErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ContributorRoleErrors'] = ResolversParentTypes['ContributorRoleErrors']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type MutationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  activateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationActivateUserArgs, 'userId'>>;
  addAffiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<MutationAddAffiliationArgs, 'input'>>;
  addContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<MutationAddContributorRoleArgs, 'displayOrder' | 'label' | 'url'>>;
  addFeedbackComment?: Resolver<Maybe<ResolversTypes['PlanFeedbackComment']>, ParentType, ContextType, RequireFields<MutationAddFeedbackCommentArgs, 'answerId' | 'commentText' | 'planFeedbackId'>>;
  addLicense?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<MutationAddLicenseArgs, 'name'>>;
  addMetadataStandard?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<MutationAddMetadataStandardArgs, 'input'>>;
  addPlan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationAddPlanArgs, 'projectId' | 'versionedTemplateId'>>;
  addPlanAnswer?: Resolver<Maybe<ResolversTypes['Answer']>, ParentType, ContextType, RequireFields<MutationAddPlanAnswerArgs, 'planId' | 'versionedQuestionId' | 'versionedSectionId'>>;
  addPlanContributor?: Resolver<Maybe<ResolversTypes['PlanContributor']>, ParentType, ContextType, RequireFields<MutationAddPlanContributorArgs, 'planId' | 'projectContributorId'>>;
  addProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationAddProjectArgs, 'title'>>;
  addProjectCollaborator?: Resolver<Maybe<ResolversTypes['ProjectCollaborator']>, ParentType, ContextType, RequireFields<MutationAddProjectCollaboratorArgs, 'email' | 'planId'>>;
  addProjectContributor?: Resolver<Maybe<ResolversTypes['ProjectContributor']>, ParentType, ContextType, RequireFields<MutationAddProjectContributorArgs, 'input'>>;
  addProjectFunder?: Resolver<Maybe<ResolversTypes['ProjectFunder']>, ParentType, ContextType, RequireFields<MutationAddProjectFunderArgs, 'input'>>;
  addProjectOutput?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationAddProjectOutputArgs, 'input'>>;
  addQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationAddQuestionArgs, 'input'>>;
  addQuestionCondition?: Resolver<ResolversTypes['QuestionCondition'], ParentType, ContextType, RequireFields<MutationAddQuestionConditionArgs, 'input'>>;
  addQuestionOption?: Resolver<ResolversTypes['QuestionOption'], ParentType, ContextType, RequireFields<MutationAddQuestionOptionArgs, 'input'>>;
  addRepository?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, Partial<MutationAddRepositoryArgs>>;
  addSection?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationAddSectionArgs, 'input'>>;
  addTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationAddTagArgs, 'name'>>;
  addTemplate?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationAddTemplateArgs, 'name'>>;
  addTemplateCollaborator?: Resolver<Maybe<ResolversTypes['TemplateCollaborator']>, ParentType, ContextType, RequireFields<MutationAddTemplateCollaboratorArgs, 'email' | 'templateId'>>;
  addUserEmail?: Resolver<Maybe<ResolversTypes['UserEmail']>, ParentType, ContextType, RequireFields<MutationAddUserEmailArgs, 'email' | 'isPrimary'>>;
  archivePlan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationArchivePlanArgs, 'dmp_id'>>;
  archiveProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationArchiveProjectArgs, 'projectId'>>;
  archiveTemplate?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationArchiveTemplateArgs, 'templateId'>>;
  completeFeedback?: Resolver<Maybe<ResolversTypes['PlanFeedback']>, ParentType, ContextType, RequireFields<MutationCompleteFeedbackArgs, 'planFeedbackId'>>;
  createTemplateVersion?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationCreateTemplateVersionArgs, 'templateId' | 'visibility'>>;
  deactivateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationDeactivateUserArgs, 'userId'>>;
  markPlanComplete?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationMarkPlanCompleteArgs, 'dmp_id'>>;
  markPlanDraft?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationMarkPlanDraftArgs, 'dmp_id'>>;
  mergeLicenses?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<MutationMergeLicensesArgs, 'licenseToKeepId' | 'licenseToRemoveId'>>;
  mergeMetadataStandards?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<MutationMergeMetadataStandardsArgs, 'metadataStandardToKeepId' | 'metadataStandardToRemoveId'>>;
  mergeRepositories?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, RequireFields<MutationMergeRepositoriesArgs, 'repositoryToKeepId' | 'repositoryToRemoveId'>>;
  mergeUsers?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationMergeUsersArgs, 'userIdToBeMerged' | 'userIdToKeep'>>;
  publishPlan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationPublishPlanArgs, 'dmp_id'>>;
  removeAffiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<MutationRemoveAffiliationArgs, 'affiliationId'>>;
  removeContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<MutationRemoveContributorRoleArgs, 'id'>>;
  removeFeedbackComment?: Resolver<Maybe<ResolversTypes['PlanFeedbackComment']>, ParentType, ContextType, RequireFields<MutationRemoveFeedbackCommentArgs, 'PlanFeedbackCommentId'>>;
  removeLicense?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<MutationRemoveLicenseArgs, 'uri'>>;
  removeMetadataStandard?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<MutationRemoveMetadataStandardArgs, 'uri'>>;
  removePlanContributor?: Resolver<Maybe<ResolversTypes['PlanContributor']>, ParentType, ContextType, RequireFields<MutationRemovePlanContributorArgs, 'planContributorId'>>;
  removeProjectCollaborator?: Resolver<Maybe<ResolversTypes['ProjectCollaborator']>, ParentType, ContextType, RequireFields<MutationRemoveProjectCollaboratorArgs, 'projectCollaboratorId'>>;
  removeProjectContributor?: Resolver<Maybe<ResolversTypes['ProjectContributor']>, ParentType, ContextType, RequireFields<MutationRemoveProjectContributorArgs, 'projectContributorId'>>;
  removeProjectFunder?: Resolver<Maybe<ResolversTypes['ProjectFunder']>, ParentType, ContextType, RequireFields<MutationRemoveProjectFunderArgs, 'projectFunderId'>>;
  removeProjectFunderFromPlan?: Resolver<Maybe<ResolversTypes['ProjectFunder']>, ParentType, ContextType, RequireFields<MutationRemoveProjectFunderFromPlanArgs, 'planId' | 'projectFunderId'>>;
  removeProjectOutput?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationRemoveProjectOutputArgs, 'projectOutputId'>>;
  removeProjectOutputFromPlan?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationRemoveProjectOutputFromPlanArgs, 'planId' | 'projectOutputId'>>;
  removeQuestion?: Resolver<Maybe<ResolversTypes['Question']>, ParentType, ContextType, RequireFields<MutationRemoveQuestionArgs, 'questionId'>>;
  removeQuestionCondition?: Resolver<Maybe<ResolversTypes['QuestionCondition']>, ParentType, ContextType, RequireFields<MutationRemoveQuestionConditionArgs, 'questionConditionId'>>;
  removeQuestionOption?: Resolver<Maybe<ResolversTypes['QuestionOption']>, ParentType, ContextType, RequireFields<MutationRemoveQuestionOptionArgs, 'id'>>;
  removeRepository?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, RequireFields<MutationRemoveRepositoryArgs, 'repositoryId'>>;
  removeSection?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationRemoveSectionArgs, 'sectionId'>>;
  removeTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationRemoveTagArgs, 'tagId'>>;
  removeTemplateCollaborator?: Resolver<Maybe<ResolversTypes['TemplateCollaborator']>, ParentType, ContextType, RequireFields<MutationRemoveTemplateCollaboratorArgs, 'email' | 'templateId'>>;
  removeUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  removeUserEmail?: Resolver<Maybe<ResolversTypes['UserEmail']>, ParentType, ContextType, RequireFields<MutationRemoveUserEmailArgs, 'email'>>;
  requestFeedback?: Resolver<Maybe<ResolversTypes['PlanFeedback']>, ParentType, ContextType, RequireFields<MutationRequestFeedbackArgs, 'planId'>>;
  selectProjectFunderForPlan?: Resolver<Maybe<ResolversTypes['ProjectFunder']>, ParentType, ContextType, RequireFields<MutationSelectProjectFunderForPlanArgs, 'planId' | 'projectFunderId'>>;
  selectProjectOutputForPlan?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationSelectProjectOutputForPlanArgs, 'planId' | 'projectOutputId'>>;
  setPrimaryUserEmail?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserEmail']>>>, ParentType, ContextType, RequireFields<MutationSetPrimaryUserEmailArgs, 'email'>>;
  setUserOrcid?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSetUserOrcidArgs, 'orcid'>>;
  updateAffiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<MutationUpdateAffiliationArgs, 'input'>>;
  updateContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<MutationUpdateContributorRoleArgs, 'displayOrder' | 'id' | 'label' | 'url'>>;
  updateLicense?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<MutationUpdateLicenseArgs, 'name' | 'uri'>>;
  updateMetadataStandard?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<MutationUpdateMetadataStandardArgs, 'input'>>;
  updatePassword?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdatePasswordArgs, 'newPassword' | 'oldPassword'>>;
  updatePlanAnswer?: Resolver<Maybe<ResolversTypes['Answer']>, ParentType, ContextType, RequireFields<MutationUpdatePlanAnswerArgs, 'answerId'>>;
  updatePlanContributor?: Resolver<Maybe<ResolversTypes['PlanContributor']>, ParentType, ContextType, RequireFields<MutationUpdatePlanContributorArgs, 'planContributorId'>>;
  updateProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, Partial<MutationUpdateProjectArgs>>;
  updateProjectCollaborator?: Resolver<Maybe<ResolversTypes['ProjectCollaborator']>, ParentType, ContextType, RequireFields<MutationUpdateProjectCollaboratorArgs, 'accessLevel' | 'projectCollaboratorId'>>;
  updateProjectContributor?: Resolver<Maybe<ResolversTypes['ProjectContributor']>, ParentType, ContextType, RequireFields<MutationUpdateProjectContributorArgs, 'input'>>;
  updateProjectFunder?: Resolver<Maybe<ResolversTypes['ProjectFunder']>, ParentType, ContextType, RequireFields<MutationUpdateProjectFunderArgs, 'input'>>;
  updateProjectOutput?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<MutationUpdateProjectOutputArgs, 'input'>>;
  updateQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationUpdateQuestionArgs, 'input'>>;
  updateQuestionCondition?: Resolver<Maybe<ResolversTypes['QuestionCondition']>, ParentType, ContextType, RequireFields<MutationUpdateQuestionConditionArgs, 'input'>>;
  updateQuestionOption?: Resolver<ResolversTypes['QuestionOption'], ParentType, ContextType, RequireFields<MutationUpdateQuestionOptionArgs, 'input'>>;
  updateRepository?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, Partial<MutationUpdateRepositoryArgs>>;
  updateSection?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationUpdateSectionArgs, 'input'>>;
  updateTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationUpdateTagArgs, 'name' | 'tagId'>>;
  updateTemplate?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationUpdateTemplateArgs, 'name' | 'templateId' | 'visibility'>>;
  updateUserNotifications?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserNotificationsArgs, 'input'>>;
  updateUserProfile?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserProfileArgs, 'input'>>;
  uploadPlan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<MutationUploadPlanArgs, 'projectId'>>;
};

export interface OrcidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Orcid'], any> {
  name: 'Orcid';
}

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

export type PlanResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Plan'] = ResolversParentTypes['Plan']> = {
  contributors?: Resolver<Maybe<Array<ResolversTypes['PlanContributor']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  dmpId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanErrors']>, ParentType, ContextType>;
  featured?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  funders?: Resolver<Maybe<Array<ResolversTypes['PlanFunder']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  languageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastSynced?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  outputs?: Resolver<Maybe<Array<ResolversTypes['PlanOutput']>>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  registered?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registeredById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['PlanStatus']>, ParentType, ContextType>;
  versionedTemplate?: Resolver<Maybe<ResolversTypes['VersionedTemplate']>, ParentType, ContextType>;
  versions?: Resolver<Maybe<Array<ResolversTypes['PlanVersion']>>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['PlanVisibility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanContributorResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanContributor'] = ResolversParentTypes['PlanContributor']> = {
  contributorRoles?: Resolver<Maybe<Array<ResolversTypes['ContributorRole']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanContributorErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isPrimaryContact?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType>;
  projectContributor?: Resolver<Maybe<ResolversTypes['ProjectContributor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanContributorErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanContributorErrors'] = ResolversParentTypes['PlanContributorErrors']> = {
  contributorRoleIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  primaryContact?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectContributorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanErrors'] = ResolversParentTypes['PlanErrors']> = {
  dmp_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  featured?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  languageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastSynced?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registered?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registeredById?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedTemplateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFeedbackResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFeedback'] = ResolversParentTypes['PlanFeedback']> = {
  adminSummary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completed?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanFeedbackErrors']>, ParentType, ContextType>;
  feedbackComments?: Resolver<Maybe<Array<ResolversTypes['PlanFeedbackComment']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  plan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType>;
  requested?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requestedBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFeedbackCommentResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFeedbackComment'] = ResolversParentTypes['PlanFeedbackComment']> = {
  PlanFeedback?: Resolver<Maybe<ResolversTypes['PlanFeedback']>, ParentType, ContextType>;
  answer?: Resolver<Maybe<ResolversTypes['Answer']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanFeedbackCommentErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  adminSummary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedById?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  feedbackComments?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requestedById?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFunderResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFunder'] = ResolversParentTypes['PlanFunder']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['PlanFunderErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectFunder?: Resolver<Maybe<ResolversTypes['ProjectFunder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanFunderErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanFunderErrors'] = ResolversParentTypes['PlanFunderErrors']> = {
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectFunderId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type PlanSearchResultResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanSearchResult'] = ResolversParentTypes['PlanSearchResult']> = {
  contributors?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dmpId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registered?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registeredBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['PlanStatus']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedTemplateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['PlanVisibility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanVersionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PlanVersion'] = ResolversParentTypes['PlanVersion']> = {
  timestamp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = {
  abstractText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contributors?: Resolver<Maybe<Array<ResolversTypes['ProjectContributor']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ProjectErrors']>, ParentType, ContextType>;
  funders?: Resolver<Maybe<Array<ResolversTypes['ProjectFunder']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTestProject?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
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
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType>;
  projectContributorId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type ProjectContributorResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectContributor'] = ResolversParentTypes['ProjectContributor']> = {
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  contributorRoles?: Resolver<Maybe<Array<ResolversTypes['ContributorRole']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ProjectContributorErrors']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectContributorErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectContributorErrors'] = ResolversParentTypes['ProjectContributorErrors']> = {
  affiliationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contributorRoleIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectErrors'] = ResolversParentTypes['ProjectErrors']> = {
  abstractText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contributorIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funderIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  outputIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  researchDomainId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectFunderResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectFunder'] = ResolversParentTypes['ProjectFunder']> = {
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['ProjectFunderErrors']>, ParentType, ContextType>;
  funderOpportunityNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funderProjectNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  grantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['ProjectFunderStatus']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectFunderErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ProjectFunderErrors'] = ResolversParentTypes['ProjectFunderErrors']> = {
  affiliationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funderOpportunityNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funderProjectNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  grantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type QueryResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  affiliationById?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<QueryAffiliationByIdArgs, 'affiliationId'>>;
  affiliationByURI?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<QueryAffiliationByUriArgs, 'uri'>>;
  affiliationTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  affiliations?: Resolver<Maybe<Array<Maybe<ResolversTypes['AffiliationSearch']>>>, ParentType, ContextType, RequireFields<QueryAffiliationsArgs, 'name'>>;
  childResearchDomains?: Resolver<Maybe<Array<Maybe<ResolversTypes['ResearchDomain']>>>, ParentType, ContextType, RequireFields<QueryChildResearchDomainsArgs, 'parentResearchDomainId'>>;
  contributorRoleById?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<QueryContributorRoleByIdArgs, 'contributorRoleId'>>;
  contributorRoleByURL?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<QueryContributorRoleByUrlArgs, 'contributorRoleURL'>>;
  contributorRoles?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContributorRole']>>>, ParentType, ContextType>;
  findCollaborator?: Resolver<Maybe<Array<Maybe<ResolversTypes['CollaboratorSearchResult']>>>, ParentType, ContextType, Partial<QueryFindCollaboratorArgs>>;
  languages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Language']>>>, ParentType, ContextType>;
  license?: Resolver<Maybe<ResolversTypes['License']>, ParentType, ContextType, RequireFields<QueryLicenseArgs, 'uri'>>;
  licenses?: Resolver<Maybe<Array<Maybe<ResolversTypes['License']>>>, ParentType, ContextType, Partial<QueryLicensesArgs>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  metadataStandard?: Resolver<Maybe<ResolversTypes['MetadataStandard']>, ParentType, ContextType, RequireFields<QueryMetadataStandardArgs, 'uri'>>;
  metadataStandards?: Resolver<Maybe<Array<Maybe<ResolversTypes['MetadataStandard']>>>, ParentType, ContextType, Partial<QueryMetadataStandardsArgs>>;
  myProjects?: Resolver<Maybe<Array<Maybe<ResolversTypes['Project']>>>, ParentType, ContextType>;
  myTemplates?: Resolver<Maybe<Array<Maybe<ResolversTypes['Template']>>>, ParentType, ContextType>;
  myVersionedTemplates?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedTemplate']>>>, ParentType, ContextType>;
  outputTypes?: Resolver<Maybe<Array<Maybe<ResolversTypes['OutputType']>>>, ParentType, ContextType>;
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<QueryPlanArgs, 'planId'>>;
  planCollaborators?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectCollaborator']>>>, ParentType, ContextType, RequireFields<QueryPlanCollaboratorsArgs, 'planId'>>;
  planContributors?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanContributor']>>>, ParentType, ContextType, RequireFields<QueryPlanContributorsArgs, 'planId'>>;
  planFeedback?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanFeedback']>>>, ParentType, ContextType, RequireFields<QueryPlanFeedbackArgs, 'planId'>>;
  planFeedbackComments?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanFeedbackComment']>>>, ParentType, ContextType, RequireFields<QueryPlanFeedbackCommentsArgs, 'planFeedbackId'>>;
  planFunders?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlanFunder']>>>, ParentType, ContextType, RequireFields<QueryPlanFundersArgs, 'planId'>>;
  planOutputs?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectOutput']>>>, ParentType, ContextType, RequireFields<QueryPlanOutputsArgs, 'planId'>>;
  planQuestionAnswer?: Resolver<Maybe<ResolversTypes['Answer']>, ParentType, ContextType, RequireFields<QueryPlanQuestionAnswerArgs, 'answerId' | 'questionId'>>;
  planSectionAnswers?: Resolver<Maybe<Array<Maybe<ResolversTypes['Answer']>>>, ParentType, ContextType, RequireFields<QueryPlanSectionAnswersArgs, 'planId' | 'sectionId'>>;
  plans?: Resolver<Maybe<Array<ResolversTypes['PlanSearchResult']>>, ParentType, ContextType, RequireFields<QueryPlansArgs, 'projectId'>>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<QueryProjectArgs, 'projectId'>>;
  projectContributor?: Resolver<Maybe<ResolversTypes['ProjectContributor']>, ParentType, ContextType, RequireFields<QueryProjectContributorArgs, 'projectContributorId'>>;
  projectContributors?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectContributor']>>>, ParentType, ContextType, RequireFields<QueryProjectContributorsArgs, 'projectId'>>;
  projectFunder?: Resolver<Maybe<ResolversTypes['ProjectFunder']>, ParentType, ContextType, RequireFields<QueryProjectFunderArgs, 'projectFunderId'>>;
  projectFunders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectFunder']>>>, ParentType, ContextType, RequireFields<QueryProjectFundersArgs, 'projectId'>>;
  projectOutput?: Resolver<Maybe<ResolversTypes['ProjectOutput']>, ParentType, ContextType, RequireFields<QueryProjectOutputArgs, 'projectOutputId'>>;
  projectOutputs?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectOutput']>>>, ParentType, ContextType, RequireFields<QueryProjectOutputsArgs, 'projectId'>>;
  publishedConditionsForQuestion?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedQuestionCondition']>>>, ParentType, ContextType, RequireFields<QueryPublishedConditionsForQuestionArgs, 'versionedQuestionId'>>;
  publishedQuestions?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedQuestion']>>>, ParentType, ContextType, RequireFields<QueryPublishedQuestionsArgs, 'versionedSectionId'>>;
  publishedSections?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedSection']>>>, ParentType, ContextType, RequireFields<QueryPublishedSectionsArgs, 'term'>>;
  publishedTemplates?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedTemplate']>>>, ParentType, ContextType, Partial<QueryPublishedTemplatesArgs>>;
  question?: Resolver<Maybe<ResolversTypes['Question']>, ParentType, ContextType, RequireFields<QueryQuestionArgs, 'questionId'>>;
  questionConditions?: Resolver<Maybe<Array<Maybe<ResolversTypes['QuestionCondition']>>>, ParentType, ContextType, RequireFields<QueryQuestionConditionsArgs, 'questionId'>>;
  questionOption?: Resolver<Maybe<ResolversTypes['QuestionOption']>, ParentType, ContextType, RequireFields<QueryQuestionOptionArgs, 'id'>>;
  questionOptions?: Resolver<Maybe<Array<Maybe<ResolversTypes['QuestionOption']>>>, ParentType, ContextType, RequireFields<QueryQuestionOptionsArgs, 'questionId'>>;
  questionTypes?: Resolver<Maybe<Array<Maybe<ResolversTypes['QuestionType']>>>, ParentType, ContextType>;
  questions?: Resolver<Maybe<Array<Maybe<ResolversTypes['Question']>>>, ParentType, ContextType, RequireFields<QueryQuestionsArgs, 'sectionId'>>;
  recommendedLicenses?: Resolver<Maybe<Array<Maybe<ResolversTypes['License']>>>, ParentType, ContextType, RequireFields<QueryRecommendedLicensesArgs, 'recommended'>>;
  relatedWork?: Resolver<Maybe<ResolversTypes['RelatedWork']>, ParentType, ContextType, RequireFields<QueryRelatedWorkArgs, 'id'>>;
  relatedWorks?: Resolver<Maybe<Array<Maybe<ResolversTypes['RelatedWork']>>>, ParentType, ContextType, Partial<QueryRelatedWorksArgs>>;
  repositories?: Resolver<Maybe<Array<Maybe<ResolversTypes['Repository']>>>, ParentType, ContextType, RequireFields<QueryRepositoriesArgs, 'input'>>;
  repository?: Resolver<Maybe<ResolversTypes['Repository']>, ParentType, ContextType, RequireFields<QueryRepositoryArgs, 'uri'>>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<QuerySectionArgs, 'sectionId'>>;
  sectionVersions?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedSection']>>>, ParentType, ContextType, RequireFields<QuerySectionVersionsArgs, 'sectionId'>>;
  sections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Section']>>>, ParentType, ContextType, RequireFields<QuerySectionsArgs, 'templateId'>>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  tagsBySectionId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType, RequireFields<QueryTagsBySectionIdArgs, 'sectionId'>>;
  template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<QueryTemplateArgs, 'templateId'>>;
  templateCollaborators?: Resolver<Maybe<Array<Maybe<ResolversTypes['TemplateCollaborator']>>>, ParentType, ContextType, RequireFields<QueryTemplateCollaboratorsArgs, 'templateId'>>;
  templateVersions?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedTemplate']>>>, ParentType, ContextType, RequireFields<QueryTemplateVersionsArgs, 'templateId'>>;
  topLevelResearchDomains?: Resolver<Maybe<Array<Maybe<ResolversTypes['ResearchDomain']>>>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'userId'>>;
  users?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
};

export type QuestionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Question'] = ResolversParentTypes['Question']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['QuestionErrors']>, ParentType, ContextType>;
  guidanceText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDirty?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionConditions?: Resolver<Maybe<Array<ResolversTypes['QuestionCondition']>>, ParentType, ContextType>;
  questionOptions?: Resolver<Maybe<Array<ResolversTypes['QuestionOption']>>, ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionTypeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  questionConditionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionOptionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionTypeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sectionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sourceQestionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  templateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuestionOptionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['QuestionOption'] = ResolversParentTypes['QuestionOption']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['QuestionOptionErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDefault?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  orderNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuestionOptionErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['QuestionOptionErrors'] = ResolversParentTypes['QuestionOptionErrors']> = {
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuestionTypeResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['QuestionType'] = ResolversParentTypes['QuestionType']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['QuestionTypeErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDefault?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usageDescription?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuestionTypeErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['QuestionTypeErrors'] = ResolversParentTypes['QuestionTypeErrors']> = {
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usageDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RelatedWorkResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['RelatedWork'] = ResolversParentTypes['RelatedWork']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  descriptor?: Resolver<Maybe<ResolversTypes['RelatedWorkDescriptor']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['RelatedWorkErrors']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  identifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  workType?: Resolver<Maybe<ResolversTypes['RelatedWorkType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RelatedWorkErrorsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['RelatedWorkErrors'] = ResolversParentTypes['RelatedWorkErrors']> = {
  descriptor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  general?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  identifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  workType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  sections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Section']>>>, ParentType, ContextType>;
  sourceTemplateId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  visibility?: Resolver<ResolversTypes['TemplateVisibility'], ParentType, ContextType>;
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
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sectionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sourceTemplateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visibility?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type UserResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  acceptedTerms?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['EmailAddress'], ParentType, ContextType>;
  emails?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserEmail']>>>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['UserErrors']>, ParentType, ContextType>;
  failed_sign_in_attemps?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type VersionedQuestionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedQuestion'] = ResolversParentTypes['VersionedQuestion']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<ResolversTypes['VersionedQuestionErrors']>, ParentType, ContextType>;
  guidanceText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionTypeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  required?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  questionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionTypeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedQuestionConditionIds?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedSectionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedTemplateId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type Resolvers<ContextType = MyContext> = {
  Affiliation?: AffiliationResolvers<ContextType>;
  AffiliationEmailDomain?: AffiliationEmailDomainResolvers<ContextType>;
  AffiliationErrors?: AffiliationErrorsResolvers<ContextType>;
  AffiliationLink?: AffiliationLinkResolvers<ContextType>;
  AffiliationSearch?: AffiliationSearchResolvers<ContextType>;
  Answer?: AnswerResolvers<ContextType>;
  AnswerComment?: AnswerCommentResolvers<ContextType>;
  AnswerCommentErrors?: AnswerCommentErrorsResolvers<ContextType>;
  CollaboratorSearchResult?: CollaboratorSearchResultResolvers<ContextType>;
  ContributorRole?: ContributorRoleResolvers<ContextType>;
  ContributorRoleErrors?: ContributorRoleErrorsResolvers<ContextType>;
  DateTimeISO?: GraphQLScalarType;
  DmspId?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  Language?: LanguageResolvers<ContextType>;
  License?: LicenseResolvers<ContextType>;
  LicenseErrors?: LicenseErrorsResolvers<ContextType>;
  MetadataStandard?: MetadataStandardResolvers<ContextType>;
  MetadataStandardErrors?: MetadataStandardErrorsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Orcid?: GraphQLScalarType;
  OutputType?: OutputTypeResolvers<ContextType>;
  OutputTypeErrors?: OutputTypeErrorsResolvers<ContextType>;
  Plan?: PlanResolvers<ContextType>;
  PlanContributor?: PlanContributorResolvers<ContextType>;
  PlanContributorErrors?: PlanContributorErrorsResolvers<ContextType>;
  PlanErrors?: PlanErrorsResolvers<ContextType>;
  PlanFeedback?: PlanFeedbackResolvers<ContextType>;
  PlanFeedbackComment?: PlanFeedbackCommentResolvers<ContextType>;
  PlanFeedbackCommentErrors?: PlanFeedbackCommentErrorsResolvers<ContextType>;
  PlanFeedbackErrors?: PlanFeedbackErrorsResolvers<ContextType>;
  PlanFunder?: PlanFunderResolvers<ContextType>;
  PlanFunderErrors?: PlanFunderErrorsResolvers<ContextType>;
  PlanOutput?: PlanOutputResolvers<ContextType>;
  PlanOutputErrors?: PlanOutputErrorsResolvers<ContextType>;
  PlanSearchResult?: PlanSearchResultResolvers<ContextType>;
  PlanVersion?: PlanVersionResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  ProjectCollaborator?: ProjectCollaboratorResolvers<ContextType>;
  ProjectCollaboratorErrors?: ProjectCollaboratorErrorsResolvers<ContextType>;
  ProjectContributor?: ProjectContributorResolvers<ContextType>;
  ProjectContributorErrors?: ProjectContributorErrorsResolvers<ContextType>;
  ProjectErrors?: ProjectErrorsResolvers<ContextType>;
  ProjectFunder?: ProjectFunderResolvers<ContextType>;
  ProjectFunderErrors?: ProjectFunderErrorsResolvers<ContextType>;
  ProjectOutput?: ProjectOutputResolvers<ContextType>;
  ProjectOutputErrors?: ProjectOutputErrorsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Question?: QuestionResolvers<ContextType>;
  QuestionCondition?: QuestionConditionResolvers<ContextType>;
  QuestionConditionErrors?: QuestionConditionErrorsResolvers<ContextType>;
  QuestionErrors?: QuestionErrorsResolvers<ContextType>;
  QuestionOption?: QuestionOptionResolvers<ContextType>;
  QuestionOptionErrors?: QuestionOptionErrorsResolvers<ContextType>;
  QuestionType?: QuestionTypeResolvers<ContextType>;
  QuestionTypeErrors?: QuestionTypeErrorsResolvers<ContextType>;
  RelatedWork?: RelatedWorkResolvers<ContextType>;
  RelatedWorkErrors?: RelatedWorkErrorsResolvers<ContextType>;
  Repository?: RepositoryResolvers<ContextType>;
  RepositoryErrors?: RepositoryErrorsResolvers<ContextType>;
  ResearchDomain?: ResearchDomainResolvers<ContextType>;
  ResearchDomainErrors?: ResearchDomainErrorsResolvers<ContextType>;
  Ror?: GraphQLScalarType;
  Section?: SectionResolvers<ContextType>;
  SectionErrors?: SectionErrorsResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  TagErrors?: TagErrorsResolvers<ContextType>;
  Template?: TemplateResolvers<ContextType>;
  TemplateCollaborator?: TemplateCollaboratorResolvers<ContextType>;
  TemplateCollaboratorErrors?: TemplateCollaboratorErrorsResolvers<ContextType>;
  TemplateErrors?: TemplateErrorsResolvers<ContextType>;
  URL?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  UserEmail?: UserEmailResolvers<ContextType>;
  UserEmailErrors?: UserEmailErrorsResolvers<ContextType>;
  UserErrors?: UserErrorsResolvers<ContextType>;
  VersionedQuestion?: VersionedQuestionResolvers<ContextType>;
  VersionedQuestionCondition?: VersionedQuestionConditionResolvers<ContextType>;
  VersionedQuestionConditionErrors?: VersionedQuestionConditionErrorsResolvers<ContextType>;
  VersionedQuestionErrors?: VersionedQuestionErrorsResolvers<ContextType>;
  VersionedSection?: VersionedSectionResolvers<ContextType>;
  VersionedSectionErrors?: VersionedSectionErrorsResolvers<ContextType>;
  VersionedTemplate?: VersionedTemplateResolvers<ContextType>;
  VersionedTemplateErrors?: VersionedTemplateErrorsResolvers<ContextType>;
};


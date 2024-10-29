import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { DmspModel } from './models/Dmsp';
import { MyContext } from './context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
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

/** Input for adding a new QuestionCondition */
export type AddQuestionConditionInput = {
  /** The action to take on a QuestionCondition */
  action: QuestionConditionActionType;
  /** The condition in which to take the action */
  condition: QuestionConditionCondition;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: InputMaybe<Scalars['String']['input']>;
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
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName: Scalars['String']['output'];
  /** The email address(es) to notify when feedback has been requested (stored as JSON array) */
  feedbackEmails?: Maybe<Scalars['String']['output']>;
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

/** Input options for adding an Affiliation */
export type AffiliationInput = {
  /** Acronyms for the affiliation */
  acronyms?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Whether or not the Affiliation is active and available in search results */
  active: Scalars['Boolean']['input'];
  /** Alias names for the affiliation */
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The primary contact email */
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  /** The primary contact name */
  contactName?: InputMaybe<Scalars['String']['input']>;
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName: Scalars['String']['input'];
  /** The email address(es) to notify when feedback has been requested (stored as JSON array) */
  feedbackEmails?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not the affiliation wants to use the feedback workflow */
  feedbackEnabled: Scalars['Boolean']['input'];
  /** The message to display to users when they request feedback */
  feedbackMessage?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['input'];
  /** The Crossref Funder id */
  fundrefId?: InputMaybe<Scalars['String']['input']>;
  /** The official homepage for the affiliation */
  homepage?: InputMaybe<Scalars['String']['input']>;
  /** The logo file name */
  logoName?: InputMaybe<Scalars['String']['input']>;
  /** The URI of the logo */
  logoURI?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not the affiliation is allowed to have administrators */
  managed: Scalars['Boolean']['input'];
  /** The official name for the affiliation (defined by the system of provenance) */
  name: Scalars['String']['input'];
  /** The email domains associated with the affiliation (for SSO) */
  ssoEmailDomains?: InputMaybe<Array<AffiliationEmailDomainInput>>;
  /** The SSO entityId */
  ssoEntityId?: InputMaybe<Scalars['String']['input']>;
  /** The links the affiliation's users can use to get help */
  subHeaderLinks?: InputMaybe<Array<AffiliationLinkInput>>;
  /** The types of the affiliation (e.g. Company, Education, Government, etc.) */
  types: Array<AffiliationType>;
  /** The unique identifer for the affiliation (Not editable!) */
  uri: Scalars['String']['input'];
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

export type Contributor = Person & {
  __typename?: 'Contributor';
  contributorId?: Maybe<PersonIdentifier>;
  dmproadmap_affiliation?: Maybe<DmpRoadmapAffiliation>;
  mbox?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  role: Array<Scalars['String']['output']>;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The Ui label to display for the contributor role */
  label: Scalars['String']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The URL for the contributor role */
  url: Scalars['URL']['output'];
};

export type ContributorRoleMutationResponse = {
  __typename?: 'ContributorRoleMutationResponse';
  /** Similar to HTTP status code, represents the status of the mutation */
  code: Scalars['Int']['output'];
  /**
   * The contributor role that was impacted by the mutation.
   * The new one if we were adding, the one that was updated when updating, or the one deletd when removing
   */
  contributorRole?: Maybe<ContributorRole>;
  /** Human-readable message for the UI */
  message: Scalars['String']['output'];
  /** Indicates whether the mutation was successful */
  success: Scalars['Boolean']['output'];
};

export type DmpRoadmapAffiliation = {
  __typename?: 'DmpRoadmapAffiliation';
  affiliation_id?: Maybe<OrganizationIdentifier>;
  name: Scalars['String']['output'];
};

export type Dmsp = {
  __typename?: 'Dmsp';
  contact: PrimaryContact;
  contributor?: Maybe<Array<Maybe<Contributor>>>;
  created?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dmp_id: DmspIdentifier;
  dmproadmap_featured?: Maybe<Scalars['String']['output']>;
  dmproadmap_related_identifiers?: Maybe<Array<Maybe<RelatedIdentifier>>>;
  dmproadmap_visibility?: Maybe<Scalars['String']['output']>;
  ethical_issues_description?: Maybe<Scalars['String']['output']>;
  ethical_issues_exist: YesNoUnknown;
  ethical_issues_report?: Maybe<Scalars['URL']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  modified?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type DmspIdentifier = {
  __typename?: 'DmspIdentifier';
  identifier: Scalars['DmspId']['output'];
  type: Scalars['String']['output'];
};

export type Identifier = {
  __typename?: 'Identifier';
  identifier: Scalars['String']['output'];
  type: Scalars['String']['output'];
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

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Reactivate the specified user Account (Admin only) */
  activateUser?: Maybe<User>;
  /** Create a new Affiliation */
  addAffiliation?: Maybe<Affiliation>;
  /** Add a new contributor role (URL and label must be unique!) */
  addContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Create a new Question */
  addQuestion: Question;
  /** Create a new QuestionCondition associated with a question */
  addQuestionCondition: QuestionCondition;
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
  /** Archive a Template (unpublishes any associated PublishedTemplate */
  archiveTemplate?: Maybe<Scalars['Boolean']['output']>;
  /** Publish the template or save as a draft */
  createVersion?: Maybe<Template>;
  /** Deactivate the specified user Account (Admin only) */
  deactivateUser?: Maybe<User>;
  /** Merge the 2 user accounts (Admin only) */
  mergeUsers?: Maybe<User>;
  /** Delete an Affiliation (only applicable to AffiliationProvenance == DMPTOOL) */
  removeAffiliation?: Maybe<Affiliation>;
  /** Delete the contributor role */
  removeContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Delete a Question */
  removeQuestion?: Maybe<Question>;
  /** Remove a QuestionCondition using a specific QuestionCondition id */
  removeQuestionCondition?: Maybe<QuestionCondition>;
  /** Delete a section */
  removeSection: Section;
  /** Delete a tag */
  removeTag?: Maybe<Tag>;
  /** Remove a TemplateCollaborator from a Template */
  removeTemplateCollaborator?: Maybe<Scalars['Boolean']['output']>;
  /** Anonymize the current user's account (essentially deletes their account without orphaning things) */
  removeUser?: Maybe<User>;
  /** Remove an email address from the current user */
  removeUserEmail?: Maybe<UserEmail>;
  /** Designate the email as the current user's primary email address */
  setPrimaryUserEmail?: Maybe<Array<Maybe<UserEmail>>>;
  /** Set the user's ORCID */
  setUserOrcid?: Maybe<User>;
  /** Update an Affiliation */
  updateAffiliation?: Maybe<Affiliation>;
  /** Update the contributor role */
  updateContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Change the current user's password */
  updatePassword?: Maybe<User>;
  /** Update a Question */
  updateQuestion: Question;
  /** Update a QuestionCondition for a specific QuestionCondition id */
  updateQuestionCondition?: Maybe<QuestionCondition>;
  /** Separate Question update specifically for options */
  updateQuestionOptions?: Maybe<Question>;
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


export type MutationAddQuestionArgs = {
  input: AddQuestionInput;
};


export type MutationAddQuestionConditionArgs = {
  input: AddQuestionConditionInput;
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


export type MutationArchiveTemplateArgs = {
  templateId: Scalars['Int']['input'];
};


export type MutationCreateVersionArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  templateId: Scalars['Int']['input'];
  versionType?: InputMaybe<TemplateVersionType>;
};


export type MutationDeactivateUserArgs = {
  userId: Scalars['Int']['input'];
};


export type MutationMergeUsersArgs = {
  userIdToBeMerged: Scalars['Int']['input'];
  userIdToKeep: Scalars['Int']['input'];
};


export type MutationRemoveAffiliationArgs = {
  affiliationId: Scalars['Int']['input'];
};


export type MutationRemoveContributorRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type MutationRemoveQuestionConditionArgs = {
  questionConditionId: Scalars['Int']['input'];
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
  id: Scalars['ID']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationUpdatePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationUpdateQuestionArgs = {
  input: UpdateQuestionInput;
};


export type MutationUpdateQuestionConditionArgs = {
  input: UpdateQuestionConditionInput;
};


export type MutationUpdateQuestionOptionsArgs = {
  questionId: Scalars['Int']['input'];
  required?: InputMaybe<Scalars['Boolean']['input']>;
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

export type OrganizationIdentifier = {
  __typename?: 'OrganizationIdentifier';
  identifier: Scalars['Ror']['output'];
  type: Scalars['String']['output'];
};

export type Person = {
  dmproadmap_affiliation?: Maybe<DmpRoadmapAffiliation>;
  mbox?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type PersonIdentifier = {
  __typename?: 'PersonIdentifier';
  identifier: Scalars['Orcid']['output'];
  type: Scalars['String']['output'];
};

export type PrimaryContact = Person & {
  __typename?: 'PrimaryContact';
  contact_id?: Maybe<Identifier>;
  dmproadmap_affiliation?: Maybe<DmpRoadmapAffiliation>;
  mbox?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
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
  /** Get the contributor role by it's id */
  contributorRoleById?: Maybe<ContributorRole>;
  /** Get the contributor role by it's URL */
  contributorRoleByURL?: Maybe<ContributorRole>;
  /** Get all of the contributor role types */
  contributorRoles?: Maybe<Array<Maybe<ContributorRole>>>;
  /** Get the DMSP by its DMP ID */
  dmspById?: Maybe<SingleDmspResponse>;
  /** Get all of the supported Languages */
  languages?: Maybe<Array<Maybe<Language>>>;
  /** Returns the currently logged in user's information */
  me?: Maybe<User>;
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
  /** Get all the QuestionTypes */
  questionTypes?: Maybe<Array<Maybe<QuestionType>>>;
  /** Get the Questions that belong to the associated sectionId */
  questions?: Maybe<Array<Maybe<Question>>>;
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
  /** Get the Templates that belong to the current user's affiliation (user must be an Admin) */
  templates?: Maybe<Array<Maybe<Template>>>;
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


export type QueryContributorRoleByIdArgs = {
  contributorRoleId: Scalars['Int']['input'];
};


export type QueryContributorRoleByUrlArgs = {
  contributorRoleURL: Scalars['URL']['input'];
};


export type QueryDmspByIdArgs = {
  dmspId: Scalars['DmspId']['input'];
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
  term: Scalars['String']['input'];
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
  created?: Maybe<Scalars['DateTimeISO']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The display order of the question */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** Guidance to complete the question */
  guidanceText?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Question has had any changes since the related template was last published */
  isDirty?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['DateTimeISO']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
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
};

/**
 * if [Question content] [condition] [conditionMatch] then [action] on [target] so
 * for example if 'Yes' EQUAL 'Yes' then 'SHOW_Question' 123
 */
export type QuestionCondition = {
  __typename?: 'QuestionCondition';
  /** The action to take on a QuestionCondition */
  action: QuestionConditionActionType;
  /** The condition in which to take the action */
  condition: QuestionConditionCondition;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['DateTimeISO']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['DateTimeISO']['output']>;
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

/** The type of Question, such as text field, radio buttons, etc */
export type QuestionType = {
  __typename?: 'QuestionType';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['DateTimeISO']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is the default question type */
  isDefault: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['DateTimeISO']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the QuestionType, like 'Short text question' */
  name: Scalars['String']['output'];
  /** The description of the QuestionType */
  usageDescription: Scalars['String']['output'];
};

export type RelatedIdentifier = {
  __typename?: 'RelatedIdentifier';
  descriptor: Scalars['String']['output'];
  identifier: Scalars['URL']['output'];
  type: Scalars['String']['output'];
  work_type: Scalars['String']['output'];
};

/** A Section that contains a list of questions in a template */
export type Section = {
  __typename?: 'Section';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The order in which the section will be displayed in the template */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
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
  /** Requirements that a user must consider in this section */
  requirements?: Maybe<Scalars['String']['output']>;
  /** The Tags associated with this section. A section might not have any tags */
  tags?: Maybe<Array<Maybe<Tag>>>;
  /** The template that the section is associated with */
  template?: Maybe<Template>;
};

/** Section version type */
export type SectionVersionType =
  /** Draft - saved state for internal review */
  | 'DRAFT'
  /** Published - saved state for use when creating DMPs */
  | 'PUBLISHED';

export type SingleDmspResponse = {
  __typename?: 'SingleDmspResponse';
  /** Similar to HTTP status code, represents the status of the mutation */
  code: Scalars['Int']['output'];
  /** The DMSP */
  dmsp?: Maybe<Dmsp>;
  /** Human-readable message for the UI */
  message: Scalars['String']['output'];
  /** Indicates whether the mutation was successful */
  success: Scalars['Boolean']['output'];
};

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
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The tag name */
  name: Scalars['String']['output'];
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
  /** Whether or not this Template is designated as a 'Best Practice' template */
  bestPractice: Scalars['Boolean']['output'];
  /** Users from different affiliations who have been invited to collaborate on this template */
  collaborators?: Maybe<Array<TemplateCollaborator>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The current published version */
  currentVersion?: Maybe<Scalars['String']['output']>;
  /** A description of the purpose of the template */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Template has had any changes since it was last published */
  isDirty: Scalars['Boolean']['output'];
  /** The template's language */
  languageId: Scalars['String']['output'];
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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

/** Input for updating a new QuestionCondition based on a QuestionCondition id */
export type UpdateQuestionConditionInput = {
  /** The action to take on a QuestionCondition */
  action: QuestionConditionActionType;
  /** The condition in which to take the action */
  condition: QuestionConditionCondition;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: InputMaybe<Scalars['String']['input']>;
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
  /** This will be used as a sort of title for the Question */
  questionText?: InputMaybe<Scalars['String']['input']>;
  /** To indicate whether the question is required to be completed */
  required?: InputMaybe<Scalars['Boolean']['input']>;
  /** Requirements associated with the Question */
  requirementText?: InputMaybe<Scalars['String']['input']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating a section */
export type UpdateSectionInput = {
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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
  /** Whether or not the email address has been confirmed */
  confirmed: Scalars['Boolean']['output'];
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The email address */
  email: Scalars['String']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is the primary email address */
  primary: Scalars['Boolean']['output'];
  /** The user the email belongs to */
  userId: Scalars['Int']['output'];
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
  created?: Maybe<Scalars['DateTimeISO']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The display order of the VersionedQuestion */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** Guidance to complete the question */
  guidanceText?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['DateTimeISO']['output']>;
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
  /** The unique id of the VersionedSection that the VersionedQuestion belongs to */
  versionedSectionId: Scalars['Int']['output'];
  /** The unique id of the VersionedTemplate that the VersionedQuestion belongs to */
  versionedTemplateId: Scalars['Int']['output'];
};

export type VersionedQuestionCondition = {
  __typename?: 'VersionedQuestionCondition';
  /** The action to take on a QuestionCondition */
  action: VersionedQuestionConditionActionType;
  /** The condition in which to take the action */
  condition: VersionedQuestionConditionCondition;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['DateTimeISO']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['DateTimeISO']['output']>;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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
  /** The parent VersionedTemplate */
  versionedTemplate: VersionedTemplate;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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
  versionedSection?: Maybe<Array<Maybe<VersionedSection>>>;
  /** The template's availability setting: Public is available to everyone, Private only your affiliation */
  visibility: TemplateVisibility;
};

export type YesNoUnknown =
  | 'no'
  | 'unknown'
  | 'yes';

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
  /** The user's organizational affiliation id */
  affiliationId: Scalars['String']['input'];
  /** The user's first/given name */
  givenName: Scalars['String']['input'];
  /** The user's preferred language */
  languageId?: InputMaybe<Scalars['String']['input']>;
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


/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  Person: ( Contributor ) | ( PrimaryContact );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddQuestionConditionInput: AddQuestionConditionInput;
  AddQuestionInput: AddQuestionInput;
  AddSectionInput: AddSectionInput;
  Affiliation: ResolverTypeWrapper<Affiliation>;
  AffiliationEmailDomain: ResolverTypeWrapper<AffiliationEmailDomain>;
  AffiliationEmailDomainInput: AffiliationEmailDomainInput;
  AffiliationInput: AffiliationInput;
  AffiliationLink: ResolverTypeWrapper<AffiliationLink>;
  AffiliationLinkInput: AffiliationLinkInput;
  AffiliationProvenance: AffiliationProvenance;
  AffiliationSearch: ResolverTypeWrapper<AffiliationSearch>;
  AffiliationType: AffiliationType;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Contributor: ResolverTypeWrapper<Contributor>;
  ContributorRole: ResolverTypeWrapper<ContributorRole>;
  ContributorRoleMutationResponse: ResolverTypeWrapper<ContributorRoleMutationResponse>;
  DateTimeISO: ResolverTypeWrapper<Scalars['DateTimeISO']['output']>;
  DmpRoadmapAffiliation: ResolverTypeWrapper<DmpRoadmapAffiliation>;
  Dmsp: ResolverTypeWrapper<DmspModel>;
  DmspId: ResolverTypeWrapper<Scalars['DmspId']['output']>;
  DmspIdentifier: ResolverTypeWrapper<DmspIdentifier>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Identifier: ResolverTypeWrapper<Identifier>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvitedToType: InvitedToType;
  Language: ResolverTypeWrapper<Language>;
  Mutation: ResolverTypeWrapper<{}>;
  Orcid: ResolverTypeWrapper<Scalars['Orcid']['output']>;
  OrganizationIdentifier: ResolverTypeWrapper<OrganizationIdentifier>;
  Person: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Person']>;
  PersonIdentifier: ResolverTypeWrapper<PersonIdentifier>;
  PrimaryContact: ResolverTypeWrapper<PrimaryContact>;
  Query: ResolverTypeWrapper<{}>;
  Question: ResolverTypeWrapper<Question>;
  QuestionCondition: ResolverTypeWrapper<QuestionCondition>;
  QuestionConditionActionType: QuestionConditionActionType;
  QuestionConditionCondition: QuestionConditionCondition;
  QuestionType: ResolverTypeWrapper<QuestionType>;
  RelatedIdentifier: ResolverTypeWrapper<RelatedIdentifier>;
  Ror: ResolverTypeWrapper<Scalars['Ror']['output']>;
  Section: ResolverTypeWrapper<Section>;
  SectionVersionType: SectionVersionType;
  SingleDmspResponse: ResolverTypeWrapper<Omit<SingleDmspResponse, 'dmsp'> & { dmsp?: Maybe<ResolversTypes['Dmsp']> }>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Tag: ResolverTypeWrapper<Tag>;
  TagInput: TagInput;
  Template: ResolverTypeWrapper<Template>;
  TemplateCollaborator: ResolverTypeWrapper<TemplateCollaborator>;
  TemplateVersionType: TemplateVersionType;
  TemplateVisibility: TemplateVisibility;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  UpdateQuestionConditionInput: UpdateQuestionConditionInput;
  UpdateQuestionInput: UpdateQuestionInput;
  UpdateSectionInput: UpdateSectionInput;
  User: ResolverTypeWrapper<User>;
  UserEmail: ResolverTypeWrapper<UserEmail>;
  UserRole: UserRole;
  VersionedQuestion: ResolverTypeWrapper<VersionedQuestion>;
  VersionedQuestionCondition: ResolverTypeWrapper<VersionedQuestionCondition>;
  VersionedQuestionConditionActionType: VersionedQuestionConditionActionType;
  VersionedQuestionConditionCondition: VersionedQuestionConditionCondition;
  VersionedSection: ResolverTypeWrapper<VersionedSection>;
  VersionedTemplate: ResolverTypeWrapper<VersionedTemplate>;
  YesNoUnknown: YesNoUnknown;
  updateUserNotificationsInput: UpdateUserNotificationsInput;
  updateUserProfileInput: UpdateUserProfileInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddQuestionConditionInput: AddQuestionConditionInput;
  AddQuestionInput: AddQuestionInput;
  AddSectionInput: AddSectionInput;
  Affiliation: Affiliation;
  AffiliationEmailDomain: AffiliationEmailDomain;
  AffiliationEmailDomainInput: AffiliationEmailDomainInput;
  AffiliationInput: AffiliationInput;
  AffiliationLink: AffiliationLink;
  AffiliationLinkInput: AffiliationLinkInput;
  AffiliationSearch: AffiliationSearch;
  Boolean: Scalars['Boolean']['output'];
  Contributor: Contributor;
  ContributorRole: ContributorRole;
  ContributorRoleMutationResponse: ContributorRoleMutationResponse;
  DateTimeISO: Scalars['DateTimeISO']['output'];
  DmpRoadmapAffiliation: DmpRoadmapAffiliation;
  Dmsp: DmspModel;
  DmspId: Scalars['DmspId']['output'];
  DmspIdentifier: DmspIdentifier;
  EmailAddress: Scalars['EmailAddress']['output'];
  ID: Scalars['ID']['output'];
  Identifier: Identifier;
  Int: Scalars['Int']['output'];
  Language: Language;
  Mutation: {};
  Orcid: Scalars['Orcid']['output'];
  OrganizationIdentifier: OrganizationIdentifier;
  Person: ResolversInterfaceTypes<ResolversParentTypes>['Person'];
  PersonIdentifier: PersonIdentifier;
  PrimaryContact: PrimaryContact;
  Query: {};
  Question: Question;
  QuestionCondition: QuestionCondition;
  QuestionType: QuestionType;
  RelatedIdentifier: RelatedIdentifier;
  Ror: Scalars['Ror']['output'];
  Section: Section;
  SingleDmspResponse: Omit<SingleDmspResponse, 'dmsp'> & { dmsp?: Maybe<ResolversParentTypes['Dmsp']> };
  String: Scalars['String']['output'];
  Tag: Tag;
  TagInput: TagInput;
  Template: Template;
  TemplateCollaborator: TemplateCollaborator;
  URL: Scalars['URL']['output'];
  UpdateQuestionConditionInput: UpdateQuestionConditionInput;
  UpdateQuestionInput: UpdateQuestionInput;
  UpdateSectionInput: UpdateSectionInput;
  User: User;
  UserEmail: UserEmail;
  VersionedQuestion: VersionedQuestion;
  VersionedQuestionCondition: VersionedQuestionCondition;
  VersionedSection: VersionedSection;
  VersionedTemplate: VersionedTemplate;
  updateUserNotificationsInput: UpdateUserNotificationsInput;
  updateUserProfileInput: UpdateUserProfileInput;
};

export type AffiliationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Affiliation'] = ResolversParentTypes['Affiliation']> = {
  acronyms?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  aliases?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  feedbackEmails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  feedbackEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  feedbackMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funder?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fundrefId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  homepage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  logoName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logoURI?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  managed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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

export type ContributorResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Contributor'] = ResolversParentTypes['Contributor']> = {
  contributorId?: Resolver<Maybe<ResolversTypes['PersonIdentifier']>, ParentType, ContextType>;
  dmproadmap_affiliation?: Resolver<Maybe<ResolversTypes['DmpRoadmapAffiliation']>, ParentType, ContextType>;
  mbox?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContributorRoleResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ContributorRole'] = ResolversParentTypes['ContributorRole']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContributorRoleMutationResponseResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ContributorRoleMutationResponse'] = ResolversParentTypes['ContributorRoleMutationResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  contributorRole?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeIsoScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTimeISO'], any> {
  name: 'DateTimeISO';
}

export type DmpRoadmapAffiliationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['DmpRoadmapAffiliation'] = ResolversParentTypes['DmpRoadmapAffiliation']> = {
  affiliation_id?: Resolver<Maybe<ResolversTypes['OrganizationIdentifier']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DmspResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Dmsp'] = ResolversParentTypes['Dmsp']> = {
  contact?: Resolver<ResolversTypes['PrimaryContact'], ParentType, ContextType>;
  contributor?: Resolver<Maybe<Array<Maybe<ResolversTypes['Contributor']>>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dmp_id?: Resolver<ResolversTypes['DmspIdentifier'], ParentType, ContextType>;
  dmproadmap_featured?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dmproadmap_related_identifiers?: Resolver<Maybe<Array<Maybe<ResolversTypes['RelatedIdentifier']>>>, ParentType, ContextType>;
  dmproadmap_visibility?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ethical_issues_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ethical_issues_exist?: Resolver<ResolversTypes['YesNoUnknown'], ParentType, ContextType>;
  ethical_issues_report?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  language?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DmspIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DmspId'], any> {
  name: 'DmspId';
}

export type DmspIdentifierResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['DmspIdentifier'] = ResolversParentTypes['DmspIdentifier']> = {
  identifier?: Resolver<ResolversTypes['DmspId'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type IdentifierResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Identifier'] = ResolversParentTypes['Identifier']> = {
  identifier?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LanguageResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Language'] = ResolversParentTypes['Language']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isDefault?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  activateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationActivateUserArgs, 'userId'>>;
  addAffiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<MutationAddAffiliationArgs, 'input'>>;
  addContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRoleMutationResponse']>, ParentType, ContextType, RequireFields<MutationAddContributorRoleArgs, 'displayOrder' | 'label' | 'url'>>;
  addQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationAddQuestionArgs, 'input'>>;
  addQuestionCondition?: Resolver<ResolversTypes['QuestionCondition'], ParentType, ContextType, RequireFields<MutationAddQuestionConditionArgs, 'input'>>;
  addSection?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationAddSectionArgs, 'input'>>;
  addTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationAddTagArgs, 'name'>>;
  addTemplate?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationAddTemplateArgs, 'name'>>;
  addTemplateCollaborator?: Resolver<Maybe<ResolversTypes['TemplateCollaborator']>, ParentType, ContextType, RequireFields<MutationAddTemplateCollaboratorArgs, 'email' | 'templateId'>>;
  addUserEmail?: Resolver<Maybe<ResolversTypes['UserEmail']>, ParentType, ContextType, RequireFields<MutationAddUserEmailArgs, 'email' | 'isPrimary'>>;
  archiveTemplate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationArchiveTemplateArgs, 'templateId'>>;
  createVersion?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationCreateVersionArgs, 'templateId'>>;
  deactivateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationDeactivateUserArgs, 'userId'>>;
  mergeUsers?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationMergeUsersArgs, 'userIdToBeMerged' | 'userIdToKeep'>>;
  removeAffiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<MutationRemoveAffiliationArgs, 'affiliationId'>>;
  removeContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRoleMutationResponse']>, ParentType, ContextType, RequireFields<MutationRemoveContributorRoleArgs, 'id'>>;
  removeQuestion?: Resolver<Maybe<ResolversTypes['Question']>, ParentType, ContextType, RequireFields<MutationRemoveQuestionArgs, 'questionId'>>;
  removeQuestionCondition?: Resolver<Maybe<ResolversTypes['QuestionCondition']>, ParentType, ContextType, RequireFields<MutationRemoveQuestionConditionArgs, 'questionConditionId'>>;
  removeSection?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationRemoveSectionArgs, 'sectionId'>>;
  removeTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationRemoveTagArgs, 'tagId'>>;
  removeTemplateCollaborator?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveTemplateCollaboratorArgs, 'email' | 'templateId'>>;
  removeUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  removeUserEmail?: Resolver<Maybe<ResolversTypes['UserEmail']>, ParentType, ContextType, RequireFields<MutationRemoveUserEmailArgs, 'email'>>;
  setPrimaryUserEmail?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserEmail']>>>, ParentType, ContextType, RequireFields<MutationSetPrimaryUserEmailArgs, 'email'>>;
  setUserOrcid?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSetUserOrcidArgs, 'orcid'>>;
  updateAffiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<MutationUpdateAffiliationArgs, 'input'>>;
  updateContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRoleMutationResponse']>, ParentType, ContextType, RequireFields<MutationUpdateContributorRoleArgs, 'displayOrder' | 'id' | 'label' | 'url'>>;
  updatePassword?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdatePasswordArgs, 'newPassword' | 'oldPassword'>>;
  updateQuestion?: Resolver<ResolversTypes['Question'], ParentType, ContextType, RequireFields<MutationUpdateQuestionArgs, 'input'>>;
  updateQuestionCondition?: Resolver<Maybe<ResolversTypes['QuestionCondition']>, ParentType, ContextType, RequireFields<MutationUpdateQuestionConditionArgs, 'input'>>;
  updateQuestionOptions?: Resolver<Maybe<ResolversTypes['Question']>, ParentType, ContextType, RequireFields<MutationUpdateQuestionOptionsArgs, 'questionId' | 'required'>>;
  updateSection?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<MutationUpdateSectionArgs, 'input'>>;
  updateTag?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationUpdateTagArgs, 'name' | 'tagId'>>;
  updateTemplate?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<MutationUpdateTemplateArgs, 'name' | 'templateId' | 'visibility'>>;
  updateUserNotifications?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserNotificationsArgs, 'input'>>;
  updateUserProfile?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserProfileArgs, 'input'>>;
};

export interface OrcidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Orcid'], any> {
  name: 'Orcid';
}

export type OrganizationIdentifierResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['OrganizationIdentifier'] = ResolversParentTypes['OrganizationIdentifier']> = {
  identifier?: Resolver<ResolversTypes['Ror'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
  __resolveType: TypeResolveFn<'Contributor' | 'PrimaryContact', ParentType, ContextType>;
  dmproadmap_affiliation?: Resolver<Maybe<ResolversTypes['DmpRoadmapAffiliation']>, ParentType, ContextType>;
  mbox?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type PersonIdentifierResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PersonIdentifier'] = ResolversParentTypes['PersonIdentifier']> = {
  identifier?: Resolver<ResolversTypes['Orcid'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PrimaryContactResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['PrimaryContact'] = ResolversParentTypes['PrimaryContact']> = {
  contact_id?: Resolver<Maybe<ResolversTypes['Identifier']>, ParentType, ContextType>;
  dmproadmap_affiliation?: Resolver<Maybe<ResolversTypes['DmpRoadmapAffiliation']>, ParentType, ContextType>;
  mbox?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  affiliationById?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<QueryAffiliationByIdArgs, 'affiliationId'>>;
  affiliationByURI?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<QueryAffiliationByUriArgs, 'uri'>>;
  affiliationTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  affiliations?: Resolver<Maybe<Array<Maybe<ResolversTypes['AffiliationSearch']>>>, ParentType, ContextType, RequireFields<QueryAffiliationsArgs, 'name'>>;
  contributorRoleById?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<QueryContributorRoleByIdArgs, 'contributorRoleId'>>;
  contributorRoleByURL?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<QueryContributorRoleByUrlArgs, 'contributorRoleURL'>>;
  contributorRoles?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContributorRole']>>>, ParentType, ContextType>;
  dmspById?: Resolver<Maybe<ResolversTypes['SingleDmspResponse']>, ParentType, ContextType, RequireFields<QueryDmspByIdArgs, 'dmspId'>>;
  languages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Language']>>>, ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  publishedConditionsForQuestion?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedQuestionCondition']>>>, ParentType, ContextType, RequireFields<QueryPublishedConditionsForQuestionArgs, 'versionedQuestionId'>>;
  publishedQuestions?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedQuestion']>>>, ParentType, ContextType, RequireFields<QueryPublishedQuestionsArgs, 'versionedSectionId'>>;
  publishedSections?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedSection']>>>, ParentType, ContextType, RequireFields<QueryPublishedSectionsArgs, 'term'>>;
  publishedTemplates?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedTemplate']>>>, ParentType, ContextType, RequireFields<QueryPublishedTemplatesArgs, 'term'>>;
  question?: Resolver<Maybe<ResolversTypes['Question']>, ParentType, ContextType, RequireFields<QueryQuestionArgs, 'questionId'>>;
  questionConditions?: Resolver<Maybe<Array<Maybe<ResolversTypes['QuestionCondition']>>>, ParentType, ContextType, RequireFields<QueryQuestionConditionsArgs, 'questionId'>>;
  questionTypes?: Resolver<Maybe<Array<Maybe<ResolversTypes['QuestionType']>>>, ParentType, ContextType>;
  questions?: Resolver<Maybe<Array<Maybe<ResolversTypes['Question']>>>, ParentType, ContextType, RequireFields<QueryQuestionsArgs, 'sectionId'>>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<QuerySectionArgs, 'sectionId'>>;
  sectionVersions?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedSection']>>>, ParentType, ContextType, RequireFields<QuerySectionVersionsArgs, 'sectionId'>>;
  sections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Section']>>>, ParentType, ContextType, RequireFields<QuerySectionsArgs, 'templateId'>>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  tagsBySectionId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType, RequireFields<QueryTagsBySectionIdArgs, 'sectionId'>>;
  template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<QueryTemplateArgs, 'templateId'>>;
  templateCollaborators?: Resolver<Maybe<Array<Maybe<ResolversTypes['TemplateCollaborator']>>>, ParentType, ContextType, RequireFields<QueryTemplateCollaboratorsArgs, 'templateId'>>;
  templateVersions?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedTemplate']>>>, ParentType, ContextType, RequireFields<QueryTemplateVersionsArgs, 'templateId'>>;
  templates?: Resolver<Maybe<Array<Maybe<ResolversTypes['Template']>>>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'userId'>>;
  users?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
};

export type QuestionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Question'] = ResolversParentTypes['Question']> = {
  created?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  guidanceText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDirty?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionTypeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  required?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sectionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sourceQestionId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  templateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuestionConditionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['QuestionCondition'] = ResolversParentTypes['QuestionCondition']> = {
  action?: Resolver<ResolversTypes['QuestionConditionActionType'], ParentType, ContextType>;
  condition?: Resolver<ResolversTypes['QuestionConditionCondition'], ParentType, ContextType>;
  conditionMatch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QuestionTypeResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['QuestionType'] = ResolversParentTypes['QuestionType']> = {
  created?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDefault?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usageDescription?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RelatedIdentifierResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['RelatedIdentifier'] = ResolversParentTypes['RelatedIdentifier']> = {
  descriptor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  identifier?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  work_type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface RorScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Ror'], any> {
  name: 'Ror';
}

export type SectionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  guidance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  introduction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isDirty?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requirements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType>;
  template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SingleDmspResponseResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['SingleDmspResponse'] = ResolversParentTypes['SingleDmspResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  dmsp?: Resolver<Maybe<ResolversTypes['Dmsp']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Template'] = ResolversParentTypes['Template']> = {
  bestPractice?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  collaborators?: Resolver<Maybe<Array<ResolversTypes['TemplateCollaborator']>>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  currentVersion?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isDirty?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  languageId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  invitedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
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
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
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
  confirmed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  primary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedQuestionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedQuestion'] = ResolversParentTypes['VersionedQuestion']> = {
  created?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  guidanceText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionTypeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  required?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  requirementText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  versionedSectionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  versionedTemplateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedQuestionConditionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedQuestionCondition'] = ResolversParentTypes['VersionedQuestionCondition']> = {
  action?: Resolver<ResolversTypes['VersionedQuestionConditionActionType'], ParentType, ContextType>;
  condition?: Resolver<ResolversTypes['VersionedQuestionConditionCondition'], ParentType, ContextType>;
  conditionMatch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  questionConditionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  versionedQuestionId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedSectionResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedSection'] = ResolversParentTypes['VersionedSection']> = {
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  displayOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  guidance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  introduction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requirements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['Tag']>>>, ParentType, ContextType>;
  versionedTemplate?: Resolver<ResolversTypes['VersionedTemplate'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionedTemplateResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['VersionedTemplate'] = ResolversParentTypes['VersionedTemplate']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  bestPractice?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifiedById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType>;
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  versionType?: Resolver<Maybe<ResolversTypes['TemplateVersionType']>, ParentType, ContextType>;
  versionedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  versionedSection?: Resolver<Maybe<Array<Maybe<ResolversTypes['VersionedSection']>>>, ParentType, ContextType>;
  visibility?: Resolver<ResolversTypes['TemplateVisibility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = MyContext> = {
  Affiliation?: AffiliationResolvers<ContextType>;
  AffiliationEmailDomain?: AffiliationEmailDomainResolvers<ContextType>;
  AffiliationLink?: AffiliationLinkResolvers<ContextType>;
  AffiliationSearch?: AffiliationSearchResolvers<ContextType>;
  Contributor?: ContributorResolvers<ContextType>;
  ContributorRole?: ContributorRoleResolvers<ContextType>;
  ContributorRoleMutationResponse?: ContributorRoleMutationResponseResolvers<ContextType>;
  DateTimeISO?: GraphQLScalarType;
  DmpRoadmapAffiliation?: DmpRoadmapAffiliationResolvers<ContextType>;
  Dmsp?: DmspResolvers<ContextType>;
  DmspId?: GraphQLScalarType;
  DmspIdentifier?: DmspIdentifierResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  Identifier?: IdentifierResolvers<ContextType>;
  Language?: LanguageResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Orcid?: GraphQLScalarType;
  OrganizationIdentifier?: OrganizationIdentifierResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonIdentifier?: PersonIdentifierResolvers<ContextType>;
  PrimaryContact?: PrimaryContactResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Question?: QuestionResolvers<ContextType>;
  QuestionCondition?: QuestionConditionResolvers<ContextType>;
  QuestionType?: QuestionTypeResolvers<ContextType>;
  RelatedIdentifier?: RelatedIdentifierResolvers<ContextType>;
  Ror?: GraphQLScalarType;
  Section?: SectionResolvers<ContextType>;
  SingleDmspResponse?: SingleDmspResponseResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  Template?: TemplateResolvers<ContextType>;
  TemplateCollaborator?: TemplateCollaboratorResolvers<ContextType>;
  URL?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  UserEmail?: UserEmailResolvers<ContextType>;
  VersionedQuestion?: VersionedQuestionResolvers<ContextType>;
  VersionedQuestionCondition?: VersionedQuestionConditionResolvers<ContextType>;
  VersionedSection?: VersionedSectionResolvers<ContextType>;
  VersionedTemplate?: VersionedTemplateResolvers<ContextType>;
};


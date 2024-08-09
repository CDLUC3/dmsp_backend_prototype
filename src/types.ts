import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { DmspModel } from './models/Dmsp';
import { ContributorRoleModel } from './models/ContributorRole';
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

/** A respresentation of an institution, organization or company */
export type Affiliation = {
  __typename?: 'Affiliation';
  /** Acronyms for the affiliation */
  acronyms?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Whether or not the affiliation is active. Inactive records shoould not appear in typeaheads! */
  active: Scalars['Boolean']['output'];
  /** The address(es) for the affiliation */
  addresses?: Maybe<Array<Maybe<AffiliationAddress>>>;
  /** Alias names for the affiliation */
  aliases?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The official ISO 2 character country code for the affiliation */
  countryCode?: Maybe<Scalars['String']['output']>;
  /** The country name for the affiliation */
  countryName?: Maybe<Scalars['String']['output']>;
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName: Scalars['String']['output'];
  /** The official homepage for the affiliation */
  domain?: Maybe<Scalars['String']['output']>;
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The Crossref Funder id */
  fundref?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the affiliation (typically the ROR id) */
  id: Scalars['String']['output'];
  /** URL links associated with the affiliation */
  links?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Localization options for the affiliation name */
  locales?: Maybe<Array<Maybe<AffiliationLocale>>>;
  /** The official name for the affiliation (defined by the system of provenance) */
  name: Scalars['String']['output'];
  /** The system the affiliation's data came from (e.g. ROR, DMPTool, etc.) */
  provenance: Scalars['String']['output'];
  /** The last time the data for the affiliation was synced with the system of provenance */
  provenanceSyncDate: Scalars['String']['output'];
  /** Other related affiliations */
  relationships?: Maybe<Array<Maybe<AffiliationRelationship>>>;
  /** The types of the affiliation (e.g. Company, Education, Government, etc.) */
  types?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The URL for the affiliation's Wikipedia entry */
  wikipediaURL?: Maybe<Scalars['URL']['output']>;
};

export type AffiliationAddress = {
  __typename?: 'AffiliationAddress';
  /** The name of the affiliation's city */
  city?: Maybe<Scalars['String']['output']>;
  /** The Geonames identify of the affiliation's country */
  countryGeonamesId?: Maybe<Scalars['Int']['output']>;
  /** The latitude coordinate */
  lat?: Maybe<Scalars['Float']['output']>;
  /** The longitude coordinate */
  lng?: Maybe<Scalars['Float']['output']>;
  /** The name of the affiliation's state/province */
  state?: Maybe<Scalars['String']['output']>;
  /** The code of the affiliation's state/province */
  stateCode?: Maybe<Scalars['String']['output']>;
};

export type AffiliationLocale = {
  __typename?: 'AffiliationLocale';
  /** The localized name of the affiliation */
  label: Scalars['String']['output'];
  /** The language code */
  locale: Scalars['String']['output'];
};

export type AffiliationRelationship = {
  __typename?: 'AffiliationRelationship';
  /** The unique identifer for the related affiliation (typically the ROR id) */
  id: Scalars['String']['output'];
  /** The official name of the related affiliation */
  name: Scalars['String']['output'];
  /** The relationship type (e.g. Parent) */
  type: Scalars['String']['output'];
};

/** Search result - An abbreviated version of an Affiliation */
export type AffiliationSearch = {
  __typename?: 'AffiliationSearch';
  /** Alias names and acronyms for the affiliation */
  aliases?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The official ISO 2 character country code for the affiliation */
  countryCode?: Maybe<Scalars['String']['output']>;
  /** The country name for the affiliation */
  countryName?: Maybe<Scalars['String']['output']>;
  /** The official display name */
  displayName: Scalars['String']['output'];
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The Crossref Funder id */
  fundref?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the affiliation (typically the ROR id) */
  id: Scalars['String']['output'];
  /** URL links associated with the affiliation */
  links?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Localization options for the affiliation name */
  locales?: Maybe<Array<Maybe<AffiliationLocale>>>;
  /** The official name of the affiliation from the system of provenance */
  name: Scalars['String']['output'];
};

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
  /** The timestamp of when the contributor role was created */
  created: Scalars['DateTimeISO']['output'];
  /** A longer description of the contributor role useful for tooltips */
  description?: Maybe<Scalars['String']['output']>;
  /** The order in which to display these items when displayed in the UI */
  displayOrder: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  /** The Ui label to display for the contributor role */
  label: Scalars['String']['output'];
  /** The timestamp of when the contributor role last modified */
  modified: Scalars['DateTimeISO']['output'];
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
  created: Scalars['DateTimeISO']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dmp_id: DmspIdentifier;
  dmproadmap_featured?: Maybe<Scalars['String']['output']>;
  dmproadmap_related_identifiers?: Maybe<Array<Maybe<RelatedIdentifier>>>;
  dmproadmap_visibility?: Maybe<Scalars['String']['output']>;
  ethical_issues_description?: Maybe<Scalars['String']['output']>;
  ethical_issues_exist: YesNoUnknown;
  ethical_issues_report?: Maybe<Scalars['URL']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  modified: Scalars['DateTimeISO']['output'];
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

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Add a new contributor role (URL and label must be unique!) */
  addContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Delete the contributor role */
  removeContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Update the contributor role */
  updateContributorRole?: Maybe<ContributorRoleMutationResponse>;
};


export type MutationAddContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationRemoveContributorRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
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
  affiliation?: Maybe<Affiliation>;
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
  me?: Maybe<User>;
  user?: Maybe<User>;
  users?: Maybe<Array<Maybe<User>>>;
};


export type QueryAffiliationArgs = {
  affiliationId: Scalars['String']['input'];
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


export type QueryUserArgs = {
  userId: Scalars['String']['input'];
};

export type RelatedIdentifier = {
  __typename?: 'RelatedIdentifier';
  descriptor: Scalars['String']['output'];
  identifier: Scalars['URL']['output'];
  type: Scalars['String']['output'];
  work_type: Scalars['String']['output'];
};

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

export type User = {
  __typename?: 'User';
  affiliation?: Maybe<Affiliation>;
  created: Scalars['DateTimeISO']['output'];
  email: Scalars['EmailAddress']['output'];
  givenName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  modified: Scalars['DateTimeISO']['output'];
  orcid?: Maybe<Scalars['Orcid']['output']>;
  role: UserRole;
  surName?: Maybe<Scalars['String']['output']>;
};

export type UserRole =
  | 'Admin'
  | 'Researcher'
  | 'SuperAdmin';

export type YesNoUnknown =
  | 'no'
  | 'unknown'
  | 'yes';



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
  Affiliation: ResolverTypeWrapper<Affiliation>;
  AffiliationAddress: ResolverTypeWrapper<AffiliationAddress>;
  AffiliationLocale: ResolverTypeWrapper<AffiliationLocale>;
  AffiliationRelationship: ResolverTypeWrapper<AffiliationRelationship>;
  AffiliationSearch: ResolverTypeWrapper<AffiliationSearch>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Contributor: ResolverTypeWrapper<Contributor>;
  ContributorRole: ResolverTypeWrapper<ContributorRoleModel>;
  ContributorRoleMutationResponse: ResolverTypeWrapper<Omit<ContributorRoleMutationResponse, 'contributorRole'> & { contributorRole?: Maybe<ResolversTypes['ContributorRole']> }>;
  DateTimeISO: ResolverTypeWrapper<Scalars['DateTimeISO']['output']>;
  DmpRoadmapAffiliation: ResolverTypeWrapper<DmpRoadmapAffiliation>;
  Dmsp: ResolverTypeWrapper<DmspModel>;
  DmspId: ResolverTypeWrapper<Scalars['DmspId']['output']>;
  DmspIdentifier: ResolverTypeWrapper<DmspIdentifier>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Identifier: ResolverTypeWrapper<Identifier>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Orcid: ResolverTypeWrapper<Scalars['Orcid']['output']>;
  OrganizationIdentifier: ResolverTypeWrapper<OrganizationIdentifier>;
  Person: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Person']>;
  PersonIdentifier: ResolverTypeWrapper<PersonIdentifier>;
  PrimaryContact: ResolverTypeWrapper<PrimaryContact>;
  Query: ResolverTypeWrapper<{}>;
  RelatedIdentifier: ResolverTypeWrapper<RelatedIdentifier>;
  Ror: ResolverTypeWrapper<Scalars['Ror']['output']>;
  SingleDmspResponse: ResolverTypeWrapper<Omit<SingleDmspResponse, 'dmsp'> & { dmsp?: Maybe<ResolversTypes['Dmsp']> }>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  User: ResolverTypeWrapper<User>;
  UserRole: UserRole;
  YesNoUnknown: YesNoUnknown;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Affiliation: Affiliation;
  AffiliationAddress: AffiliationAddress;
  AffiliationLocale: AffiliationLocale;
  AffiliationRelationship: AffiliationRelationship;
  AffiliationSearch: AffiliationSearch;
  Boolean: Scalars['Boolean']['output'];
  Contributor: Contributor;
  ContributorRole: ContributorRoleModel;
  ContributorRoleMutationResponse: Omit<ContributorRoleMutationResponse, 'contributorRole'> & { contributorRole?: Maybe<ResolversParentTypes['ContributorRole']> };
  DateTimeISO: Scalars['DateTimeISO']['output'];
  DmpRoadmapAffiliation: DmpRoadmapAffiliation;
  Dmsp: DmspModel;
  DmspId: Scalars['DmspId']['output'];
  DmspIdentifier: DmspIdentifier;
  EmailAddress: Scalars['EmailAddress']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Identifier: Identifier;
  Int: Scalars['Int']['output'];
  Mutation: {};
  Orcid: Scalars['Orcid']['output'];
  OrganizationIdentifier: OrganizationIdentifier;
  Person: ResolversInterfaceTypes<ResolversParentTypes>['Person'];
  PersonIdentifier: PersonIdentifier;
  PrimaryContact: PrimaryContact;
  Query: {};
  RelatedIdentifier: RelatedIdentifier;
  Ror: Scalars['Ror']['output'];
  SingleDmspResponse: Omit<SingleDmspResponse, 'dmsp'> & { dmsp?: Maybe<ResolversParentTypes['Dmsp']> };
  String: Scalars['String']['output'];
  URL: Scalars['URL']['output'];
  User: User;
};

export type AffiliationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Affiliation'] = ResolversParentTypes['Affiliation']> = {
  acronyms?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  addresses?: Resolver<Maybe<Array<Maybe<ResolversTypes['AffiliationAddress']>>>, ParentType, ContextType>;
  aliases?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  domain?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  funder?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fundref?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  links?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  locales?: Resolver<Maybe<Array<Maybe<ResolversTypes['AffiliationLocale']>>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provenance?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provenanceSyncDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  relationships?: Resolver<Maybe<Array<Maybe<ResolversTypes['AffiliationRelationship']>>>, ParentType, ContextType>;
  types?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  wikipediaURL?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationAddressResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AffiliationAddress'] = ResolversParentTypes['AffiliationAddress']> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryGeonamesId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stateCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationLocaleResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AffiliationLocale'] = ResolversParentTypes['AffiliationLocale']> = {
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locale?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationRelationshipResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AffiliationRelationship'] = ResolversParentTypes['AffiliationRelationship']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AffiliationSearchResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['AffiliationSearch'] = ResolversParentTypes['AffiliationSearch']> = {
  aliases?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  funder?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fundref?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  links?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  locales?: Resolver<Maybe<Array<Maybe<ResolversTypes['AffiliationLocale']>>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  created?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  modified?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
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
  created?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dmp_id?: Resolver<ResolversTypes['DmspIdentifier'], ParentType, ContextType>;
  dmproadmap_featured?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dmproadmap_related_identifiers?: Resolver<Maybe<Array<Maybe<ResolversTypes['RelatedIdentifier']>>>, ParentType, ContextType>;
  dmproadmap_visibility?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ethical_issues_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ethical_issues_exist?: Resolver<ResolversTypes['YesNoUnknown'], ParentType, ContextType>;
  ethical_issues_report?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  language?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
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

export type MutationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRoleMutationResponse']>, ParentType, ContextType, RequireFields<MutationAddContributorRoleArgs, 'displayOrder' | 'label' | 'url'>>;
  removeContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRoleMutationResponse']>, ParentType, ContextType, RequireFields<MutationRemoveContributorRoleArgs, 'id'>>;
  updateContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRoleMutationResponse']>, ParentType, ContextType, RequireFields<MutationUpdateContributorRoleArgs, 'displayOrder' | 'id' | 'label' | 'url'>>;
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
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType, RequireFields<QueryAffiliationArgs, 'affiliationId'>>;
  affiliations?: Resolver<Maybe<Array<Maybe<ResolversTypes['AffiliationSearch']>>>, ParentType, ContextType, RequireFields<QueryAffiliationsArgs, 'name'>>;
  contributorRoleById?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<QueryContributorRoleByIdArgs, 'contributorRoleId'>>;
  contributorRoleByURL?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<QueryContributorRoleByUrlArgs, 'contributorRoleURL'>>;
  contributorRoles?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContributorRole']>>>, ParentType, ContextType>;
  dmspById?: Resolver<Maybe<ResolversTypes['SingleDmspResponse']>, ParentType, ContextType, RequireFields<QueryDmspByIdArgs, 'dmspId'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'userId'>>;
  users?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
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

export type SingleDmspResponseResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['SingleDmspResponse'] = ResolversParentTypes['SingleDmspResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  dmsp?: Resolver<Maybe<ResolversTypes['Dmsp']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type UserResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  created?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['EmailAddress'], ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modified?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['Orcid']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  surName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = MyContext> = {
  Affiliation?: AffiliationResolvers<ContextType>;
  AffiliationAddress?: AffiliationAddressResolvers<ContextType>;
  AffiliationLocale?: AffiliationLocaleResolvers<ContextType>;
  AffiliationRelationship?: AffiliationRelationshipResolvers<ContextType>;
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
  Mutation?: MutationResolvers<ContextType>;
  Orcid?: GraphQLScalarType;
  OrganizationIdentifier?: OrganizationIdentifierResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonIdentifier?: PersonIdentifierResolvers<ContextType>;
  PrimaryContact?: PrimaryContactResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RelatedIdentifier?: RelatedIdentifierResolvers<ContextType>;
  Ror?: GraphQLScalarType;
  SingleDmspResponse?: SingleDmspResponseResolvers<ContextType>;
  URL?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
};


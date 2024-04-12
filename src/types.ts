import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ContributorRoleModel, DMPModel } from './models';
import { DataSourceContext } from './context';
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
  URL: { input: any; output: any; }
};

export type Affiliation = {
  __typename?: 'Affiliation';
  name: Scalars['String']['output'];
  ror?: Maybe<Scalars['URL']['output']>;
};

export type Contributor = {
  __typename?: 'Contributor';
  affiliation?: Maybe<Affiliation>;
  mbox?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  orcid?: Maybe<Scalars['URL']['output']>;
  role: Array<ContributorRole>;
};

export type ContributorRole = {
  __typename?: 'ContributorRole';
  /** The timestamp of when the contributor role was created */
  created: Scalars['DateTimeISO']['output'];
  /** A longer description of the contributor role useful for tooltips */
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** The Ui label to display for the contributor role */
  label: Scalars['String']['output'];
  /** The timestamp of when the contributor role last modified */
  modified: Scalars['DateTimeISO']['output'];
  /** The URL for the contributor role */
  url: Scalars['URL']['output'];
};

export type Dmp = {
  __typename?: 'DMP';
  contributors?: Maybe<Array<Maybe<Contributor>>>;
  created: Scalars['DateTimeISO']['output'];
  description: Scalars['String']['output'];
  dmpID: Scalars['String']['output'];
  ethicalConcernsDescription?: Maybe<Scalars['String']['output']>;
  ethicalConcernsReportURL?: Maybe<Scalars['URL']['output']>;
  hasEthicalConcerns: Scalars['Boolean']['output'];
  isFeatured: Scalars['Boolean']['output'];
  language?: Maybe<Scalars['String']['output']>;
  modified: Scalars['DateTimeISO']['output'];
  primaryContact: PrimaryContact;
  title: Scalars['String']['output'];
  visibility: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _dummy?: Maybe<Scalars['String']['output']>;
  /** Add a new contributor role (URL and label must be unique!) */
  addContributorRole?: Maybe<ContributorRole>;
  /** Delete the contributor role */
  removeContributorRole?: Maybe<Scalars['Boolean']['output']>;
  /** Update the contributor role */
  updateContributorRole?: Maybe<ContributorRole>;
};


export type MutationAddContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationRemoveContributorRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['URL']['input']>;
};

export type PrimaryContact = {
  __typename?: 'PrimaryContact';
  affiliation?: Maybe<Affiliation>;
  mbox?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  orcid?: Maybe<Scalars['URL']['output']>;
};

export type Query = {
  __typename?: 'Query';
  _dummy?: Maybe<Scalars['String']['output']>;
  /** Get the contributor role by it's ID */
  contributorRoleById?: Maybe<ContributorRole>;
  /** Get the contributor role by it's URL */
  contributorRoleByURL?: Maybe<ContributorRole>;
  /** Get all of the contributor role types */
  contributorRoles?: Maybe<Array<Maybe<ContributorRole>>>;
  /** Get the contributor role by it's ID */
  getDMP?: Maybe<Dmp>;
};


export type QueryContributorRoleByIdArgs = {
  contributorRoleId: Scalars['ID']['input'];
};


export type QueryContributorRoleByUrlArgs = {
  contributorRoleURL: Scalars['URL']['input'];
};


export type QueryGetDmpArgs = {
  dmpId: Scalars['String']['input'];
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
  Affiliation: ResolverTypeWrapper<Affiliation>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Contributor: ResolverTypeWrapper<Omit<Contributor, 'role'> & { role: Array<ResolversTypes['ContributorRole']> }>;
  ContributorRole: ResolverTypeWrapper<ContributorRoleModel>;
  DMP: ResolverTypeWrapper<DMPModel>;
  DateTimeISO: ResolverTypeWrapper<Scalars['DateTimeISO']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  PrimaryContact: ResolverTypeWrapper<PrimaryContact>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Affiliation: Affiliation;
  Boolean: Scalars['Boolean']['output'];
  Contributor: Omit<Contributor, 'role'> & { role: Array<ResolversParentTypes['ContributorRole']> };
  ContributorRole: ContributorRoleModel;
  DMP: DMPModel;
  DateTimeISO: Scalars['DateTimeISO']['output'];
  ID: Scalars['ID']['output'];
  Mutation: {};
  PrimaryContact: PrimaryContact;
  Query: {};
  String: Scalars['String']['output'];
  URL: Scalars['URL']['output'];
};

export type AffiliationResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['Affiliation'] = ResolversParentTypes['Affiliation']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ror?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContributorResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['Contributor'] = ResolversParentTypes['Contributor']> = {
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  mbox?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  role?: Resolver<Array<ResolversTypes['ContributorRole']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContributorRoleResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['ContributorRole'] = ResolversParentTypes['ContributorRole']> = {
  created?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  modified?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DmpResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['DMP'] = ResolversParentTypes['DMP']> = {
  contributors?: Resolver<Maybe<Array<Maybe<ResolversTypes['Contributor']>>>, ParentType, ContextType>;
  created?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dmpID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ethicalConcernsDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ethicalConcernsReportURL?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  hasEthicalConcerns?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isFeatured?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  language?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modified?: Resolver<ResolversTypes['DateTimeISO'], ParentType, ContextType>;
  primaryContact?: Resolver<ResolversTypes['PrimaryContact'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  visibility?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeIsoScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTimeISO'], any> {
  name: 'DateTimeISO';
}

export type MutationResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  _dummy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<MutationAddContributorRoleArgs, 'label' | 'url'>>;
  removeContributorRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveContributorRoleArgs, 'id'>>;
  updateContributorRole?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<MutationUpdateContributorRoleArgs, 'id'>>;
};

export type PrimaryContactResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['PrimaryContact'] = ResolversParentTypes['PrimaryContact']> = {
  affiliation?: Resolver<Maybe<ResolversTypes['Affiliation']>, ParentType, ContextType>;
  mbox?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orcid?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  _dummy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contributorRoleById?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<QueryContributorRoleByIdArgs, 'contributorRoleId'>>;
  contributorRoleByURL?: Resolver<Maybe<ResolversTypes['ContributorRole']>, ParentType, ContextType, RequireFields<QueryContributorRoleByUrlArgs, 'contributorRoleURL'>>;
  contributorRoles?: Resolver<Maybe<Array<Maybe<ResolversTypes['ContributorRole']>>>, ParentType, ContextType>;
  getDMP?: Resolver<Maybe<ResolversTypes['DMP']>, ParentType, ContextType, RequireFields<QueryGetDmpArgs, 'dmpId'>>;
};

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type Resolvers<ContextType = DataSourceContext> = {
  Affiliation?: AffiliationResolvers<ContextType>;
  Contributor?: ContributorResolvers<ContextType>;
  ContributorRole?: ContributorRoleResolvers<ContextType>;
  DMP?: DmpResolvers<ContextType>;
  DateTimeISO?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  PrimaryContact?: PrimaryContactResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  URL?: GraphQLScalarType;
};


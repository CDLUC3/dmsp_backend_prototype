import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    "Search for a repository"
    repositories(input: RepositorySearchInput!): RepositorySearchResults
    "Fetch a specific repository"
    repository(uri: String!): Repository
  }

  extend type Mutation {
    "Add a new Repository"
    addRepository(input: AddRepositoryInput): Repository
    "Update a Repository record"
    updateRepository(input: UpdateRepositoryInput): Repository
    "Delete a Repository"
    removeRepository(repositoryId: Int!): Repository

    "Merge two repositories"
    mergeRepositories(repositoryToKeepId: Int!, repositoryToRemoveId: Int!): Repository
  }

  enum RepositoryType {
    "A discipline specific repository (e.g. GeneCards, Arctic Data Centre, etc.)"
    DISCIPLINARY
    "A generalist repository (e.g. Zenodo, Dryad)"
    GENERALIST
    "An institution specific repository (e.g. ASU Library Research Data Repository, etc.)"
    INSTITUTIONAL
  }

  "A repository where research outputs are preserved"
  type Repository {
    "The unique identifer for the Object"
    id: Int
    "The user who created the Object"
    createdById: Int
    "The timestamp when the Object was created"
    created: String
    "The user who last modified the Object"
    modifiedById: Int
    "The timestamp when the Object was last modifed"
    modified: String
    "Errors associated with the Object"
    errors: RepositoryErrors

    "The name of the repository"
    name: String!
    "The taxonomy URL of the repository"
    uri: String!
    "A description of the repository"
    description: String
    "The website URL"
    website: String
    "Research domains associated with the repository"
    researchDomains: [ResearchDomain!]
    "Keywords to assist in finding the repository"
    keywords: [String!]
    "The Categories/Types of the repository"
    repositoryTypes: [RepositoryType!]
  }

  type RepositorySearchResults {
    "The list of repositories"
    feed: [Repository]
    "The total number of results"
    totalCount: Int
    "The id of the last Repository in the results"
    cursor: Int
    "Any errors associated with the search"
    error: PaginationError
  }

  "A collection of errors related to the Repository"
  type RepositoryErrors {
    "General error messages such as the object already exists"
    general: String

    name: String
    uri: String
    description: String
    website: String
    researchDomainIds: String
    keywords: String
    repositoryTypes: String
  }

  input RepositorySearchInput {
    "The search term"
    term: String
    "The repository category/type"
    repositoryType: String
    "The research domain associated with the repository"
    researchDomainId: Int
    "The cursor for pagination"
    cursor: Int
    "The number of results to return"
    limit: Int
  }

  input AddRepositoryInput {
    "The name of the repository"
    name: String!
    "A description of the repository"
    description: String
    "The website URL"
    website: String
    "Research domains associated with the repository"
    researchDomainIds: [Int!]
    "Keywords to assist in finding the repository"
    keywords: [String!]
    "The Categories/Types of the repository"
    repositoryTypes: [String!]
    "The taxonomy URL (do not make this up! should resolve to an HTML/JSON representation of the object)"
    uri: String
  }

  input UpdateRepositoryInput {
    "The Repository id"
    id: Int!
    "The name of the repository"
    name: String!
    "A description of the repository"
    description: String
    "The website URL"
    website: String
    "Research domains associated with the repository"
    researchDomainIds: [Int!]
    "Keywords to assist in finding the repository"
    keywords: [String!]
    "The Categories/Types of the repository"
    repositoryTypes: [String!]
  }
`;

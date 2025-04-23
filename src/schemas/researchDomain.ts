import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    "Get all of the top level research domains (the most generic ones)"
    topLevelResearchDomains(cursor: Int, limit: Int): ResearchDomainResults
    "Get all of the research domains related to the specified top level domain (more nuanced ones)"
    childResearchDomains(parentResearchDomainId: Int!): [ResearchDomain]
  }

  "An aread of research (e.g. Electrical Engineering, Cellular biology, etc.)"
  type ResearchDomain {
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
    errors: ResearchDomainErrors

    "The name of the domain"
    name: String!
    "The taxonomy URL of the research domain"
    uri: String!
    "A description of the type of research covered by the domain"
    description: String
    "The parent research domain (if applicable). If this is blank then it is a top level domain."
    parentResearchDomain: ResearchDomain
    "The ID of the parent research domain (if applicable)"
    parentResearchDomainId: Int
    "The child research domains (if applicable)"
    childResearchDomains: [ResearchDomain!]
  }

  type ResearchDomainResults {
    "The list of research domains"
    feed: [ResearchDomain]
    "The id of the last ResearchDomain in the results"
    cursor: Int
    "The total number of research domains"
    totalCount: Int
    "Any errors associated with the search"
    error: PaginationError
  }

  "A collection of errors related to the ResearchDomain"
  type ResearchDomainErrors {
    "General error messages such as the object already exists"
    general: String

    name: String
    uri: String
    description: String
    parentResearchDomainId: String
    childResearchDomainIds: String
  }
`;

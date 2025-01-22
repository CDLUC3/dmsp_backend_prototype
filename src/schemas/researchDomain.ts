import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    "Get all of the top level research domains (the most generic ones)"
    topLevelResearchDomains: [ResearchDomain]
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
    errors: [String!]

    "The name of the domain"
    name: String!
    "The taxonomy URL of the research domain"
    uri: String!
    "A description of the type of research covered by the domain"
    description: String
    "The parent research domain (if applicable). If this is blank then it is a top level domain."
    parentResearchDomain: ResearchDomain
    "The child research domains (if applicable)"
    childResearchDomains: [ResearchDomain!]
  }
`;

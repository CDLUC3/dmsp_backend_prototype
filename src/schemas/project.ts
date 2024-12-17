import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {

  }

  extend type Mutation {

  }

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
    "A description of the type of research covered by the domain"
    description: String
  }

  type Project {
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

    "The name/title of the research project"
    title: String!
    "The research project abstract"
    abstract: String
    "The estimated date the research project will begin (use YYYY-MM-DD format)"
    startDate: String
    "The estimated date the research project will end (use YYYY-MM-DD format)"
    endDate: String
    "The type of research being done"
    researchDomain: ResearchDomain

    "People who are contributing to the research project (not just the DMP)"
    contributors: [ProjectContributor!]
    "The funders who are supporting the research project"
    funders: [ProjectFunder!]
  }
`;

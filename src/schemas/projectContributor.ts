import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {

  }

  extend type Mutation {

  }

  "A person involved with a research project"
  type ProjectContributor {
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

    "The research project"
    project: Project!
    "The contributor's affiliation"
    affiliation: Affiliation
    "The contributor's first/given name"
    givenName: String
    "The contributor's last/sur name"
    surname: String
    "The contributor's ORCID"
    orcid: String
    "The contributor's email address"
    email: String
    "The roles the contributor has on the research project"
    roles: [ContributorRole!]
  }
`;

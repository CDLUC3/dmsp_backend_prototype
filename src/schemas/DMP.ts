import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the contributor role by it's ID"
    getDMP(dmpId: String!): DMP
  }

  type DMP {
    dmpID: String!
    title: String!
    primaryContact: PrimaryContact!
    created: DateTimeISO!
    modified: DateTimeISO!

    contributors: [Contributor]
    description: String!
    isFeatured: Boolean!
    visibility: String!
    hasEthicalConcerns: Boolean!
    ethicalConcernsDescription: String
    ethicalConcernsReportURL: URL
    language: String
  }

  type PrimaryContact {
    name: String!
    orcid: URL
    mbox: String
    affiliation: Affiliation
  }

  type Contributor {
    name: String!
    role: [ContributorRole!]!
    orcid: URL
    mbox: String
    affiliation: Affiliation
  }

  type Affiliation {
    name: String!
    ror: URL
  }
`;
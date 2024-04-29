import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the DMSP by its DMP ID"
    dmspById(dmspId: ID!): SingleDmspResponse
  }

  type SingleDmspResponse {
    "Similar to HTTP status code, represents the status of the mutation"
    code: Int!
    "Indicates whether the mutation was successful"
    success: Boolean!
    "Human-readable message for the UI"
    message: String!
    "The DMSP"
    dmsp: Dmsp
  }

  type Dmsp {
    id: ID!
    dmpId: Identifier!
    title: String!
    contact: PrimaryContact!
    created: DateTimeISO!
    modified: DateTimeISO!

    contributor: [Contributor]
    description: String
    isFeatured: Boolean
    visibility: String
    hasEthicalConcerns: Boolean!
    ethicalConcernsDescription: String
    ethicalConcernsReportURL: URL
    language: String
  }

  type PrimaryContact implements Person {
    name: String!
    mbox: String
    dmproadmap_affiliation: Affiliation

    contact_id: Identifier
  }

  type Contributor implements Person {
    name: String!
    mbox: String
    dmproadmap_affiliation: Affiliation

    role: [String!]!
    contributorId: Identifier
  }

  type Affiliation {
    name: String!
    affiliation_id: Identifier
  }

  type Identifier {
    type: String!
    identifier: String!
  }

  interface Person {
    name: String!
    mbox: String
    dmproadmap_affiliation: Affiliation
  }

  enum YesNoUnknown {
    yes
    no
    unknown
  }
`;
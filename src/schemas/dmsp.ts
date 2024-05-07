import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the DMSP by its DMP ID"
    dmspById(dmspId: DmspId!): SingleDmspResponse
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
    contact: PrimaryContact!
    created: DateTimeISO!
    dmp_id: DmspIdentifier!
    ethical_issues_exist: YesNoUnknown!
    modified: DateTimeISO!
    title: String!

    contributor: [Contributor]
    description: String
    dmproadmap_featured: String
    dmproadmap_related_identifiers: [RelatedIdentifier]
    dmproadmap_visibility: String
    ethical_issues_description: String
    ethical_issues_report: URL
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
    contributorId: PersonIdentifier
  }

  type RelatedIdentifier {
    descriptor: String!
    identifier: URL!
    type: String!
    work_type: String!
  }

  type Affiliation {
    name: String!
    affiliation_id: OrganizationIdentifier
  }

  type DmspIdentifier {
    type: String!
    identifier: DmspId!
  }

  type OrganizationIdentifier {
    type: String!
    identifier: Ror!
  }

  type PersonIdentifier {
    type: String!
    identifier: Orcid!
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
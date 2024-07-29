import gql from "graphql-tag";

// type AffiliationSearchOptions {
//   name: String!
//   funderOnly: Boolean!
// }

export const typeDefs = gql`
  extend type Query {
    "Retrieve a specific Affiliation by its ID"
    affiliation(affiliationId: String!): Affiliation
    "Perform a search for Affiliations matching the specified name"
    affiliations(name: String!, funderOnly: Boolean): [AffiliationSearch]
  }

  type AffiliationSearch {
    id: String!
    name: String!
    funder: Boolean!
    fundref: String
    aliases: [String]
    countryCode: String
    countryName: String
    links: [String]
  }

  type Affiliation {
    id: String!
    active: Boolean!
    name: String!
    displayName: String!
    funder: Boolean!
    fundref: String
    acronyms: [String]
    aliases: [String]
    domain: String
    countryCode: String
    countryName: String
    links: [String]
    types: [String]
    wikipediaURL: URL
    relationships: [AffiliationRelationship]
    addresses: [AffiliationAddress]
    externalIds: [ExternalId]
    provenance: String!
    provenanceSyncDate: String!
  }

  type AffiliationRelationship {
    id: String!
    type: String!
    name: String!
  }

  type AffiliationAddress {
    city: String
    state: String
    stateCode: String
    countryGeonamesId: Int
    lat: Float
    lng: Float
  }

  type ExternalId {
    type: String!
    id: String
  }
`;

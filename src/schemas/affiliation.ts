import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Retrieve a specific Affiliation by its ID"
    affiliation(affiliationId: String!): Affiliation
    "Perform a search for Affiliations matching the specified name"
    affiliations(name: String!, funderOnly: Boolean): [AffiliationSearch]
  }

  "Search result - An abbreviated version of an Affiliation"
  type AffiliationSearch {
    "The unique identifer for the affiliation (typically the ROR id)"
    id: String!
    "The official name of the affiliation from the system of provenance"
    name: String!
    "The official display name"
    displayName: String!
    "Whether or not this affiliation is a funder"
    funder: Boolean!
    "The Crossref Funder id"
    fundref: String
    "Alias names and acronyms for the affiliation"
    aliases: [String]
    "The official ISO 2 character country code for the affiliation"
    countryCode: String
    "The country name for the affiliation"
    countryName: String
    "URL links associated with the affiliation"
    links: [String]
    "Localization options for the affiliation name"
    locales: [AffiliationLocale]
  }

  "A respresentation of an institution, organization or company"
  type Affiliation {
    "The unique identifer for the affiliation (typically the ROR id)"
    id: String!
    "Whether or not the affiliation is active. Inactive records shoould not appear in typeaheads!"
    active: Boolean!
    "The official name for the affiliation (defined by the system of provenance)"
    name: String!
    "The display name to help disambiguate similar names (typically with domain or country appended)"
    displayName: String!
    "Whether or not this affiliation is a funder"
    funder: Boolean!
    "The Crossref Funder id"
    fundref: String
    "Acronyms for the affiliation"
    acronyms: [String]
    "Alias names for the affiliation"
    aliases: [String]
    "The official homepage for the affiliation"
    domain: String
    "The official ISO 2 character country code for the affiliation"
    countryCode: String
    "The country name for the affiliation"
    countryName: String
    "Localization options for the affiliation name"
    locales: [AffiliationLocale]
    "URL links associated with the affiliation"
    links: [String]
    "The types of the affiliation (e.g. Company, Education, Government, etc.)"
    types: [String]
    "The URL for the affiliation's Wikipedia entry"
    wikipediaURL: URL
    "Other related affiliations"
    relationships: [AffiliationRelationship]
    "The address(es) for the affiliation"
    addresses: [AffiliationAddress]
    "The system the affiliation's data came from (e.g. ROR, DMPTool, etc.)"
    provenance: String!
    "The last time the data for the affiliation was synced with the system of provenance"
    provenanceSyncDate: String!
  }

  type AffiliationRelationship {
    "The unique identifer for the related affiliation (typically the ROR id)"
    id: String!
    "The relationship type (e.g. Parent)"
    type: String!
    "The official name of the related affiliation"
    name: String!
  }

  type AffiliationAddress {
    "The name of the affiliation's city"
    city: String
    "The name of the affiliation's state/province"
    state: String
    "The code of the affiliation's state/province"
    stateCode: String
    "The Geonames identify of the affiliation's country"
    countryGeonamesId: Int
    "The latitude coordinate"
    lat: Float
    "The longitude coordinate"
    lng: Float
  }

  type AffiliationLocale {
    "The localized name of the affiliation"
    label: String!
    "The language code"
    locale: String!
  }
`;

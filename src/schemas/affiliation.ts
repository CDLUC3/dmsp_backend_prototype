import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Retrieve all of the valid Affiliation types"
    affiliationTypes: [String!]
    "Retrieve a specific Affiliation by its ID"
    affiliationById(affiliationId: Int!): Affiliation
    "Retrieve a specific Affiliation by its URI"
    affiliationByURI(uri: String!): Affiliation
    "Perform a search for Affiliations matching the specified name"
    affiliations(name: String!, funderOnly: Boolean): [AffiliationSearch]
  }

  extend type Mutation {
    "Create a new Affiliation"
    addAffiliation(input: AffiliationInput!): Affiliation
    "Update an Affiliation"
    updateAffiliation(input: AffiliationInput!): Affiliation
    "Delete an Affiliation (only applicable to AffiliationProvenance == DMPTOOL)"
    removeAffiliation(affiliationId: Int!): Affiliation
  }

  "Search result - An abbreviated version of an Affiliation"
  type AffiliationSearch {
    "The unique identifer for the affiliation (typically the ROR id)"
    id: Int!
    "The URI of the affiliation"
    uri: String!
    "The official display name"
    displayName: String!
    "Whether or not this affiliation is a funder"
    funder: Boolean!
    "The categories the Affiliation belongs to"
    types: [AffiliationType!]!
  }

  "The provenance of an Affiliation record"
  enum AffiliationProvenance {
    "Created and managed within the DMPTool"
    DMPTOOL
    "Created and managed by the Research Organization Registry (ROR) https://ror.org"
    ROR
  }

  "Categories for Affiliation"
  enum AffiliationType {
    EDUCATION
    NONPROFIT
    GOVERNMENT
    FACILITY
    COMPANY
    HEALTHCARE
    ARCHIVE
    OTHER
  }

  "A respresentation of an institution, organization or company"
  type Affiliation {
    "The unique identifer for the affiliation (assigned by the Database)"
    id: Int
    "The unique identifer for the affiliation (assigned by the provenance e.g. https://ror.org/12345)"
    uri: String!
    "Whether or not the affiliation is active. Inactive records should not appear in typeaheads!"
    active: Boolean!
    "The system the affiliation's data came from (e.g. ROR, DMPTool, etc.)"
    provenance: String!
    "The official name for the affiliation (defined by the system of provenance)"
    name: String!
    "The display name to help disambiguate similar names (typically with domain or country appended)"
    displayName: String!
    "The combined name, homepage, aliases and acronyms to facilitate search"
    searchName: String!
    "Whether or not this affiliation is a funder"
    funder: Boolean!
    "The Crossref Funder id"
    fundrefId: String
    "The official homepage for the affiliation"
    homepage: String
    "Acronyms for the affiliation"
    acronyms: [String!]
    "Alias names for the affiliation"
    aliases: [String!]
    "The types of the affiliation (e.g. Company, Education, Government, etc.)"
    types: [AffiliationType!]!
    "Whether or not the affiliation is allowed to have administrators"
    managed: Boolean!
    "The URI of the logo"
    logoURI: String
    "The logo file name"
    logoName: String
    "The primary contact email"
    contactEmail: String
    "The primary contact name"
    contactName: String
    "The links the affiliation's users can use to get help"
    subHeaderLinks: [AffiliationLink!]
    "The SSO entityId"
    ssoEntityId: String
    "The email domains associated with the affiliation (for SSO)"
    ssoEmailDomains: [AffiliationEmailDomain!]
    "Whether or not the affiliation wants to use the feedback workflow"
    feedbackEnabled: Boolean!
    "The message to display to users when they request feedback"
    feedbackMessage: String
    "The email address(es) to notify when feedback has been requested (stored as JSON array)"
    feedbackEmails: [String!]
    "The properties of this object that are NOT editable. Determined by the record's provenance"
    uneditableProperties: [String!]!
  }

  "Input for a hyperlink displayed in the sub-header of the UI for the afiliation's users"
  input AffiliationLinkInput {
    "Unique identifier for the link"
    id: Int!
    "The URL"
    url: String!
    "The text to display (e.g. Helpdesk, Grants Office, etc.)"
    text: String
  }

  "Input for email domains linked to the affiliation for purposes of determining if SSO is applicable"
  input AffiliationEmailDomainInput {
    "Unique identifier for the email domain"
    id: Int!
    "The email domain (e.g. example.com, law.example.com, etc.)"
    domain: String!
  }

    "A hyperlink displayed in the sub-header of the UI for the afiliation's users"
  type AffiliationLink {
    "Unique identifier for the link"
    id: Int!
    "The URL"
    url: String!
    "The text to display (e.g. Helpdesk, Grants Office, etc.)"
    text: String
  }

  "Email domains linked to the affiliation for purposes of determining if SSO is applicable"
  type AffiliationEmailDomain {
    "Unique identifier for the email domain"
    id: Int!
    "The email domain (e.g. example.com, law.example.com, etc.)"
    domain: String!
  }

  "Input options for adding an Affiliation"
  input AffiliationInput {
    "Whether or not the Affiliation is active and available in search results"
    active: Boolean!
    "The unique identifer for the affiliation (Not editable!)"
    uri: String!
    "The official name for the affiliation (defined by the system of provenance)"
    name: String!
    "The display name to help disambiguate similar names (typically with domain or country appended)"
    displayName: String!
    "Whether or not this affiliation is a funder"
    funder: Boolean!
    "The Crossref Funder id"
    fundrefId: String
    "The official homepage for the affiliation"
    homepage: String
    "Acronyms for the affiliation"
    acronyms: [String!]
    "Alias names for the affiliation"
    aliases: [String!]
    "The types of the affiliation (e.g. Company, Education, Government, etc.)"
    types: [AffiliationType!]!

    "Whether or not the affiliation is allowed to have administrators"
    managed: Boolean!
    "The URI of the logo"
    logoURI: String
    "The logo file name"
    logoName: String
    "The primary contact email"
    contactEmail: String
    "The primary contact name"
    contactName: String
    "The links the affiliation's users can use to get help"
    subHeaderLinks: [AffiliationLinkInput!]
    "The SSO entityId"
    ssoEntityId: String
    "The email domains associated with the affiliation (for SSO)"
    ssoEmailDomains: [AffiliationEmailDomainInput!]
    "Whether or not the affiliation wants to use the feedback workflow"
    feedbackEnabled: Boolean!
    "The message to display to users when they request feedback"
    feedbackMessage: String
    "The email address(es) to notify when feedback has been requested (stored as JSON array)"
    feedbackEmails: String
  }
`;

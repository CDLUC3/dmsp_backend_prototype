// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
export const typeDefs = `#graphql
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    getDMSP(PK: String!, SK: String): DMSP
  }

  type Mutation {
    createDSMP(input: DMSPInput!): DMSP
    updateDSMP(PK: String!, input: DMSPInput!): DMSP
    deleteDSMP(PK: String!): String
  }

  input DMSPInput {
    title: String!
    modified: String!
    created: String!
    contact: DMSPContactInput!
    dmp_id: DMSPIdentifierInput!
    project: [DMSPProjectInput!]!
    dataset: [DMSPDatasetInput!]!
  }

  input DMSPContactInput {
    name: String!
    dmproadmap_affiliation: DMSPAffiliationInput!
    mbox: String!
    contact_id: DMSPIdentifierInput!
  }

  input DMSPAffiliationInput {
    name: String!
    affiliation_id: DMSPIdentifierInput!
  }

  input DMSPIdentifierInput {
    type: String!
    identifier: String!
  }

  input DMSPProjectInput {
    title: String!
  }

  input DMSPDatasetInput {
    title: String!
  }

  "A Data Management and Sharing Plan (DMSP)"
  type DMSP {
    # Required
    contact: DMSPContact!
    created: String!
    dataset: [DMSPDataset!]!
    dmp_id: DMSPIdentifier!
    modified: String!
    project: [DMSPProject!]!
    title: String!

    # Optional
    contributor: [DMSPContributor]
    cost: [DMSPCost]
    description: String
    dmphub_provenance_id: String
    dmphub_versions: [DMSPVersion!]
    dmproadmap_featured: String
    dmproadmap_privacy: String
    dmproadmap_template: DMSPTemplate
    dmproadmap_related_identifiers: [DMSPRelatedIdentifier!]
    dmproadmap_research_facilities: [DMSPResearchFacility!]
    ethical_issues_exist: String
    ethical_issues_description: String
    ethical_issues_report: String
    language: String
  }

  "The primary contact for the DMSP"
  type DMSPContact {
    # Required
    name: String!
    mbox: String!
    contact_id: DMSPIdentifier!

    # Optional
    dmproadmap_affiliation: DMSPAffiliation
  }

  "A contributor to the research project"
  type DMSPContributor {
    # Required
    name: String!
    role: [String!]!

    # Optional
    contributor_id: DMSPIdentifier
    dmproadmap_affiliation: DMSPAffiliation
    mbox: String
  }

  "Anticipated costs for the research project"
  type DMSPCost {
    title: String!

    description: String
    currency_code: String
    value: Int
  }

  "An insitutional or organizational affiliation of a contributor"
  type DMSPAffiliation {
    name: String!

    affiliation_id: DMSPIdentifier
  }

  type DMSPIdentifier {
    type: String!
    identifier: String!
  }

  "The research project associated with the DMSP"
  type DMSPProject {
    title: String!

    description: String
    start: String
    end: String
    funding: [DMSPFunding!]
  }

  #A funding source for the research project (often tied to the DMSP)"
  type DMSPFunding {
    funding_status: String!
    name: String!

    dmproadmap_opportunity_number: String
    dmproadmap_project_number: String
    funder_id: DMSPIdentifier
    grant_id: DMSPIdentifier
  }

  "Anticipated research output (represents an 'actual' research output when the dataset_id is popuated)"
  type DMSPDataset {
    title: String!

    type: String
    description: String
    data_quality_assurance: [String!]
    dataset_id: DMSPIdentifier
    issued: String
    keyword: [String!]
    language: String
    personal_data: String
    sensitive_data: String
    preservation_statement: String
    distribution: [DMSPDistribution!]
    metadata: [DMSPMetadataStandard!]
    security_and_privacy: [DMSPSecurityPrivacyStatement!]
    technical_resource: [DMSPTechnicalResource!]
  }

  "A distribution of the research output"
  type DMSPDistribution {
    title: String!
    data_access: String!

    access_url: String
    available_until: String
    byte_size: Int
    description: String
    download_url: String
    format: [String!]
    license: [DMSPLicense!]
    host: DMSPHost
  }

  "The repository associated with the distribution (e.g. Zenodo, GitHub, GeneBank, etc.)"
  type DMSPHost {
    title: String!
    url: String!

    availability: String
    backup_frequency: String
    backup_type: String
    certified_with: String
    description: String
    dmproadmap_host_id: DMSPIdentifier
    geo_location: String
    pid_system: [String!]
    storage_type: String
    support_versioning: String
  }

  "Licenses for the research output distribution"
  type DMSPLicense {
    license_ref: String!
    start_date: String!
  }

  "Metadata standards used for the research output"
  type DMSPMetadataStandard {
    metadata_standard_id: DMSPIdentifier!

    description: String
    language: String
  }

  "A description of the security and privacy considerations for the research output"
  type DMSPSecurityPrivacyStatement {
    title: String!

    description: String
  }

  "A technical resource involved in the production of the research output (e.g. an electron microscope or telescope)"
  type DMSPTechnicalResource {
    name: String!

    description: String
    dmproadmap_technical_resource_id: DMSPIdentifier
  }

  "A place involved with the production of the research project (e.g. a lab, field station, observatory, etc.)"
  type DMSPResearchFacility {
    name: String!
    type: String!

    facility_id: DMSPIdentifier
  }

  "Identifiers for works related to the DMSP"
  type DMSPRelatedIdentifier {
    descriptor: String!
    identifier: String!
    type: String!
    work_type: String!
  }

  "The template used to produce the DMSP (specific to the dmphub_provenance)"
  type DMSPTemplate {
    id: String!
    title: String!
  }

  "A version of the DMSP"
  type DMSPVersion {
    timestamp: String!
    url: String!
  }
`;
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  "A Data Management and Sharing Plan (DMSP)"
  type DMP {
    # Required
    contact: Contact!
    created: String!
    dataset: [Dataset!]!
    dmp_id: Identifier!
    modified: String!
    project: [Project!]!
    title: String!

    # Optional
    contributor: [Contributor]
    cost: [Cost]
    description: String
    dmphub_provenance_id: String
    dmphub_versions: [Version!]
    dmproadmap_featured: String
    dmproadmap_privacy: String
    dmproadmap_template: Template
    dmproadmap_related_identifiers: [RelatedIdentifier!]
    dmproadmap_research_facilities: [ResearchFacility!]
    ethical_issues_exist: String
    ethical_issues_description: String
    ethical_issues_report: String
    language: String
  }

  "The primary contact for the DMSP"
  type Contact {
    # Required
    name: String!
    mbox: String!
    contact_id: Identifier!

    # Optional
    dmproadmap_affiliation: Affiliation
  }

  "A contributor to the research project"
  type Contributor {
    # Required
    name: String!
    role: [String!]!

    # Optional
    contributor_id: Identifier
    dmproadmap_affiliation: Affiliation
    mbox: String
  }

  "Anticipated costs for the research project"
  type Cost {
    title: String!

    description: String
    currency_code: String
    value: Int
  }

  "An insitutional or organizational affiliation of a contributor"
  type Affiliation {
    name: String!

    affiliation_id: Identifier
  }

  type Identifier {
    type: String!
    identifier: String!
  }

  "The research project associated with the DMSP"
  type Project {
    title: String!

    description: String
    start: String
    end: String
    funding: [Funding!]
  }

  #A funding source for the research project (often tied to the DMSP)"
  type Funding {
    funding_status: String!
    name: String!

    dmproadmap_opportunity_number: String
    dmproadmap_project_number: String
    funder_id: Identifier
    grant_id: Identifier
  }

  "Anticipated research output (represents an 'actual' research output when the dataset_id is popuated)"
  type Dataset {
    title: String!

    type: String
    description: String
    data_quality_assurance: [String!]
    dataset_id: Identifier
    issued: String
    keyword: [String!]
    language: String
    personal_data: String
    sensitive_data: String
    preservation_statement: String
    distribution: [Distribution!]
    metadata: [MetadataStandard!]
    security_and_privacy: [SecurityPrivacyStatement!]
    technical_resource: [TechnicalResource!]
  }

  "A distribution of the research output"
  type Distribution {
    title: String!
    data_access: String!

    access_url: String
    available_until: String
    byte_size: Int
    description: String
    download_url: String
    format: [String!]
    license: [License!]
    host: Host
  }

  "The repository associated with the distribution (e.g. Zenodo, GitHub, GeneBank, etc.)"
  type Host {
    title: String!
    url: String!

    availability: String
    backup_frequency: String
    backup_type: String
    certified_with: String
    description: String
    dmproadmap_host_id: Identifier
    geo_location: String
    pid_system: [String!]
    storage_type: String
    support_versioning: String
  }

  "Licenses for the research output distribution"
  type License {
    license_ref: String!
    start_date: String!
  }

  "Metadata standards used for the research output"
  type MetadataStandard {
    metadata_standard_id: Identifier!

    description: String
    language: String
  }

  "A description of the security and privacy considerations for the research output"
  type SecurityPrivacyStatement {
    title: String!

    description: String
  }

  "A technical resource involved in the production of the research output (e.g. an electron microscope or telescope)"
  type TechnicalResource {
    name: String!

    description: String
    dmproadmap_technical_resource_id: Identifier
  }

  "A place involved with the production of the research project (e.g. a lab, field station, observatory, etc.)"
  type ResearchFacility {
    name: String!
    type: String!

    facility_id: Identifier
  }

  "Identifiers for works related to the DMSP"
  type RelatedIdentifier {
    descriptor: String!
    identifier: String!
    type: String!
    work_type: String!
  }

  "The template used to produce the DMSP (specific to the dmphub_provenance)"
  type Template {
    id: String!
    title: String!
  }

  "A version of the DMSP"
  type Version {
    timestamp: String!
    url: String!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]

    getDMP(PK: String!, SK: String): DMP
    dmps: [DMP]
  }


  type Mutation {
    createDMP(input: DMPInput!): DMP
    updateDMP(PK: String!, input: DMPInput!): DMP
    deleteDMP(PK: String!): String
  }


  input DMPInput {
    title: String!
    modified: String!
    created: String!
    contact: ContactInput!
    dmp_id: DMPIDInput!
    project: [ProjectInput!]!
    dataset: [DatasetInput!]!
  }

  input ContactInput {
    name: String!
    dmproadmap_affiliation: AffiliationInput!
    mbox: String!
    contact_id: ContactIDInput!
  }

  input AffiliationInput {
    name: String!
    affiliation_id: AffiliationIDInput!
  }

  input AffiliationIDInput {
    type: String!
    identifier: String!
  }

  input ContactIDInput {
    type: String!
    identifier: String!
  }

  input DMPIDInput {
    identifier: String!
    type: String!
  }

  input ProjectInput {
    title: String!
  }

  input DatasetInput {
    title: String!
  }
`;

export default typeDefs;

import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    "Search for a related work"
    relatedWorks(projectId: Int): [RelatedWork]

    "Fetch a specific related work"
    relatedWork(id: Int!): RelatedWork
  }

  "A metadata standard used when describing a research output"
  type RelatedWork {
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
    errors: RelatedWorkErrors

    "The related work's relationship to the research project (e.g. references, isReferencedBy, etc.)"
    descriptor: RelatedWorkDescriptor
    "The type of the related work (e.g. dataset, software, etc.)"
    workType: RelatedWorkType
    "The unique identifier for the work (e.g. DOI, URL, etc."
    identifier: String
  }

  "A collection of errors related to the MetadataStandard"
  type RelatedWorkErrors {
    "General error messages such as the object already exists"
    general: String

    descriptor: String
    workType: String
    identifier: String
  }

  "Relationship types between a plan and a related work (derived from the DataCite metadata schema"
  enum RelatedWorkDescriptor {
    IS_CITED_BY
    CITES
    IS_SUPPLEMENT_TO
    IS_SUPPLEMENTED_BY
    IS_CONTINUED_BY
    CONTINUES
    IS_DESCRIBED_BY
    DESCRIBES
    HAS_METADATA
    IS_METADATA_FOR
    HAS_VERSION
    IS_VERSION_OF
    IS_NEW_VERSION_OF
    IS_PREVIOUS_VERSION_OF
    IS_PART_OF
    HAS_PART
    IS_PUBLISHED_IN
    IS_REFERENCED_BY
    REFERENCES
    IS_DOCUMENTED_BY
    DOCUMENTS
    IS_COMPILED_BY
    COMPILES
    IS_VARIANT_FORM_OF
    IS_ORIGINAL_FORM_OF
    IS_IDENTICAL_TO
    IS_REVIEWED_BY
    REVIEWS
    IS_DERIVED_FROM
    IS_SOURCE_OF
    IS_REQUIRED_BY
    REQUIRES
    OBSOLETES
    IS_OBSOLETED_BY
    IS_COLLECTED_BY
    COLLECTS
    IS_TRANSLATION_OF
    HAS_TRANSLATION
  }

  "The type of work that is related to the plan (derived from the DataCite metadata schema)"
  enum RelatedWorkType {
    AUDIOVISUAL
    BOOK
    BOOK_CHAPTER
    COLLECTION
    COMPUTATIONAL_NOTEBOOK
    CONFERENCE_PAPER
    CONFERENCE_PROCEEDING
    DATA_PAPER
    DATASET
    DISSERTATION
    EVENT
    IMAGE
    INSTRUMENT
    INTERACTIVE_RESOURCE
    JOURNAL
    JOURNAL_ARTICLE
    MODEL
    OUTPUT_MANAGEMENT_PLAN
    PEER_REVIEW
    PHYSICAL_OBJECT
    PREPRINT
    PROJECT
    REPORT
    SERVICE
    SOFTWARE
    SOUND
    STANDARD
    STUDY_REGISTRATION
    TEXT
    WORKFLOW
    OTHER
  }
`;

import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the best practice VersionedGuidance for a given Tag ID"
    bestPracticeGuidance(tagId: Int!): [VersionedGuidance!]!
    "Get all VersionedGuidance for a given affiliation and Tag ID"
    versionedGuidance(affiliationId: String!, tagId: Int!): [VersionedGuidance!]!
  }

  "A snapshot of a GuidanceGroup when it was published"
  type VersionedGuidanceGroup {
    "The unique identifier for the Object"
    id: Int
    "The user who created the Object"
    createdById: Int
    "The timestamp when the Object was created"
    created: String
    "The user who last modified the Object"
    modifiedById: Int
    "The timestamp when the Object was last modified"
    modified: String
    "Errors associated with the Object"
    errors: VersionedGuidanceGroupErrors

    "The GuidanceGroup this is a snapshot of"
    guidanceGroupId: Int!
    "The version number of this snapshot"
    version: Int
    "Whether this is a best practice VersionedGuidanceGroup"
    bestPractice: Boolean!
    "Whether this is the currently active version"
    active: Boolean!
    "The name of the VersionedGuidanceGroup"
    name: String!

    "The GuidanceGroup this is a snapshot of"
    guidanceGroup: GuidanceGroup
    "The VersionedGuidance items in this group"
    versionedGuidance: [VersionedGuidance!]
  }

  "A snapshot of a Guidance item when its GuidanceGroup was published"
  type VersionedGuidance {
    "The unique identifier for the Object"
    id: Int
    "The user who created the Object"
    createdById: Int
    "The timestamp when the Object was created"
    created: String
    "The user who last modified the Object"
    modifiedById: Int
    "The timestamp when the Object was last modified"
    modified: String
    "Errors associated with the Object"
    errors: VersionedGuidanceErrors

    "The VersionedGuidanceGroup this belongs to"
    versionedGuidanceGroupId: Int!
    "The Guidance this is a snapshot of"
    guidanceId: Int
    "The guidance text content"
    guidanceText: String
    "The primary Tag this Guidance is associated with"
    tagId: Int!

    "The VersionedGuidanceGroup this belongs to"
    versionedGuidanceGroup: VersionedGuidanceGroup
    "The Guidance this is a snapshot of"
    guidance: Guidance
    "The primary Tag this Guidance is associated with"
    tag: Tag
    "All Tags associated with this VersionedGuidance"
    tags: [Tag!]
  }

  "A collection of errors related to VersionedGuidanceGroup"
  type VersionedGuidanceGroupErrors {
    "General error messages such as the object already exists"
    general: String

    guidanceGroupId: String
    version: String
    bestPractice: String
    active: String
    name: String
  }

  "A collection of errors related to VersionedGuidance"
  type VersionedGuidanceErrors {
    "General error messages such as the object already exists"
    general: String

    versionedGuidanceGroupId: String
    guidanceId: String
    guidanceText: String
    tagId: String
  }
`;

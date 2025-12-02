import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all Guidance items for a specific GuidanceGroup"
    guidanceByGroup(guidanceGroupId: Int!): [Guidance!]!
    "Get a specific Guidance item by ID"
    guidance(guidanceId: Int!): Guidance
  }

  extend type Mutation {
    "Create a new Guidance item"
    addGuidance(input: AddGuidanceInput!): Guidance!
    "Update an existing Guidance item"
    updateGuidance(input: UpdateGuidanceInput!): Guidance!
    "Delete a Guidance item"
    removeGuidance(guidanceId: Int!): Guidance!
  }

  "A Guidance item contains guidance text and associated tag id"
  type Guidance {
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
    errors: GuidanceErrors

    "The GuidanceGroup this Guidance belongs to"
    guidanceGroupId: Int!
    "The guidance text content"
    guidanceText: String
    "The tag id associated with this Guidance"
    tagId: Int

    "The GuidanceGroup this Guidance belongs to"
    guidanceGroup: GuidanceGroup

    "User who modified the guidance last"
    user: User
  }

  "A collection of errors related to Guidance"
  type GuidanceErrors {
    "General error messages such as the object already exists"
    general: String

    guidanceGroupId: String
    guidanceText: String
    tagId: String
  }

  "Input for adding a new Guidance item"
  input AddGuidanceInput {
    "The GuidanceGroup this Guidance belongs to"
    guidanceGroupId: Int!
    "The guidance text content"
    guidanceText: String
    "The tag id associated with this Guidance"
    tagId: Int
  }

  "Input for updating a Guidance item"
  input UpdateGuidanceInput {
    "The unique identifier for the Guidance"
    guidanceId: Int!
    "The guidance text content"
    guidanceText: String
    "The tag id associated with this Guidance"
    tagId: Int
  }
`;

import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the Sections that belong to the associated templateId"
    sections(templateId: Int!): [Section]!
    "Get the specified section"
    section(sectionId: Int!): Section
  }

  extend type Mutation {
    "Create a new Section. Leave the 'copyFromSectionId' blank to create a new section from scratch"
    addSection(input: AddSectionInput!): Section!     
    "Update a Section"
    updateSection(input: UpdateSectionInput!): Section!
    "Delete a section"
    removeSection(sectionId: Int!): Section!
  }

  "A Section that contains a list of questions in a template"
  type Section {
    "The unique identifer for the Object"
    id: Int!
    "The order in which the section will be displayed in the template"
    displayOrder: Int!
    "The section title"
    name: String!
    "The section introduction"
    introduction: String
    "Requirements that a user must consider in this section"
    requirements: String
    "The guidance to help user with section"
    guidance: String
    "The Tags associated with this section"
    tags: [Tag!]!
    "Indicates whether or not the section has changed since the template was last published"
    isDirty: Boolean!
    "The user who created the Object"
    createdById: Int!
    "The timestamp when the Object was created"
    created: DateTimeISO!
    "The user who last modified the Object"
    modifiedById: Int
    "The timestamp when the Object was last modifed"
    modified: DateTimeISO
    "Errors associated with the Object"
    errors: [String!]
  }

  "Input for adding a new section"
  input AddSectionInput {
    templateId: Int!
    name: String!
    copyFromSectionId: Int
    introduction: String
    requirements: String
    guidance: String
    tags: [TagInput!]
  }

  "Input for updating a section"
  input UpdateSectionInput {
    sectionId: Int!
    name: String
    introduction: String
    requirements: String
    guidance: String
    tags: [TagInput!]
  }

  "Input for Tag operations"
  input TagInput {
    id: Int
    name: String!
    description: String
  }
`;

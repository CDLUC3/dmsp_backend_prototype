import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the Sections that belong to the associated templateId"
    sections(templateId: Int!): [Section]
    "Get the specified section"
    section(sectionId: Int!): Section
  }

  extend type Mutation {
    "Create a new Section. Leave the 'copyFromVersionedSectionId' blank to create a new section from scratch"
    addSection(input: AddSectionInput!): Section!     
    "Update a Section"
    updateSection(input: UpdateSectionInput!): Section!
    "Delete a section"
    removeSection(sectionId: Int!): Section!
  }

  "A Section that contains a list of questions in a template"
  type Section {
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
    errors: [String!]
    
    "The template ID that the section belongs to"
    templateId: Int
    "The template that the section is associated with"
    template: Template
    "The section title"
    name: String!
    "The section introduction"
    introduction: String
    "Requirements that a user must consider in this section"
    requirements: String
    "The guidance to help user with section"
    guidance: String
    "The order in which the section will be displayed in the template"
    displayOrder: Int
    "The Tags associated with this section. A section might not have any tags"
    tags: [Tag]
    "Indicates whether or not the section has changed since the template was last published"
    isDirty: Boolean!
  }

  "Input for adding a new section"
  input AddSectionInput {
    "The id of the template that the section belongs to"
    templateId: Int!
    "The section name"
    name: String!
    "The Section you want to copy from"
    copyFromVersionedSectionId: Int
    "The section introduction"
    introduction: String
    "Requirements that a user must consider in this section"
    requirements: String
    "The guidance to help user with section"
    guidance: String
    "The order in which the section will be displayed in the template"
    displayOrder: Int
    "The Tags associated with this section. A section might not have any tags"
    tags: [TagInput!]
  }

  "Input for updating a section"
  input UpdateSectionInput {
   "The unique identifer for the Section"
    sectionId: Int!
    "The section name"
    name: String
    "The section introduction"
    introduction: String
    "Requirements that a user must consider in this section"
    requirements: String
    "The guidance to help user with section"
    guidance: String
    "The order in which the section will be displayed in the template"
    displayOrder: Int
    "The Tags associated with this section. A section might not have any tags"
    tags: [TagInput!]
  }

  "Input for Tag operations"
  input TagInput {
    "The unique identifier for the Tag"
    id: Int
    "The name of the Tag"
    name: String!
    "The description of the Tag"
    description: String
  }

`;


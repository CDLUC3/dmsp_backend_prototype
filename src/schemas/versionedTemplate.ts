import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the VersionedTemplate for the specified Template (a.k. the Template history)"
    templateVersions(templateId: Int!): [VersionedTemplate]
    "Search for VersionedTemplate whose name or owning Org's name contains the search term"
    publishedTemplates(term: String): [VersionedTemplate]
    "Get the VersionedTemplates that belong to the current user's affiliation (user must be an Admin)"
    myVersionedTemplates: [VersionedTemplate]
  }

  "Template version type"
  enum TemplateVersionType {
    "Draft - saved state for internal review"
    DRAFT
    "Published - saved state for use when creating DMPs"
    PUBLISHED
  }

  "A snapshot of a Template when it became published. DMPs are created from published templates"
  type VersionedTemplate {
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
    errors: VersionedTemplateErrors

    "The template that this published version stems from"
    template: Template
    "The major.minor semantic version"
    version: String!
    "The publisher of the Template"
    versionedBy: User
    "The type of version: Published or Draft (default: Draft)"
    versionType: TemplateVersionType
    "A comment/note the user enters when publishing the Template"
    comment: String
    "Whether or not this is the version provided when users create a new DMP (default: false)"
    active: Boolean!

    "The name/title of the template"
    name: String!
    "A description of the purpose of the template"
    description: String
    "The owner of the Template"
    owner: Affiliation
    "The template's availability setting: Public is available to everyone, Private only your affiliation"
    visibility: TemplateVisibility!
    "Whether or not this Template is designated as a 'Best Practice' template"
    bestPractice: Boolean!

    "The VersionedSections that go with the VersionedTemplate"
    versionedSections: [VersionedSection!]
  }

  "A collection of errors related to the VersionedTemplate"
  type VersionedTemplateErrors {
    "General error messages such as the object already exists"
    general: String

    templateId: String
    version: String
    versionedById: String
    versionType: String
    comment: String

    name: String
    description: String
    ownerId: String
    visibility: String
    versionedSectionIds: String
  }
`;
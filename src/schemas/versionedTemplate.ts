import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the VersionedTemplate for the specified Template (a.k. the Template history)"
    templateVersions(templateId: Int!): [VersionedTemplate]

    "Get the DMPTool Best Practice VersionedTemplate"
    bestPracticeTemplates: [VersionedTemplate]
    "Search for VersionedTemplate whose name or owning Org's name contains the search term"
    publishedTemplates(term: String!): [VersionedTemplate]
    "Get the specified VersionedTemplate"
    publishedTemplate(publishedTemplateId: Int!): VersionedTemplate
  }

  extend type Mutation {
    "Unpublish the specified PublishedTemplate"
    unpublishTemplate(publishedTemplateId: Int!): Boolean
  }

  "Template version type"
  enum VersionType {
    "Draft - saved state for internal review"
    Draft
    "Published - saved state for use when creating DMPs"
    Published
  }

  "A snapshot of a Template when it became published. DMPs are created from published templates"
  type VersionedTemplate {
    "The unique identifer for the template"
    id: Int!
    "The template that this published version stems from"
    template: Template
    "The major.minor semantic version"
    version: String!
    "The publisher of the Template"
    versionedBy: User
    "The type of version: Published or Draft (default: Draft)"
    versionType: VersionType
    "A comment/note the user enters when publishing the Template"
    comment: String
    "Whether or not this is the version provided when users create a new DMP (default: false)"
    active: Boolean!

    "The name/title of the template"
    name: String!
    "A description of the purpose of the template"
    description: String
    "The owner of the Template"
    owner: Affiliation!
    "The template's availability setting: Public is available to everyone, Private only your affiliation"
    visibility: Visibility!
    "Whether or not this Template is designated as a 'Best Practice' template"
    bestPractice: Boolean!

    "The timestamp when the version was created"
    created: DateTimeISO!
    "The user who created the version"
    createdById: Int
    "The timestamp when the version was modified (typically when its 'active' flag changes)"
    modified: DateTimeISO!
    "The user who modfiied the version"
    modifiedById: Int
  }
`;
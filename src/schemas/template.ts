import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the Templates that belong to the current user's affiliation (user must be an Admin)"
    myTemplates(): [Template]
    "Get the specified Template (user must be an Admin)"
    template(templateId: Int!): Template
    "Get all of the PublishedTemplates for the specified Template (a.k. the Template history)"
    templateVersions(templateId: number): Promise<PublishedTemplate[]>

    "Get the DMPTool Best Practice PublishedTemplates"
    bestPracticeTemplates(): [PublishedTemplate]
    "Search for PublishedTemplates whose name or owning Org's name contains the search term"
    publishedTemplates(term: String!): [PublishedTemplate]
    "Get the specified PublishedTemplate"
    publishedTemplate(publishedTemplateId: Int!): PublishedTemplate
  }

  extend type Mutation {
    "Create a new Template"
    addTemplate(name: String!): Template
    "Create a Template from another PublishedTemplate"
    copyTemplate(publishedTemplateId: Int!, name: String!): Template
    "Update a Template"
    updateTemplate(templateId: Int!, name: String!, visibility: Visibility!): Template
    "Archive a Template (unpublishes any associated PublishedTemplate"
    archiveTemplate(templateId: Int!): boolean

    "Publish a Template"
    publishTemplate(templateId: Int!, comment: String): PublishedTemplate
    "Unpublish the specified PublishedTemplate"
    unpublishTemplate(publishedTemplateId: Int!): boolean
  }

  "Template visibility"
  enum Visibility {
    "Visible only to users of your institution"
    Private
    "Visible to all users"
    Public
  }

  "A Template used to create DMPs"
  type Template {
    "The unique identifer for the template"
    id: Int!
    "The name/title of the template"
    name: String!
    "The affiliation that the template belongs to"
    affiliation: Affiliation!
    "The owner of the Template"
    owner: User!
    "The template's availability setting: Public is available to everyone, Private only your affiliation"
    visibility: Visibility!
    "The current published version"
    currentVersion: Int!
    "Whether or not the Template has had any changes since it was last published"
    isDirty: Boolean!
    "The timestamp when the template was created"
    created: DateTimeISO!
    "The timestamp when the template was modifed"
    modified: DateTimeISO!
  }

  "A snapshot of a Template when it became published. DMPs are created from published templates"
  type PublishedTemplate {
    "The unique identifer for the template"
    id: Int!
    "The template that this published version stems from"
    template: Template!
    "The major.minor semantic version"
    version: String!
    "The name/title of the template"
    name: String!
    "The affiliation that the template belongs to"
    affiliation: Affiliation!
    "The owner of the Template"
    owner: User!
    "The publisher of the Template"
    publishedBy: User!
    "The template's availability setting: Public is available to everyone, Private only your affiliation"
    visibility: Visibility!
    "A comment/note the user enters when publishing the Template"
    comment: String
    "Whether or not this is the version provided when users create a new DMP"
    active: Boolean!
    "The timestamp when the template was created"
    created: DateTimeISO!
  }
`;

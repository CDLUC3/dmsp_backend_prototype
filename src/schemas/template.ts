import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the Templates that belong to the current user's affiliation (user must be an Admin)"
    templates: [Template]
    "Get the specified Template (user must be an Admin)"
    template(templateId: Int!): Template
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
    "Create a new Template"
    addTemplate(name: String!): Template
    "Create a Template from another PublishedTemplate"
    copyTemplate(publishedTemplateId: Int!, name: String!): Template
    "Update a Template"
    updateTemplate(templateId: Int!, name: String!, visibility: Visibility!): Template
    "Archive a Template (unpublishes any associated PublishedTemplate"
    archiveTemplate(templateId: Int!): Boolean

    "Save a Draft"
    draftTemplate(templateId: Int!, comment: String): VersionedTemplate
    "Publish a Template"
    publishTemplate(templateId: Int!, comment: String): VersionedTemplate
    "Unpublish the specified PublishedTemplate"
    unpublishTemplate(publishedTemplateId: Int!): Boolean
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
    "The template that this one was derived from"
    sourceTemplateId: Int
    "The name/title of the template"
    name: String!
    "A description of the purpose of the template"
    description: String
    "The affiliation that the template belongs to"
    owner: Affiliation!
    "The template's availability setting: Public is available to everyone, Private only your affiliation"
    visibility: Visibility!
    "The current published version"
    currentVersion: String
    "Whether or not the Template has had any changes since it was last published"
    isDirty: Boolean!
    "Whether or not this Template is designated as a 'Best Practice' template"
    bestPractice: Boolean!

    "Users from different affiliations who have been invited to collaborate on this template"
    collaborators: [TemplateCollaborator!]

    "The user who created the Template"
    createdById: Int
    "The timestamp when the template was created"
    created: DateTimeISO!
    "The user who modified the Template"
    modifiedById: Int
    "The timestamp when the template was modifed"
    modified: DateTimeISO!
  }
`;

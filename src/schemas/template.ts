import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the Templates that belong to the current user's affiliation (user must be an Admin)"
    templates: [Template]
    "Get the specified Template (user must be an Admin)"
    template(templateId: Int!): Template
    "Get all public templates"
    publicTemplates: [Template]
  }

  extend type Mutation {
    "Create a new Template. Leave the 'copyFromTemplateId' blank to create a new template from scratch"
    addTemplate(name: String!, copyFromTemplateId: Int): Template
    "Update a Template"
    updateTemplate(templateId: Int!, name: String!, visibility: TemplateVisibility!, bestPractice: Boolean): Template
    "Archive a Template (unpublishes any associated PublishedTemplate"
    archiveTemplate(templateId: Int!): Boolean

    "Publish the template or save as a draft"
    createTemplateVersion(templateId: Int!, comment: String, versionType: TemplateVersionType, visibility: TemplateVisibility!): Template
  }

  "Template visibility"
  enum TemplateVisibility {
    "Visible only to users of your institution"
    PRIVATE
    "Visible to all users"
    PUBLIC
  }

  "A Template used to create DMPs"
  type Template {
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

    "The template that this one was derived from"
    sourceTemplateId: Int
    "The name/title of the template"
    name: String!
    "A description of the purpose of the template"
    description: String
    "The affiliation that the template belongs to"
    owner: Affiliation
    "The template's availability setting: Public is available to everyone, Private only your affiliation"
    visibility: TemplateVisibility!
    "The last published version"
    latestPublishVersion: String
    "The last published date"
    latestPublishDate: String
    "Whether or not the Template has had any changes since it was last published"
    isDirty: Boolean!
    "Whether or not this Template is designated as a 'Best Practice' template"
    bestPractice: Boolean!
    "The Sections associated with the template"
    sections: [Section]
    "The template's language"
    languageId: String!

    "Users from different affiliations who have been invited to collaborate on this template"
    collaborators: [TemplateCollaborator!]
  }
`;

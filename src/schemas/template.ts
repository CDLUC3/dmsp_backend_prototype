import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Return a specific template"
    template(templateId: Int!): Template

    "Return all of the templates"
    templates: [Template]
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
    "The timestamp when the template was created"
    created: DateTimeISO!
    "The timestamp when the template was modifed"
    modified: DateTimeISO!
    "A description of the purpose of the template"
    description: String
  }
`;

// "The template's visibility setting"
// visibility: Visibility!
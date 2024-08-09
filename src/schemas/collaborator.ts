import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the Users that belong to another affiliation that can edit the Template"
    templateCollaborators(templateId: Int!): [TemplateCollaborator]
  }

  extend type Mutation {
    "Add a collaborator to a Template"
    addTemplateCollaborator(templateId: Int!, email: String!): Boolean
    "Remove a TemplateCollaborator from a Template"
    removeTemplateCollaborator(templateId: Int!, email: String!): Boolean
  }

  "A user that that belongs to a different affiliation that can edit the Template"
  type TemplateCollaborator {
    "The template the collaborator may edit"
    template: Template
    "The collaborator's email"
    email: String!
    "The person who invited the collaborator"
    invitedBy: User
    "The collaborator (if they have an account)"
    user: User
    "The timestamp when the collaborator was added"
    created: DateTimeISO!
  }
`;

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
    id: Int!
    "The template the collaborator may edit"
    template: Template
    "The collaborator's email"
    email: String!
    "The collaborator (if they have an account)"
    user: User
    "The user who invited the collaborator"
    invitedBy: User
    "The timestamp when the collaborator was added"
    created: DateTimeISO!
    "The user who created the collaborator"
    createdById: Int
    "The timestamp when the collaborator was added"
    modified: DateTimeISO!
    "The user who last modified the collaborator"
    modifiedById: Int
  }
`;

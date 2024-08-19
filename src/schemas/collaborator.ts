import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the Users that belong to another affiliation that can edit the Template"
    templateCollaborators(templateId: Int!): [TemplateCollaborator]
  }

  extend type Mutation {
    "Add a collaborator to a Template"
    addTemplateCollaborator(templateId: Int!, email: String!): TemplateCollaborator
    "Remove a TemplateCollaborator from a Template"
    removeTemplateCollaborator(templateId: Int!, email: String!): Boolean
  }

  "A user that that belongs to a different affiliation that can edit the Template"
  type TemplateCollaborator {
    "The unique identifer for the Object"
    id: Int
    "The user who created the Object"
    createdById: Int
    "The timestamp when the Object was created"
    created: DateTimeISO
    "The user who last modified the Object"
    modifiedById: Int
    "The timestamp when the Object was last modifed"
    modified: DateTimeISO

    "The template the collaborator may edit"
    template: Template
    "The collaborator's email"
    email: String!
    "The collaborator (if they have an account)"
    user: User
    "The user who invited the collaborator"
    invitedBy: User
  }
`;

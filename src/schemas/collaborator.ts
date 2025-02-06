import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the Users that belong to another affiliation that can edit the Template"
    templateCollaborators(templateId: Int!): [TemplateCollaborator]

    "Get all of the Users that are collaborators for the Plan"
    planCollaborators(planId: Int!): [PlanCollaborator]

    "Search for a User to add as a collaborator"
    findCollaborator(term: String): [CollaboratorSearchResult]
  }

  extend type Mutation {
    "Add a collaborator to a Template"
    addTemplateCollaborator(templateId: Int!, email: String!): TemplateCollaborator
    "Remove a TemplateCollaborator from a Template"
    removeTemplateCollaborator(templateId: Int!, email: String!): TemplateCollaborator

    "Add a collaborator to a Plan"
    addPlanCollaborator(planId: Int!, email: String!): PlanCollaborator
    "Chnage a collaborator's accessLevel on a Plan"
    updatePlanCollaborator(planCollaboratorId: Int!, accessLevel: PlanCollaboratorAccessLevel!): PlanCollaborator
    "Remove a PlanCollaborator from a Plan"
    removePlanCollaborator(planCollaboratorId: Int!): PlanCollaborator
  }

  enum PlanCollaboratorAccessLevel {
    "The user is ONLY able to comment on the Plan's answers"
    COMMENTER
    "The user is able to comment and edit the Plan's answers, add/edit/delete contributors and research outputs"
    EDITOR
    "The user is able to perform all actions on a Plan (typically restricted to the owner/creator)"
    ADMIN
  }

  "A user that that belongs to a different affiliation that can edit the Template"
  type TemplateCollaborator {
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
    errors: TemplateCollaboratorErrors

    "The template the collaborator may edit"
    template: Template
    "The collaborator's email"
    email: String!
    "The collaborator (if they have an account)"
    user: User
    "The user who invited the collaborator"
    invitedBy: User
  }

  "A user that that belongs to a different affiliation that can edit the Plan"
  type PlanCollaborator {
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

    "The plan the collaborator may edit"
    plan: Plan
    "The collaborator's email"
    email: String!
    "The collaborator (if they have an account)"
    user: User
    "The user who invited the collaborator"
    invitedBy: User
    "The user's access level"
    accessLevel: PlanCollaboratorAccessLevel
  }

  "A collection of errors related to the TemplateCollaborator"
  type TemplateCollaboratorErrors {
    "General error messages such as the object already exists"
    general: String

    templateId: String
  }

  "The result of the findCollaborator query"
  type CollaboratorSearchResult {
    "The unique identifer for the Object"
    id: Int
    "The collaborator's first/given name"
    givenName: String
    "The collaborator's last/sur name"
    surName: String
    "The collaborator's ORCID"
    orcid: String
    "The collaborator's affiliation"
    affiliation: Affiliation
  }
`;

import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the Users that a contributors to the research project"
    projectContributors(projectId: Int!): [ProjectContributor]

    "Get a specific contributor on the research project"
    projectContributor(projectContributorId: Int!): ProjectContributor

    "Get all of the Users that are contributors for the specific Plan"
    planContributors(planId: Int!): [PlanContributor]
  }

  extend type Mutation {
    "Add a contributor to a research project"
    addProjectContributor(input: AddProjectContributorInput!): ProjectContributor
    "Update a contributor on the research project"
    updateProjectContributor(input: updateProjectContributorInput!): ProjectContributor
    "Remove a research project contributor"
    removeProjectContributor(projectContributorId: Int!): ProjectContributor

    "Add a Contributor to a Plan"
    addPlanContributor(planId: Int!, projectContributorId: Int!, roles: [String!]): PlanContributor
    "Chnage a Contributor's accessLevel on a Plan"
    updatePlanContributor(planContributorId: Int!, roles: [String!]): PlanContributor
    "Remove a PlanContributor from a Plan"
    removePlanContributor(planContributorId: Int!): PlanContributor
  }

  "A person involved with a research project"
  type ProjectContributor {
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
    errors: ProjectContributorErrors

    "The research project"
    project: Project
    "The contributor's affiliation"
    affiliation: Affiliation
    "The contributor's first/given name"
    givenName: String
    "The contributor's last/sur name"
    surName: String
    "The contributor's ORCID"
    orcid: String
    "The contributor's email address"
    email: String
    "The roles the contributor has on the research project"
    contributorRoles: [ContributorRole!]
  }

  "A contributor associated with a plan"
  type PlanContributor {
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
    errors: PlanContributorErrors

    "The plan that the contributor is associated with"
    plan: Plan
    "The project contributor"
    projectContributor: ProjectContributor
    "Whether or not the contributor the primary contact for the Plan"
    isPrimaryContact: Boolean
    "The roles associated with the contributor"
    contributorRoles: [ContributorRole!]
  }

  "A collection of errors related to the ProjectContributor"
  type ProjectContributorErrors {
    "General error messages such as the object already exists"
    general: String

    projectId: String
    affiliationId: String
    givenName: String
    surName: String
    orcid: String
    email: String
    contributorRoleIds: String
  }

  "A collection of errors related to the PlanContributor"
  type PlanContributorErrors {
    "General error messages such as affiliation already exists"
    general: String
    "The project that the contributor is associated with"
    projectId: String
    "The project contributor"
    projectContributorId: String
    "The isPrimaryContact flag"
    primaryContact: String
    "The roles associated with the contributor"
    contributorRoleIds: String
  }

  input AddProjectContributorInput {
    "The research project"
    projectId: Int!
    "The contributor's affiliation URI"
    affiliationId: String
    "The contributor's first/given name"
    givenName: String
    "The contributor's last/sur name"
    surName: String
    "The contributor's ORCID"
    orcid: String
    "The contributor's email address"
    email: String
    "The roles the contributor has on the research project"
    contributorRoleIds: [Int!]
  }

  input updateProjectContributorInput {
    "The project contributor"
    projectContributorId: Int!
    "The contributor's affiliation URI"
    affiliationId: String
    "The contributor's first/given name"
    givenName: String
    "The contributor's last/sur name"
    surName: String
    "The contributor's ORCID"
    orcid: String
    "The contributor's email address"
    email: String
    "The roles the contributor has on the research project"
    contributorRoleIds: [Int!]
  }
`;

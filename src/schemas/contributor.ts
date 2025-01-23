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
    errors: [String!]

    "The research project"
    project: Project
    "The contributor's affiliation"
    affiliation: Affiliation
    "The contributor's first/given name"
    givenName: String
    "The contributor's last/sur name"
    surname: String
    "The contributor's ORCID"
    orcid: String
    "The contributor's email address"
    email: String
    "The roles the contributor has on the research project"
    contributorRoles: [ContributorRole!]
  }

  "A person involved with the research project who will appear in the Plan's citation and landing page"
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
    errors: [String!]

    "The Plan"
    plan: Plan
    "The contributor's affiliation"
    ProjectContributor: ProjectContributor
    "The roles the contributor has for this specific plan (can differ from the project)"
    contributorRoles: [ContributorRole!]
  }

  input AddProjectContributorInput {
    "The research project"
    projectId: Int!
    "The contributor's affiliation URI"
    affiliationId: String
    "The contributor's first/given name"
    givenName: String
    "The contributor's last/sur name"
    surname: String
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
    surname: String
    "The contributor's ORCID"
    orcid: String
    "The contributor's email address"
    email: String
    "The roles the contributor has on the research project"
    contributorRoleIds: [Int!]
  }
`;

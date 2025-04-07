import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the Users that a Funders to the research project"
    projectFunders(projectId: Int!): [ProjectFunder]

    "Get a specific ProjectFunder"
    projectFunder(projectFunderId: Int!): ProjectFunder

    "Get all of the Funders for the specific Plan"
    planFunders(planId: Int!): [PlanFunder]
  }

  extend type Mutation {
    "Add a Funder to a research project"
    addProjectFunder(input: AddProjectFunderInput!): ProjectFunder
    "Update a Funder on the research project"
    updateProjectFunder(input: UpdateProjectFunderInput!): ProjectFunder
    "Remove a research project Funder"
    removeProjectFunder(projectFunderId: Int!): ProjectFunder

    "Add a Funder to a Plan"
    addPlanFunder(planId: Int!, projectFunderId: Int!): PlanFunder
    "Remove a PlanFunder from a Plan"
    removePlanFunder(planFunderId: Int!): PlanFunder
  }

  "The status of the funding"
  enum ProjectFunderStatus {
    "The project will be submitting a grant, or has not yet heard back from the funder"
    PLANNED
    "The funder did not award the project"
    DENIED
    "The funding has been awarded to the project"
    GRANTED
  }

  "A funder affiliation that is supporting a research project"
  type ProjectFunder {
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
    errors: ProjectFunderErrors

    "The project that is seeking (or has aquired) funding"
    project: Project
    "The funder"
    affiliation: Affiliation
    "The status of the funding resquest"
    status: ProjectFunderStatus
    "The funder's unique id/url for the research project (normally assigned after the grant has been awarded)"
    funderProjectNumber: String
    "The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded)"
    grantId: String
    "The funder's unique id/url for the call for submissions to apply for a grant"
    funderOpportunityNumber: String
  }

  "A funder associated with a plan"
  type PlanFunder {
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
    errors: PlanFunderErrors

    "The project that is seeking (or has aquired) funding"
    project: Project
    "The project funder"
    projectFunder: ProjectFunder
  }

  input AddProjectFunderInput {
    "The project"
    projectId: Int!
    "The funder URI"
    affiliationId: String!
    "The status of the funding resquest"
    status: ProjectFunderStatus
    "The funder's unique id/url for the research project (normally assigned after the grant has been awarded)"
    funderProjectNumber: String
    "The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded)"
    grantId: String
    "The funder's unique id/url for the call for submissions to apply for a grant"
    funderOpportunityNumber: String
  }

  input UpdateProjectFunderInput {
    "The project funder"
    projectFunderId: Int!
    "The status of the funding resquest"
    status: ProjectFunderStatus
    "The funder's unique id/url for the research project (normally assigned after the grant has been awarded)"
    funderProjectNumber: String
    "The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded)"
    grantId: String
    "The funder's unique id/url for the call for submissions to apply for a grant"
    funderOpportunityNumber: String
  }

  "A collection of errors related to the ProjectFunder"
  type ProjectFunderErrors {
    "General error messages such as the object already exists"
    general: String

    projectId: String
    affiliationId: String
    status: String
    funderProjectNumber: String
    grantId: String
    funderOpportunityNumber: String
  }

  "A collection of errors related to the PlanFunder"
  type PlanFunderErrors {
    "General error messages such as the object already exists"
    general: String

    projectId: String
    projectFunderId: String
  }
`;

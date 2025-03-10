import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the user's projects"
    myProjects: [Project]

    "Get a specific project"
    project(projectId: Int!): Project
  }

  extend type Mutation {
    "Create a project"
    addProject(title: String!, isTestProject: Boolean): Project
    "Edit a project"
    updateProject(input: UpdateProjectInput): Project
    "Download the plan"
    archiveProject(projectId: Int!): Project
  }

  type Project {
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
    errors: ProjectErrors

    "The name/title of the research project"
    title: String!
    "The research project abstract"
    abstractText: String
    "The estimated date the research project will begin (use YYYY-MM-DD format)"
    startDate: String
    "The estimated date the research project will end (use YYYY-MM-DD format)"
    endDate: String
    "The type of research being done"
    researchDomain: ResearchDomain
    "Whether or not this is test/mock research project"
    isTestProject: Boolean

    "People who are contributing to the research project (not just the DMP)"
    contributors: [ProjectContributor!]
    "The funders who are supporting the research project"
    funders: [ProjectFunder!]
    "The outputs that will be/were created as a reult of the research project"
    outputs: [ProjectOutput!]
    "The plans that are associated with the research project"
    plans: [PlanSearchResult!]
  }

  "A collection of errors related to the Project"
  type ProjectErrors {
    "General error messages such as the object already exists"
    general: String

    title: String
    abstractText: String
    startDate: String
    endDate: String
    researchDomainId: String
    contributorIds: String
    funderIds: String
    outputIds: String
  }

  input UpdateProjectInput {
    "The project's id"
    id: Int!
    "The title of the research project"
    title: String!
    "The research project description/abstract"
    abstractText: String
    "The actual or anticipated start date for the project"
    startDate: String
    "The actual or anticipated end date of the project"
    endDate: String
    "The id of the research domain"
    researchDomainId: Int
    "Whether or not the project is a mock/test"
    isTestProject: Boolean
  }
`;

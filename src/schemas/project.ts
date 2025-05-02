import gql from "graphql-tag";
import {mergeTypeDefs} from "@graphql-tools/merge";
import {typeDefs as contributorTypeDefs} from "./contributor"
import {typeDefs as funderTypeDefs} from "./funder"

export const projectTypeDefs = gql`
  extend type Query {
    "Get all of the user's projects"
    myProjects(cursor: Int, limit: Int): ProjectSearchResults

    "Get a specific project"
    project(projectId: Int!): Project

    "Search for projects within external APIs"
    searchExternalProjects(affiliationId: Int!, awardId: String, awardName: String, awardYear: String, piNames: [String]): [ExternalProject]
  }

  extend type Mutation {
    "Create a project"
    addProject(title: String!, isTestProject: Boolean): Project
    "Edit a project"
    updateProject(input: UpdateProjectInput): Project
    "Download the plan"
    archiveProject(projectId: Int!): Project
    "Import a project from an external source"
    projectImport(input: ProjectImportInput): Project
  }

  type ProjectSearchResult {
    "The unique identifer for the Object"
    id: Int
    "The name/title of the research project"
    title: String
    "The research project abstract"
    abstractText: String
    "The estimated date the research project will begin (use YYYY-MM-DD format)"
    startDate: String
    "The estimated date the research project will end (use YYYY-MM-DD format)"
    endDate: String
    "The type of research being done"
    researchDomain: String
    "Whether or not this is test/mock research project"
    isTestProject: Boolean
    "The id of the person who created the project"
    createdById: Int
    "The name of the person who created the project"
    createdByName: String
    "The timestamp when the project was created"
    created: String
    "The id of the person who last modified the project"
    modifiedById: Int
    "The name of the person who last modified the project"
    modifiedByName: String
    "The timestamp when the project was last modified"
    modified: String
    "The names and access levels of the collaborators"
    collaborators: [ProjectSearchResultCollaborator!]
    "The names and roles of the contributors"
    contributors: [ProjectSearchResultContributor!]
    "The names of the funders"
    funders: [ProjectSearchResultFunder!]
    "Search results errors"
    errors: ProjectErrors
  }

  type ProjectSearchResults {
    "The list of projects"
    projects: [ProjectSearchResult]
    "The id of the last ProjectSearchResult in the results"
    cursor: Int
    "The total number of projects"
    totalCount: Int
    "Any errors associated with the search"
    error: PaginationError
  }

  "DMP Tool Project type"
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

  type ProjectSearchResultCollaborator {
    "The name of the collaborator"
    name: String
    "The access level of the collaborator"
    accessLevel: String
    "The ORCiD ID"
    orcid: String
  }

  type ProjectSearchResultContributor {
    "The name of the contributor"
    name: String
    "The role of the contributor"
    role: String
    "The ORCiD ID"
    orcid: String
  }

  type ProjectSearchResultFunder {
    "The name of the funder"
    name: String
    "The grant id/url"
    grantId: String
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

  "External Project type"
  type ExternalProject {
    "The project title"
    title: String
    "The project description"
    abstractText: String
    "The project start date"
    startDate: String
    "The project end date"
    endDate: String
    "Funding information for this project"
    funders: [ExternalFunding!]
    "Contributor information for this project"
    contributors: [ExternalContributor!]
  }

  type ExternalFunding {
    "The funder's unique id/url for the research project (normally assigned after the grant has been awarded)"
    funderProjectNumber: String
    "The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded)"
    grantId: String
    "The funder's unique id/url for the call for submissions to apply for a grant"
    funderOpportunityNumber: String
  }

  type ExternalContributor {
    "The ROR ID of the contributor's institution"
    affiliationId: String
    "The contributor's first/given name"
    givenName: String
    "The contributor's last/sur name"
    surName: String
    "The contributor's ORCID"
    orcid: String
    "The contributor's email address"
    email: String
  }

  input ProjectImportInput {
    "The external project data"
    project: UpdateProjectInput!
    "The external funding data"
    funding: [AddProjectFunderInput!]
    "The external contributor data"
    contributors: [AddProjectContributorInput!]
  }
`;

export const typeDefs = mergeTypeDefs([projectTypeDefs, funderTypeDefs, contributorTypeDefs]);

import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the outputs for the research project"
    projectOutputs(projectId: Int!): [ProjectOutput]

    "Fetch a single project output"
    projectOutput(projectOutputId: Int!): ProjectOutput

    "The subset of project outputs associated with the sepcified Plan"
    planOutputs(planId: Int!): [ProjectOutput]
  }

  extend type Mutation {
    "Add an output to a research project"
    addProjectOutput(input: AddProjectOutputInput!): ProjectOutput

    "Update an output on the research project"
    updateProjectOutput(input: UpdateProjectOutputInput!): ProjectOutput

    "Remove a research project output"
    removeProjectOutput(projectOutputId: Int!): ProjectOutput

    "Add an Output to a Plan"
    selectProjectOutputForPlan(planId: Int!, projectOutputId: Int!): ProjectOutput

    "Remove an Output from a Plan"
    removeProjectOutputFromPlan(planId: Int!, projectOutputId: Int!): ProjectOutput
  }

  "The status of the funding"
  enum AccessLevel {
    "Access to the output will be public/open"
    UNRESTRICTED
    "Access requests must be reviewed and then permitted"
    CONTROLLED
    "Any other type of access level"
    OTHER
  }

  "Something produced/collected as part of (or as a result of) a research project"
  type ProjectOutput {
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

    "The project associated with the output"
    project: Project
    "The type of output"
    outputType: OutputType
    "The title/name of the output"
    title: String!
    "A description of the output"
    description: String
    "Whether or not the output may contain sensitive data"
    mayContainSensitiveInformation: Boolean
    "Whether or not the output may contain personally identifying information (PII)"
    mayContainPII: Boolean
    "The initial access level that will be allowed for the output"
    initialAccessLevel: AccessLevel!
    "The initial license that will apply to the output"
    initialLicense: License
    "The date the output is expected to be deposited (YYYY-MM-DD format)"
    anticipatedReleaseDate: String

    "The repositories the output will be deposited in"
    repositories: [Repository!]
    "The metadata standards that will be used to describe the output"
    metadataStandards: [MetadataStandard!]
  }

  input AddProjectOutputInput {
    "The id of the project you are adding the output to"
    projectId: Int!
    "The type of output"
    outputTypeId: Int!
    "The title/name of the output"
    title: String!
    "A description of the output"
    description: String
    "Whether or not the output may contain sensitive data"
    mayContainSensitiveInformation: Boolean
    "Whether or not the output may contain personally identifying information (PII)"
    mayContainPII: Boolean
    "The initial access level that will be allowed for the output"
    initialAccessLevel: String
    "The initial license that will apply to the output"
    initialLicenseId: Int
    "The date the output is expected to be deposited (YYYY-MM-DD format)"
    anticipatedReleaseDate: String

    "The repositories the output will be deposited in"
    respositoryIds: [Int!]
    "The metadata standards that will be used to describe the output"
    metadataStandardIds: [Int!]
  }

  input UpdateProjectOutputInput {
    "The id of the output"
    projectOutputId: Int!
    "The type of output"
    outputTypeId: Int!
    "The title/name of the output"
    title: String!
    "A description of the output"
    description: String
    "Whether or not the output may contain sensitive data"
    mayContainSensitiveInformation: Boolean
    "Whether or not the output may contain personally identifying information (PII)"
    mayContainPII: Boolean
    "The initial access level that will be allowed for the output"
    initialAccessLevel: String
    "The initial license that will apply to the output"
    initialLicenseId: Int
    "The date the output is expected to be deposited (YYYY-MM-DD format)"
    anticipatedReleaseDate: String

    "The repositories the output will be deposited in"
    respositoryIds: [Int!]
    "The metadata standards that will be used to describe the output"
    metadataStandardIds: [Int!]
  }
`;

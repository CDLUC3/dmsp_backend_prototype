import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    "Get all the research output types"
    outputTypes: [OutputType]
  }

  "An output collected/produced during or as a result of a research project"
  type OutputType {
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
    errors: OutputTypeErrors

    "The name of the output type"
    name: String!
    "The taxonomy URL of the output type"
    uri: String!
    "A description of the type of output to be collected/generated during the project"
    description: String
  }

  "A collection of errors related to the OutputType"
  type OutputTypeErrors {
    "General error messages such as the object already exists"
    general: String

    uri: String
    name: String
    description: String
  }
`;

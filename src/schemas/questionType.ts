import gql from 'graphql-tag';

export const typeDefs = gql`

  extend type Query {
    "Get all the QuestionTypes"
    questionTypes: [QuestionType]
  }


"The type of Question, such as text field, radio buttons, etc"
type QuestionType {
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
    "Errors associated with the Object"
    errors: [String!]

    "The name of the QuestionType, like 'Short text question'"
    name: String!
    "The description of the QuestionType"
    usageDescription: String!
}
`
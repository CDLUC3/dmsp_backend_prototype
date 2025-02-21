import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the Question Options that belong to the associated questionId"
    questionOptions(questionId: Int!): [QuestionOption]
    "Get the specific Question Option based on question option id"
    questionOption(id: Int!): QuestionOption
  }

extend type Mutation {
    "Create a new QuestionOption"
    addQuestionOption(input: AddQuestionOptionInput!): QuestionOption!
    "Update a QuestionOption"
    updateQuestionOption(input: UpdateQuestionOptionInput!): QuestionOption!
    "Delete a QuestionOption"
    removeQuestionOption(id: Int!): QuestionOption
  }

"QuestionOption always belongs to a Question"
type QuestionOption @cacheControl(inheritMaxAge: true) {
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
    errors: QuestionOptionErrors

    "The question id that the QuestionOption belongs to"
    questionId: Int!
    "The option text"
    text: String!
    "The option order number"
    orderNumber: Int!
    "Whether the option is the default selected one"
    isDefault: Boolean

}

"A collection of errors related to the QuestionOption"
type QuestionOptionErrors {
    "General error messages such as the object already exists"
    general: String

    questionId: String
    text: String
    orderNumber: String
  }

"Input for Question options operations"
input QuestionOptionInput {
  "The text for the question option"
  text: String
  "The order of the question option"
  orderNumber: Int
  "Whether the question option is the default selected one"
  isDefault: Boolean
}

input AddQuestionOptionInput {
    "The question id that the QuestionOption belongs to"
    questionId: Int!
    "The option text"
    text: String!
    "The option order number"
    orderNumber: Int!
    "Whether the option is the default selected one"
    isDefault: Boolean
}

input UpdateQuestionOptionInput {
    "The id of the QuestionOption"
    id: Int
    "The option text"
    text: String!
    "The option order number"
    orderNumber: Int!
    "Whether the option is the default selected one"
    isDefault: Boolean
    "id of parent question"
    questionId: Int
}
`
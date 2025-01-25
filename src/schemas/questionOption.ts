import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the Question Options that belong to the associated questionId"
    questionOptions(questionId: Int!): [QuestionOption]
    "Get the specific Question Option based on questionOptionId"
    questionOption(questionOptionId: Int!): QuestionOption
  }

extend type Mutation {
    "Create a new QuestionOption"
    addQuestionOption(input: AddQuestionOptionInput!): QuestionOption!
    "Update a QuestionOption"
    updateQuestionOption(input: UpdateQuestionOptionInput!): QuestionOption!
    "Delete a QuestionOption"
    removeQuestionOption(questionOptionId: Int!): QuestionOption
  }

"QuestionOption always belongs to a Question"
type QuestionOption {
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

    "The question id that the QuestionOption belongs to"
    questionId: Int!
    "The option text"
    text: String!
    "The option order number"
    orderNumber: Int!
    "Whether the option is the default selected one"
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
    questionOptionId: Int
    "The option text"
    text: String!
    "The option order number"
    orderNumber: Int!
    "Whether the option is the default selected one"
    isDefault: Boolean
}
`
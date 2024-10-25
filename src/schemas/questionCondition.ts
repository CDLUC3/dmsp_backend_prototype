import gql from 'graphql-tag';

export const typeDefs = gql`

  extend type Query {
    "Get the QuestionConditions that belong to a specific question"
    questionConditions(questionId: Int!): [QuestionCondition]
  }

  extend type Mutation {
    "Create a new QuestionCondition associated with a question"
    addQuestionCondition(input: AddQuestionConditionInput!): QuestionCondition!
    "Update a QuestionCondition for a specific QuestionCondition id"
    updateQuestionCondition(input: UpdateQuestionConditionInput!): QuestionCondition
    "Remove a QuestionCondition using a specific QuestionCondition id"
    removeQuestionCondition(questionConditionId: Int!): QuestionCondition
  }

  "QuestionCondition action"
  enum QuestionConditionActionType {
    "Show the question"
    SHOW_QUESTION
    "Hide the question"
    HIDE_QUESTION
    "Send email"
    SEND_EMAIL
  }

  "QuestionCondition types"
  enum QuestionConditionCondition {
    "When a question has an answer"
    HAS_ANSWER
    "When a question equals a specific value"
    EQUAL
    "When a question does not equal a specific value"
    DOES_NOT_EQUAL
    "When a question includes a specific value"
    INCLUDES
  }

  """
  if [Question content] [condition] [conditionMatch] then [action] on [target] so
  for example if 'Yes' EQUAL 'Yes' then 'SHOW_Question' 123
  """
  type QuestionCondition {
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
    "The question id that the QuestionCondition belongs to"
    questionId: Int!
    "The action to take on a QuestionCondition"
    action: QuestionConditionActionType!
    "The type of condition in which to take the action"
    conditionType: QuestionConditionCondition!
    "Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here)"
    conditionMatch: String
    "The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise)"
    target: String!
}

  "Input for adding a new QuestionCondition"
  input AddQuestionConditionInput {
    "The id of the question that the QuestionCondition belongs to"
    questionId: Int!
    "The action to take on a QuestionCondition"
    action: QuestionConditionActionType!
    "The condition in which to take the action"
    condition: QuestionConditionCondition!
    "Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here)"
    conditionMatch: String
    "The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise)"
    target: String!
  }

  "Input for updating a new QuestionCondition based on a QuestionCondition id"
  input UpdateQuestionConditionInput {
    "The id of the QuestionCondition that will be updated"
    questionConditionId: Int!
    "The action to take on a QuestionCondition"
    action: QuestionConditionActionType!
    "The condition in which to take the action"
    condition: QuestionConditionCondition!
    "Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here)"
    conditionMatch: String
    "The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise)"
    target: String!
  }

`
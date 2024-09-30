import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    "Search for VersionedQuestions that belong to Section specified by sectionId"
    publishedConditionsForQuestion(questionId: Int!): [VersionedQuestionCondition]
  }

    "VersionedQuestionCondition action"
  enum VersionedQuestionConditionActionType {
    "Show the question"
    SHOW_QUESTION
    "Hide the question"
    HIDE_QUESTION
    "Send email"
    SEND_EMAIL
  }

  "VersionedQuestionCondition types"
  enum VersionedQuestionConditionCondition {
    "When a question has an answer"
    HAS_ANSWER
    "When a question equals a specific value"
    EQUAL
    "When a question does not equal a specific value"
    DOES_NOT_EQUAL
    "When a question includes a specific value"
    INCLUDES
  }
  type VersionedQuestionCondition {
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

    "The versionedQuestion id that the QuestionCondition belongs to"
    versionedQuestionId: Int!
    "The action to take on a QuestionCondition"
    action: VersionedQuestionConditionActionType!
    "The condition in which to take the action"
    condition: VersionedQuestionConditionCondition!
    "Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here)"
    conditionMatch: String
    "The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise)"
    target: String!
  }
`;

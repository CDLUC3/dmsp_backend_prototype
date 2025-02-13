import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all rounds of admin feedback for the plan"
    planSectionAnswers(planId: Int!, sectionId: Int!): [Answer]

    "Get all of the comments associated with the round of admin feedback"
    planQuestionAnswer(questionId: Int!, answerId: Int!): Answer
  }

  extend type Mutation {
    "Answer a question"
    addPlanAnswer(planId: Int!, versionedSectionId: Int!, versionedQuestionId: Int!, answerText: String): Answer
    "Edit an answer"
    updatePlanAnswer(answerId: Int!, answerText: String): Answer
  }

  "An answer to a question on a Data Managament Plan (DMP)"
  type Answer {
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

    "The question in the template the answer is for"
    versionedSection: VersionedSection!
    "The question in the template the answer is for"
    versionedQuestion: VersionedQuestion!
    "The DMP that the answer belongs to"
    plan: Plan!
    "The answer to the question"
    answerText: String
  }

  "A collection of errors related to the Answer"
  type AffiliationErrors {
    "General error messages such as affiliation already exists"
    general: String

    versionedSectionId: String
    versionedQuestionId: String
    planId: String
    answerText: String
  }

  type AnswerComment {
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

    "The answer the comment is associated with"
    answer: Answer!
    "The comment"
    commentText: String!
  }

  "A collection of errors related to the Answer Comment"
  type AnswerCommentErrors {
    "General error messages such as affiliation already exists"
    general: String

    answerId: String
    commentText: String
  }
`;

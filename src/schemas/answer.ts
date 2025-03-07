import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all rounds of admin feedback for the plan"
    answers(projectId: Int!, planId: Int!, versionedSectionId: Int!): [Answer]

    "Get all of the comments associated with the round of admin feedback"
    answer(projectId: Int!, answerId: Int!): Answer
  }

  extend type Mutation {
    "Answer a question"
    addAnswer(planId: Int!, versionedSectionId: Int!, versionedQuestionId: Int!, answerText: String): Answer
    "Edit an answer"
    updateAnswer(answerId: Int!, answerText: String): Answer
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
    errors: AffiliationErrors

    "The question in the template the answer is for"
    versionedSection: VersionedSection
    "The question in the template the answer is for"
    versionedQuestion: VersionedQuestion
    "The DMP that the answer belongs to"
    plan: Plan
    "The answer to the question"
    answerText: String

    "The comments associated with the answer"
    comments: [AnswerComment!]
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
    errors: AnswerCommentErrors

    "The answer the comment is associated with"
    answerId: Int!
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

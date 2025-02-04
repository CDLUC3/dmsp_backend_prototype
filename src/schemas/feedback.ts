import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all rounds of admin feedback for the plan"
    planFeedback(planId: Int!): [PlanFeedback]

    "Get all of the comments associated with the round of admin feedback"
    planFeedbackComments(planFeedbackId: Int!): [PlanFeedbackComment]
  }

  extend type Mutation {
    "Request a round of admin feedback"
    requestFeedback(planId: Int!): PlanFeedback
    "Mark the feedback round as complete"
    completeFeedback(planFeedbackId: Int!, summaryText: String): PlanFeedback
    "Add a comment to an answer within a round of feedback"
    addFeedbackComment(planFeedbackId: Int!, answerId: Int!, commentText: String!): PlanFeedbackComment
    "Remove a comment to an answer within a round of feedback"
    removeFeedbackComment(PlanFeedbackCommentId: Int!): PlanFeedbackComment
  }

  "A round of administrative feedback for a Data Managament Plan (DMP)"
  type PlanFeedback {
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
    errors: PlanFeedbackErrors

    "The plan the user wants feedback on"
    plan: Plan!
    "The timestamp of when the user requested the feedback"
    requested: String!
    "The user who requested the round of feedback"
    requestedBy: User!
    "The timestamp that the feedback was marked as complete"
    completed: String
    "The admin who completed the feedback round"
    completedBy: User
    "An overall summary that can be sent to the user upon completion"
    adminSummary: String

    "The specific contextual commentary"
    feedbackComments: [PlanFeedbackComment!]
  }

  type PlanFeedbackComment {
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
    errors: PlanFeedbackCommentErrors

    "The answer the comment is related to"
    answer: Answer
    "The round of plan feedback the comment belongs to"
    PlanFeedback: PlanFeedback
    "The comment"
    comment: String
  }

  "A collection of errors related to the PlanFeedback"
  type PlanFeedbackErrors {
    "General error messages such as the object already exists"
    general: String

    planId: String
    requestedById: String
  }

  "A collection of errors related to the PlanFeedbackComment"
  type PlanFeedbackCommentErrors {
    "General error messages such as the object already exists"
    general: String

    planFeedbackId: String
    comment: String
  }
`;

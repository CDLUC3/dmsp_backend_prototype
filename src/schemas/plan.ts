import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all plans for the research project"
    plans(projectId: Int!): [Plan]

    "Get a specific plan"
    plan(planId: Int!): Plan

    "Archive a plan"
    archivePlan(planId: Int!): Plan
  }

  extend type Mutation {
    "Create a plan"
    addPlan(projectId: Int!, versionedTemplateId: Int!): Plan
    "Upload a plan"
    uploadPlan(projectId: Int!, fileName: String, fileContent: String): Plan
    "Publish a plan (changes status to PUBLISHED)"
    publishPlan(planId: Int!, visibility: PlanVisibility): Plan
    "Change the plan's status to COMPLETE (cannot be done once the plan is PUBLISHED)"
    markPlanComplete(planId: Int!): Plan
    "Change the plan's status to DRAFT (cannot be done once the plan is PUBLISHED)"
    markPlanDraft(planId: Int!): Plan
    "Download the plan"
    downloadPlan(planId: Int!, format: PlanDownloadFormat!): String
  }

  enum PlanDownloadFormat {
    CSV
    DOCX
    HTML
    JSON
    PDF
    TEXT
  }

  enum PlanVisibility {
    "Visible to anyone"
    PUBLIC
    "Visible only to people at the user's (or editor's) affiliation"
    ORGANIZATIONAL
    "Visible only to people who have been invited to collaborate (or provide feedback)"
    PRIVATE
  }

  enum PlanStatus {
    "The Plan is still being written and reviewed"
    DRAFT
    "The Plan is ready for submission or download"
    COMPLETE
    "The Plan's DMP ID (DOI) has been registered"
    PUBLISHED
  }

  "A Data Managament Plan (DMP)"
  type Plan {
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

    "The template the plan is based on"
    versionedTemplate: VersionedTemplate!
    "The name/title of the plan (typically copied over from the project)"
    visibility: PlanVisibility
    "The DMP ID/DOI for the plan"
    dmpId: String
    "The last time any part of the DMP was updated (add collaborators, answer questions, etc.)"
    lastUpdatedOn: String
    "The last person to have changed any part of the DMP (add collaborators, answer questions, etc.)"
    lastUpdatedBy: String
    "The status of the plan"
    status: PlanStatus

    "People who are contributing to the research project (not just the DMP)"
    contributors: [PlanContributor!]
    "People who are collaborating on the the DMP content"
    collaborators: [PlanCollaborator!]
    "The funder who is supporting the work defined by the DMP"
    funders: [ProjectFunder!]

    "The plan's answers to the template questions"
    answers: [Answer!]
    "Rounds of administrator feedback provided for the Plan"
    feedback: [PlanFeedback!]
  }
`;

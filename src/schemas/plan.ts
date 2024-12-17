import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {

  }

  extend type Mutation {

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

    "The name/title of the plan (typically copied over from the project)"
    visibility: PlanVisibility
    "The DMP ID/DOI for the plan"
    dmpId: String
    "The last time any part of the DMP was updated (add collaborators, answer questions, etc.)"
    lastUpdatedOn: String
    "The last person to have changed any part of the DMP (add collaborators, answer questions, etc.)"
    lastUpdatedBy: String
    "The type of research being done"
    status: PlanStatus

    "People who are contributing to the research project (not just the DMP)"
    contributors: [ProjectContributor!]
    "The funders who are supporting the research project"
    funders: [ProjectFunder!]
  }
`;

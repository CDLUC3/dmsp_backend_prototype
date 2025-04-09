import gql from "graphql-tag";

// This schema file contains queries and mutations that are meant to assist Super Admins with
// maintenance tasks

export const typeDefs = gql`
  extend type Query {
    "Fetch the DynamoDB PlanVersion record for a specific plan and version timestamp (leave blank for the latest)"
    superInspectPlanVersion(planId: Int!, modified: String): String
  }

  extend type Mutation {
    "Initialize an PLanVersion record in the DynamoDB for all Plans that do not have one"
    superInitializePlanVersions: InitializePlanVersionOutput!
  }

  "Output type for the initializePlanVersion mutation"
  type InitializePlanVersionOutput {
    "The number of PlanVersion records that were created"
    count: Int!
    "The ids of the Plans that were processed"
    planIds: [Int!]
  }
`;

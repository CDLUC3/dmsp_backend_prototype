import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the contributor role types"
    contributorRoles: [ContributorRole]
    "Get the contributor role by it's ID"
    contributorRoleById(contributorRoleId: ID!): ContributorRole
    "Get the contributor role by it's URL"
    contributorRoleByURL(contributorRoleURL: URL!): ContributorRole
  }

  extend type Mutation {
    "Add a new contributor role (URL and label must be unique!)"
    addContributorRole(url: URL!, label: String!, description: String): ContributorRole
    "Update the contributor role"
    updateContributorRole(id: ID!, url: URL, label: String, description: String): ContributorRole
    "Delete the contributor role"
    removeContributorRole(id: ID!): Boolean
  }

  type ContributorRole {
    id: ID!
    "The Ui label to display for the contributor role"
    label: String!
    "The URL for the contributor role"
    url: URL!
    "A longer description of the contributor role useful for tooltips"
    description: String
    "The timestamp of when the contributor role was created"
    created: DateTimeISO!
    "The timestamp of when the contributor role last modified"
    modified: DateTimeISO!
  }
`;
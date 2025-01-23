import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the contributor role types"
    contributorRoles: [ContributorRole]
    "Get the contributor role by it's id"
    contributorRoleById(contributorRoleId: Int!): ContributorRole
    "Get the contributor role by it's URL"
    contributorRoleByURL(contributorRoleURL: URL!): ContributorRole
  }

  extend type Mutation {
    "Add a new contributor role (URL and label must be unique!)"
    addContributorRole(url: URL!, label: String!, displayOrder: Int!, description: String): ContributorRoleMutationResponse
    "Update the contributor role"
    updateContributorRole(id: ID!, url: URL!, label: String!, displayOrder: Int!, description: String): ContributorRoleMutationResponse
    "Delete the contributor role"
    removeContributorRole(id: ID!): ContributorRoleMutationResponse
  }

  type ContributorRoleMutationResponse {
    "Similar to HTTP status code, represents the status of the mutation"
    code: Int!
    "Indicates whether the mutation was successful"
    success: Boolean!
    "Human-readable message for the UI"
    message: String!
    """
    The contributor role that was impacted by the mutation.
    The new one if we were adding, the one that was updated when updating, or the one deletd when removing
    """
    contributorRole: ContributorRole
  }

  type ContributorRole {
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

    "The order in which to display these items when displayed in the UI"
    displayOrder: Int!
    "The Ui label to display for the contributor role"
    label: String!
    "The taxonomy URL for the contributor role"
    uri: URL!
    "A longer description of the contributor role useful for tooltips"
    description: String
  }
`;
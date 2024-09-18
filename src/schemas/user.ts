import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Returns the currently logged in user's information"
    me: User
    "Returns all of the users associated with the current user's affiliation (Admin only)"
    users: [User]
    "Returns the specified user (Admin only)"
    user(userId: Int!): User
  }

  "The types of roles supported by the DMPTool"
  enum UserRole {
    RESEARCHER
    ADMIN
    SUPERADMIN
  }

  "A user of the DMPTool"
  type User {
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

    "The user's first/given name"
    givenName: String
    "The user's last/family name"
    surName: String
    "The user's primary email address"
    email: EmailAddress!
    "The user's role within the DMPTool"
    role: UserRole!
    "The user's organizational affiliation"
    affiliation: Affiliation
    "Whether the user has accepted the terms and conditions of having an account"
    acceptedTerms: Boolean
    "The user's ORCID"
    orcid: Orcid
  }
`;
import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    me: User
    users: [User]
    user(userId: Int!): User
  }

  enum UserRole {
    Researcher
    Admin
    SuperAdmin
  }

  type User {
    id: Int
    givenName: String
    surName: String
    email: EmailAddress!
    role: UserRole!
    affiliation: Affiliation
    orcid: Orcid
    created: DateTimeISO!
    modified: DateTimeISO

    "The user who created the user (created via registration if null)"
    createdById: Int
    "The user who modified the user"
    modifiedById: Int
  }
`;
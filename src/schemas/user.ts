import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    me: User
    users: [User]
    user(userId: String!): User
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
    modified: DateTimeISO!
  }
`;
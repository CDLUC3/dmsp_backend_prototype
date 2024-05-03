import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    me: User
    users: [User]
  }

  enum UserRole {
    RESEARCHER
    ADMIN
    SUPERADMIN
  }

  type User {
    id: ID!
    givenName: String!
    surName: String!
    email: EmailAddress!
    role: UserRole!
    orcid: Orcid
  }
`;
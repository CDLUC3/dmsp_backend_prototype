import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    me: User
    users: [User]
  }

  enum UserRole {
    RESEARCHER
    ADMIN
    SUPER_ADMIN
  }

  type User {
    id: Int!
    givenName: String!
    surName: String!
    email: EmailAddress!
    role: UserRole!
    orcid: Orcid
    created: DateTimeISO!
    modified: DateTimeISO!
  }
`;
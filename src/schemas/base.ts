import gql from "graphql-tag";

export const typeDefs = gql`
  # Specialized scalars from graphql-tools: https://the-guild.dev/graphql/scalars/docs/scalars
  scalar DateTimeISO
  scalar EmailAddress
  scalar URL

  # Our custom scalars
  scalar Orcid
  scalar Ror
  scalar DmspId

  # Base Query and Mutation objects are defined here because names must be unique and each
  # individual GraphQL file has its own Queries and Mutations, so we have those extend these
  # base definitions
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }

  "Contextual error message"
  type ContextualError {
    property: String,
    message: String!
  }
`;
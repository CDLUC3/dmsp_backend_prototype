import gql from "graphql-tag";

export const typeDefs = gql`
  # Scalars from graphql-tools
  scalar URL
  scalar DateTimeISO

  # Base Query and Mutation objects are defined here because names must be unique and each
  # individual GraphQL file has its own Queries and Mutations, so we have those extend these
  # base definitions
  type Query {
    _dummy: String
  }
  type Mutation {
    _dummy: String
  }
`;

export const typeDefs = `#graphql
  type ContributorRole {
    id: ID!
    label: String!
    url: URL!
    description: String
    created: DateTimeISO!
    modified: DateTimeISO!
  }

  extend type Query {
    contributorRoles: [ContributorRole]
    contributorRoleById(id: String!): ContributorRole
    contributorRoleByUrl(url: URL!): ContributorRole
  }

  extend type Mutation {
    addContributorRole(url: URL!, label: String!, description: String): ContributorRole
    updateContributorRole(id: String!, url: URL, label: String, description: String): ContributorRole
    removeContributorRole(id: String!): Boolean
  }
`

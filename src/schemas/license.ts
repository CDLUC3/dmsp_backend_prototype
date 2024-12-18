import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    "Search for a license"
    licenses(term: String, recommended: Boolean): [License]
  }

  extend type Mutation {
    "Add a new License (don't make the URI up! should resolve to an taxonomy HTML/JSON representation of the object)"
    addLicense(name: String!, description: String, uri: String): License
    "Update a License record"
    updateLicense(licenseId: Int!, name: String!, description: String): License
    "Delete a License"
    removeLicense(licenseId: Int!): License

    "Merge two licenses"
    mergeLicenses(licenseToKeepId: Int!, licenseToRemoveId: Int!): License
  }

  "A license associated with a research output (e.g. CC0, MIT, etc.)"
  type License {
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

    "The name of the license"
    name: String!
    "The taxonomy URL of the license"
    uri: String!
    "A description of the license"
    description: String
  }
`;

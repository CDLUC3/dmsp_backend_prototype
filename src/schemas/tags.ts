import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all available tags to display"
    tags: [Tag]
  }

  extend type Mutation {
    "Add a new tag to available list of tags"
    addTag(name: String!, description: String): Tag
    "Update a tag"
    updateTag(tagId: Int!, name: String!, description: String ): Tag
    "Delete a tag"
    removeTag(tagId: Int!): Tag
  }

  "A Tag is a way to group similar types of categories together"
  type Tag {
    "The unique identifer for the Object"
    id: Int!
    "The tag name"
    name: String!
    "The tag description"
    description: String
  }
`;

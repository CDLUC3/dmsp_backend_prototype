import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the VersionedSection for the specified Section ID"
    sectionVersions(sectionId: Int!): [VersionedSection]
    "Search for VersionedSection whose name contains the search term"
    publishedSections(term: String!): [VersionedSection]
  }

  "Section version type"
  enum SectionVersionType {
    "Draft - saved state for internal review"
    DRAFT
    "Published - saved state for use when creating DMPs"
    PUBLISHED
  }

  "A snapshot of a Section when it became published."
  type VersionedSection {
    "The unique identifer for the Object"
    id: Int!
    "ID of the parent VersionedTemplate"
    versionedTemplateId: Int!
    "The section that this is a snapshot of"
    section: Section
    "The type of version: Published or Draft (default: Draft)"
    versionType: SectionVersionType

    "The displayOrder of this VersionedSection"
    displayOrder: Int!
    "The section name/title"
    name: String!
    "The section introduction"
    introduction: String
    "Requirements that a user must consider in this section"
    requirements: String
    "The guidance to help user with section"
    guidance: String

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
  }
`;

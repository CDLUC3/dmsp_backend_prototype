import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the VersionedSection for the specified Section ID"
    sectionVersions(sectionId: Int!): [VersionedSection]
    "Search for VersionedSection whose name contains the search term"
    publishedSections(term: String!, cursor: Int, limit: Int): PublishedSectionSearchResult
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
    errors: VersionedSectionErrors

    "The parent VersionedTemplate"
    versionedTemplate: VersionedTemplate!
    "The section that this is a snapshot of"
    section: Section
    "The displayOrder of this VersionedSection"
    displayOrder: Int!
    "The VersionedSection name/title"
    name: String!
    "The VersionedSection introduction"
    introduction: String
    "Requirements that a user must consider in this VersionedSection"
    requirements: String
    "The guidance to help user with VersionedSection"
    guidance: String
    "The Tags associated with this VersionedSection"
    tags: [Tag]

    "The questions associated with this VersionedSection"
    versionedQuestions: [VersionedQuestion!]
  }

  "Paginated results of a search for publishedTemplates query"
  type PublishedSectionSearchResult {
    "The versioned sections"
    feed: [VersionedSection]
    "The total number of results"
    totalCount: Int
    "The id of the last VersionedSection in the results"
    cursor: Int
    "Any errors associated with the search"
    error: PaginationError
  }

  "A collection of errors related to the VersionedSection"
  type VersionedSectionErrors {
    "General error messages such as the object already exists"
    general: String

    versionedTemplateId: String
    sectionId: String
    name: String
    displayOrder: String
    introduction: String
    requirements: String
    guidance: String
    tagIds: String
    versionedQuestionIds: String
  }
`;

import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all of the VersionedSection for the specified Section ID"
    sectionVersions(sectionId: Int!): [VersionedSection]
    "Search for VersionedSection whose name contains the search term"
    publishedSections(term: String!, paginationOptions: PaginationOptions): VersionedSectionSearchResults
    "Get all of the best practice VersionedSection"
    bestPracticeSections: [VersionedSection]
  }

  "Section version type"
  enum SectionVersionType {
    "Draft - saved state for internal review"
    DRAFT
    "Published - saved state for use when creating DMPs"
    PUBLISHED
  }

  type VersionedSectionSearchResult {
    "The unique identifer for the Object"
    id: Int
    "The timestamp when the Object was last modifed"
    modified: String
    "The timestamp when the Object was created"
    created: String
    "The VersionedSection name/title"
    name: String!
    "The VersionedSection introduction"
    introduction: String
    "The displayOrder of this VersionedSection"
    displayOrder: Int!
    "Whether or not this VersionedSection is designated as a 'Best Practice' section"
    bestPractice: Boolean
    "The id of the VersionedTemplate that this VersionedSection belongs to"
    versionedTemplateId: Int
    "The name of the VersionedTemplate that this VersionedSection belongs to"
    versionedTemplateName: String
    "The number of questions associated with this VersionedSection"
    versionedQuestionCount: Int
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

  type VersionedSectionSearchResults implements PaginatedQueryResults {
    "The TemplateSearchResults that match the search criteria"
    items: [VersionedSectionSearchResult]
    "The total number of possible items"
    totalCount: Int
    "The number of items returned"
    limit: Int
    "The cursor to use for the next page of results (for infinite scroll/load more)"
    nextCursor: String
    "The current offset of the results (for standard offset pagination)"
    currentOffset: Int
    "Whether or not there is a next page"
    hasNextPage: Boolean
    "Whether or not there is a previous page"
    hasPreviousPage: Boolean
    "The sortFields that are available for this query (for standard offset pagination only!)"
    availableSortFields: [String]
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

import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    "Search for VersionedQuestions that belong to Section specified by sectionId"
    publishedQuestions(sectionId: Int!): [VersionedQuestion]
  }

"A snapshot of a Question when it became published."
type VersionedQuestion {
    "The unique identifer for the Object"
    id: Int
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

    "The unique id of the VersionedTemplate that the VersionedQuestion belongs to"
    versionedTemplateId: Int!
    "The unique id of the VersionedSection that the VersionedQuestion belongs to"
    versionedSectionId: Int!
    "The display order of the VersionedQuestion"
    displayOrder: Int
    "The type of question, such as text field, select box, radio buttons, etc"
    questionTypeId: Int
    "This will be used as a sort of title for the Question"
    questionText: String
    "Requirements associated with the Question"
    requirementText: String
    "Guidance to complete the question"
    guidanceText: String
    "Sample text to possibly provide a starting point or example to answer question"
    sampleText: String
    "To indicate whether the question is required to be completed"
    required: Boolean
}


`
import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get the Questions that belong to the associated sectionId"
    questions(sectionId: Int!): [Question]
    "Get the specific Question based on questionId"
    question(questionId: Int!): Question
  }

extend type Mutation {
    "Create a new Question"
    addQuestion(input: AddQuestionInput!): Question!
    "Update a Question"
    updateQuestion(input: UpdateQuestionInput!): Question!
    "Delete a Question"
    removeQuestion(questionId: Int!): Question
    "Separate Question update specifically for options"
    updateQuestionOptions(questionId: Int!, required:Boolean = false ): Question
  }

"Question always belongs to a Section, which always belongs to a Template"
type Question {
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

    "The unique id of the Template that the question belongs to"
    templateId: Int!
    "The unique id of the Section that the question belongs to"
    sectionId: Int!
    "The original question id if this question is a copy of another"
    sourceQestionId: Int
    "The display order of the question"
    displayOrder: Int
    "Whether or not the Question has had any changes since the related template was last published"
    isDirty: Boolean
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

input AddQuestionInput {
    "The unique id of the Template that the question belongs to"
    templateId: Int!
    "The unique id of the Section that the question belongs to"
    sectionId: Int!
    "The display order of the question"
    displayOrder: Int
    "Whether or not the Question has had any changes since it was last published"
    isDirty: Boolean
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

input UpdateQuestionInput {
    "The unique identifier for the Question"
    questionId: Int!
    "The display order of the Question"
    displayOrder: Int
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
import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Get all plans for the research project"
    plans(projectId: Int!): [PlanSearchResult!]

    "Get a specific plan"
    plan(planId: Int!): Plan
  }

  extend type Mutation {
    "Create a plan"
    addPlan(projectId: Int!, versionedTemplateId: Int!): Plan
    "Upload a plan"
    uploadPlan(projectId: Int!, fileName: String, fileContent: String): Plan
    "Publish a plan (changes status to PUBLISHED)"
    publishPlan(dmpId: String!, visibility: PlanVisibility): Plan
    "Change the plan's status to COMPLETE (cannot be done once the plan is PUBLISHED)"
    markPlanAsComplete(dmpId: String!): Plan
    "Change the plan's status to DRAFT (cannot be done once the plan is PUBLISHED)"
    markPlanAsDraft(dmpId: String!): Plan
    "Archive a plan"
    archivePlan(dmpId: String!): Plan
  }

  type PlanSearchResult {
    "The unique identifer for the Object"
    id: Int
    "The user who created the Object"
    createdBy: String
    "The timestamp when the Object was created"
    created: String
    "The user who last modified the Object"
    modifiedBy: String
    "The timestamp when the Object was last modifed"
    modified: String

    "The title of the plan"
    title: String
    "The current status of the plan"
    status: PlanStatus
    "The visibility/permission setting"
    visibility: PlanVisibility
    "The DMP ID/DOI for the plan"
    dmpId: String
    "The person who published/registered the plan"
    registeredBy: String
    "The timestamp for when the Plan was registered/published"
    registered: String
    "The name of the funder"
    funder: String
    "The names of the contributors"
    contributors: String
    "The name of the template the plan is based on"
    templateTitle: String
    "The section search results"
    sections: [PlanSectionProgress!]
  }

  "The progress the user has made within a section of the plan"
  type PlanSectionProgress {
    "The id of the Section"
    sectionId: Int!
    "The title of the section"
    sectionTitle: String!
    "The display order of the section"
    displayOrder: Int!
    "The number of questions in the section"
    totalQuestions: Int!
    "The number of questions the user has answered"
    answeredQuestions: Int!
  }

  enum PlanDownloadFormat {
    CSV
    DOCX
    HTML
    JSON
    PDF
    TEXT
  }

  "The visibility/privacy setting for the plan"
  enum PlanVisibility {
    "Visible only to people at the user's (or editor's) affiliation"
    ORGANIZATIONAL
    "Visible only to people who have been invited to collaborate (or provide feedback)"
    PRIVATE
    "Visible to anyone"
    PUBLIC
  }

  "The status/state of the plan"
  enum PlanStatus {
    "The Plan has been archived"
    ARCHIVED
    "The Plan is still being written and reviewed"
    DRAFT
    "The Plan is ready for submission or download"
    COMPLETE
    "The Plan's DMP ID (DOI) has been registered"
    PUBLISHED
  }

  "A Data Managament Plan (DMP)"
  type Plan {
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
    errors: PlanErrors

    "The project the plan is associated with"
    project: Project
    "The template the plan is based on"
    versionedTemplate: VersionedTemplate
    "The DMP ID/DOI for the plan"
    dmpId: String
    "The status/state of the plan"
    status: PlanStatus
    "The visibility/privacy setting for the plan"
    visibility: PlanVisibility
    "The individual who registered the plan"
    registeredById: Int
    "The timestamp for when the Plan was registered"
    registered: String
    "The language of the plan"
    languageId: String
    "Whether or not the plan is featured on the public plans page"
    featured: Boolean
    "The last time the plan was synced with the DMPHub"
    lastSynced: String

    "The contributors for the plan"
    contributors: [PlanContributor!]
    "The funders for the plan"
    funders: [PlanFunder!]
    "Anticipated research outputs"
    outputs: [PlanOutput!]

    "Prior versions of the plan"
    versions: [PlanVersion!]

    answers: [Answer!]
  }

  "The error messages for the plan"
  type PlanErrors {
    general: String

    versionedTemplateId: String
    projectId: String
    dmp_id: String
    status: String
    visibility: String
    registeredById: String
    registered: String
    languageId: String
    featured: String
    lastSynced: String
  }

  "A version of the plan"
  type PlanVersion {
    "The timestamp of the version, equates to the plan's modified date"
    timestamp: String
    "The DMPHub URL for the version"
    url: String
  }
`;

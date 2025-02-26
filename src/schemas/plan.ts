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
    publishPlan(dmp_id: String!, visibility: PlanVisibility): Plan
    "Change the plan's status to COMPLETE (cannot be done once the plan is PUBLISHED)"
    markPlanComplete(dmp_id: String!): Plan
    "Change the plan's status to DRAFT (cannot be done once the plan is PUBLISHED)"
    markPlanDraft(dmp_id: String!): Plan
    "Archive a plan"
    archivePlan(dmp_id: String!): Plan
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

    "The template the plan is based on"
    versionedTemplateId: Int!

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
    contributors: [String!]
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
    "Visible to anyone"
    PUBLIC
    "Visible only to people at the user's (or editor's) affiliation"
    ORGANISATIONAL
    "Visible only to people who have been invited to collaborate (or provide feedback)"
    PRIVATE
  }

  "The status/state of the plan"
  enum PlanStatus {
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

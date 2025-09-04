// The DMP Common Standard v1.1 format represented as JS interfaces
// -----------------------------------------------------------------------------------------------
export enum DMPYesNoUnknown {
  YES = 'yes',
  NO = 'no',
  UNKNOWN = 'unknown',
}

export enum DMPIdentifierType {
  DOI = 'doi',
  ORCID = 'orcid',
  ROR = 'ror',
  URL = 'url',
  OTHER = 'other',
}

export enum DMPStatus {
  ARCHIVED = 'archived',
  DRAFT = 'draft',
  COMPLETE = 'complete',
  PUBLISHED = 'published',
}

export enum DMPPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum DMPFundingStatus {
  PLANNED = 'planned',
  APPLIED = 'applied',
  GRANTED = 'granted',
  REJECTED = 'rejected',
}

export enum DMPOutputAccessLevel {
  OPEN = 'open',
  SHARED = 'shared',
  CLOSED = 'closed',
}

export enum DMPRelatedIdentifierDescriptor {
  IS_CITED_BY = "is_cited_by",
  CITES = "cites",
  IS_SUPPLEMENT_TO = "is_supplement_to",
  IS_SUPPLEMENTED_BY = "is_supplemented_by",
  IS_CONTINUED_BY = "is_continued_by",
  CONTINUES = "continues",
  IS_DESCRIBED_BY = "is_described_by",
  DESCRIBES = "describes",
  HAS_METADATA = "has_metadata",
  IS_METADATA_FOR = "is_metadata_for",
  HAS_VERSION = "has_version",
  IS_VERSION_OF = "is_version_of",
  IS_NEW_VERSION_OF = "is_new_version_of",
  IS_PREVIOUS_VERSION_OF = "is_previous_version_of",
  IS_PART_OF = "is_part_of",
  HAS_PART = "has_part",
  IS_PUBLISHED_IN = "is_published_in",
  IS_REFERENCED_BY = "is_referenced_by",
  REFERENCES = "references",
  IS_DOCUMENTED_BY = "is_documented_by",
  DOCUMENTS = "documents",
  IS_COMPILED_BY = "is_compiled_by",
  COMPILES = "compiles",
  IS_VARIANT_FORM_OF = "is_variant_form_of",
  IS_ORIGINAL_FORM_OF = "is_original_form_of",
  IS_IDENTICAL_TO = "is_identical_to",
  IS_REVIEWED_BY = "is_reviewed_by",
  REVIEWS = "reviews",
  IS_DERIVED_FROM = "is_derived_from",
  IS_SOURCE_OF = "is_source_of",
  IS_REQUIRED_BY = "is_required_by",
  REQUIRES = "requires",
  OBSOLETES = "obsoletes",
  IS_OBSOLETED_BY = "is_obsoleted_by",
  IS_COLLECTED_BY = "is_collected_by",
  COLLECTS = "collects",
  IS_TRANSLATION_OF = "is_translation_of",
  HAS_TRANSLATION = "has_translation"
}

// Derived from the Datacite schema
export enum DMPRelatedIdentifierWorkType {
  AUDIOVISUAL = "audiovisual",
  BOOK = "book",
  BOOK_CHAPTER = "book_chapter",
  COLLECTION = "collection",
  COMPUTATIONAL_NOTEBOOK = "computational_notebook",
  CONFERENCE_PAPER = "conference_paper",
  CONFERENCE_PROCEEDING = "conference_proceeding",
  DATA_PAPER = "data_paper",
  DATASET = "dataset",
  DISSERTATION = "dissertation",
  EVENT = "event",
  IMAGE = "image",
  INSTRUMENT = "instrument",
  INTERACTIVE_RESOURCE = "interactive_resource",
  JOURNAL = "journal",
  JOURNAL_ARTICLE = "journal_article",
  MODEL = "model",
  OUTPUT_MANAGEMENT_PLAN = "output_management_plan",
  PEER_REVIEW = "peer_review",
  PHYSICAL_OBJECT = "physical_object",
  PREPRINT = "preprint",
  PROJECT = "project",
  REPORT = "report",
  SERVICE = "service",
  SOFTWARE = "software",
  SOUND = "sound",
  STANDARD = "standard",
  STUDY_REGISTRATION = "study_registration",
  TEXT = "text",
  WORKFLOW = "workflow",
  OTHER = "other"
}

export enum DMPResearchFacilityType {
  DATA_CENTER = 'data_center',
  FIELD_STATION = 'field_station',
  LABORATORY = 'laboratory',
  OBSERVATORY = 'observatory',
  OTHER = 'other',
}

export interface DMPCommonStandard {
  dmphub_provenance_id: string;
  dmproadmap_featured: string;
  dmproadmap_privacy: DMPPrivacy;
  dmproadmap_status: DMPStatus;
  dmproadmap_narrative?: DMPCommonStandardNarrative;

  created: string;
  modified: string;
  registered?: string;
  tombstoned?: string;

  title: string;
  description?: string;
  language: string;
  ethical_issues_exist: string;
  ethical_issues_description?: string;
  ethical_issues_report?: string;

  dmp_id: {
    identifier: string;
    type: DMPIdentifierType;
  };

  contact: DMPCommonStandardContact

  contributor?: DMPCommonStandardContributor[];

  // TODO: If we decide to support this (perhaps in the same way we offer research output definitions)
  //       we should create a model and add this to it
  cost?: DMPCommonStandardCost[],

  // TODO: Define the DMPCommonStandardOutput on the Output model
  dataset: DMPCommonStandardDataset[],

  project: DMPCommonStandardProject[],

  // TODO: Define the the RelatedWork model and move this to it
  dmproadmap_related_identifiers?: DMPCommonStandardRelatedIdentifier[],

  // TODO: Determine how we want to do this in the future. Right now we record if the template owner is a facility
  dmproadmap_research_facilities?: DMPCommonStandardResearchFacility[],

  // TODO: Define the the Version model and move this to it
  dmphub_versions?: DMPCommonStandardVersion[],

  dmproadmap_template?: DMPCommonStandardTemplate,
}

export interface DMPCommonStandardAffiliation {
  name: string;
  affiliation_id?: {
    identifier: string;
    type: DMPIdentifierType;
  }
}

// Representation of the primary contact in the DMP Common Standard format
export interface DMPCommonStandardContact {
  name: string;
  mbox: string;
  dmproadmap_affiliation?: DMPCommonStandardAffiliation;
  contact_id: {
    identifier: string;
    type: DMPIdentifierType;
  };
}

// Representation of a Contributor in the DMP Common Standard format
export interface DMPCommonStandardContributor {
  name: string;
  mbox?: string;
  dmproadmap_affiliation?: DMPCommonStandardAffiliation;
  contributor_id?: {
    identifier: string;
    type: DMPIdentifierType;
  }
  role: string[];
}

// Represents a budgetary cost in the DMP Common Standard format
export interface DMPCommonStandardCost {
  title: string;
  currency_code?: string;
  description?: string;
  value?: number
}

// Represents a research output in the DMP Common Standard format
export interface DMPCommonStandardDataset {
  type: string;
  title?: string;
  description?: string;
  issued?: string;
  personal_data: DMPYesNoUnknown;
  sensitive_data: DMPYesNoUnknown;
  preservation_statement?: string;
  data_quality_assurance?: string[];
  keyword?: string[];

  dataset_id: {
    identifier: string;
    type: DMPIdentifierType;
  };

  metadata?: DMPCommonStandardMetadataStandard[];
  security_and_privacy?: DMPCommonStandardSecurityAndPrivacyStatement[];
  technical_resource?: DMPCommonStandardTechnicalResource[];
  distribution?: DMPCommonStandardDistribution[];
}

// Represents a distribution to a repository of the research output in the DMP Common Standard format
export interface DMPCommonStandardDistribution {
  title: string;
  description?: string;
  available_until?: string;
  byte_size?: number;
  data_access: DMPOutputAccessLevel;
  host: DMPCommonStandardHost;
  license?: DMPCommonStandardLicense[];
}

// Represnts a repository the research output will be stored in
export interface DMPCommonStandardHost {
  title: string;
  description?: string;
  url: string;
  dmproadmap_host_id?: {
    identifier: string;
    type: DMPIdentifierType;
  }
}

// Representation of a PLanFunder in the DMP Common Standard format
export interface DMPCommonStandardFunding {
  name: string;
  funder_id?: {
    identifier: string;
    type: DMPIdentifierType;
  }
  funding_status: DMPFundingStatus;
  grant_id?: {
    identifier: string;
    type: DMPIdentifierType;
  };
  dmproadmap_project_number?: string;
  dmproadmap_opportunity_number?: string;
}

// Represents a license agreement in the DMP Common Standard format
export interface DMPCommonStandardLicense {
  license_ref: string;
  start_date: string;
}

// Represents a metadata standard that will be used to describe the research output
export interface DMPCommonStandardMetadataStandard {
  description?: string;
  language: string;
  metadata_standard_id: {
    identifier: string;
    type: DMPIdentifierType;
  };
}

// Represents the narrative elements of a Plan in the DMP Common Standard format
export interface DMPCommonStandardNarrative {
  template_id: number;
  template_title: string;
  template_version: string;

  sections: DMPCommonStandardNarrativeSection[];
}

// Represents a question in the narrative in the DMP Common Standard format
export interface DMPCommonStandardNarrativeQuestion {
  question_id: number;
  question_text: string;
  question_order?: number;

  question_type: {
    id: number;
    name: string;
  }

  answer_id?: number;
  answer_json?: string;
}

// Represents a section of the narrative in the DMP Common Standard format
export interface DMPCommonStandardNarrativeSection {
  section_id: number;
  section_title: string;
  section_description?: string;
  section_order?: number;

  questions: DMPCommonStandardNarrativeQuestion[];
}

// Representation of a Project in the DMP Common Standard format
export interface DMPCommonStandardProject {
  title: string;
  description?: string;
  start?: string;
  end?: string;
  dmptool_research_domain?: string;

  funding?: DMPCommonStandardFunding[];
}

// Represents a related work in the DMP Common Standard format
export interface DMPCommonStandardRelatedIdentifier {
  work_type: DMPRelatedIdentifierWorkType;
  descriptor: DMPRelatedIdentifierDescriptor;
  identifier: string;
  type: DMPIdentifierType;
  citation?: string;
}

// Representation of a research facility in the DMP Common Standard format
export interface DMPCommonStandardResearchFacility {
  name: string;
  type: DMPResearchFacilityType;
  dmproadmap_research_facility_id?: {
    identifier: string;
    type: DMPIdentifierType;
  };
}

// Representation of a security an privacy statement in the DMP Common Standard format
export interface DMPCommonStandardSecurityAndPrivacyStatement {
  title: string;
  description?: string;
}

// Representation of a technical resource in the DMP Common Standard format
export interface DMPCommonStandardTechnicalResource {
  name: string;
  description?: string;
  technical_resource_id?: {
    identifier: string;
    type: DMPIdentifierType;
  }
}

// Representation of a link to a historical version of the DMP
export interface DMPCommonStandardVersion {
  timestamp: string;
  url: string;
}

export interface DMPCommonStandardTemplate {
  id: number;
  title: string;
}

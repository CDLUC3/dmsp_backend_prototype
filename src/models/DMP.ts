
import { MyContext } from "../context";
import { ORCID_REGEX } from "./User";
import { DEFAULT_ROR_AFFILIATION_URL } from "./Affiliation";
import { formatLogMessage } from "../logger";

export const DOI_REGEX = /(https?:\/)?(doi.org\/)?(doi:)?10.\d{4,9}\/[-._;()/:A-Z0-9]+/i;

// Represents the plan (stored in the DMPHub's DynamoDB table)
export class DMP {
  public dmp_id: DMPIdentifier;
  public dmphub_provenance_id: string;

  public errors: Record<string, string>;

  public dmproadmap_project_id: number;
  public dmproadmap_template_id: number;

  public created: string;
  public modified: string;
  public registered?: string;

  public title: string;
  public description?: string;
  public language: string;
  public ethical_issues_exist: DMPYesNoUnknown;
  public ethical_issues_description?: string;
  public ethical_issues_report?: string;
  public dmproadmap_featured: boolean;
  public dmproadmap_privacy: DMPVisibility;
  public dmproadmap_status: DMPStatus;

  public contact: DMPContact;
  public contributor: DMPContributor[];
  public cost: DMPCost[];
  public dataset: DMPOutput[];
  public project: DMPProject[];
  public dmproadmap_related_identifiers: DMPRelatedIdentifier[];
  public dmproadmap_research_facilities: DMPResearchFacility[];
  public dmphub_versions: DMPVersion[];

  constructor(options) {
    this.dmp_id = new DMPIdentifier(options.dmp_id);
    this.dmphub_provenance_id = options.dmphub_provenance_id;

    this.errors = options.errors ?? {};

    this.dmproadmap_project_id = options.dmproadmap_project_id;
    this.dmproadmap_template_id = options.dmproadmap_template_id;

    this.created = options.created;
    this.modified = options.modified;
    this.registered = options.registered;

    this.title = options.title;
    this.description = options.description;
    this.language = LanguageConvertThreeToFive(options.language);
    this.ethical_issues_exist = options.ethical_issues_exist;
    this.ethical_issues_description = options.ethical_issues_description;
    this.ethical_issues_report = options.ethical_issues_report;
    this.dmproadmap_featured = options.dmproadmap_featured === 1 ? true : false;
    this.dmproadmap_privacy = options.dmproadmap_privacy ?? DMPVisibility.PRIVATE;
    this.dmproadmap_status = options.dmproadmap_status ?? DMPStatus.DRAFT;

    this.contact = options.contact;
    // Handle all arrays of nested objects
    const contributors = Array.isArray(options.contributor) ? options.contributor : [];
    this.contributor = contributors.map((contrib) => new DMPContributor(contrib));
    const costs = Array.isArray(options.cost) ? options.cost : [];
    this.cost = costs.map((cost) => new DMPCost(cost));
    const datasets = Array.isArray(options.dataset) ? options.dataset : [];
    this.dataset = datasets.map((dataset) => new DMPOutput(dataset));
    const projects = Array.isArray(options.project) ? options.project : [];
    this.project = projects.map((proj) => new DMPProject(proj));
    const relatedIds = Array.isArray(options.dmproadmap_related_identifiers) ? options.dmproadmap_related_identifiers : [];
    this.dmproadmap_related_identifiers = relatedIds.map((relId) => new DMPRelatedIdentifier(relId));
    const researchFacilities = Array.isArray(options.dmproadmap_research_facilities) ? options.dmproadmap_research_facilities : [];
    this.dmproadmap_research_facilities = researchFacilities.map((facility) => new DMPResearchFacility(facility));
    const versions = Array.isArray(options.dmphub_versions) ? options.dmphub_versions : [];
    this.dmphub_versions = versions.map((version) => new DMPVersion(version));
  }

  async create(context: MyContext, projectId: number, versionedTemplateId: number): Promise<DMP | null> {
    formatLogMessage(context).info({ projectId, versionedTemplateId }, 'Creating DMP', { dmpId: this.dmp_id.identifier });
    // Create the plan in the local MySQL database

    // Create the DMP in the DMPHub (exclude dmpMetadata)

    // Update the DMP ID value on the DMP record (make sure EZID code has been update to NOT register yet!)

    return null;
  }

  async update(context: MyContext, projectId: number, versionedTemplateId: number): Promise<DMP | null> {
    formatLogMessage(context).info({ projectId, versionedTemplateId }, 'Updating DMP', { dmpId: this.dmp_id.identifier });
    // Update the plan in the local MySQL database

    // Update the DMP in the DMPHub (exclude dmpMetadata)

    return null;
  }

  async delete(context: MyContext): Promise<DMP | null> {
    formatLogMessage(context).info('Deleting DMP', { dmpId: this.dmp_id.identifier });
    // Delete the plan in the local MySQL database

    // Delete the DMP in the DMPHub (or Tombstone if it is registered)

    return null;
  }

  async publish(context: MyContext): Promise<DMP | null> {
    formatLogMessage(context).info('Publishing DMP', { dmpId: this.dmp_id.identifier });
    // Register the DMP in the DMPHub

    // Update the plan's registered info

    return null;
  }

  // Find the DMP by its DMP ID
  static async findById(reference: string, context: MyContext, dmp_id: string): Promise<DMP | null> {
    return await context.dataSources.dmphubAPIDataSource.getDMP(context, dmp_id, reference);
  }
}

export enum DMPStatus {
  DRAFT = 'draft',
  COMPLETE = 'complete',
  PUBLISHED = 'published',
}

export enum DMPVisibility {
  ORGANIATIONAL = 'organizational',
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum DMPFundingStatus {
  PLANNED = 'planned',
  APPLIED = 'applied',
  GRANTED = 'granted',
  REJECTED = 'rejected',
}

export enum DMPFacilityType {
  FIELD_STATION = 'field_station',
  DATA_CENTER = 'data_center',
  LABORATORY = 'laboratory',
  OBSERVATORY = 'observatory',
  OTHER = 'other',
}

export enum DMPOutputAccessLevel {
  OPEN = 'open',
  SHARED = 'shared',
  CLOSED = 'closed',
}

enum DMPRelatedIdentifierDescriptor {
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
enum DMPRelatedIdentifierWorkType {
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

export enum DMPYesNoUnknown {
  YES = 'yes',
  NO = 'no',
  UNKNOWN = 'unknown',
}

function LanguageConvertThreeToFive(language: string): string {
  switch (language) {
    case 'pt-BR':
      return 'ptb';
    default:
      return 'eng';
  }
}

// Represents an affiliation or funder
class DMPAffiliation {
  public name: string;
  public affiliation_id: DMPIdentifier;
  public errors: Record<string, string>;

  constructor(options) {
    this.name = options?.name;
    this.affiliation_id = new DMPIdentifier(options?.affiliation_id);
    this.errors = options?.errors ?? {};
  }

  // Check if the affiliation is valid (must have either a name or an affiliation ID)
  isValid(): boolean {
    return this.affiliation_id.isValid() || this.name !== null && this.name !== undefined && this.name.length > 0;
  }
}

// Represents the primary contact for the plan
class DMPContact {
  public name: string;
  public mbox: string;
  public dmproadmap_affiliation: DMPAffiliation;
  public contact_id: DMPIdentifier;
  public errors: Record<string, string>;

  constructor(options) {
    this.name = options?.name;
    this.mbox = options?.mbox;
    this.dmproadmap_affiliation = new DMPAffiliation(options?.dmproadmap_affiliation);
    this.contact_id = new DMPIdentifier(options?.contact_id);
    this.errors = options?.errors ?? {};
  }

  // Check if the contact is valid (must have a name, an email address and a contact_id)
  isValid(): boolean {
    return (this.name !== null && this.name !== undefined && this.name.length > 0)
      || (this.mbox !== null && this.mbox !== undefined && this.mbox.length > 0)
      || (this.contact_id && this.contact_id.isValid());
  }
}

// Represents a contributor to the plan
export class DMPContributor {
  public name: string;
  public mbox: string;
  public dmproadmap_affiliation: DMPAffiliation;
  public contributor_id: DMPIdentifier;
  public role: string[];
  public errors: Record<string, string>;

  constructor(options) {
    this.name = options?.name;
    this.mbox = options?.mbox;
    this.dmproadmap_affiliation = new DMPAffiliation(options?.dmproadmap_affiliation);
    this.contributor_id = new DMPIdentifier(options?.contributor_id);
    this.role = options?.role ?? [];
    this.errors = options?.errors ?? {};
  }

  // Check if the contributor is valid (must have either a name, email address or contributor ID).
  // it must also have a least one role
  isValid(): boolean {
    const valid = (this.name !== null && this.name !== undefined && this.name.length > 0)
      || (this.mbox !== null && this.mbox !== undefined && this.mbox.length > 0)
      || (this.contributor_id && this.contributor_id.isValid());

    return valid && this.role.length > 0;
  }
}

// Represents a cost or budgetary item associated with the plan
export class DMPCost {
  public title: string;
  public currency_code: string;
  public description: string;
  public value: number;
  public errors: Record<string, string>;

  constructor(options) {
    this.title = options?.title;
    this.currency_code = options?.currency_code ?? 'usd';
    this.description = options?.description;
    this.value = options?.value;
    this.errors = options?.errors ?? {};
  }
}

// Represents a distribution of a research output
export class DMPDistribution {
  public available_until: string;
  public byte_size: number;
  public data_access: DMPOutputAccessLevel;
  public description: string;
  public host: DMPRepository;
  public license: DMPLicense[];
  public title: string;
  public errors: Record<string, string>;

  constructor(options) {
    this.available_until = options?.available_until;
    this.byte_size = options?.byte_size;
    this.data_access = options?.data_access ?? DMPOutputAccessLevel.OPEN;
    this.description = options?.description;
    this.host = new DMPRepository(options?.host);
    this.title = options?.title;
    this.errors = options?.errors ?? {};

    const licenses = Array.isArray(options.license) ? options.license : [];
    this.license = licenses.map((lic) => new DMPLicense(lic));
  }
}

// Represents a block of funding for the research project
export class DMPFunding {
  public dmproadmap_opportunity_number: string;
  public dmproadmap_project_number: string;
  public funder_id: DMPIdentifier;
  public funding_status: DMPFundingStatus;
  public grant_id: DMPIdentifier;
  public name: string;
  public errors: Record<string, string>;

  constructor(options) {
    this.dmproadmap_opportunity_number = options?.dmproadmap_opportunity_number;
    this.dmproadmap_project_number = options?.dmproadmap_project_number;
    this.funder_id = new DMPIdentifier(options?.funder_id);
    this.funding_status = options?.funding_status;
    this.grant_id = new DMPIdentifier(options?.grant_id);
    this.name = options?.name;
    this.errors = options?.errors ?? {};
  }
}

// Represents a unique identifier
class DMPIdentifier {
  public identifier: string;
  public type: string;
  public errors: Record<string, string>;

  constructor(options) {
    if (options.identifier) {
      this.identifier = options?.identifier;
      this.type = options?.type ?? DMPIdentifier.determineType(options?.identifier);
    }
    this.errors = options?.errors ?? {};
  }

  // Determine the type of identifier based on its format
  private static determineType(identifier: string): string {
    if (identifier.startsWith(DEFAULT_ROR_AFFILIATION_URL)) {
      return 'ror';
    } else if (identifier.match(ORCID_REGEX)) {
      return 'orcid';
    } else if (identifier.match(DOI_REGEX)) {
      return 'doi';
    } else if (identifier.match(/^https?:\/\//i)) {
      return 'url'
    } else {
      return 'other';
    }
  }

  // Check if the identifier is valid (must have an idenitfier and a type)
  isValid(): boolean {
    return this.identifier !== null && this.identifier !== undefined && this.identifier.length > 0
      && this.type !== null && this.type !== undefined && this.type.length > 0;
  }
}

// Represents a license associated with a research output
export class DMPLicense {
  public license_ref: string;
  public start_date: string;
  public errors: Record<string, string>;

  constructor(options) {
    this.license_ref = options?.license_ref;
    this.start_date = options?.start_date;
    this.errors = options?.errors ?? {};
  }
}

// Represents a metadata standard that will be used to describe a research output
export class DMPMetadataStandard {
  public description: string;
  public language: string;
  public metadata_standard_id: DMPIdentifier;
  public errors: Record<string, string>;

  constructor(options) {
    this.description = options?.description;
    this.language = options?.language ?? 'eng';
    this.metadata_standard_id = new DMPIdentifier(options?.metadata_standard_id);
    this.errors = options?.errors ?? {};
  }
}

// Represents an anticipate research output
export class DMPOutput {
  public data_quality_assurance: string[];
  public dataset_id: DMPIdentifier;
  public description: string;
  public distribution: DMPDistribution[];
  public issued: string;
  public keyword: string[];
  public metadata: DMPMetadataStandard[];
  public personal_data: DMPYesNoUnknown;
  public preservation_statement: string;
  public security_and_privacy: DMPSecurityAndPrivacyStatement[];
  public sensitive_data: DMPYesNoUnknown;
  public technical_resource: DMPTechnicalResource[];
  public title: string;
  public type: string;
  public errors: Record<string, string>;

  constructor(options) {
    this.data_quality_assurance = options?.data_quality_assurance;
    this.dataset_id = new DMPIdentifier(options?.dataset_id);
    this.description = options?.description;
    this.issued = options?.issued;
    this.keyword = options?.keyword;
    this.personal_data = options?.personal_data ?? DMPYesNoUnknown.UNKNOWN;
    this.preservation_statement = options?.preservation_statement;
    this.sensitive_data = options?.sensitive_data ?? DMPYesNoUnknown.UNKNOWN;
    this.title = options?.title;
    this.type = options?.type;
    this.errors = options?.errors ?? {};

    const distros = Array.isArray(options.distribution) ? options.distribution : [];
    this.distribution = distros.map((dist) => new DMPDistribution(dist));
    const metadataStandards = Array.isArray(options.metadata) ? options.metadata : [];
    this.metadata = metadataStandards.map((meta) => new DMPMetadataStandard(meta));
    const secPrivStatements = Array.isArray(options.security_and_privacy) ? options.security_and_privacy : [];
    this.security_and_privacy = secPrivStatements.map((sec) => new DMPSecurityAndPrivacyStatement(sec));
    const techResources = Array.isArray(options.technical_resource) ? options.technical_resource : [];
    this.technical_resource = techResources.map((tech) => new DMPTechnicalResource(tech));
  }
}

// Represents the project that the plan is associated with
export class DMPProject {
  public description: string;
  public end: string;
  public funding: DMPAffiliation[];
  public start: string;
  public title: string;
  public errors: Record<string, string>;

  constructor(options) {
    this.description = options?.description;
    this.end = options?.end;
    this.start = options?.start;
    this.title = options?.title;
    this.errors = options?.errors ?? {};

    const fundings = Array.isArray(options.funding) ? options.funding : [];
    this.funding = fundings.map((fund) => new DMPFunding(fund));
  }
}

// Represents a work (published research output) that is related to the plan
export class DMPRelatedIdentifier {
  public citation: string;
  public descriptor: DMPRelatedIdentifierDescriptor;
  public identifier: string;
  public type: string;
  public work_type: DMPRelatedIdentifierWorkType;
  public errors: Record<string, string>;

  constructor(options) {
    this.citation = options?.citation;
    this.descriptor = options?.descriptor ?? DMPRelatedIdentifierDescriptor.REFERENCES;
    this.identifier = options?.identifier;
    this.type = options?.type;
    this.work_type = options?.work_type ?? DMPRelatedIdentifierWorkType.OTHER;
    this.errors = options?.errors ?? {};
  }
}

// Represents a repository that will host the research output
export class DMPRepository {
  public description: string;
  public dmproadmap_host_id: DMPIdentifier;
  public title: string;
  public url: string;
  public errors: Record<string, string>;

  constructor(options) {
    this.description = options?.description;
    this.dmproadmap_host_id = new DMPIdentifier(options?.dmproadmap_host_id);
    this.title = options?.title;
    this.url = options?.url;
    this.errors = options?.errors ?? {};
  }
}

// Represents a research facility that will be used to conduct the research
export class DMPResearchFacility {
  public facility_id: DMPIdentifier;
  public name: string;
  public type: DMPResearchFacilityType;
  public errors: Record<string, string>;

  constructor(options) {
    this.facility_id = new DMPIdentifier(options?.facility_id);
    this.name = options?.name;
    this.type = options?.type ?? DMPResearchFacilityType.FIELD_STATION;
    this.errors = options?.errors ?? {};
  }
}

// Represents a security and privacy statement associated with a research output
export class DMPSecurityAndPrivacyStatement {
  public description: string;
  public title: string;
  public errors: Record<string, string>;

  constructor(options) {
    this.description = options?.description;
    this.title = options?.title;
    this.errors = options?.errors ?? {};
  }
}

// Represents a technical resource that will be used to conduct the research
export class DMPTechnicalResource {
  public description: string;
  public name: string;
  public technical_resource_id: DMPIdentifier;
  public errors: Record<string, string>;

  constructor(options) {
    this.description = options?.description;
    this.name = options?.name;
    this.technical_resource_id = new DMPIdentifier(options?.technical_resource_id, );
    this.errors = options?.errors ?? {};
  }
}

// Represents a version of the plan
export class DMPVersion {
  public timestamp: string;
  public url: string;
  public errors: Record<string, string>;

  constructor(options) {
    this.timestamp = options?.timestamp;
    this.url = options?.url;
    this.errors = options?.errors ?? {};
  }
}
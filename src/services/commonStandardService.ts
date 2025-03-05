import { DMPHubConfig } from "../config/dmpHubConfig";
import { MyContext } from "../context";
import { DEFAULT_ROR_AFFILIATION_URL } from "../models/Affiliation";
import { ProjectFunderStatus } from "../models/Funder";
import { defaultLanguageId } from "../models/Language";
import { Plan, PlanStatus, PlanVisibility } from "../models/Plan"
import { getCurrentDate } from "../utils/helpers";

// Represents the the RDA Common Metadata standard version of a plan/DMP. When communicating with external
// systems we need to convert project/plan data into this format. This is the format that the DMPHub
// DynamoDB uses.
//
// Some things of note:
//   - All properties prefixed with `dmproadmap_` or `dmphub_` are not parts of the RDA Common Metadata standard
//     They are used to store information that is either not yet supported by that format or are used to
//      facilitate mapping the information back into Project/Plan data.
//   - There are no booleans, use the DMPYesNoUnknown enum to represent boolean values (except `dmphub_featured`)
//   - There are no dates, use strings in the 'YYYY-MM-DD' or 'YYYY-MM-DD hh:mm:ss:msZ' to represent dates/times
//   - The `dmphub_provenance_id` is used to store the ID of the system that created the DMP
//   - The `registered` date is used to store the date that the DMP ID (DOI) was published/registered
//
// We are currently using schema version 1.1
//     See: https://github.com/RDA-DMP-Common/RDA-DMP-Common-Standard/tree/master/examples/JSON/JSON-schema/1.1

export async function planToDMPCommonStandard(
  context: MyContext,
  reference: string,
  plan: Plan
): Promise<DMPCommonStandard | null> {
  const project = await loadProjectAndTemplateInfo(context, reference, plan.id);
  const fundings = await loadFunderInfo(context, reference, plan.id);
  const contributors = await loadContributorInfo(context, reference, plan.id);
  const narrative = await loadNarrativeTemplateInfo(context, reference, plan.id);

  const contact = contributors.find((c) => c.isPrimaryContact);

  // If we don't have the bare minimum amount of data to make the DMP valid
  if (!contact || !project) {
    return null;
  }

  let status: DMPStatus;
  switch (plan.status) {
    case PlanStatus.ARCHIVED:
      status = DMPStatus.ARCHIVED;
      break;
    case PlanStatus.COMPLETE:
      status = DMPStatus.COMPLETE;
      break;
    case PlanStatus.PUBLISHED:
      status = DMPStatus.PUBLISHED;
      break;
    default:
      status = DMPStatus.DRAFT;
      break;
  }

  return {
    dmphub_provenance_id: DMPHubConfig.dmpHubProvenance,
    created: plan.created,
    modified: plan.modified,
    registered: plan.registered,
    title: `DMP for: ${project[0].name ?? project[0].title}`,
    description: project[0].abstractText,
    language: plan.languageId?.length > 3 ? convertFiveCharToThreeChar(this.languageId) : this.languageId,
    ethical_issues_exist: DMPYesNoUnknown.UNKNOWN,
    dmproadmap_featured: plan.featured,
    dmproadmap_privacy: plan.visibility === PlanVisibility.PUBLIC ? DMPPrivacy.PUBLIC : DMPPrivacy.PRIVATE,
    dmproadmap_status: status,

    dmp_id: {
      identifier: plan.dmpId,
      type: 'doi',
    },

    contact: {
      name: [contact?.givenName, contact?.surName].filter((n) => n).join(' ').trim(),
      mbox: contact?.email,
      dmproadmap_affiliation: {
        name: contact?.name,
        affiliation_id: {
          identifier: contact?.uri,
          type: contact?.uri.startsWith(DEFAULT_ROR_AFFILIATION_URL) ? 'ror' : 'url',
        },
      },
      contact_id: {
        identifier: contact?.orcid ?? contact?.email,
        type: contact?.orcid ? 'orcid' : 'other',
      },
    },

    contributor: contributors.map((contributor) => contributorToDMPCommonStandard(contributor)),

    // TODO: Add in dataset once we've got that built out
    dataset: [{
      type: 'dataset',
      title: 'Initial Dataset',
      issued: getCurrentDate(),
      personal_data: DMPYesNoUnknown.UNKNOWN,
      sensitive_data: DMPYesNoUnknown.UNKNOWN,
      dataset_id: {
        identifier: `${plan.dmpId}/dataset`,
        type: 'doi',
      },
    }],

    project: [{
      title: project[0].title,
      description: project[0].abstractText,
      start: project[0].startDate,
      end: project[0].endDate,

      funding: fundings.map((funder) => funderToDMPCommonStandard(funder)),
    }],

    // TODO: Add in dmproadmap_related_identifiers once we have that part built out

    dmproadmap_narrative: planNarrativeToDMPCommonStandard(narrative),
  };
}

// Helper function to convert a 3 character language code to a 5 character code
export function convertFiveCharToThreeChar(language: string): string {
  switch (language) {
    case 'pt-BR':
      return 'ptb';
    default:
      return 'eng';
  }
}

// Helper function to convert a 5 character language code to a 3 character code
export function convertThreeCharToFiveChar(language: string): string {
  switch (language) {
    case 'ptb':
      return 'pt-BR';
    default:
      return defaultLanguageId;
  }
}

// Fetch the project and template info needed to construct the DMP Common Standard
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadProjectAndTemplateInfo = async (context: MyContext, reference: string, planId: number): Promise<any> => {
  const sql = 'SELECT pr.title, pr.abstractText, pr.startDate, pr.EndDate, t.name ' +
                      'FROM plans p ' +
                        'INNER JOIN projects pr ON p.projectId = pr.id ' +
                        'INNER JOIN versionedTemplates vt ON p.versionedTemplateId = vt.id ' +
                      'WHERE p.id = ?';
  const results = await Plan.query(context, sql, [planId.toString()], reference);
  return Array.isArray(results) && results.length > 0 ? results[0] : null;
}

// Fetch the funder info needed to construct the DMP Common Standard
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadFunderInfo = async (context: MyContext, reference: string, planId: number): Promise<any[]> => {
  const sql = 'SELECT a.uri, a.name, prf.status, prf.grantId, prf.funderProjectNumber, prf.funderOpportunityNumber ' +
                    'FROM planFunders pf ' +
                      'LEFT JOIN projectFunders prf ON pf.projectFunderId = prf.id' +
                        'LEFT JOIN affiliations a ON prf.affiliationId = a.id WHERE pf.planId = ?';
  const fundings = await Plan.query(context, sql, [planId.toString()], reference);
  return Array.isArray(fundings) ? fundings : [];
}

// Fetch the contributor info needed to construct the DMP Common Standard
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadContributorInfo = async (context: MyContext, reference: string, planId: number): Promise<any[]> => {
  const sql = 'SELECT a.uri, a.name, pctr.email, pctr.givenName, pctr.surName, pctr.orcid, ' +
                        'pc.isPrimaryContact, GROUP_CONCAT(r.uri) as roles ' +
                      'FROM planContributors pc ' +
                        'LEFT JOIN planContributorRoles pcr ON pc.id = pcr.planContributorId ' +
                          'LEFT JOIN contributorRoles r ON pcr.contributorRoleId = r.id ' +
                        'LEFT JOIN projectContributors pctr ON pc.projectContributorId = pctr.id ' +
                          'LEFT JOIN affiliations a ON pctr.affiliationId = a.uri ' +
                        'WHERE pc.planId = ? ' +
                        'GROUP BY a.uri, a.name, pctr.email, pctr.givenName, pctr.surName, pctr.orcid;';
  const contributors = await Plan.query(context, sql, [planId.toString()], reference);
  return Array.isArray(contributors) ? contributors : [];
}

// Fetch the narrative info needed to construct the DMP Common Standard
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadNarrativeTemplateInfo = async (context: MyContext, reference: string, planId: number): Promise<any> => {
  const sql = 'SELECT t.id templateId, t.name templateTitle, t.version templateVersion, ' +
                        's.id sectionId, s.name sectionTitle, s.introduction sectionDescription, s.displayOrder sectionOrder, ' +
                        'q.id questionId, q.questionText questionText, q.displayOrder questionOrder, ' +
                        'q.questionTypeId questionTypeId, qt.name questionTypeName, ' +
                        'a.id answerId, a.answerText answerText ' +
                      'FROM plans p ' +
                        `LEFT JOIN answers a ON p.id = a.planId ` +
                          'LEFT JOIN versionedQuestions q ON a.versionedQuestionId = q.id ' +
                            'LEFT JOIN questionTypes qt ON q.questionTypeId = qt.id ' +
                            'LEFT JOIN versionedSections s ON q.versionedSectionId = s.id ' +
                              'LEFT JOIN versionedTemplates t ON s.versionedTemplateId = t.id ' +
                        'WHERE p.id = ? '
                        'ORDER BY s.displayOrder, q.displayOrder;';
  const results = await Plan.query(context, sql, [planId.toString()], reference);

  const narrative = {
    templateId: results[0].templateId,
    templateTitle: results[0].templateTitle,
    templateVersion: results[0].templateVersion,
    sections: [],
  };

  // Extract all of the section and question info
  narrative.sections = results.reduce((acc, row) => {
    const section = acc.find((s) => s.sectionId === row.sectionId);
    if (!section) {
      acc.push({
        sectionId: row.sectionId,
        sectionTitle: row.sectionTitle,
        sectionDescription: row.sectionDescription,
        sectionOrder: row.sectionOrder,
        questions: [],
      });
    }
    const question = section.questions.find((q) => q.questionId === row.questionId);
    if (!question) {
      section.questions.push({
        questionId: row.questionId,
        questionText: row.questionText,
        questionOrder: row.questionOrder,
        questionTypeId: row.questionTypeId,
        questionTypeName: row.questionTypeName,
        answerId: row.answerId,
        answerText: row.answerText,
      });
    }
    return acc;
  }, []);
  // Sort the questions by display order
  narrative.sections.forEach((section) => {
    section.questions.sort((a, b) => a.questionOrder - b.questionOrder);
  });
  // Sort the sections by display order
  narrative.sections.sort((a, b) => a.sectionOrder - b.sectionOrder);

  return narrative;
}

const contributorToDMPCommonStandard = (contributor): DMPCommonStandardContributor => {
  return {
    name: [contributor.givenName, contributor.surName].filter((n) => n).join(' ').trim(),
    mbox: contributor.email,
    dmproadmap_affiliation: {
      name: contributor.name,
      affiliation_id: {
        identifier: contributor.uri,
        type: contributor.uri.startsWith(DEFAULT_ROR_AFFILIATION_URL) ? 'ror' : 'url',
      },
    },
    role: contributor.roles.split(','),
    contributor_id: {
      identifier: contributor.orcid ?? contributor.email,
      type: contributor.orcid ? 'orcid' : 'other',
    },
  };
}

const funderToDMPCommonStandard = (funding): DMPCommonStandardFunding => {
  let status: DMPFundingStatus;
  switch (funding.status) {
    case ProjectFunderStatus.DENIED:
      status = DMPFundingStatus.REJECTED;
      break;
    case ProjectFunderStatus.GRANTED:
      status = DMPFundingStatus.GRANTED;
      break;
    default:
      status = DMPFundingStatus.PLANNED;
      break;
  }

  return {
    name: funding.name,
    funder_id: {
      identifier: funding.uri,
      type: funding.uri.startsWith(DEFAULT_ROR_AFFILIATION_URL) ? 'ror' : 'url',
    },
    funding_status: status,
    grant_id: {
      identifier: funding.grantId,
      type: funding.grantId.startsWith('http') ? 'url' : 'other'
    },
    dmproadmap_project_number: funding.funderProjectNumber,
    dmproadmap_opportunity_number: funding.funderOpportunityNumber,
  };
}

// Converts the narrative from the Plan format to the DMP Common Standard format
const planNarrativeToDMPCommonStandard = (narrative): DMPCommonStandardNarrative => {
  return {
    template_id: narrative.templateId,
    template_title: narrative.templateTitle,
    template_version: narrative.templateVersion,

    sections: narrative.sections.map((section) => ({
      section_id: section.id,
      section_title: section.title,
      section_description: section.description,
      section_order: section.displayOrder,

      questions: section.questions.map((question) => ({
        question_id: question.id,
        question_text: question.questionText,
        question_order: question.displayOrder,

        question_type: {
          id: question.questionTypeId,
          name: question.questionTypeName,
        },

        answer_id: question.answer?.id,
        answer_text: question.answer?.answerText,
      })),
    })),
  };
}

export interface DMPCommonStandard {
  dmphub_provenance_id: string;
  dmproadmap_featured: boolean;
  dmproadmap_privacy: DMPPrivacy;
  dmproadmap_status: DMPStatus;
  dmproadmap_narrative: DMPCommonStandardNarrative;

  created: string;
  modified: string;
  registered?: string;

  title: string;
  description?: string;
  language: string;
  ethical_issues_exist: string;
  ethical_issues_description?: string;
  ethical_issues_report?: string;

  dmp_id: {
    identifier: string;
    type: 'doi' | 'other';
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
}

// Representation of the primary contact in the DMP Common Standard format
interface DMPCommonStandardContact {
  name: string;
  mbox: string;
  dmproadmap_affiliation: {
    name: string;
    affiliation_id: {
      identifier: string;
      type: 'ror' | 'url';
    };
  };
  contact_id: {
    identifier: string;
    type: 'orcid' | 'other';
  };
}

// Representation of a Contributor in the DMP Common Standard format
interface DMPCommonStandardContributor {
  name: string;
  mbox?: string;
  dmproadmap_affiliation?: {
    name: string;
    affiliation_id: {
      identifier: string;
      type: 'ror' | 'url';
    }
  }
  contributor_id?: {
    identifier: string;
    type: 'orcid' | 'other';
  }
  role: string[];
}

// Represents a budgetary cost in the DMP Common Standard format
interface DMPCommonStandardCost {
  title: string;
  currency_code?: string;
  description?: string;
  value?: number
}

// Represents a research output in the DMP Common Standard format
interface DMPCommonStandardDataset {
  type: string;
  title?: string;
  description?: string;
  issued: string;
  personal_data: DMPYesNoUnknown;
  sensitive_data: DMPYesNoUnknown;
  preservation_statement?: string;
  data_quality_assurance?: string[];
  keyword?: string[];

  dataset_id: {
    identifier: string;
    type: 'doi' | 'url' | 'other';
  };

  metadata?: DMPCommonStandardMetadataStandard[];
  security_and_privacy?: DMPCommonStandardSecurityAndPrivacyStatement[];
  technical_resource?: DMPCommonStandardTechnicalResource[];
  distribution?: DMPCommonStandardDistribution[];
}

// Represents a distribution to a repository of the research output in the DMP Common Standard format
interface DMPCommonStandardDistribution {
  title: string;
  description?: string;
  available_until?: string;
  byte_size?: number;
  data_access: DMPOutputAccessLevel;
  host: DMPCommonStandardHost;
  license?: DMPCommonStandardLicense[];
}

// Represnts a repository the research output will be stored in
interface DMPCommonStandardHost {
  title: string;
  description?: string;
  url: string;
  dmproadmap_host_id?: {
    identifier: string;
    type: 'doi' | 'url' | 'other';
  }
}

// Representation of a PLanFunder in the DMP Common Standard format
interface DMPCommonStandardFunding {
  name: string;
  funder_id?: {
    identifier: string;
    type: 'ror' | 'url';
  }
  funding_status: DMPFundingStatus;
  grant_id?: {
    identifier: string;
    type: 'url' | 'other';
  };
  dmproadmap_project_number?: string;
  dmproadmap_opportunity_number?: string;
}

// Represents a license agreement in the DMP Common Standard format
interface DMPCommonStandardLicense {
  license_ref: string;
  start_date: string;
}

// Represents a metadata standard that will be used to describe the research output
interface DMPCommonStandardMetadataStandard {
  description?: string;
  language: string;
  metadata_standard_id: {
    identifier: string;
    type: 'url' | 'doi' | 'other';
  };
}

// Represents the narrative elements of a Plan in the DMP Common Standard format
interface DMPCommonStandardNarrative {
  template_id: number;
  template_title: string;
  template_version: string;

  sections: DMPCommonStandardNarrativeSection[];
}

// Represents a question in the narrative in the DMP Common Standard format
interface DMPCommonStandardNarrativeQuestion {
  question_id: number;
  question_text: string;
  question_order?: number;

  question_type: {
    id: number;
    name: string;
  }

  answer_id?: number;
  answer_text?: string;
}

// Represents a section of the narrative in the DMP Common Standard format
interface DMPCommonStandardNarrativeSection {
  section_id: number;
  section_title: string;
  section_description?: string;
  section_order?: number;

  questions: DMPCommonStandardNarrativeQuestion[];
}

// Representation of a Project in the DMP Common Standard format
interface DMPCommonStandardProject {
  title: string;
  description?: string;
  start?: string;
  end?: string;

  funding?: DMPCommonStandardFunding[];
}

// Represents a related work in the DMP Common Standard format
interface DMPCommonStandardRelatedIdentifier {
  work_type: DMPRelatedIdentifierWorkType;
  descriptor: DMPRelatedIdentifierDescriptor;
  identifier: string;
  type: 'doi' | 'url' | 'other';
  citation?: string;
}

// Representation of a research facility in the DMP Common Standard format
interface DMPCommonStandardResearchFacility {
  name: string;
  type: DMPResearchFacilityType;
  dmproadmap_research_facility_id?: {
    identifier: string;
    type: 'ror' | 'url';
  };
}

// Representation of a security an privacy statement in the DMP Common Standard format
interface DMPCommonStandardSecurityAndPrivacyStatement {
  title: string;
  description?: string;
}

// Representation of a technical resource in the DMP Common Standard format
interface DMPCommonStandardTechnicalResource {
  name: string;
  description?: string;
  technical_resource_id?: {
    identifier: string;
    type: 'doi' | 'url' | 'other';
  }
}

// Representation of a link to a historical version of the DMP
interface DMPCommonStandardVersion {
  timestamp: string;
  url: string;
}

enum DMPYesNoUnknown {
  YES = 'yes',
  NO = 'no',
  UNKNOWN = 'unknown',
}

enum DMPStatus {
  ARCHIVED = 'archived',
  DRAFT = 'draft',
  COMPLETE = 'complete',
  PUBLISHED = 'published',
}

enum DMPPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

enum DMPFundingStatus {
  PLANNED = 'planned',
  APPLIED = 'applied',
  GRANTED = 'granted',
  REJECTED = 'rejected',
}

enum DMPOutputAccessLevel {
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

import { MyContext } from "../context";
import { ORCID_REGEX } from "./User";
import { DEFAULT_ROR_AFFILIATION_URL } from "./Affiliation";
import { formatLogMessage } from "../logger";
import { validateDate, validateURL, valueIsEmpty } from "../utils/helpers";
import { defaultLanguageId } from "./Language";
import { Plan } from "./Plan";

export const DOI_REGEX = /(https?:\/)?(doi.org\/)?(doi:)?10.\d{4,9}\/[-._;()/:A-Z0-9]+/i;

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
    const lang = options.language ?? defaultLanguageId;

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
    this.language = lang?.length < 5 ? LanguageConvertThreeToFive(lang) : lang;
    this.ethical_issues_exist = options.ethical_issues_exist;
    this.ethical_issues_description = options.ethical_issues_description;
    this.ethical_issues_report = options.ethical_issues_report;
    this.dmproadmap_featured = options.dmproadmap_featured === 1 ? true : false;
    this.dmproadmap_privacy = options.dmproadmap_privacy ?? DMPVisibility.PRIVATE;
    this.dmproadmap_status = options.dmproadmap_status ?? DMPStatus.DRAFT;

    this.contact = new DMPContact(options.contact);
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

  // Validate the DMP (must have a title, created, modified, language and a dataset)
  // All child objects must also be valid
  async isValid(): Promise<boolean> {
    // The following properties are required for all DMPs
    if (valueIsEmpty(this.title)) this.errors['title'] = 'DMP must have a title';
    if (valueIsEmpty(this.language)) this.errors['language'] = 'DMP must have a language';
    if (valueIsEmpty(this.created)) this.errors['created'] = 'DMP must have a created date';
    if (valueIsEmpty(this.modified)) this.errors['modified'] = 'DMP must have a modified date';
    if (valueIsEmpty(this.ethical_issues_exist)) {
      this.errors['ethical_issues_exist'] = 'DMP must indicate whether any ethical issues exist';
    }
    // A DMP must have a valid language code
    if (this.dmp_id.isEmpty() || !this.dmp_id.isValid()) this.errors['dmp_id'] = 'DMP must have a DMP ID';
    // A DMP must have a primary contact
    if (this.contact.isEmpty() || !this.contact.isValid()) this.errors['contact'] = 'DMP must have a primary contact';
    // A DMP must have at least one research output
    const validDatasets = this.dataset.filter((dataset) => !dataset.isEmpty() && dataset.isValid());
    if (validDatasets.length === 0) this.errors['dataset'] = 'DMP must have at least one valid research output';

    // Then just verify that all other child objects are valid
    const allContributorsAreValid = this.contributor.every((contributor) => {
      return contributor.isEmpty() || contributor.isValid();
    });
    if (!allContributorsAreValid) this.errors['contributor'] = 'DMP must have valid contributors';
    const allCostsAreValid = this.cost.every((cost) => cost.isEmpty() || cost.isValid());
    if (!allCostsAreValid) this.errors['cost'] = 'DMP must have valid costs';
    const allProjectsAreValid = this.project.every((project) => project.isEmpty() || project.isValid());
    if (!allProjectsAreValid) this.errors['project'] = 'DMP must have valid projects';
    const allRelatedIdsAreValid = this.dmproadmap_related_identifiers.every((relatedId) => {
      return relatedId.isEmpty() || relatedId.isValid();
    });
    if (!allRelatedIdsAreValid) this.errors['dmproadmap_related_identifiers'] = 'DMP must have valid related identifiers';
    const allResearchFacilitiesAreValid = this.dmproadmap_research_facilities.every((facility) => {
      return facility.isEmpty() || facility.isValid();
    });
    if (!allResearchFacilitiesAreValid) this.errors['dmproadmap_research_facilities'] = 'DMP must have valid research facilities';
    const allVersionsAreValid = this.dmphub_versions.every((version) => version.isEmpty() || version.isValid());
    if (!allVersionsAreValid) this.errors['dmphub_versions'] = 'DMP must have valid versions';

    return Object.keys(this.errors).length === 0;
  }

  toJSON(): string {
    // The top level of the JSON must be an object with a single property 'dmp' that contains the DMP JSON
    return JSON.stringify({ dmp: this.toCommonStandard() });
  }

  // Convert this DMP into the RDA Common Metadata Standard JSON format
  toCommonStandard() {
    return {
      dmp_id: this.dmp_id.toCommonStandard(),
      dmphub_provenance_id: this.dmphub_provenance_id,
      dmproadmap_project_id: this.dmproadmap_project_id,
      dmproadmap_template_id: this.dmproadmap_template_id,
      created: this.created,
      modified: this.modified,
      registered: this.registered,
      title: this.title,
      description: this.description,
      language: this.language?.length > 3 ? LanguageConvertFiveToThree(this.language) : this.language,
      ethical_issues_exist: this.ethical_issues_exist,
      ethical_issues_description: this.ethical_issues_description,
      ethical_issues_report: this.ethical_issues_report,
      dmproadmap_featured: this.dmproadmap_featured,
      dmproadmap_privacy: this.dmproadmap_privacy,
      dmproadmap_status: this.dmproadmap_status,
      contact: this.contact.toCommonStandard(),
      contributor: this.contributor.map((contributor) => contributor.toCommonStandard()),
      cost: this.cost.map((cost) => cost.toCommonStandard()),
      dataset: this.dataset.map((dataset) => dataset.toCommonStandard()),
      project: this.project.map((project) => project.toCommonStandard()),
      dmproadmap_related_identifiers: this.dmproadmap_related_identifiers.map((relatedId) => relatedId.toCommonStandard()),
      dmproadmap_research_facilities: this.dmproadmap_research_facilities.map((facility) => facility.toCommonStandard()),
      dmphub_versions: this.dmphub_versions.map((version) => version.toCommonStandard()),
    };
  }

  async create(context: MyContext, plan: Plan): Promise<DMP | null> {
    formatLogMessage(context).debug({ plan }, 'Creating DMP');

    const dmp = DMP.fromPlan(plan);
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
  static async findById(reference: string, context: MyContext, dmp_id: string, version: string): Promise<DMP | null> {
    return await context.dataSources.dmphubAPIDataSource.getDMP(context, dmp_id, version, reference);
  }
}

function LanguageConvertThreeToFive(language: string): string {
  switch (language) {
    case 'pt-BR':
      return 'ptb';
    default:
      return 'eng';
  }
}

function LanguageConvertFiveToThree(language: string): string {
  switch (language) {
    case 'ptb':
      return 'pt-BR';
    default:
      return 'en-US';
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

  // Check if the affiliation is empty (no name or affiliation ID)
  isEmpty(): boolean {
    return valueIsEmpty(this.name) && this.affiliation_id.isEmpty();
  }

  // Validate the affiliation (must have a name or an affiliation ID)
  isValid(): boolean {
    const idIsEmpty = this.affiliation_id.isEmpty();
    if (!idIsEmpty && !this.affiliation_id.isValid()) {
      this.errors['affiliation_id'] = 'Affiliation must have a valid identifier';
    }
    if (idIsEmpty && valueIsEmpty(this.name)) {
      this.errors['affiliation_id'] = 'Affiliation id must have a name or a valid identifier';
    }

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      name: this.name,
    };
    if (!this.affiliation_id.isEmpty()) {
      out['affiliation_id'] = this.affiliation_id.toCommonStandard();
    }
    return out;
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

  // Check if the contact is empty (no name, email or contact ID)
  isEmpty(): boolean {
    return valueIsEmpty(this.name) && valueIsEmpty(this.mbox) && this.dmproadmap_affiliation.isEmpty() &&
      this.contact_id.isEmpty();
  }

  // Validate the contact (must have a name, mbox and contact ID)
  isValid(): boolean {
    if (valueIsEmpty(this.name)) this.errors['name'] = 'Primary contact must have a name';
    if (valueIsEmpty(this.mbox)) this.errors['mbox'] = 'Primary contact must have an email address';

    if (this.contact_id.isEmpty() || !this.contact_id.isValid()){
      this.errors['contact_id'] = 'Primary contact id must have a valid identifier';
    }

    if (!this.dmproadmap_affiliation.isEmpty() && !this.dmproadmap_affiliation.isValid()) {
      this.errors['dmproadmap_affiliation'] = 'Primary contact must have a valid affiliation';
    }

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      name: this.name,
      mbox: this.mbox,
    };
    if (!this.dmproadmap_affiliation.isEmpty()) {
      out['dmproadmap_affiliation'] = this.dmproadmap_affiliation.toCommonStandard();
    }
    if (!this.contact_id.isEmpty()) {
      out['contact_id'] = this.contact_id.toCommonStandard();
    }
    return out;
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

  // Check if the contributor is empty (no name, email, affiliation or contributor ID)
  isEmpty(): boolean {
    return valueIsEmpty(this.name) && valueIsEmpty(this.mbox) && this.dmproadmap_affiliation.isEmpty() &&
      this.contributor_id.isEmpty() && this.role.length === 0;
  }

  // Validate the contributor (must have a role and name)
  isValid(): boolean {
    if (this.role.length === 0) this.errors['role'] = 'Contributor must have at least one role';
    if (valueIsEmpty(this.name)) this.errors['name'] = 'Contributor must have a name';

    // Technically the contributor_id is required by the common standard but we allow it to be empty
    const idIsEmpty = this.contributor_id.isEmpty();
    if (!idIsEmpty && !this.contributor_id.isValid()) {
      this.errors['contributor_id'] = 'Contributor id must have a valid identifier';
    }

    if (!this.dmproadmap_affiliation.isEmpty() && !this.dmproadmap_affiliation.isValid()) {
      this.errors['dmproadmap_affiliation'] = 'Contributor must have a valid affiliation';
    }



    if (valueIsEmpty(this.name) && valueIsEmpty(this.mbox) && idIsEmpty) {
      this.errors['general'] = 'Contributor must have a name, an email address or a contributor ID';
    }

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      name: this.name,
      mbox: this.mbox,
      role: this.role,
    };
    if (!this.dmproadmap_affiliation.isEmpty()) {
      out['dmproadmap_affiliation'] = this.dmproadmap_affiliation.toCommonStandard();
    }
    if (!this.contributor_id.isEmpty()) {
      out['contributor_id'] = this.contributor_id.toCommonStandard();
    }
    return out;
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

  // Check if the cost is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.title) && valueIsEmpty(this.currency_code) && valueIsEmpty(this.description) &&
      valueIsEmpty(this.value);
  }

  // Validate the cost (must have a title, currency code and value)
  isValid(): boolean {
    if (valueIsEmpty(this.title)) this.errors['title'] = 'Cost must have a title';

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    return {
      title: this.title,
      currency_code: this.currency_code,
      description: this.description,
      value: this.value,
    };
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

  // Check if the distribution is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.available_until) && valueIsEmpty(this.byte_size) && valueIsEmpty(this.data_access) &&
      valueIsEmpty(this.description) && valueIsEmpty(this.title) && this.host.isEmpty() &&
      (this.license.length === 0 || this.license.every((lic) => lic.isEmpty()));
  }

  // Validate the distribution (must have a data_access and a title)
  isValid(): boolean {
    if (valueIsEmpty(this.title)) this.errors['title'] = 'Distribution must have a title';
    if (valueIsEmpty(this.data_access)) this.errors['data_access'] = 'Distribution must have a data access level';

    // If the host/repo is specified make sure it's valid
    if (!this.host.isEmpty() && !this.host.isValid()) this.errors['host'] = 'Distribution must have a valid host';

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      available_until: this.available_until,
      data_access: this.data_access,
      description: this.description,
      title: this.title,
    };
    if (!valueIsEmpty(this.byte_size)) {
      out['byte_size'] = Number(this.byte_size);
    }
    if (!this.host.isEmpty()) {
      out['host'] = this.host.toCommonStandard();
    }
    if (this.license.length > 0) {
      out['license'] = this.license.map((lic) => lic.toCommonStandard());
    }
    return out;
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

  // Check if the funding is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.dmproadmap_opportunity_number) && valueIsEmpty(this.dmproadmap_project_number) &&
      this.funder_id.isEmpty() && this.funding_status === undefined && this.grant_id.isEmpty() &&
      valueIsEmpty(this.name);
  }

  // Validate the funding (must have a funder ID or a name)
  isValid(): boolean {
    // The funder_id is required
    if (this.funder_id.isEmpty() || !this.funder_id.isValid()) {
      this.errors['funder_id'] = 'Funding must have a funder ID';
    }

    // If a grant_id is present make sure it's valid
    if (!this.grant_id.isEmpty() && !this.grant_id.isValid()) {
      this.errors['grant_id'] = 'Grant id must have a valid identifier';
    }

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      dmproadmap_opportunity_number: this.dmproadmap_opportunity_number,
      dmproadmap_project_number: this.dmproadmap_project_number,
      funding_status: this.funding_status,
      name: this.name,
    };
    if (!this.funder_id.isEmpty()) {
      out['funder_id'] = this.funder_id.toCommonStandard();
    }
    if (!this.grant_id.isEmpty()) {
      out['grant_id'] = this.grant_id.toCommonStandard();
    }
    return out;
  }
}

// Represents a unique identifier
class DMPIdentifier {
  public identifier: string;
  public type: string;
  public errors: Record<string, string>;

  constructor(options) {
    if (options?.identifier) {
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

  // Check if the identifier is empty (no identifier or type)
  isEmpty(): boolean {
    return valueIsEmpty(this.identifier) && valueIsEmpty(this.type);
  }

  // Check if the identifier is valid (must have an idenitfier and a type)
  isValid(): boolean {
    // Both properties are always required
    if (valueIsEmpty(this.identifier)) this.errors['identifier'] = 'Identifier must have a value';
    if (valueIsEmpty(this.type)) this.errors['type'] = 'Identifier must have a type';

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    return {
      identifier: this.identifier,
      type: this.type,
    };
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

  // Check if the license is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.license_ref) && valueIsEmpty(this.start_date);
  }

  // Validate the license (must have a license reference and a start date)
  isValid(): boolean {
    if (valueIsEmpty(this.license_ref)) this.errors['license_ref'] = 'License must have a reference';
    if (!validateDate(this.start_date)) this.errors['start_date'] = 'License must have a start date';

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    return {
      license_ref: this.license_ref,
      start_date: this.start_date,
    };
  }
}

// Represents a metadata standard that will be used to describe a research output
export class DMPMetadataStandard {
  public description: string;
  public language: string;
  public metadata_standard_id: DMPIdentifier;
  public errors: Record<string, string>;

  constructor(options) {
    const lang = options?.language ?? defaultLanguageId;

    this.description = options?.description;
    this.language = lang?.length < 5 ? LanguageConvertThreeToFive(lang) : lang;
    this.metadata_standard_id = new DMPIdentifier(options?.metadata_standard_id);
    this.errors = options?.errors ?? {};
  }

  // Check if the metadata standard is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.description) && valueIsEmpty(this.language) && this.metadata_standard_id.isEmpty();
  }

  // Validate the metadata standard (must have a metadata standard ID and language)
  isValid(): boolean {
    if (valueIsEmpty(this.language)) this.errors['language'] = 'Metadata standard must have a language';
    if (!this.metadata_standard_id.isEmpty() && !this.metadata_standard_id.isValid()) {
      this.errors['metadata_standard_id'] = 'Metadata standard must have a valid ID';
    }

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      description: this.description,
      language: this.language?.length > 3 ? LanguageConvertFiveToThree(this.language) : this.language,
    };
    if (!this.metadata_standard_id.isEmpty()) {
      out['metadata_standard_id'] = this.metadata_standard_id.toCommonStandard();
    }
    return out;
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
    this.data_quality_assurance = options?.data_quality_assurance ?? [];
    this.dataset_id = new DMPIdentifier(options?.dataset_id);
    this.description = options?.description;
    this.issued = options?.issued;
    this.keyword = options?.keyword ?? [];
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

  // Check if the output is empty
  isEmpty(): boolean {
    return this.data_quality_assurance.every((dqa) => valueIsEmpty(dqa)) && this.dataset_id.isEmpty() &&
      valueIsEmpty(this.description) && valueIsEmpty(this.issued) && this.keyword.every((kw) => valueIsEmpty(kw)) &&
      valueIsEmpty(this.personal_data) && valueIsEmpty(this.preservation_statement) &&
      valueIsEmpty(this.sensitive_data) && valueIsEmpty(this.type) && valueIsEmpty(this.title) &&
      (this.distribution.length === 0 || this.distribution.every((dist) => dist.isEmpty())) &&
      (this.metadata.length === 0 || this.metadata.every((meta) => meta.isEmpty())) &&
      (this.security_and_privacy.length === 0 || this.security_and_privacy.every((sp) => sp.isEmpty())) &&
      (this.technical_resource.length === 0 || this.technical_resource.every((tech) => tech.isEmpty()));
  }

  // Validate the output (must have a title and sensitive data flag and a personal data flag)
  isValid(): boolean {
    // The following properties are required
    if (valueIsEmpty(this.title)) this.errors['title'] = 'Output must have a title';
    if (valueIsEmpty(this.sensitive_data)) {
      this.errors['sensitive_data'] = 'Output must indicate whether it contains sensitive data';
    }
    if (valueIsEmpty(this.personal_data)) {
      this.errors['personal_data'] = 'Output must indicate whether it contains personal data';
    }

    // The dataset_id is required
    if (!this.dataset_id.isEmpty() && !this.dataset_id.isValid()) {
      this.errors['dataset_id'] = 'Output must have a valid dataset ID';
    }

    // If the following child properties have entries make sure they are valid
    const distributionsAreValid = this.distribution.every((dist) => dist.isEmpty() || dist.isValid());
    if (!distributionsAreValid) this.errors['distribution'] = 'Output must have valid distributions';
    const metadataStandardsAreValid = this.metadata.every((meta) => meta.isEmpty() || meta.isValid());
    if (!metadataStandardsAreValid) this.errors['metadata'] = 'Output must have valid metadata standards';
    const securityAndPrivacyAreValid = this.security_and_privacy.every((sec) => sec.isEmpty() || sec.isValid());
    if (!securityAndPrivacyAreValid) this.errors['security_and_privacy'] = 'Output must have valid security and privacy statements';
    const technicalResourcesAreValid = this.technical_resource.every((tech) => tech.isEmpty() || tech.isValid());
    if (!technicalResourcesAreValid) this.errors['technical_resource'] = 'Output must have valid technical resources';

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      data_quality_assurance: this.data_quality_assurance,
      description: this.description,
      distribution: this.distribution.map((dist) => dist.toCommonStandard()),
      issued: this.issued,
      keyword: this.keyword,
      metadata: this.metadata.map((meta) => meta.toCommonStandard()),
      personal_data: this.personal_data,
      preservation_statement: this.preservation_statement,
      security_and_privacy: this.security_and_privacy.map((sec) => sec.toCommonStandard()),
      sensitive_data: this.sensitive_data,
      technical_resource: this.technical_resource.map((tech) => tech.toCommonStandard()),
      title: this.title,
      type: this.type,
    };
    if (!this.dataset_id.isEmpty()) {
      out['dataset_id'] = this.dataset_id.toCommonStandard();
    }
    if (this.distribution.length > 0) {
      out['distribution'] = this.distribution.map((dist) => dist.toCommonStandard());
    }
    if (this.metadata.length > 0) {
      out['metadata'] = this.metadata.map((meta) => meta.toCommonStandard());
    }
    if (this.security_and_privacy.length > 0) {
      out['security_and_privacy'] = this.security_and_privacy.map((sec) => sec.toCommonStandard());
    }
    if (this.technical_resource.length > 0) {
      out['technical_resource'] = this.technical_resource.map((tech) => tech.toCommonStandard());
    }
    return out;
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

  // Check if the project is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.description) && valueIsEmpty(this.end) && valueIsEmpty(this.start) &&
      valueIsEmpty(this.title) && this.funding.every((fund) => fund.isEmpty());
  }

  // Validate the project (must have a title). If the project has a start and end date then both dates must be
  // valid and the end date must fall after the start date
  isValid(): boolean {
    // A project requires a title
    if (valueIsEmpty(this.title)) this.errors['title'] = 'Project must have a title';

    // Then just make sure any funding sources are valid
    const allFundingsAreValid = this.funding.every((fund) => fund.isEmpty() || fund.isValid());
    if (!allFundingsAreValid) this.errors['funding'] = 'Project must have valid funding sources';

    // Make sure the dates are valid if they exist
    if (this.start && !validateDate(this.start)) this.errors['start'] = 'Project start date must be a valid date';
    if (this.end && !validateDate(this.end)) this.errors['end'] = 'Project end date must be a valid date';
    if (this.start && this.end && new Date(this.start) > new Date(this.end)) {
      this.errors['end'] = 'Project end date must fall after the start date';
    }

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      description: this.description,
      end: this.end,
      start: this.start,
      title: this.title,
    };
    if (this.funding.length > 0) {
      out['funding'] = this.funding.map((fund) => fund.toCommonStandard());
    }
    return out;
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

  // Check if the related identifier is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.citation) && valueIsEmpty(this.descriptor) && valueIsEmpty(this.identifier) &&
      valueIsEmpty(this.type) && valueIsEmpty(this.work_type);
  }

  // Validate the related identifier (must have a descriptor, work type, identifier and type)
  isValid(): boolean {
    if (valueIsEmpty(this.descriptor)) this.errors['descriptor'] = 'Related identifier must have a descriptor';
    if (valueIsEmpty(this.work_type)) this.errors['work_type'] = 'Related identifier must have a work type';
    if (valueIsEmpty(this.identifier)) this.errors['identifier'] = 'Related identifier must have an identifier';
    if (valueIsEmpty(this.type)) this.errors['type'] = 'Related identifier must have a type';

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    return {
      citation: this.citation,
      descriptor: this.descriptor,
      identifier: this.identifier,
      type: this.type,
      work_type: this.work_type,
    };
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

  // Check if the repository is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.description) && this.dmproadmap_host_id.isEmpty() && valueIsEmpty(this.title) &&
      valueIsEmpty(this.url);
  }

  // Check if the repository is valid (must have a title and a URL)
  isValid(): boolean {
    if (valueIsEmpty(this.title)) this.errors['title'] = 'Repository must have a title';
    if (valueIsEmpty(this.url)) this.errors['url'] = 'Repository must have a URL';

    if (!this.dmproadmap_host_id.isEmpty() && !this.dmproadmap_host_id.isValid()) {
      this.errors['dmproadmap_host_id'] = 'Repository must have a valid host ID';
    }

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      description: this.description,
      title: this.title,
      url: this.url,
    };
    if (!this.dmproadmap_host_id.isEmpty()) {
      out['dmproadmap_host_id'] = this.dmproadmap_host_id.toCommonStandard();
    }
    return out;
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

  // Check if the research facility is empty
  isEmpty(): boolean {
    return this.facility_id.isEmpty() && valueIsEmpty(this.name) && valueIsEmpty(this.type);
  }

  // Validate the research facility (must have a type and must have either a name or a facility ID)
  isValid(): boolean {
    if (valueIsEmpty(this.type)) this.errors['type'] = 'Research facility must have a type';

    // If the facility id exists, validate it
    const idIsEmpty = this.facility_id.isEmpty();
    if (!idIsEmpty && !this.facility_id.isValid()) {
      this.errors['facility_id'] = 'Research facility must have a valid facility ID';
    }
    if (valueIsEmpty(this.name) && idIsEmpty) {
      // If the facility id does not exist, then the name is required
      this.errors['general'] = 'Research facility must have a name or a facility ID';
    }

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      name: this.name,
      type: this.type,
    };
    if (!this.facility_id.isEmpty()) {
      out['facility_id'] = this.facility_id.toCommonStandard();
    }
    return out;
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

  // Check if the security and privacy statement is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.description) && valueIsEmpty(this.title);
  }

  // Validate the security and privacy statement (must have a title)
  isValid(): boolean {
    if (valueIsEmpty(this.title)) this.errors['title'] = 'Security and privacy statement must have a title';

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    return {
      description: this.description,
      title: this.title,
    };
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
    this.technical_resource_id = new DMPIdentifier(options?.technical_resource_id,);
    this.errors = options?.errors ?? {};
  }

  // Check if the technical resource is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.description) && valueIsEmpty(this.name) && this.technical_resource_id.isEmpty();
  }

  // Validate the technical resource (must have a name)
  isValid(): boolean {
    if (!valueIsEmpty(this.name)) this.errors['name'] = 'Technical resource must have a name';

    // If the technical resource id exists, validate it
    const idIsEmpty = this.technical_resource_id.isEmpty();
    if (!idIsEmpty && !this.technical_resource_id.isValid()) {
      this.errors['technical_resource_id'] = 'Technical resource must have a valid technical resource ID';
    }

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    const out = {
      description: this.description,
      name: this.name,
    };
    if (!this.technical_resource_id.isEmpty()) {
      out['technical_resource_id'] = this.technical_resource_id.toCommonStandard();
    }

    return out;
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

  // Check if the version is empty
  isEmpty(): boolean {
    return valueIsEmpty(this.timestamp) && valueIsEmpty(this.url);
  }

  // Validate the version (must have a timestamp and a URL)
  isValid(): boolean {
    if (!validateDate(this.timestamp)) this.errors['timestamp'] = 'Invalid timestamp';
    if (!validateURL(this.url)) this.errors['url'] = 'Invalid URL';

    return Object.keys(this.errors).length === 0;
  }

  toCommonStandard() {
    return {
      timestamp: this.timestamp,
      url: this.url,
    };
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

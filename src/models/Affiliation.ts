import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { randomHex } from "../utils/helpers";

export const DEFAULT_DMPTOOL_AFFILIATION_URL = 'https://dmptool.org/affiliations/';
export const DEFAULT_ROR_AFFILIATION_URL = 'https://ror.org/';

// The provenance of an Affiliation record
// Users can only update certain properties for records managed by other systems.
export enum AffiliationProvenance {
  DMPTOOL = 'DMPTOOL', // Affiliations added directly into the DMPTool (uses the URL above)
  ROR = 'ROR', // Affiliations managed by the Research Organization Registry (ROR) https://ror.org
}

// Affiliation types
export enum AffiliationType {
  EDUCATION = 'EDUCATION',
  NONPROFIT = 'NONPROFIT',
  GOVERNMENT = 'GOVERNMENT',
  FACILITY = 'FACILITY',
  COMPANY = 'COMPANY',
  HEALTHCARE = 'HEALTHCARE',
  ARCHIVE = 'ARCHIVE',
  OTHER = 'OTHER',
}

// Represents an Institution, Organization or Company
export class Affiliation extends MySqlModel {
  public uri!: string;
  public active!: boolean;
  public provenance!: AffiliationProvenance;
  public name!: string;
  public displayName!: string;
  public searchName!: string;
  public funder!: boolean;
  public fundrefId: string;
  public homepage: string;
  public acronyms: string[];
  public aliases: string[];
  public types: AffiliationType[];

  // Properties specific to the DMPTool. These can be modified regardless of the record's provenance
  public managed: boolean;
  public logoURI: string;
  public logoName: string;
  public contactEmail: string;
  public contactName: string;
  public ssoEntityId: string;
  public feedbackEnabled: boolean;
  public feedbackMessage: string;
  public feedbackEmails: string[];

  public uneditableProperties: string[];

  private tableName = 'affiliations';

  // Initialize a new Affiliation
  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.uri = options.uri;
    this.active = options.active || true;
    this.provenance = options.provenance || AffiliationProvenance.DMPTOOL;
    this.name = options.name;
    this.displayName = options.displayName;
    this.searchName = options.searchName;
    this.funder = options.funder || false;
    this.fundrefId = options.fundrefId
    this.homepage = options.homepage;
    this.acronyms = options.acronyms || [];
    this.aliases = options.aliases || [];
    this.types = options.types || [AffiliationType.OTHER];
    this.managed = options.managed;
    this.logoURI = options.logoURI;
    this.logoName = options.logoName;
    this.contactEmail = options.contactEmail;
    this.contactName = options.contactName;
    this.ssoEntityId = options.ssoEntityId;
    this.feedbackEnabled = options.feedbackEnabled;
    this.feedbackMessage = options.feedbackMessage;
    this.feedbackEmails = options.feedbackEmails;

    this.uneditableProperties = ['uri', 'provenance', 'searchName'];

    // Records owned by the DMPTool can edit these additional properties
    if (this.provenance === AffiliationProvenance.ROR) {
      ['name', 'funder', 'fundrefId', 'homepage', 'acronyms', 'aliases', 'types'].forEach((entry) => {
        this.uneditableProperties.push(entry);
      });
    }
  }

  // Convert the name, homepage, acronyms and aliases into a search string
  buildSearchName(): string {
    const parts = [this.name, this.homepage, this.acronyms, this.aliases];
    return parts.flat().filter((item) => item).join(' | ').substring(0, 249);
  }

  // Perform tasks necessary to prepare the data to be saved
  prepForSave(): void {
    this.name = this.name?.trim();
    this.managed = this.managed || false;
    this.feedbackEnabled = this.feedbackEnabled || false;
    this.acronyms = this.acronyms || [];
    this.aliases = this.aliases || [];
    this.types = this.types || [];
    this.feedbackEmails = this.feedbackEmails || [];
    this.searchName = this.buildSearchName();
    if (!this.displayName) {
      this.displayName = this.homepage ? `${this.name} (${this.homepage})` : this.name;
    }
  }

  // Save the current record
  async create(context: MyContext): Promise<Affiliation> {
    // Assign a new DMPTool id if one was not provided (meaning it was manually added by a user)
    if (!this.uri) {
      this.uri = `${DEFAULT_DMPTOOL_AFFILIATION_URL}${randomHex(6)}`;
    }
    // First make sure the record doesn't already exist
    const current = await Affiliation.findByURI('Affiliation.create', context, this.uri);

    // Then make sure it doesn't already exist
    if (current) {
      this.errors.push('That Affiliation already exists');
    } else {
      // Save the record and then fetch it
      this.prepForSave();
      const newId = await Affiliation.insert(
        context,
        this.tableName,
        this,
        'Affiliation.create',
        ['uneditableProperties']
      );
      return await Affiliation.findById('Affiliation.create', context, newId);
    }

    // Otherwise return as-is with all the errors
    return this;
  }

  // Save the changes made to the affiliation
  async update(context: MyContext): Promise<Affiliation> {
    // First make sure the record is valid
    if (await this.isValid()) {
      if (this.uri) {
        this.prepForSave();
        const updated = await Affiliation.update(
          context,
          this.tableName,
          this,
          'Affiliation.update',
          ['uneditableProperties', this.uneditableProperties].flat()
        );

        if (updated) {
          return await Affiliation.findById('Affiliation.update', context, this.id);
        }
      }
      // This template has never been saved before so we cannot update it!
      this.errors.push('Affiliation has never been saved');
    } else {
      this.errors.push('The affiliation is not valid');
    }
    return this;
  }

  // Delete this record (will cascade delate all associated AffiliationLinks and AffiliaitonEmailDomains)
  async delete(context: MyContext): Promise<Affiliation> {
    if (this.uri) {
      const result = await Affiliation.delete(context, this.tableName, this.id, 'Affiliation.delete');
      if (result) {
        return this;
      }
    }
    return null;
  }

  // Some of the properties are stored as JSON strings in the DB so we need to parse them
  // after fetching them
  static processResult(affiliation: Affiliation): Affiliation {
    if (affiliation?.aliases && typeof affiliation.aliases === 'string') {
      affiliation.aliases = JSON.parse(affiliation.aliases);
    }
    if (affiliation?.acronyms && typeof affiliation.acronyms === 'string') {
      affiliation.acronyms = JSON.parse(affiliation.acronyms);
    }
    if (affiliation?.feedbackEmails && typeof affiliation.feedbackEmails === 'string') {
      affiliation.feedbackEmails = JSON.parse(affiliation.feedbackEmails);
    }

    // Only include types that are in the enum
    if (affiliation?.types && typeof affiliation.types === 'string') {
      const types = JSON.parse(affiliation.types);
      affiliation.types = [];

      for (const typ of types) {
        if (AffiliationType[typ.toLocaleUpperCase()] !== undefined) {
          affiliation.types.push(AffiliationType[typ.toLocaleUpperCase()]);
        }
      }
    }
    return affiliation;
  }


  // Return the specified Affiliation  based on the DB id
  static async findById(reference: string, context: MyContext, id: string | number): Promise<Affiliation> {
    const sql = 'SELECT * FROM affiliations WHERE id = ?';
    const results = await Affiliation.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? this.processResult(results[0]) : null;
  }

  // Return the specified Affiliation based on the URI
  static async findByURI(reference: string, context: MyContext, uri: string): Promise<Affiliation> {
    const sql = 'SELECT * FROM affiliations WHERE uri = ?';
    const results = await Affiliation.query(context, sql, [uri], reference);
    return Array.isArray(results) && results.length > 0 ? this.processResult(results[0]) : null;
  }

  // Return the specified Affiliation based on it's name
  static async findByName(reference: string, context: MyContext, name: string): Promise<Affiliation> {
    const sql = 'SELECT * FROM affiliations WHERE TRIM(LOWER(name)) = ?';
    const results = await Affiliation.query(context, sql, [name?.toLowerCase()?.trim()], reference);
    return Array.isArray(results) && results.length > 0 ? this.processResult(results[0]) : null;
  }
}

export interface AffiliationSearchCriteria {
  name: string;
  funderOnly: boolean;
}

// A pared down version of the full Affiliation object. This type is returned by
// our index searches
export class AffiliationSearch {
  public id!: number;
  public uri!: string;
  public displayName!: string;
  public funder!: boolean;
  public types!: AffiliationType[];

  // Initialize a new AffiliationSearch result
  constructor(options) {
    this.id = options.id;
    this.uri = options.uri;
    this.displayName = options.displayName;
    this.funder = options.funder || false;
    this.types = options.types || [AffiliationType.OTHER];
  }

  // Search for Affiliations that match the term and the funder flag
  static async search(context: MyContext, options: AffiliationSearchCriteria): Promise<AffiliationSearch[]> {
    let sql = 'SELECT * FROM affiliations WHERE active = 1';
    const vals = [];

    if (options.name) {
      sql += ' AND LOWER(searchName) LIKE ?'
      vals.push(`%${options.name.toLowerCase()}%`);
    }
    if (options.funderOnly) {
      sql += ' AND funder = 1';
    }

    const results = await Affiliation.query(context, sql, vals, 'AffiliationSearch.search');
    if (Array.isArray(results) && results.length > 0) {
      return results.map((entry) => { return new AffiliationSearch(entry) });
    }

    return [];
  }
}

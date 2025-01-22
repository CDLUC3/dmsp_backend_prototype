import { MyContext } from "../context";
import { ResearchDomain } from "../types";
import { randomHex, validateURL } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export const DEFAULT_DMPTOOL_METADATA_STANDARD_URL = 'https://dmptool.org/metadata-standards/';;
export class MetadataStandard extends MySqlModel {
  public name: string;
  public uri: string;
  public description?: string;
  public researchDomains: ResearchDomain[];
  public keywords: string[];

  private tableName = 'metadataStandards';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.id = options.id;
    this.name = options.name;
    this.uri = options.uri;
    this.description = options.description;
    this.researchDomains = options.researchDomains || [];
    this.keywords = options.keywords || [];
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.name) {
      this.errors.push('Name can\'t be blank');
    }
    if (!validateURL(this.uri)) {
      this.errors.push('Invalid URI format');
    }
    return this.errors.length <= 0;
  }

  // Ensure data integrity
  cleanup(): void {
    if (!Array.isArray(this.researchDomains)) {
      this.researchDomains = []
    }
    if (!Array.isArray(this.keywords)) {
      this.keywords = []
    }
    // Remove leading/trailing blank spaces
    this.name = this.name?.trim();
    this.uri = this.uri?.trim();

    // make sure all keywords are lower cased and trimmed
    this.keywords = this.keywords.filter((item) => item).map((entry) => entry.toLowerCase().trim());
  }

  //Create a new MetadataStandard
  async create(context: MyContext): Promise<MetadataStandard> {
    const reference = 'MetadataStandard.create';

    // If no URI is present, then use the DMPTool's default URI
    if (!this.uri) {
      this.uri = `${DEFAULT_DMPTOOL_METADATA_STANDARD_URL}${randomHex(6)}`;
    }

    // First make sure the record is valid
    if (await this.isValid()) {
      let current = await MetadataStandard.findByURI(reference, context, this.uri);
      if (!current) {
        current = await MetadataStandard.findByName(reference, context, this.name.toString());
      }

      // Then make sure it doesn't already exist
      if (current) {
        this.errors.push('MetadataStandard already exists');
      } else {
        // Save the record and then fetch it
        const newId = await MetadataStandard.insert(context, this.tableName, this, reference, ['researchDomains']);
        const response = await MetadataStandard.findById(reference, context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  //Update an existing MetadataStandard
  async update(context: MyContext, noTouch = false): Promise<MetadataStandard> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        await MetadataStandard.update(
          context,
          this.tableName,
          this,
          'MetadataStandard.update',
          ['researchDomains'],
          noTouch
        );
        return await MetadataStandard.findById('MetadataStandard.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.errors.push('MetadataStandard has never been saved');
    }
    return this;
  }

  //Delete the MetadataStandard
  async delete(context: MyContext): Promise<MetadataStandard> {
    if (this.id) {
      const deleted = await MetadataStandard.findById('MetadataStandard.delete', context, this.id);

      const successfullyDeleted = await MetadataStandard.delete(
        context,
        this.tableName,
        this.id,
        'MetadataStandard.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Search for Metadata standards
  static async search(
    reference: string,
    context: MyContext,
    term: string,
    researchDomainId: number,
  ): Promise<MetadataStandard[]> {
    const searchTerm = term ? `%${term.toLocaleLowerCase().trim()}%` : '%';
    const sql = `SELECT * FROM metadataStandards WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR keywords LIKE ? ORDER BY name`;
    const results = await MetadataStandard.query(context, sql, [searchTerm, searchTerm, searchTerm], reference);

    // Apply any filters
    if (Array.isArray(results) && researchDomainId) {
      const standardIds = await MetadataStandard.findMetadataStandardIdsByResearchDomainId(
        reference,
        context,
        researchDomainId
      );
      return results.filter((standard) => standardIds.includes(standard.id))
    }

    // No need to reinitialize all of the results to objects here because they're just search results
    return Array.isArray(results) ? results : [];
  }

  // Fetch a MetadataStandard by it's id
  static async findById(reference: string, context: MyContext, metadataStandardId: number): Promise<MetadataStandard> {
    const sql = `SELECT * FROM metadataStandards WHERE id = ?`;
    const results = await MetadataStandard.query(context, sql, [metadataStandardId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new MetadataStandard(results[0]) : null;
  }

  static async findByURI(reference: string, context: MyContext, uri: string): Promise<MetadataStandard> {
    const sql = `SELECT * FROM metadataStandards WHERE uri = ?`;
    const results = await MetadataStandard.query(context, sql, [uri], reference);
    return Array.isArray(results) && results.length > 0 ? new MetadataStandard(results[0]) : null;
  }

  static async findByName(reference: string, context: MyContext, name: string): Promise<MetadataStandard> {
    const sql = `SELECT * FROM metadataStandards WHERE LOWER(name) = ?`;
    const results = await MetadataStandard.query(context, sql, [name.toLowerCase().trim()], reference);
    return Array.isArray(results) && results.length > 0 ? new MetadataStandard(results[0]) : null;
  }

  // Fetch all of the MetadataStandards associated with a ResearchDomain
  static async findMetadataStandardIdsByResearchDomainId(
    reference: string,
    context: MyContext,
    researchDomainId: number
  ): Promise<number[]> {
    const sql = 'SELECT metadataStandardId FROM metadataStandardResearchDomains WHERE = researchDomainId = ?';
    const results = await MetadataStandard.query(context, sql, [researchDomainId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((rec) => rec.metadataStandardId) : [];
  }
};

import { MyContext } from "../context";
import { validateURL } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export class MetadataStandard extends MySqlModel {
  public name: string;
  public uri: string;
  public description?: string;
  public researchDomainIds: number[];
  public keywords: string[];

  private tableName = 'metadataStandards';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.id = options.id;
    this.name = options.name;
    this.uri = options.uri;
    this.description = options.description;
    this.researchDomainIds = options.researchDomainIds || [];
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
    if (!Array.isArray(this.researchDomainIds)) {
      this.researchDomainIds = []
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
        const newId = await MetadataStandard.insert(context, this.tableName, this, reference);
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
        await MetadataStandard.update(context, this.tableName, this, 'MetadataStandard.update', [], noTouch);
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

  // Return all of the projectFunders for the Project
  static async search(
    reference: string,
    context: MyContext,
    term: string,
    researchDomainId: number,
  ): Promise<MetadataStandard[]> {
    const searchTerm = term ? `%${term.toLocaleLowerCase().trim()}%` : '%';

    let sql = `SELECT * FROM metadataStandards WHERE (LOWER(term) LIKE ? OR keywords LIKE ?)`;
    const vals = [searchTerm, searchTerm];
    if (researchDomainId) {
      sql = `${sql} AND JSON_CONTAINS(researchDomainIds, ?, '$')`;
      vals.push(researchDomainId.toString());
    }

    const results = await MetadataStandard.query(context, `${sql} ORDER BY name`, vals, reference);
    return Array.isArray(results) ? results : [];
  }

  // Fetch a MetadataStandard by it's id
  static async findById(reference: string, context: MyContext, metadataStandardId: number): Promise<MetadataStandard> {
    const sql = `SELECT * FROM metadataStandards WHERE id = ?`;
    const results = await MetadataStandard.query(context, sql, [metadataStandardId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  static async findByURI(reference: string, context: MyContext, uri: string): Promise<MetadataStandard> {
    const sql = `SELECT * FROM metadataStandards WHERE uri = ?`;
    const results = await MetadataStandard.query(context, sql, [uri], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  static async findByName(reference: string, context: MyContext, name: string): Promise<MetadataStandard> {
    const sql = `SELECT * FROM metadataStandards WHERE LOWER(name) = ?`;
    const results = await MetadataStandard.query(context, sql, [name.toLowerCase().trim()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
};

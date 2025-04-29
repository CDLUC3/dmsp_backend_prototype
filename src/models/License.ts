import { MyContext } from "../context";
import { formatLogMessage } from "../logger";
import { PaginatedQueryResults, PaginationOptions } from "../types/general";
import { isNullOrUndefined, randomHex, validateURL } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export const DEFAULT_DMPTOOL_LICENSE_URL = 'https://dmptool.org/licenses/';;

export class License extends MySqlModel {
  public name: string;
  public uri: string;
  public description?: string;
  public recommended: boolean;

  private tableName = 'licenses';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.id = options.id;
    this.name = options.name;
    this.uri = options.uri;
    this.description = options.description;
    this.recommended = options.recommended ?? false;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.name) this.addError('name', 'Name can\'t be blank');
    if (!validateURL(this.uri)) this.addError('uri', 'Invalid URL');

    return Object.keys(this.errors).length === 0;
  }

  // Ensure data integrity
  prepForSave(): void {
    // Remove leading/trailing blank spaces
    this.name = this.name?.trim();
    this.uri = this.uri?.trim();
  }

  //Create a new License
  async create(context: MyContext): Promise<License> {
    const reference = 'License.create';

    // If no URI is present, then use the DMPTool's default URI
    if (!this.uri) {
      this.uri = `${DEFAULT_DMPTOOL_LICENSE_URL}${randomHex(6)}`;
    }

    // First make sure the record is valid
    if (await this.isValid()) {
      let current = await License.findByURI(reference, context, this.uri);
      if (!current) {
        current = await License.findByName(reference, context, this.name.toString());
      }

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'License already exists');
      } else {
        // Save the record and then fetch it
        const newId = await License.insert(context, this.tableName, this, reference);
        const response = await License.findById(reference, context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return new License(this);
  }

  //Update an existing License
  async update(context: MyContext, noTouch = false): Promise<License> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        await License.update(context, this.tableName, this, 'License.update', [], noTouch);
        return await License.findById('License.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'License has never been saved');
    }
    return new License(this);
  }

  //Delete the License
  async delete(context: MyContext): Promise<License> {
    if (this.id) {
      const deleted = await License.findById('License.delete', context, this.id);

      const successfullyDeleted = await License.delete(
        context,
        this.tableName,
        this.id,
        'License.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Fetch a License by it's id
  static async findById(reference: string, context: MyContext, licenseId: number): Promise<License> {
    const sql = `SELECT * FROM licenses WHERE id = ?`;
    const results = await License.query(context, sql, [licenseId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new License(results[0]) : null;
  }

  static async findByURI(reference: string, context: MyContext, uri: string): Promise<License> {
    const sql = `SELECT * FROM licenses WHERE uri = ?`;
    const results = await License.query(context, sql, [uri], reference);
    return Array.isArray(results) && results.length > 0 ? new License(results[0]) : null;
  }

  static async findByName(reference: string, context: MyContext, name: string): Promise<License> {
    const sql = `SELECT * FROM licenses WHERE LOWER(name) = ?`;
    const results = await License.query(context, sql, [name?.toLowerCase()?.trim()], reference);
    return Array.isArray(results) && results.length > 0 ? new License(results[0]) : null;
  }

  // Find licenses that match the search term
  static async search(
    reference: string,
    context: MyContext,
    name: string,
    options: PaginationOptions,
  ): Promise<PaginatedQueryResults<License>> {
    const whereFilters = [];
    const values = [];

    // Handle the incoming search term
    const searchTerm = (name ?? '').toLowerCase().trim();
    if (searchTerm) {
      whereFilters.push('(LOWER(l.name) LIKE ? OR LOWER(l.description) LIKE ?)');
      values.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Set the default sort field and order if none was provided
    if (isNullOrUndefined(options.sortField)) options.sortField = 'l.name';
    if (isNullOrUndefined(options.sortOrder)) options.sortOrder = 'ASC';

    const sqlStatement = 'SELECT l.* FROM licenses l';

    // Specify the field we want to use for the count
    options.countField = 'l.id';

    // if the options are of type PaginationOptionsForOffsets
    if ('offset' in options && !isNullOrUndefined(options.offset)) {
      // Specify the fields available for sorting
      options.availableSortFields = ['l.name', 'l.created', 'l.recommended'];
    } else if ('cursor' in options) {
      // Specify the field we want to use for the cursor (should typically match the sort field)
      options.cursorField = 'LOWER(REPLACE(CONCAT(l.name, l.id), \' \', \'_\'))';
    }

    const response: PaginatedQueryResults<License> = await License.queryWithPagination(
      context,
      sqlStatement,
      whereFilters,
      '',
      values,
      options,
      reference,
    )

    formatLogMessage(context).debug({ options, response }, reference);
    return response;
  }

  // Find licenses that match the search term
  static async recommended(reference: string, context: MyContext, recommended = true): Promise<License[]> {
    const sql = `SELECT * FROM licenses WHERE recommended = ?`;
    const vals = recommended ? ['1'] : ['0'];
    const results = await License.query(context, sql, vals, reference);
    // No need to initialize new License objects here as they are just search results
    return Array.isArray(results) ? results : [];
  }
};

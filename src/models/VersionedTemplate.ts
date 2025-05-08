import { TemplateVisibility } from "./Template";
import { MySqlModel } from './MySqlModel';
import { MyContext } from '../context';
import { defaultLanguageId } from "./Language";
import { PaginatedQueryResults, PaginationOptions, PaginationOptionsForCursors, PaginationOptionsForOffsets, PaginationType } from "../types/general";
import { formatLogMessage } from "../logger";
import { isNullOrUndefined } from "../utils/helpers";

export enum TemplateVersionType {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

// Search result for VersionedTemplates
export class VersionedTemplateSearchResult {
  public id: number;
  public templateId: number;
  public name: string;
  public description?: string;
  public version: string;
  public visibility: TemplateVisibility;
  public bestPractice: boolean;
  public ownerId: number;
  public ownerURI: string;
  public ownerSearchName: string;
  public ownerDisplayName: string;
  public modifiedById: number;
  public modifiedByName: string;
  public modified: string;

  constructor(options) {
    this.id = options.id;
    this.templateId = options.templateId;
    this.name = options.name;
    this.description = options.description;
    this.version = options.version;
    this.visibility = options.visibility;
    this.bestPractice = options.bestPractice;
    this.ownerId = options.ownerId;
    this.ownerSearchName = options.ownerName;
    this.ownerURI = options.ownerURI;
    this.ownerDisplayName = options.ownerDisplayName;
    this.modifiedById = options.modifiedById;
    this.modifiedByName = options.modifiedByName;
    this.modified = options.modified;
  }

  // Find all of the high level details about the published templates matching the search term
  static async search(
    reference: string,
    context: MyContext,
    term: string,
    options: PaginationOptions = VersionedTemplate.getDefaultPaginationOptions(),
  ): Promise<PaginatedQueryResults<VersionedTemplateSearchResult>> {
    const whereFilters = ['vt.active = 1 AND vt.versionType = ?'];
    const values = [TemplateVersionType.PUBLISHED.toString()];

    // Handle the incoming search term
    const searchTerm = (term ?? '').toLowerCase().trim();
    if (searchTerm) {
      whereFilters.push('(LOWER(vt.name) LIKE ? OR LOWER(a.searchName) LIKE ?)');
      values.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Determine the type of pagination being used
    let opts;
    if (options.type === PaginationType.OFFSET) {
      opts = {
        ...options,
        // Specify the fields available for sorting
        availableSortFields: ['vt.name', 'vt.created', 'vt.visibility', 'vt.bestPractice', 'vt.modified'],
      } as PaginationOptionsForOffsets;
    } else {
      opts = {
        ...options,
        // Specify the field we want to use for the cursor (should typically match the sort field)
        cursorField: 'LOWER(REPLACE(CONCAT(vt.modified, vt.id), \' \', \'_\'))',
      } as PaginationOptionsForCursors;
    }

    // Set the default sort field and order if none was provided
    if (isNullOrUndefined(opts.sortField)) opts.sortField = 'vt.modified';
    if (isNullOrUndefined(opts.sortDir)) opts.sortDir = 'DESC';

    // Specify the field we want to use for the count
    opts.countField = 'vt.id';

    const sqlStatement = 'SELECT vt.id, vt.templateId, vt.name, vt.description, vt.version, vt.visibility, vt.bestPractice, \
                            vt.modified, vt.modifiedById, TRIM(CONCAT(u.givenName, CONCAT(\' \', u.surName))) as modifiedByName, \
                            a.id as ownerId, vt.ownerId as ownerURI, a.displayName as ownerDisplayName, \
                            a.searchName as ownerSearchName \
                          FROM versionedTemplates vt \
                            LEFT JOIN users u ON u.id = vt.modifiedById \
                            LEFT JOIN affiliations a ON a.uri = vt.ownerId';

    const response: PaginatedQueryResults<VersionedTemplateSearchResult> = await VersionedTemplate.queryWithPagination(
      context,
      sqlStatement,
      whereFilters,
      '',
      values,
      opts,
      reference,
    )

    formatLogMessage(context).debug({ options, response }, reference);
    return response;
  }

  // Find all of the high level details about the published templates for a specific affiliation
  static async findByAffiliationId(
    reference: string,
    context: MyContext,
    affiliationId: string
  ): Promise<VersionedTemplateSearchResult[]> {
    const sql = 'SELECT vt.id, vt.templateId, vt.name, vt.description, vt.version, vt.visibility, vt.bestPractice, ' +
                'vt.modified, vt.modifiedById, TRIM(CONCAT(u.givenName, CONCAT(\' \', u.surName))) as modifiedByName, ' +
                'a.id as ownerId, vt.ownerId as ownerURI, a.displayName as ownerDisplayName, ' +
                'a.searchName as ownerSearchName ' +
              'FROM versionedTemplates vt ' +
                'LEFT JOIN users u ON u.id = vt.modifiedById ' +
                'LEFT JOIN affiliations a ON a.uri = vt.ownerId ' +
              'WHERE vt.ownerId = affiliationId AND vt.active = 1 AND vt.versionType = ? '
              'ORDER BY vt.modified DESC;';
    const vals = [affiliationId, TemplateVersionType.PUBLISHED];
    const results = await VersionedTemplate.query(context, sql, vals, reference);
    return Array.isArray(results) ? results.map((entry) => new VersionedTemplateSearchResult(entry)) : [];
  }
}

// A Snapshot/Version of a Template
export class VersionedTemplate extends MySqlModel {
  public templateId: number;
  public version: string;
  public versionedById: number;

  public name: string;
  public description?: string;
  public ownerId: string;

  public versionType: TemplateVersionType;
  public comment?: string;
  public active: boolean;

  public visibility: TemplateVisibility;
  public bestPractice: boolean;
  public languageId: string;

  private tableName = 'versionedTemplates';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.templateId = options.templateId;
    this.version = options.version;
    this.versionedById = options.versionedById;

    this.name = options.name;
    this.ownerId = options.ownerId;
    this.description = options.description;

    this.versionType = options.versionType ?? TemplateVersionType.DRAFT;
    this.comment = options.comment ?? '';
    this.active = options.active ?? false;

    this.visibility = options.visibility ?? TemplateVisibility.ORGANIZATION;
    this.bestPractice = options.bestPractice ?? false;
    this.languageId = options.languageId ?? defaultLanguageId;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.templateId) this.addError('templateId', 'Template can\'t be blank');
    if (!this.ownerId) this.addError('ownerId', 'Owner can\'t be blank');
    if (!this.versionedById) this.addError('versionedById', 'Versioned by can\'t be blank');
    if (!this.name) this.addError('name', 'Name can\'t be blank');
    if (!this.version) this.addError('version', 'Version can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Save the current record
  async create(context: MyContext): Promise<VersionedTemplate> {
    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      const newId = await VersionedTemplate.insert(context, this.tableName, this, 'VersionedTemplate.create');
      return await VersionedTemplate.findVersionedTemplateById('VersionedTemplate.create', context, newId);
    }
    // Otherwise return as-is with all the errors
    return new VersionedTemplate(this);
  }

  // Save the changes made to the VersionedTemplate
  async update(context: MyContext): Promise<VersionedTemplate> {
    // First make sure the record is valid
    if (await this.isValid()) {
      if (this.id) {
        const result = await VersionedTemplate.update(context, this.tableName, this, 'VersionedTemplate.update');
        return result as VersionedTemplate;
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'VersionedTemplate has never been saved');
    }
    return new VersionedTemplate(this);
  }

  // Fetch the Versioned template by its id
  static async findById(reference: string, context: MyContext, versionedTemplateId: number): Promise<VersionedTemplate> {
    const sql = 'SELECT * FROM versionedTemplates WHERE id = ?';
    const results = await VersionedTemplate.query(context, sql, [versionedTemplateId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new VersionedTemplate(results[0]) : null;
  }

  // Return all of the versions for the specified Template
  static async findByTemplateId(reference: string, context: MyContext, templateId: number): Promise<VersionedTemplate[]> {
    const sql = 'SELECT * FROM versionedTemplates WHERE templateId = ? ORDER BY version DESC';
    const results = await VersionedTemplate.query(context, sql, [templateId.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new VersionedTemplate(entry)) : [];
  }

  // Return the specified version
  static async findVersionedTemplateById(
    reference: string,
    context: MyContext,
    versionedTemplateId: number
  ): Promise<VersionedTemplate> {
    const sql = 'SELECT * FROM versionedTemplates WHERE id = ?';
    const results = await VersionedTemplate.query(context, sql, [versionedTemplateId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new VersionedTemplate(results[0]) : null;
  }

  // Find all of the templates associated with the context's User's affiliation
  static async findByAffiliationId(reference: string, context: MyContext, affiliationId: string): Promise<VersionedTemplate[]> {
    const sql = 'SELECT * FROM versionedTemplates WHERE ownerId = ? ORDER BY modified DESC';
    const results = await VersionedTemplate.query(context, sql, [affiliationId], reference);
    // No need to instantiate the objects here
    return Array.isArray(results) ? results : [];
  }
}

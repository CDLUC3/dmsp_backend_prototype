import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { VersionedTemplate } from "../types";
import { Tag } from "./Tag";
import { PaginatedQueryResults, PaginationOptions, PaginationOptionsForCursors, PaginationOptionsForOffsets, PaginationType } from "../types/general";
import { prepareObjectForLogs } from "../logger";
import { isNullOrUndefined } from "../utils/helpers";
import { TemplateVersionType } from "./VersionedTemplate";

// Search result for VersionedTemplates
export class VersionedSectionSearchResult {
  public id: number;
  public modified: string;
  public created: string;
  public name: string;
  public introduction?: string;
  public displayOrder: number;
  public bestPractice: boolean;
  public versionedTemplateId: number;
  public versionedTemplateName: string;
  public versionedQuestionCount: number;

  constructor(options) {
    this.id = options.id;
    this.modified = options.modified;
    this.created = options.created;
    this.name = options.name;
    this.introduction = options.introduction;
    this.displayOrder = options.displayOrder ?? 0;
    this.bestPractice = options.bestPractice ?? false;
    this.versionedTemplateId = options.versionedTemplateId;
    this.versionedTemplateName = options.versionedTemplateName;
    this.versionedQuestionCount = options.versionedQuestionCount ?? 0;
  }

  // Find all of the high level details about the published templates matching the search term
  static async search(
    reference: string,
    context: MyContext,
    term: string,
    options: PaginationOptions = VersionedSection.getDefaultPaginationOptions(),
  ): Promise<PaginatedQueryResults<VersionedSectionSearchResult>> {
    // Only include active published templates that are owned by the user's affiliation or marked as best practice
    const whereFilters = ['vt.active = 1 AND vt.versionType = ? AND (vt.ownerId = ? OR vt.bestPractice = 1)'];
    const values = [TemplateVersionType.PUBLISHED.toString(), context?.token?.affiliationId];

    // Handle the incoming search term
    const searchTerm = (term ?? '').toLowerCase().trim();
    if (!isNullOrUndefined(searchTerm)) {
      whereFilters.push('LOWER(vs.name) LIKE ?');
      values.push(`%${searchTerm}%`);
    }

    // Determine the type of pagination being used
    let opts;
    if (options.type === PaginationType.OFFSET) {
      opts = {
        ...options,
        // Specify the fields available for sorting
        availableSortFields: ['vs.name', 'vs.created', 'vs.bestPractice', 'vt.name', 'vs.modified',
                              'versionedQuestionCount'],
      } as PaginationOptionsForOffsets;
    } else {
      opts = {
        ...options,
        // Specify the field we want to use for the cursor (should typically match the sort field)
        cursorField: 'LOWER(REPLACE(CONCAT(vs.modified, vs.id), \' \', \'_\'))',
      } as PaginationOptionsForCursors;
    }

    // Set the default sort field and order if none was provided
    if (isNullOrUndefined(opts.sortField)) opts.sortField = 'vs.modified';
    if (isNullOrUndefined(opts.sortDir)) opts.sortDir = 'DESC';

    // Specify the field we want to use for the count
    opts.countField = 'vs.id';

    const sql = 'SELECT vs.id, vs.modified, vs.created, vs.name, vs.introduction, vs.displayOrder, vt.bestPractice, ' +
                      'vt.id as versionedTemplateId, vt.name as versionedTemplateName, ' +
                      'COUNT(vq.id) as versionedQuestionCount ' +
                'FROM versionedSections vs ' +
                  'INNER JOIN versionedTemplates vt ON vs.versionedTemplateId = vt.id ' +
                  'LEFT JOIN versionedQuestions vq ON vs.id = vq.versionedSectionId';

    const groupBy = 'GROUP BY vs.id, vs.modified, vs.created, vs.name, vs.introduction, vs.displayOrder, ' +
                        'vt.bestPractice, vt.id, vt.name';
    const response: PaginatedQueryResults<VersionedSectionSearchResult> = await VersionedSection.queryWithPagination(
      context,
      sql,
      whereFilters,
      groupBy,
      values,
      opts,
      reference,
    )

    context.logger.debug(prepareObjectForLogs({ options, response }), reference);
    return response;
  }
}

export class VersionedSection extends MySqlModel {
  public versionedTemplateId: number;
  public name: string;
  public introduction?: string;
  public requirements?: string;
  public guidance?: string;
  public displayOrder: number;
  public tags?: Tag[];
  public versionedTemplate: VersionedTemplate;
  public sectionId: number;
  // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated VersionedTemplate
  //public bestPractice: boolean;

  private tableName = 'versionedSections';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.versionedTemplateId = options.versionedTemplateId;
    this.sectionId = options.sectionId;
    this.name = options.name;
    this.introduction = options.introduction;
    this.requirements = options.requirements;
    this.guidance = options.guidance;
    this.displayOrder = options.displayOrder;
    this.tags = options.tags;
    // TODO: Think about whether we need to add bestPractice here, or whether it will inherit from associated VersionedTemplate
    //this.bestPractice = options.bestPractice ?? false;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.versionedTemplateId) this.addError('versionedTemplateId', 'VersionedTemplate can\'t be blank');
    if (!this.sectionId) this.addError('sectionId', 'Section ID can\'t be blank');
    if (!this.name) this.addError('name', 'Name can\'t be blank');
    if (!this.displayOrder) this.addError('displayOrder', 'DisplayOrder can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Insert the new record
  async create(context: MyContext): Promise<VersionedSection> {
    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      const newId = await VersionedSection.insert(context, this.tableName, this, 'VersionedSection.create', ['tags']);
      return await VersionedSection.findById('VersionedSection.create', context, newId);
    }
    // Otherwise return as-is with all the errors
    return new VersionedSection(this);
  }

  // Find the VersionedSection by id
  static async findById(reference: string, context: MyContext, id: number): Promise<VersionedSection> {
    const sql = 'SELECT * FROM versionedSections WHERE id= ?';
    const results = await VersionedSection.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new VersionedSection(results[0]) : null;
  }

  // Find the VersionedSections by sectionId
  static async findBySectionId(reference: string, context: MyContext, sectionId: number): Promise<VersionedSection[]> {
    const sql = 'SELECT * FROM versionedSections WHERE sectionId = ?';
    const results = await VersionedSection.query(context, sql, [sectionId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((entry) => new VersionedSection(entry)) : [];
  }

  // Find the VersionedSections by versionedTemplateId
  static async findByTemplateId(reference: string, context: MyContext, versionedTemplateId: number): Promise<VersionedSection[]> {
    const sql = 'SELECT * FROM versionedSections WHERE versionedTemplateId = ?';
    const results = await VersionedSection.query(context, sql, [versionedTemplateId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((entry) => new VersionedSection(entry)) : [];
  }

  // Find the VersionedSection by name
  static async findByName(
    reference: string,
    context: MyContext,
    term: string,
    options: PaginationOptions = VersionedSection.getDefaultPaginationOptions(),
  ): Promise<PaginatedQueryResults<VersionedSection>> {
    const whereFilters = [];
    const values = [];

    // Handle the incoming search term
    const searchTerm = (term ?? '').toLowerCase().trim();
    if (!isNullOrUndefined(searchTerm)) {
      whereFilters.push('LOWER(vs.name) LIKE ?');
      values.push(`%${searchTerm}%`);
    }

    // Determine the type of pagination being used
    let opts;
    if (options.type === PaginationType.OFFSET) {
      opts = {
        ...options,
        // Specify the fields available for sorting
        availableSortFields: ['vs.name', 'vs.created'],
      } as PaginationOptionsForOffsets;
    } else {
      opts = {
        ...options,
        // Specify the field we want to use for the cursor (should typically match the sort field)
        cursorField: 'LOWER(REPLACE(CONCAT(vs.name, vs.id), \' \', \'_\'))',
      } as PaginationOptionsForCursors;
    }

    // Set the default sort field and order if none was provided
    if (isNullOrUndefined(opts.sortField)) opts.sortField = 'vs.name';
    if (isNullOrUndefined(opts.sortDir)) opts.sortDir = 'ASC';

    // Specify the field we want to use for the count
    opts.countField = 'vs.id';

    const sqlStatement = 'SELECT vs.* FROM versionedSections vs';

    const response: PaginatedQueryResults<VersionedSection> = await VersionedSection.queryWithPagination(
      context,
      sqlStatement,
      whereFilters,
      '',
      values,
      opts,
      reference,
    )

    context.logger.debug(prepareObjectForLogs({ options, response }), reference);
    return response;
  }
}

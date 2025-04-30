import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { VersionedTemplate } from "../types";
import { Tag } from "../models/Tag";
import { PaginatedQueryResults, PaginationOptions } from "../types/general";
import { formatLogMessage } from "../logger";
import { isNullOrUndefined } from "../utils/helpers";

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
    return Array.isArray(results) && results.length > 0 ? results.map((entry) => new VersionedSection(entry)) : null;
  }

  // Find the VersionedSections by versionedTemplateId
  static async findByTemplateId(reference: string, context: MyContext, versionedTemplateId: number): Promise<VersionedSection[]> {
    const sql = 'SELECT * FROM versionedSections WHERE versionedTemplateId = ?';
    const results = await VersionedSection.query(context, sql, [versionedTemplateId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((entry) => new VersionedSection(entry)) : null;
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
    if (searchTerm) {
      whereFilters.push('LOWER(vs.name) LIKE ?');
      values.push(`%${searchTerm}%`);
    }

    // Set the default sort field and order if none was provided
    if (isNullOrUndefined(options.sortField)) options.sortField = 'vs.name';
    if (isNullOrUndefined(options.sortOrder)) options.sortOrder = 'ASC';

    const sqlStatement = 'SELECT vs.* FROM versionedSections vs';

    // Specify the field we want to use for the count
    options.countField = 'vs.id';

    // if the options are of type PaginationOptionsForOffsets
    if ('offset' in options && !isNullOrUndefined(options.offset)) {
      // Specify the fields available for sorting
      options.availableSortFields = ['vs.name', 'vs.created'];
    } else if ('cursor' in options) {
      // Specify the field we want to use for the cursor (should typically match the sort field)
      options.cursorField = 'LOWER(REPLACE(CONCAT(vs.name, vs.id), \' \', \'_\'))';
    }

    const response: PaginatedQueryResults<VersionedSection> = await VersionedSection.queryWithPagination(
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
}

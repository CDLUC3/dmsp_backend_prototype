import { MyContext } from "../context";
import { isNullOrUndefined, valueIsEmpty } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

// Types of relationships the Plan can have to the related work (e.g. Plan is cited by the related work)
export enum RelatedWorkRelationDescriptor {
  IS_CITED_BY = "IS_CITED_BY",
  CITES = "CITES",
  IS_SUPPLEMENT_TO = "IS_SUPPLEMENT_TO",
  IS_SUPPLEMENTED_BY = "IS_SUPPLEMENTED_BY",
  IS_CONTINUED_BY = "IS_CONTINUED_BY",
  CONTINUES = "CONTINUES",
  IS_DESCRIBED_BY = "IS_DESCRIBED_BY",
  DESCRIBES = "DESCRIBES",
  HAS_METADATA = "HAS_METADATA",
  IS_METADATA_FOR = "IS_METADATA_FOR",
  HAS_VERSION = "HAS_VERSION",
  IS_VERSION_OF = "IS_VERSION_OF",
  IS_NEW_VERSION_OF = "IS_NEW_VERSION_OF",
  IS_PREVIOUS_VERSION_OF = "IS_PREVIOUS_VERSION_OF",
  IS_PART_OF = "IS_PART_OF",
  HAS_PART = "HAS_PART",
  IS_PUBLISHED_IN = "IS_PUBLISHED_IN",
  IS_REFERENCED_BY = "IS_REFERENCED_BY",
  REFERENCES = "REFERENCES",
  IS_DOCUMENTED_BY = "IS_DOCUMENTED_BY",
  DOCUMENTS = "DOCUMENTS",
  IS_COMPILED_BY = "IS_COMPILED_BY",
  COMPILES = "COMPILES",
  IS_VARIANT_FORM_OF = "IS_VARIANT_FORM_OF",
  IS_ORIGINAL_FORM_OF = "IS_ORIGINAL_FORM_OF",
  IS_IDENTICAL_TO = "IS_IDENTICAL_TO",
  IS_REVIEWED_BY = "IS_REVIEWED_BY",
  REVIEWS = "REVIEWS",
  IS_DERIVED_FROM = "IS_DERIVED_FROM",
  IS_SOURCE_OF = "IS_SOURCE_OF",
  IS_REQUIRED_BY = "IS_REQUIRED_BY",
  REQUIRES = "REQUIRES",
  OBSOLETES = "OBSOLETES",
  IS_OBSOLETED_BY = "IS_OBSOLETED_BY",
  IS_COLLECTED_BY = "IS_COLLECTED_BY",
  COLLECTS = "COLLECTS",
  IS_TRANSLATION_OF = "IS_TRANSLATION_OF",
  HAS_TRANSLATION = "HAS_TRANSLATION",
}

// Available related work types
export enum RelatedWorkType {
  AUDIOVISUAL = "AUDIOVISUAL",
  BOOK = "BOOK",
  BOOK_CHAPTER = "BOOK_CHAPTER",
  COLLECTION = "COLLECTION",
  COMPUTATIONAL_NOTEBOOK = "COMPUTATIONAL_NOTEBOOK",
  CONFERENCE_PAPER = "CONFERENCE_PAPER",
  CONFERENCE_PROCEEDING = "CONFERENCE_PROCEEDING",
  DATA_PAPER = "DATA_PAPER",
  DATASET = "DATASET",
  DISSERTATION = "DISSERTATION",
  EVENT = "EVENT",
  IMAGE = "IMAGE",
  INSTRUMENT = "INSTRUMENT",
  INTERACTIVE_RESOURCE = "INTERACTIVE_RESOURCE",
  JOURNAL = "JOURNAL",
  JOURNAL_ARTICLE = "JOURNAL_ARTICLE",
  MODEL = "MODEL",
  OUTPUT_MANAGEMENT_PLAN = "OUTPUT_MANAGEMENT_PLAN",
  PEER_REVIEW = "PEER_REVIEW",
  PHYSICAL_OBJECT = "PHYSICAL_OBJECT",
  PREPRINT = "PREPRINT",
  PROJECT = "PROJECT",
  REPORT = "REPORT",
  SERVICE = "SERVICE",
  SOFTWARE = "SOFTWARE",
  SOUND = "SOUND",
  STANDARD = "STANDARD",
  STUDY_REGISTRATION = "STUDY_REGISTRATION",
  TEXT = "TEXT",
  WORKFLOW = "WORKFLOW",
  OTHER = "OTHER",
}

export class RelatedWork extends MySqlModel {
  public projectId: number;
  public workType: RelatedWorkType;
  public relationDescriptor: RelatedWorkRelationDescriptor;
  public identifier: string;
  public citation: string;

  public static tableName = 'relatedWorks';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.projectId = options.projectId;
    this.workType = options.workType ?? RelatedWorkType.DATASET;
    this.relationDescriptor = options.relationDescriptor ?? RelatedWorkRelationDescriptor.REFERENCES;
    this.identifier = options.identifier;
    this.citation = options.citation;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (isNullOrUndefined(this.projectId)) this.addError('projectId', 'Project can\'t be blank');
    if (valueIsEmpty(this.workType)) this.addError('workType', 'Work type can\'t be blank');
    if (valueIsEmpty(this.relationDescriptor)) this.addError('relationDescriptor', 'Relation descriptor can\'t be blank');
    if (valueIsEmpty(this.identifier)) this.addError('identifier', 'Identifier can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Ensure data integrity
  prepForSave(): void {
    // Remove leading/trailing blank spaces
    this.identifier = this.identifier?.trim();
    this.citation = this.citation?.trim();
  }

  // Create a new RelatedWork
  async create(context: MyContext): Promise<RelatedWork> {
    const reference = 'RelatedWork.create';

    // First make sure the record is valid
    if (await this.isValid()) {
      const current = await RelatedWork.findByProjectAndIdentifier(
        reference,
        context,
        this.projectId,
        this.identifier
      );

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'RelatedWork already exists');
      } else {
        // Save the record and then fetch it
        this.prepForSave();
        const newId = await RelatedWork.insert(context, RelatedWork.tableName, this, reference);
        const response = await RelatedWork.findById(reference, context, newId);
        return response;
      }
    }



    // Otherwise return as-is with all the errors
    return new RelatedWork(this);
  }

  // Update an existing RelatedWork
  async update(context: MyContext, noTouch = false): Promise<RelatedWork> {
    if (await this.isValid()) {
      if (this.id) {
        this.prepForSave();
        await RelatedWork.update(context, RelatedWork.tableName, this, 'RelatedWork.update', [], noTouch);
        return await RelatedWork.findById('RelatedWork.update', context, this.id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'RelatedWork has never been saved');
    }
    return new RelatedWork(this);
  }

  // Delete the RelatedWork
  async delete(context: MyContext): Promise<RelatedWork> {
    if (this.id) {
      const deleted = await RelatedWork.findById('RelatedWork.delete', context, this.id);

      const successfullyDeleted = await RelatedWork.delete(
        context,
        RelatedWork.tableName,
        this.id,
        'RelatedWork.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Find a RelatedWork by its identifier
  static async findById(reference: string, context: MyContext, id: number): Promise<RelatedWork> {
    const sql = `SELECT * FROM ${RelatedWork.tableName} WHERE id = ?`;
    const result = await RelatedWork.query(context, sql, [id.toString()], reference);
    return Array.isArray(result) && result.length > 0 ? new RelatedWork(result[0]) : null;
  }

  // Find a RelatedWork by Project and Identifier
  static async findByProjectAndIdentifier(
    reference: string,
    context: MyContext,
    projectId: number,
    identifier: string
  ): Promise<RelatedWork> {
    const sql = `SELECT * FROM ${RelatedWork.tableName} WHERE projectId = ? AND identifier = ?`;
    const result = await RelatedWork.query(context, sql, [projectId.toString(), identifier], reference);
    return Array.isArray(result) && result.length > 0 ? new RelatedWork(result[0]) : null;
  }

  // Find all the RelatedWorks entries for an identifier
  static async findByIdentifier(reference: string, context: MyContext, identifer: string): Promise<RelatedWork[]> {
    const sql = `SELECT * FROM ${RelatedWork.tableName} WHERE identifier = ?`;
    const result = await RelatedWork.query(context, sql, [identifer], reference);
    return Array.isArray(result) && result.length !== 0 ? result.map((rw) => new RelatedWork(rw)) : [];
  }

  // Find all the RelatedWorks for a project
  static async findByProjectId(reference: string, context: MyContext, projectId: number): Promise<RelatedWork[]> {
    const sql = `SELECT * FROM ${RelatedWork.tableName} WHERE projectId = ?`;
    const result = await RelatedWork.query(context, sql, [projectId.toString()], reference);
    return Array.isArray(result) && result.length !== 0 ? result.map((rw) => new RelatedWork(rw)) : [];
  }
}

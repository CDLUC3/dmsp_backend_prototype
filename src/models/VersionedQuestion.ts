import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

export class VersionedQuestion extends MySqlModel {
  public versionedTemplateId: number;
  public versionedSectionId: number;
  public questionId: number;
  public questionTypeId: number;
  public questionText: string;
  public requirementText?: string;
  public guidanceText?: string;
  public sampleText?: string;
  public required: boolean;
  public displayOrder: number;

  private tableName = 'versionedQuestions';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.versionedTemplateId = options.versionedTemplateId;
    this.versionedSectionId = options.versionedSectionId;
    this.questionId = options.questionId;
    this.questionTypeId = options.questionTypeId;
    this.questionText = options.questionText;
    this.requirementText = options.requirementText;
    this.guidanceText = options.guidanceText;
    this.sampleText = options.sampleText;
    this.required = options.required || false;
    this.displayOrder = options.displayOrder;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.versionedTemplateId) {
      this.errors.push('Versioned Template can\'t be blank');
    }
    if (!this.versionedSectionId) {
      this.errors.push('Versioned Section can\'t be blank');
    }
    if (!this.questionId) {
      this.errors.push('Question can\'t be blank');
    }
    if (!this.questionTypeId) {
      this.errors.push('Question type can\'t be blank');
    }
    if (!this.questionText) {
      this.errors.push('Question text by can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  // Insert the new record
  async create(context: MyContext): Promise<VersionedQuestion> {
    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      const newId = await VersionedQuestion.insert(context, this.tableName, this, 'VersionedQuestion.create', ['tableName']);
      return await VersionedQuestion.findById('VersionedQuestion.create', context, newId);
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  // Find the VersionedQuestion by id
  static async findById(reference: string, context: MyContext, id: number): Promise<VersionedQuestion> {
    const sql = 'SELECT * FROM versionedQuestions WHERE id = ?';
    const results = await VersionedQuestion.query(context, sql, [id.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }


  // Find all VersionedQuestion that match versionedSectionId
  static async findByVersionedSectionId(reference: string, context: MyContext, versionedSectionId: number): Promise<VersionedQuestion[]> {
    const sql = 'SELECT * FROM versionedQuestions WHERE versionedSectionId = ?';
    const results = await VersionedQuestion.query(context, sql, [versionedSectionId.toString()], reference);
    return Array.isArray(results) ? results : [];
  }
}

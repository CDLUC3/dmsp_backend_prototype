import { AnyQuestionType } from "@dmptool/types";
import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { isNullOrUndefined } from "../utils/helpers";

export class VersionedQuestion extends MySqlModel {
  public versionedTemplateId: number;
  public versionedSectionId: number;
  public questionId: number;
  public questionJSON: string;
  public questionType: AnyQuestionType;
  public questionText: string;
  public requirementText?: string;
  public guidanceText?: string;
  public sampleText?: string;
  public required: boolean;
  public displayOrder: number;

  private tableName = 'versionedQuestions';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.versionedTemplateId = options.versionedTemplateId;
    this.versionedSectionId = options.versionedSectionId;
    this.questionId = options.questionId;
    this.questionType = (typeof options.questionType === 'string') ? JSON.parse(options.questionType) : options.questionType;
    this.questionText = options.questionText;
    this.requirementText = options.requirementText;
    this.guidanceText = options.guidanceText;
    this.sampleText = options.sampleText;
    this.required = options.required ?? false;
    this.displayOrder = options.displayOrder;

    // stringify the questionType and set it to the questionJSON
    try {
      this.questionJSON = JSON.stringify(this.questionType);
    } catch (e) {
      // Add the Zod schema error to the errors object
      this.addError('questionType', e.message);
    }
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (isNullOrUndefined(this.versionedTemplateId)) this.addError('versionedTemplateId', 'Versioned Template can\'t be blank');
    if (isNullOrUndefined(this.versionedSectionId)) this.addError('versionedSectionId', 'Versioned Section can\'t be blank');
    if (isNullOrUndefined(this.questionId)) this.addError('questionId', 'Question can\'t be blank');
    if (isNullOrUndefined(this.questionText)) this.addError('questionText', 'Question text can\'t be blank');
    if (isNullOrUndefined(this.questionType)) this.addError('questionType', 'Question type JSON can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Insert the new record
  async create(context: MyContext): Promise<VersionedQuestion> {
    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      const newId = await VersionedQuestion.insert(context, this.tableName, this, 'VersionedQuestion.create', ['questionJSON']);
      return await VersionedQuestion.findById('VersionedQuestion.create', context, newId);
    }
    // Otherwise return as-is with all the errors
    return new VersionedQuestion(this);
  }

  // Find the VersionedQuestion by id
  static async findById(reference: string, context: MyContext, id: number): Promise<VersionedQuestion> {
    const sql = 'SELECT * FROM versionedQuestions WHERE id = ?';
    const results = await VersionedQuestion.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new VersionedQuestion(results[0]) : null;
  }


  // Find all VersionedQuestion that match versionedSectionId
  static async findByVersionedSectionId(reference: string, context: MyContext, versionedSectionId: number): Promise<VersionedQuestion[]> {
    const sql = 'SELECT * FROM versionedQuestions WHERE versionedSectionId = ?';
    const results = await VersionedQuestion.query(context, sql, [versionedSectionId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new VersionedQuestion(entry)) : [];
  }
}

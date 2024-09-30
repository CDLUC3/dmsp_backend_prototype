import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

export class Question extends MySqlModel {
  public templateId: number;
  public sectionId: number;
  public sourceQuestionId?: number;
  public questionTypeId: number;
  public questionText: string;
  public requirementText?: string;
  public guidanceText?: string;
  public sampleText?: string;
  public required: boolean;
  public displayOrder: number;
  public isDirty: boolean;

  private tableName = 'questions';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.templateId = options.templateId;
    this.sectionId = options.sectionId;
    this.sourceQuestionId = options.sourceQuestionId;
    this.questionTypeId = options.questionTypeId;
    this.questionText = options.questionText;
    this.requirementText = options.requirementText;
    this.guidanceText = options.guidanceText;
    this.sampleText = options.sampleText;
    this.required = options.required || false;
    this.displayOrder = options.displayOrder;
    this.isDirty = options.isDirty || false;
  }

  //Update an existing Section
  async update(context: MyContext): Promise<Question> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        await Question.update(context, this.tableName, this, 'Question.update', ['tags']);
        return await Question.findById('Question.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.errors.push('Question has never been saved');
    }
    return this;
  }

  // Find the Question by it's id
  static async findById(reference: string, context: MyContext, sectionId: number): Promise<Question> {
    const sql = 'SELECT * FROM questions WHERE id = ?';
    const result = await Question.query(context, sql, [sectionId.toString()], reference);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }

  // Fetch all of the Questions for the specified Section
  static async findBySectionId(reference: string, context: MyContext, sectionId: number): Promise<Question[]> {
    const sql = 'SELECT * FROM questions WHERE sectionId = ?';
    const results = await Question.query(context, sql, [sectionId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
}

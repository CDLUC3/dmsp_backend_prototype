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

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.templateId) {
      this.errors.push('Template ID can\'t be blank');
    }
    if (!this.sectionId) {
      this.errors.push('Section ID can\'t be blank');
    }
    if (!this.questionText) {
      this.errors.push('Question text can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  //Create a new Question
  async create(context: MyContext, questionText: string, sectionId: number, templateId: number): Promise<Question> {
    // First make sure the record is valid
    if (await this.isValid()) {
      const current = await Question.findByQuestionText(
        'Question.create',
        context,
        questionText,
        sectionId,
        templateId
      );

      // Then make sure it doesn't already exist
      if (current) {
        this.errors.push('Question with this question text already exists');
      } else {
        // Save the record and then fetch it
        const newId = await Question.insert(context, this.tableName, this, 'Question.create', ['tableName']);
        const response = await Question.findById('Section.create', context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  //Update an existing Section
  async update(context: MyContext): Promise<Question> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        await Question.update(context, this.tableName, this, 'Question.update', ['tableName']);
        return await Question.findById('Question.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.errors.push('Question has never been saved');
    }
    return this;
  }

  //Delete Question based on the Question object's id and return
  async delete(context: MyContext): Promise<Question> {
    if (this.id) {
      /*First get the question to be deleted so we can return this info to the user
      since calling 'delete' doesn't return anything*/
      const deletedSection = await Question.findById('Question.delete', context, this.id);

      const successfullyDeleted = await Question.delete(context, this.tableName, this.id, 'Question.delete');
      if (successfullyDeleted) {
        return deletedSection;
      } else {
        return null
      }
    }
    return null;
  }

  // Find the Question by it's id
  static async findById(reference: string, context: MyContext, questionId: number): Promise<Question> {
    const sql = 'SELECT * FROM questions WHERE id = ?';
    const result = await Question.query(context, sql, [questionId.toString()], reference);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }

  // Fetch all of the Questions for the specified Section
  static async findBySectionId(reference: string, context: MyContext, sectionId: number): Promise<Question[]> {
    const sql = 'SELECT * FROM questions WHERE sectionId = ?';
    const results = await Question.query(context, sql, [sectionId.toString()], reference);
    return Array.isArray(results) ? results : [];
  }

  // Find section by section name
  static async findByQuestionText(
    reference: string,
    context: MyContext,
    questionText: string,
    sectionId: number,
    templateId: number,

  ): Promise<Question> {
    const sql = 'SELECT * FROM questions WHERE LOWER(questionText) = ? AND sectionId = ? AND templateId = ?';
    const vals = [questionText.toLowerCase(), sectionId.toString(), templateId.toString()];
    const results = await Question.query(context, sql, vals, reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
}

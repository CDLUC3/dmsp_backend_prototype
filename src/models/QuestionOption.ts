import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

export class QuestionOption extends MySqlModel {
  public questionId: number;
  public text: string;
  public orderNumber: number;
  public isDefault: boolean;

  private tableName = 'questionOptions';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.questionId = options.questionId;
    this.text = options.text;
    this.orderNumber = options.orderNumber;
    this.isDefault = options.isDefault;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.questionId) {
      this.errors.push('Question ID can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  // Ensure data integrity
  cleanup(): void {
    // Remove leading/trailing blank spaces
    this.text = this.text?.trim();
  }

  //Create a new QuestionOption
  async create(context: MyContext): Promise<QuestionOption> {
    // First make sure the record is valid
    if (await this.isValid()) {
      this.cleanup();

      // Save the record and then fetch it
      const newId = await QuestionOption.insert(context, this.tableName, this, 'QuestionOption.create');
      const response = await QuestionOption.findByQuestionOptionId('QuestionOption.create', context, newId);
      return response;
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  //Update an existing QuestionOption
  async update(context: MyContext, noTouch = false): Promise<QuestionOption> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        this.cleanup();

        await QuestionOption.update(context, this.tableName, this, 'QuestionOption.update', [], noTouch);
        return await QuestionOption.findByQuestionOptionId('QuestionOption.update', context, id);
      }
      // This question option has never been saved before so we cannot update it!
      this.errors.push('QuestionOption has never been saved');
    }
    return this;
  }

  //Delete QuestionOption based on the QuestionOption's id and return
  async delete(context: MyContext): Promise<QuestionOption> {
    if (this.id) {
      /*First get the questionOption to be deleted so we can return this info to the user
      since calling 'delete' doesn't return anything*/
      const deletedQuestionOption = await QuestionOption.findByQuestionOptionId('QuestionOption.delete', context, this.id);

      const successfullyDeleted = await QuestionOption.delete(context, this.tableName, this.id, 'QuestionOption.delete');
      if (successfullyDeleted) {
        return deletedQuestionOption;
      } else {
        return null
      }
    }
    return null;
  }

  // Find the QuestionOption by it's id
  static async findByQuestionOptionId(reference: string, context: MyContext, questionOptionId: number): Promise<QuestionOption> {
    const sql = 'SELECT * FROM questionOptions WHERE id = ?';
    const result = await QuestionOption.query(context, sql, [questionOptionId.toString()], reference);
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }

  // Fetch all of the QuestionOptions for the specified questionId
  static async findByQuestionId(reference: string, context: MyContext, questionId: number): Promise<QuestionOption[]> {
    const sql = 'SELECT * FROM questionOptions WHERE questionId = ?';
    const results = await QuestionOption.query(context, sql, [questionId.toString()], reference);
    return Array.isArray(results) ? results : [];
  }
}

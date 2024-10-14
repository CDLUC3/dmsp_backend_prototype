import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

export enum QuestionConditionActionType {
  SHOW_QUESTION = 'SHOW_QUESTION',
  HIDE_QUESTION = 'HIDE_QUESTION',
  SEND_EMAIL = 'SEND_EMAIL',
}

export enum QuestionConditionCondition {
  HAS_ANSWER = 'HAS_ANSWER',
  EQUAL = 'EQUAL',
  DOES_NOT_EQUAL = 'DOES_NOT_EQUAL',
  INCLUDES = 'INCLUDES',
}
export class QuestionCondition extends MySqlModel {
  public questionId: number;
  public action: QuestionConditionActionType;
  public condition: QuestionConditionCondition;
  public conditionMatch?: string;
  public target: string;

  private tableName = 'questionConditions';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.questionId = options.questionId;
    this.action = options.action || QuestionConditionActionType.SHOW_QUESTION;
    this.condition = options.condition || QuestionConditionCondition.EQUAL;
    this.conditionMatch = options.conditionMatch;
    this.target = options.target;
  }

  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.questionId) {
      this.errors.push('Question ID can\'t be blank');
    }
    if (!this.action) {
      this.errors.push('Action can\'t be blank');
    }
    if (!this.condition) {
      this.errors.push('Condition can\'t be blank');
    }
    if (!this.target) {
      this.errors.push('Target can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  //Create a new QuestionCondition
  async create(context: MyContext): Promise<QuestionCondition> {
    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      const newId = await QuestionCondition.insert(context, this.tableName, this, 'QuestionCondition.create', ['tableName']);
      const response = await QuestionCondition.findById('QuestionCondition.create', context, newId);
      return response;
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  //Update an existing QuestionCondition
  async update(context: MyContext): Promise<QuestionCondition> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        await QuestionCondition.update(context, this.tableName, this, 'QuestionCondition.update', ['tableName']);
        return await QuestionCondition.findById('QuestionCondition.update', context, id);
      }
      // This QuestionCondition has never been saved before so we cannot update it!
      this.errors.push('QuestionCondition has never been saved');
    }
    return this;
  }

  //Delete QuestionCondition based on the QuestionCondition object's id and return
  async delete(context: MyContext): Promise<QuestionCondition> {
    if (this.id) {
      /*First get the QuestionCondition to be deleted so we can return this info to the user
      since calling 'delete' doesn't return anything*/
      const deletedSection = await QuestionCondition.findById('QuestionCondition.delete', context, this.id);

      const successfullyDeleted = await QuestionCondition.delete(context, this.tableName, this.id, 'QuestionCondition.delete');
      if (successfullyDeleted) {
        return deletedSection;
      } else {
        return null
      }
    }
    return null;
  }

  // Fetch a QuestionConditions by it's id
  static async findById(reference: string, context: MyContext, questionConditionId: number): Promise<QuestionCondition> {
    const sql = 'SELECT * FROM questionConditions WHERE id = ?';
    const results = await QuestionCondition.query(context, sql, [questionConditionId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Fetch all of the QuestionConditions for the specified Question
  static async findByQuestionId(reference: string, context: MyContext, questionId: number): Promise<QuestionCondition[]> {
    const sql = 'SELECT * FROM questionConditions WHERE questionId = ?';
    const results = await QuestionCondition.query(context, sql, [questionId.toString()], reference);
    return Array.isArray(results) ? results : [];
  }
}

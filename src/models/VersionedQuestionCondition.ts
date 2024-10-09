import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { QuestionConditionActionType, QuestionConditionCondition } from "./QuestionCondition";

export class VersionedQuestionCondition extends MySqlModel {
  public versionedQuestionId: number;
  public questionConditionId: number;
  public action: QuestionConditionActionType;
  public condition: QuestionConditionCondition;
  public conditionMatch?: string;
  public target: string;

  private tableName = 'versionedQuestionConditions';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.versionedQuestionId = options.versionedQuestionId;
    this.questionConditionId = options.questionConditionId;
    this.action = options.action;
    this.condition = options.condition;
    this.conditionMatch = options.conditionMatch;
    this.target = options.target;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.versionedQuestionId) {
      this.errors.push('Versioned Question can\'t be blank');
    }
    if (!this.questionConditionId) {
      this.errors.push('Question Condition can\'t be blank');
    }
    if (!this.action) {
      this.errors.push('Action can\'t be blank');
    }
    if (!this.condition) {
      this.errors.push('Condition text by can\'t be blank');
    }
    if (!this.target) {
      this.errors.push('Target text by can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  // Insert the new record
  async create(context: MyContext): Promise<VersionedQuestionCondition> {
    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      const newId = await VersionedQuestionCondition.insert(
        context,
        this.tableName,
        this,
        'VersionedQuestionCondition.create',
        ['tableName']
      );
      return await VersionedQuestionCondition.findById('VersionedQuestion.create', context, newId);
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  // Find the VersionedQuestionCondition by id
  static async findById(reference: string, context: MyContext, id: number): Promise<VersionedQuestionCondition> {
    const sql = 'SELECT * FROM versionedQuestionConditions WHERE id = ?';
    const results = await VersionedQuestionCondition.query(context, sql, [id.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
}

import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { removeNullAndUndefinedFromJSON } from "../utils/helpers";


export class Answer extends MySqlModel {
  public planId: number;
  public versionedSectionId: number;
  public versionedQuestionId: number;
  public json: string;

  private static tableName = 'answers';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.planId = options.planId;
    this.versionedSectionId = options.versionedSectionId;
    this.versionedQuestionId = options.versionedQuestionId;
    this.json = options.json;
    // Ensure json is stored as a string
    try {
      this.json = removeNullAndUndefinedFromJSON(options.json);
    } catch (e) {
      this.addError('json', e.message);
    }
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.planId) this.addError('planId', 'Plan can\'t be blank');
    if (!this.versionedSectionId) this.addError('versionedSectionId', 'Section can\'t be blank');
    if (!this.versionedQuestionId) this.addError('versionedQuestionId', 'Question can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Ensure data integrity
  prepForSave(): void {
    // Remove leading/trailing blank spaces
    this.json = this.json?.trim();
  }

  //Create a new Answer
  async create(context: MyContext): Promise<Answer> {
    const reference = 'Answer.create';

    // First make sure the record is valid
    if (await this.isValid()) {
      const current = await Answer.findByPlanIdAndVersionedQuestionId(
        reference,
        context,
        this.planId,
        this.versionedQuestionId
      );

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'Answer already exists');
      } else {
        // Save the record and then fetch it
        const newId = await Answer.insert(context, Answer.tableName, this, reference);
        const response = await Answer.findById(reference, context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return new Answer(this);
  }

  //Update an existing Answer
  async update(context: MyContext, noTouch = false): Promise<Answer> {
    if (await this.isValid()) {
      if (this.id) {
        await Answer.update(context, Answer.tableName, this, 'Answer.update', [], noTouch);
        return await Answer.findById('Answer.update', context, this.id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'Answer has never been saved');
    }
    return new Answer(this);
  }

  //Delete the Answer
  async delete(context: MyContext): Promise<Answer> {
    if (this.id) {
      const deleted = await Answer.findById('Answer.delete', context, this.id);

      const successfullyDeleted = await Answer.delete(
        context,
        Answer.tableName,
        this.id,
        'Answer.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Fetch a Answer by it's id
  static async findById(reference: string, context: MyContext, licenseId: number): Promise<Answer> {
    const sql = `SELECT * FROM ${Answer.tableName} WHERE id = ?`;
    const results = await Answer.query(context, sql, [licenseId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new Answer(results[0]) : null;
  }

  // Fetch a Answer by it's planId and versionedQuestionId
  static async findByPlanIdAndVersionedQuestionId(
    reference: string,
    context: MyContext,
    planId: number,
    versionedQuestionId: number
  ): Promise<Answer> {
    const sql = `SELECT * FROM answers WHERE planId = ? AND versionedQuestionId = ?`;
    const results = await Answer.query(context, sql, [planId.toString(), versionedQuestionId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new Answer(results[0]) : null;
  }

  // Fetch all of the answers for a versionedSectionId
  static async findByPlanIdAndVersionedSectionId(
    reference: string,
    context: MyContext,
    planId: number,
    versionedSectionId: number
  ): Promise<Answer[]> {
    const sql = `SELECT * FROM answers WHERE planId = ? AND versionedSectionId = ?`;
    const results = await Answer.query(context, sql, [planId.toString(), versionedSectionId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((ans) => new Answer(ans)) : [];
  }

  // Fetch all of the answers for a plan
  static async findByPlanId(reference: string, context: MyContext, planId: number): Promise<Answer[]> {
    const sql = `SELECT * FROM answers WHERE planId = ?`;
    const results = await Answer.query(context, sql, [planId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((ans) => new Answer(ans)) : [];
  }
};

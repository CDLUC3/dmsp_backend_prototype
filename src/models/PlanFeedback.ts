import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { PlanFeedbackStatusEnum } from "../types";

export class PlanFeedback extends MySqlModel {
  public planId: number;
  public requested: string;
  public requestedById: number;
  public completed?: string; //Optional - won't exist initially when request is made
  public completedById?: number; //Optional - won't exist initially when request is made
  public summaryText?: string; //Optional - won't exist initially when request is made

  private static tableName = 'feedback';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.planId = options.planId;
    this.requested = options.requested;
    this.requestedById = options.requestedById;
    this.completed = options.completed;
    this.completedById = options.completedById;
    this.summaryText = options.summaryText;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.planId) this.addError('planId', 'Plan can\'t be blank');
    if (!this.requested) this.addError('requested', 'Requested can\'t be blank');
    if (!this.requestedById) this.addError('requestedById', 'RequestedById can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Ensure data integrity
  prepForSave(): void {
    // Remove leading/trailing blank spaces
    this.summaryText = this.summaryText?.trim();
  }

  //Create new PlanFeedback
  async create(context: MyContext): Promise<PlanFeedback> {
    const reference = 'PlanFeedback.create';

    // First make sure the record is valid
    if (await this.isValid()) {

      // My assumption is that you can have multiple rounds of requests for the same planId, so we don't need to check if it already exists
      // Save the record and then fetch it
      const newId = await PlanFeedback.insert(context, PlanFeedback.tableName, this, reference);
      const response = await PlanFeedback.findById(reference, context, newId);
      return response;

    }
    // Otherwise return as-is with all the errors
    return new PlanFeedback(this);
  }

  //Update an existing PlanFeedback
  async update(context: MyContext, noTouch = false): Promise<PlanFeedback> {
    if (await this.isValid()) {
      if (this.id) {
        this.prepForSave();
        await PlanFeedback.update(context, PlanFeedback.tableName, this, 'PlanFeedback.update', [], noTouch);
        return await PlanFeedback.findById('PlanFeedback.update', context, this.id);
      }
      // This feedback has never been saved before so we cannot update it!
      this.addError('general', 'PlanFeedback has never been saved');
    }
    return new PlanFeedback(this);
  }

  //Delete the PlanFeedback
  async delete(context: MyContext): Promise<PlanFeedback> {
    if (this.id) {
      const deleted = await PlanFeedback.findById('PlanFeedback.delete', context, this.id);

      const successfullyDeleted = await PlanFeedback.delete(
        context,
        PlanFeedback.tableName,
        this.id,
        'PlanFeedback.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Fetch a PlanFeedback by it's id
  static async findById(reference: string, context: MyContext, feedbackId: number): Promise<PlanFeedback> {
    const sql = `SELECT * FROM ${PlanFeedback.tableName} WHERE id = ?`;
    const results = await PlanFeedback.query(context, sql, [feedbackId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new PlanFeedback(results[0]) : null;
  }

  // Fetch PlanFeedback by it's planId and requestedById
  static async findByPlanIdAndRequestedById(
    reference: string,
    context: MyContext,
    planId: number,
    requestedById: number
  ): Promise<PlanFeedback[]> {
    const sql = `SELECT * FROM ${PlanFeedback.tableName} WHERE planId = ? AND requestedById = ?`;
    const results = await PlanFeedback.query(context, sql, [planId.toString(), requestedById.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((ans) => new PlanFeedback(ans)) : [];
  }

  // Fetch all of the feedback for a plan
  static async findByPlanId(reference: string, context: MyContext, planId: number): Promise<PlanFeedback[]> {
    const sql = `SELECT * FROM ${PlanFeedback.tableName} WHERE planId = ?`;
    const results = await PlanFeedback.query(context, sql, [planId.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((ans) => new PlanFeedback(ans)) : [];
  }

  // Get the feedback status for a plan
  static async statusForPlan(
    reference: string,
    context: MyContext,
    planId: number
  ): Promise<PlanFeedbackStatusEnum> {
    // Determine open feedback rows (requested IS NOT NULL AND completed IS NULL).
    // For each open feedback row, check if it has any child rows in feedbackComments (via feedbackid).
    // Aggregate into:
    //   requestedCount = number of open feedback rows with 0 comments
    //   receivedCount  = number of open feedback rows with >=1 comment
    const sql = `
      SELECT
        IFNULL(SUM(CASE WHEN x.comment_count = 0 THEN 1 ELSE 0 END), 0) AS requestedCount,
        IFNULL(SUM(CASE WHEN x.comment_count > 0 THEN 1 ELSE 0 END), 0) AS receivedCount
      FROM (
        SELECT f.id, COUNT(fc.id) AS comment_count
        FROM ${PlanFeedback.tableName} f
        LEFT JOIN feedbackComments fc ON fc.feedbackid = f.id
        WHERE f.planId = ? AND f.requested IS NOT NULL AND f.completed IS NULL
        GROUP BY f.id
      ) x
    `;
    const results = await PlanFeedback.query(context, sql, [planId?.toString()], reference);
    const row = Array.isArray(results) && results.length > 0 ? results[0] : { requestedCount: 0, receivedCount: 0 };

    const requestedCount = Number(row.requestedCount) || 0;
    const receivedCount = Number(row.receivedCount) || 0;

    // If any open feedback has no comments => overall REQUESTED (takes precedence).
    if (requestedCount > 0) return 'REQUESTED';
    if (receivedCount > 0) return 'RECEIVED';
    // No open feedback rows => NONE
    return 'NONE';
  }
};

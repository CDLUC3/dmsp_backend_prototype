
import { MyContext } from "../context";
import { valueIsEmpty } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

// Represents a historical version of the plan. We just stuff the DMP Common Standard format into a JSON field
// we will eventually want to be able to reconstitute the JSON back into a Plan object
export class PlanVersion extends MySqlModel {
  public planId: number;
  public dmp: string;

  private static tableName = 'planVersions';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.planId = options?.planId;
    this.dmp = options?.dmp;
  }

  // Validate the version (must have a timestamp and a URL)
  async isValid(): Promise<boolean> {
    if (!this.planId) this.errors['planId'] = 'Plan can\'t be blank';
    if (valueIsEmpty(this.dmp)) this.errors['dmp'] = 'DMP content cannot be empty';

    return Object.keys(this.errors).length === 0;
  }

  // Serialize the DMP as JSON
  prepForSave(): void {
    // If the DMP is not a string, stringify it
    if (typeof this.dmp !== 'string') {
      this.dmp = JSON.stringify(this.dmp);
    }
  }

  // Parse the JSON back into an object
  static processResults(planVersion: PlanVersion): PlanVersion {
    // if dmp is a string
    if (typeof planVersion.dmp === 'string') {
      // parse it
      planVersion.dmp = JSON.parse(planVersion.dmp);
    }
    return planVersion;
  }

  //Create a new PlanVersion
  async create(context: MyContext): Promise<PlanVersion> {
    const reference = 'PlanVersion.create';

    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      this.prepForSave();
      const newId = await PlanVersion.insert(context, PlanVersion.tableName, this, reference);
      const response = await PlanVersion.findById(reference, context, newId);
      return response;
    }
    // Otherwise return as-is with all the errors
    return new PlanVersion(this);
  }

  // Delete the PlanVersion
  async delete(context: MyContext): Promise<PlanVersion> {
    const reference = 'PlanVersion.delete';
    if (this.id) {
      const deleted = await PlanVersion.findById(reference, context, this.id);

      const successfullyDeleted = await PlanVersion.delete(context, PlanVersion.tableName, this.id, reference);
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Find the Version by it's id
  static async findById(reference: string, context: MyContext, planVersionId: number): Promise<PlanVersion | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const results = await PlanVersion.query(context, sql, [planVersionId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? PlanVersion.processResults(results[0]) : null;
  }

  // Find the Version by it's planId
  static async findByPlanId(reference: string, context: MyContext, planId: number): Promise<PlanVersion[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE planId = ?`;
    const results = await PlanVersion.query(context, sql, [planId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map(PlanVersion.processResults) : [];
  }
}

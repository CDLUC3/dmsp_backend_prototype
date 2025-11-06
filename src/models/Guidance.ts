import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { Tag } from "./Tag";

export class Guidance extends MySqlModel {
  public guidanceGroupId: number;
  public guidanceText?: string;
  public tags?: Tag[];

  private tableName = 'guidance';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.guidanceGroupId = options.guidanceGroupId;
    this.guidanceText = options.guidanceText;
    this.tags = options.tags;
  }

  // Check that the Guidance data contains the required fields
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.guidanceGroupId) this.addError('guidanceGroupId', 'GuidanceGroup ID can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Ensure data integrity
  prepForSave(): void {
    // Remove leading/trailing blank spaces
    this.guidanceText = this.guidanceText?.trim();
  }

  // Create a new Guidance
  async create(context: MyContext): Promise<Guidance> {
    // First make sure the record is valid
    if (await this.isValid()) {
      this.prepForSave();
      
      // Save the record and then fetch it
      const newId = await Guidance.insert(context, this.tableName, this, 'Guidance.create', ['tags']);
      const response = await Guidance.findById('Guidance.create', context, newId);
      return response;
    }
    // Otherwise return as-is with all the errors
    return new Guidance(this);
  }

  // Update an existing Guidance
  async update(context: MyContext, noTouch = false): Promise<Guidance> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        this.prepForSave();

        await Guidance.update(context, this.tableName, this, 'Guidance.update', ['tags'], noTouch);
        return await Guidance.findById('Guidance.update', context, id);
      }
      // This guidance has never been saved before so we cannot update it!
      this.addError('general', 'Guidance has never been saved');
    }
    return new Guidance(this);
  }

  // Delete Guidance based on the Guidance object's id
  async delete(context: MyContext): Promise<Guidance> {
    if (this.id) {
      // First get the guidance to be deleted so we can return this info to the user
      const deletedGuidance = await Guidance.findById('Guidance.delete', context, this.id);

      const successfullyDeleted = await Guidance.delete(context, this.tableName, this.id, 'Guidance.delete');
      if (successfullyDeleted) {
        return deletedGuidance;
      } else {
        return null;
      }
    }
    return null;
  }

  // Find all Guidance items for a specific GuidanceGroup
  static async findByGuidanceGroupId(reference: string, context: MyContext, guidanceGroupId: number): Promise<Guidance[]> {
    const sql = 'SELECT * FROM guidance WHERE guidanceGroupId = ? ORDER BY id ASC';
    const results = await Guidance.query(context, sql, [guidanceGroupId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new Guidance(entry)) : [];
  }

  // Find a specific Guidance by id
  static async findById(reference: string, context: MyContext, guidanceId: number): Promise<Guidance> {
    const sql = 'SELECT * FROM guidance WHERE id = ?';
    const result = await Guidance.query(context, sql, [guidanceId?.toString()], reference);
    return Array.isArray(result) && result.length > 0 ? new Guidance(result[0]) : null;
  }
}

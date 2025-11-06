import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { Tag } from "./Tag";
import { VersionedGuidanceGroup } from "./VersionedGuidanceGroup";
import { Guidance } from "./Guidance";

export class VersionedGuidance extends MySqlModel {
  public versionedGuidanceGroupId: number;
  public guidanceId?: number;
  public guidanceText?: string;
  public tagId: number;
  public tags?: Tag[];

  private tableName = 'versionedGuidance';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.versionedGuidanceGroupId = options.versionedGuidanceGroupId;
    this.guidanceId = options.guidanceId;
    this.guidanceText = options.guidanceText;
    this.tagId = options.tagId;
    this.tags = options.tags;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.versionedGuidanceGroupId) this.addError('versionedGuidanceGroupId', 'VersionedGuidanceGroup ID can\'t be blank');
    if (!this.tagId) this.addError('tagId', 'Tag ID can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Insert the new record
  async create(context: MyContext): Promise<VersionedGuidance> {
    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      const newId = await VersionedGuidance.insert(context, this.tableName, this, 'VersionedGuidance.create', ['tags']);
      return await VersionedGuidance.findById('VersionedGuidance.create', context, newId);
    }
    // Otherwise return as-is with all the errors
    return new VersionedGuidance(this);
  }

  // Find the VersionedGuidance by id
  static async findById(reference: string, context: MyContext, id: number): Promise<VersionedGuidance> {
    const sql = 'SELECT * FROM versionedGuidance WHERE id = ?';
    const results = await VersionedGuidance.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new VersionedGuidance(results[0]) : null;
  }

  // Find the VersionedGuidance items by guidanceId
  static async findByGuidanceId(reference: string, context: MyContext, guidanceId: number): Promise<VersionedGuidance[]> {
    const sql = 'SELECT * FROM versionedGuidance WHERE guidanceId = ?';
    const results = await VersionedGuidance.query(context, sql, [guidanceId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((entry) => new VersionedGuidance(entry)) : [];
  }

  // Find the VersionedGuidance items by versionedGuidanceGroupId
  static async findByVersionedGuidanceGroupId(reference: string, context: MyContext, versionedGuidanceGroupId: number): Promise<VersionedGuidance[]> {
    const sql = 'SELECT * FROM versionedGuidance WHERE versionedGuidanceGroupId = ? ORDER BY tagId ASC';
    const results = await VersionedGuidance.query(context, sql, [versionedGuidanceGroupId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results.map((entry) => new VersionedGuidance(entry)) : [];
  }

  // Find best practice VersionedGuidance for a specific tag
  static async findBestPracticeByTagId(reference: string, context: MyContext, tagId: number): Promise<VersionedGuidance[]> {
    const sql = `
      SELECT vg.* 
      FROM versionedGuidance vg
      INNER JOIN versionedGuidanceGroups vgg ON vg.versionedGuidanceGroupId = vgg.id
      WHERE vg.tagId = ? AND vgg.bestPractice = 1 AND vgg.active = 1
      ORDER BY vg.id ASC
    `;
    const results = await VersionedGuidance.query(context, sql, [tagId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new VersionedGuidance(entry)) : [];
  }

  // Find VersionedGuidance for a specific affiliation and tag
  static async findByAffiliationAndTagId(reference: string, context: MyContext, affiliationId: string, tagId: number): Promise<VersionedGuidance[]> {
    const sql = `
      SELECT vg.* 
      FROM versionedGuidance vg
      INNER JOIN versionedGuidanceGroups vgg ON vg.versionedGuidanceGroupId = vgg.id
      INNER JOIN guidanceGroups gg ON vgg.guidanceGroupId = gg.id
      WHERE gg.affiliationId = ? AND vg.tagId = ? AND vgg.active = 1
      ORDER BY vg.id ASC
    `;
    const results = await VersionedGuidance.query(context, sql, [affiliationId, tagId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new VersionedGuidance(entry)) : [];
  }
}

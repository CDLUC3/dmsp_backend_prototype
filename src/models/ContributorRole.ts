import { MyContext } from "../context";
import { validateURL } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export class ContributorRole extends MySqlModel {
  public id?: number;
  public displayOrder: number;
  public url: string;
  public label: string;
  public description?: string;
  public created: string;
  public createdById?: number;
  public modified?: string;
  public modifiedById?: number;

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.id = options.id;
    this.displayOrder = options.displayOrder;
    this.url = options.url;
    this.label = options.label;
    this.description = options.description;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    return super.isValid()
      && validateURL(this.url) && this.displayOrder !== null && this.label.length > 0;
  }

  // Return all of the contributor roles
  static async all(reference: string, context: MyContext): Promise<ContributorRole[] | null> {
    const sql = 'SELECT * FROM contributorRoles ORDER BY label';
    return await ContributorRole.query(context, sql, [], reference);
  }

  // Fetch a contributor role by it's id
  static async findById(
    reference: string,
    context: MyContext,
    contributorRoleById: number
  ): Promise<ContributorRole | null> {
    const sql = 'SELECT * FROM contributorRoles WHERE id = ?';
    const results = await ContributorRole.query(context, sql, [contributorRoleById.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Fetch a contributor role by it's URL
  static async findByURL(
    reference: string,
    context: MyContext,
    contributorRoleByURL: string
  ): Promise<ContributorRole | null> {
    const sql = 'SELECT * FROM contributorRoles WHERE url = ?';
    const results = await ContributorRole.query(context, sql, [contributorRoleByURL], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
};

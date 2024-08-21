import { MyContext } from "../context";
import { validateURL } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export class ContributorRole extends MySqlModel {
  public displayOrder: number;
  public url: string;
  public label: string;
  public description?: string;

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
    await super.isValid();

    if (!validateURL(this.url)) {
      this.errors.push('URL can\'t be blank');
    }
    if (!this.displayOrder || this.displayOrder < 0) {
      this.errors.push('Display order must be a positive number');
    }
    if (!this.label) {
      this.errors.push('Label can\'t be blank');
    }
    return this.errors.length <= 0;
  }

  // Return all of the contributor roles
  static async all(reference: string, context: MyContext): Promise<ContributorRole[]> {
    const sql = 'SELECT * FROM contributorRoles ORDER BY label';
    return await ContributorRole.query(context, sql, [], reference);
  }

  // Fetch a contributor role by it's id
  static async findById(
    reference: string,
    context: MyContext,
    contributorRoleById: number
  ): Promise<ContributorRole> {
    const sql = 'SELECT * FROM contributorRoles WHERE id = ?';
    const results = await ContributorRole.query(context, sql, [contributorRoleById.toString()], reference);
    return results[0];
  }

  // Fetch a contributor role by it's URL
  static async findByURL(
    reference: string,
    context: MyContext,
    contributorRoleByURL: string
  ): Promise<ContributorRole> {
    const sql = 'SELECT * FROM contributorRoles WHERE url = ?';
    const results = await ContributorRole.query(context, sql, [contributorRoleByURL], reference);
    return results[0];
  }
};

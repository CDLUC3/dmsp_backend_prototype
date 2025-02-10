import { MyContext } from "../context";
import { validateURL } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

// A link that can be displayed to the affiliation's users within the context of the DMPTool
export class AffiliationLink extends MySqlModel {
  public affiliationId!: string;
  public url!: string;
  public text: string;

  private tableName = 'affiliationLinks';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.affiliationId = options.affiliationId;
    this.url = options.url;
    this.text = options.text;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.affiliationId) this.addError('affiliationId', 'Affiliation can\'t be blank');
    if (validateURL(this.url)) this.addError('url', 'Invalid URL');

    return Object.keys(this.errors).length === 0;
  }

  // Save the current record
  async create(context: MyContext): Promise<AffiliationLink> {
    // First make sure the record doesn't already exist
    const currentDomain = await AffiliationLink.findByURL(
      'AffiliationLink.create',
      context,
      this.url,
    );

    // Then make sure it doesn't already exist
    if(await this.isValid()) {
      if (currentDomain) {
        const assoc = currentDomain.affiliationId == this.affiliationId ? 'this Affiliation' : 'another Affiliation';
        this.addError('general', `That email domain is already associated with ${assoc}`);
      } else {
      // Save the record and then fetch it
        const newId = await AffiliationLink.insert(context, this.tableName, this, 'AffiliationLink.create');
        return await AffiliationLink.findById('AffiliationLink.create', context, newId as number);
      }
    }
    // Otherwise return as-is with all the errors
    return new AffiliationLink(this);
  }

  // Archive this record
  async delete(context: MyContext): Promise<AffiliationLink> {
    if (this.id) {
      const result = await AffiliationLink.delete(context, this.tableName, this.id, 'AffiliationLink.delete');
      if (result) {
        return new AffiliationLink(this);
      }
    }
    return null;
  }

  // Return the specified AffiliationEmailDomain
  static async findById(reference: string, context: MyContext, id: number): Promise<AffiliationLink> {
    const sql = `SELECT * FROM affiliationLinks WHERE id = ?`;
    const results = await AffiliationLink.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new AffiliationLink(results[0]) : null;
  }

  // Return the specified AffiliationEmailDomain
  static async findByURL(reference: string, context: MyContext, url: string): Promise<AffiliationLink> {
    const sql = `SELECT * FROM affiliationLinks WHERE url = ?`;
    const results = await AffiliationLink.query(context, sql, [url], reference);
    return Array.isArray(results) && results.length > 0 ? new AffiliationLink(results[0]) : null;
  }

  // Return all of the AffiliationEmailDomains for the Affiliation
  static async findByAffiliationId(reference: string, context: MyContext, affiliationId: number): Promise<AffiliationLink[]> {
    const sql = `SELECT * FROM affiliationLinks WHERE affiliationId = ?`;
    const results = await AffiliationLink.query(context, sql, [affiliationId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new AffiliationLink(entry)) : [];
  }
}

import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

// An email domain associated with this affiliation. For use with SSO
export class AffiliationEmailDomain extends MySqlModel {
  public affiliationId!: string;
  public domain!: string;

  private tableName = 'affiliationEmailDomains';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.affiliationId = options.affiliationId
    this.domain = options.domain;
  }

  // Save the current record
  async create(context: MyContext): Promise<AffiliationEmailDomain> {
    // First make sure the record doesn't already exist
    const currentDomain = await AffiliationEmailDomain.findByDomain(
      'AffiliationEmailDomain.create',
      context,
      this.domain,
    );

    // Then make sure it doesn't already exist
    if (currentDomain) {
      const assoc = currentDomain.affiliationId == this.affiliationId ? 'this Affiliation' : 'another Affiliation';
      this.errors.push(`That email domain is already associated with ${assoc}`);
    } else {
    // Save the record and then fetch it
      const newId = await AffiliationEmailDomain.insert(context, this.tableName, this, 'AffiliationEmailDomain.create');
      return await AffiliationEmailDomain.findById('AffiliationEmailDomain.create', context, newId as number);
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  // Archive this record
  async delete(context: MyContext): Promise<AffiliationEmailDomain> {
    if (this.id) {
      const result = await AffiliationEmailDomain.delete(context, this.tableName, this.id, 'AffiliationEmailDomain.delete');
      if (result) {
        return this;
      }
    }
    return null;
  }

  // Return the specified AffiliationEmailDomain
  static async findById(reference: string, context: MyContext, id: number): Promise<AffiliationEmailDomain> {
    const sql = `SELECT * FROM affiliationEmailDomains WHERE id = ?`;
    const results = await AffiliationEmailDomain.query(context, sql, [id?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Search by the domain
  static async findByDomain(reference: string, context: MyContext, domain: string): Promise<AffiliationEmailDomain> {
    const sql = `SELECT * FROM affiliationEmailDomains WHERE domain LIKE ?`;
    const results = await AffiliationEmailDomain.query(context, sql, [domain], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Return all of the AffiliationEmailDomains for the Affiliation
  static async findByAffiliationId(reference: string, context: MyContext, affiliationId: string): Promise<AffiliationEmailDomain[]> {
    const sql = `SELECT * FROM affiliationEmailDomains WHERE affiliationId = ?`;
    const results = await AffiliationEmailDomain.query(context, sql, [affiliationId], reference);
    return Array.isArray(results) ? results : [];
  }
}

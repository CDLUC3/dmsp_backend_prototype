import { MyContext } from "../context";
import { validateURL } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

export class OutputType extends MySqlModel {
  public name: string;
  public uri: string;
  public description?: string;

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.id = options.id;
    this.name = options.name;
    this.uri = options.uri;
    this.description = options.description;
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!validateURL(this.uri)) this.addError('uri', 'URL can\'t be blank');
    if (!this.name) this.addError('name', 'Name can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Return all of the output types
  static async all(reference: string, context: MyContext): Promise<OutputType[]> {
    const sql = 'SELECT * FROM outputTypes ORDER BY name';
    const results = await OutputType.query(context, sql, [], reference);
    return Array.isArray(results) ? results : [];
  }

  // Fetch a output type by it's id
  static async findById(reference: string, context: MyContext, outputTypeId: number): Promise<OutputType> {
    const sql = 'SELECT * FROM outputTypes WHERE id = ?';
    const results = await OutputType.query(context, sql, [outputTypeId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? new OutputType(results[0]) : null;
  }

  // Fetch a contributor role by it's URL
  static async findByURL(reference: string, context: MyContext, outputTypeURL: string): Promise<OutputType> {
    const sql = 'SELECT * FROM outputTypes WHERE url = ?';
    const results = await OutputType.query(context, sql, [outputTypeURL], reference);
    return Array.isArray(results) && results.length > 0 ? new OutputType(results[0]) : null;
  }
}

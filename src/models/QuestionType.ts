import { MySqlModel } from "./MySqlModel";

export class QuestionType extends MySqlModel {
  public name: string;
  public usageDescription?: string;
  public isDefault: boolean;

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.name = options.name;
    this.usageDescription = options.usageDescription;
    this.isDefault = options.isDefault || false;
  }

  // Need to add logic to ensure there is only one default QuestionType when saving!

  // Fetch the default QuestionType
  static async default(context) {
    const sql = 'SELECT * FROM questionTypes WHERE isDefault = 1';
    const results = await QuestionType.query(context, sql, [], 'QuestionType default');
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
}

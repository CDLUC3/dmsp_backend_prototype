import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

export class QuestionType extends MySqlModel {
  public name: string;
  public usageDescription: string;
  public isDefault: boolean;

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.name = options.name;
    this.usageDescription = options.usageDescription;
    this.isDefault = options.isDefault || false;
  }

  // Find all QuestionTypes
  static async findAll(reference: string, context: MyContext): Promise<QuestionType[]> {
    const sql = 'SELECT * FROM questionTypes';
    const result = await QuestionType.query(context, sql, [], reference);
    return Array.isArray(result) ? result : [];
  }
}

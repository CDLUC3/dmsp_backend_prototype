import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";
import { AnyQuestionType } from '@dmptool/types';

export class QuestionType extends MySqlModel {
  public name: string;
  public usageDescription: string;
  public json: AnyQuestionType;
  public isDefault: boolean;

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.name = options.name;
    this.usageDescription = options.usageDescription;
    this.json = options.json;
    this.isDefault = options.isDefault ?? false;
  }

  // Find all QuestionTypes
  static async findAll(reference: string, context: MyContext): Promise<QuestionType[]> {
    const sql = 'SELECT * FROM questionTypes';
    const results = await QuestionType.query(context, sql, [], reference);
    return Array.isArray(results) ? results : [];
  }
}

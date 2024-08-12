import { logger, formatLogMessage } from "../logger";
import { MySQLDataSource } from "../datasources/mySQLDataSource";

export enum Visibility {
  Private = 'Private', // Template is only available to Researchers that belong to the same affiliation
  Public = 'Public', // Template is available to everyone creating a DMP
}

// A Template for creating a DMP
export class Template {
  public errors: string[];

  constructor(
    public id: number,
    public name: string,
    public affiliationId: string,
    public ownerId: number,
    public visibility: Visibility = Visibility.Private,
    public currentVersion = '',
    public isDirty = true,
    public bestPractice = false,

    public created: string = new Date().toUTCString(),
    public modified: string = new Date().toUTCString(),
  ){
    this.errors = [];
  }

  static async findById(caller: string, dataSource: MySQLDataSource, id: number): Promise<Template | null> {
    const logMessage = `Template.findById query for ${caller}, template: ${id}`;
    try {
      const sql = 'SELECT * FROM templates WHERE templateId = ?';
      const resp = await dataSource.query(sql, [id.toString()]);
      formatLogMessage(logger).debug(logMessage);
      return resp;
    } catch (err) {
      formatLogMessage(logger).error(`Template.findById ERROR for ${caller}, template: ${id} - ${err.message}`);
      return null;
    }
  }
}

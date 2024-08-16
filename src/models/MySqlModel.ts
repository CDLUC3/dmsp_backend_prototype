import { formatLogMessage } from "../logger";
import { MyContext } from '../context';
import { validateDate } from "../utils/helpers";

export class MySqlModel {
  public errors: string[];

  // Initialize with fields common to all MySQL DB tables
  constructor(
    public id?: number,
    public created: string = new Date().toUTCString(),
    public createdById?: number,
    public modified?: string,
    public modifiedById?: number,
  ){
    // If no modifier was designated and this is a new record then use the creator's id
    if (!this.id && !this.modifiedById) {
      this.modifiedById = this.createdById;
    }
    if (!this.modified){
      this.modified = this.id ? new Date().toUTCString() : this.created;
    }

    this.errors = [];
  };

  // Indicates whether or not the standard fields on the record are valid
  //   - created and modified should be dates
  //   - createdById and modifiedById should be numbers
  //   - id should be a number or null if its a new record
  async isValid(): Promise<boolean> {
    if (!validateDate(this.created)) {
      this.errors.push('Created date can\'t be blank');
    }
    if (!validateDate(this.modified)) {
      this.errors.push('Modified date can\'t be blank');
    }
    if (this.createdById === null) {
      this.errors.push('Created by can\'t be blank');
    }
    if (this.modifiedById === null) {
      this.errors.push('Modified by can\'t be blank');
    }

    return this.errors.length <= 0;
  }

  // Execute a SQL query
  //    - apolloContext:   The Apollo server context
  //    - sqlStatement:    The SQL statement to perform e.g. `SELECT * FROM table WHERE id = ?`
  //    - reference:       A reference to contextualize log messages e.g. `users resolver`
  //    - values:          The values to inject into the SQL statement e.g. `[id.toString()]`
  static async query(
    apolloContext: MyContext,
    sqlStatement: string,
    values: string[] = [],
    reference = 'undefined caller',
  ): Promise<any[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { logger, dataSources } = apolloContext;

    // The dataSource, logger and sqlStatement are required so bail if they are not provided
    if (dataSources && logger && dataSources.sqlDataSource && sqlStatement) {
      const logMessage = `${reference}, sql: ${sqlStatement}, vals: ${values}`;
      try {
        formatLogMessage(logger).debug(logMessage);
        const resp = await dataSources.sqlDataSource.query(sqlStatement, values);
        return Array.isArray(resp) ? resp : [resp];
      } catch (err) {
        const msg = `${reference}, ERROR: ${err.message}`;
        formatLogMessage(logger).error(msg);
        return [];
      }
    }
    const errMsg = `${reference}, ERROR: apolloContext and sqlStatement are required.`;
    if (logger) {
      formatLogMessage(logger).error(errMsg);
    } else {
      // In the event that there was no logger!
      console.log(errMsg);
    }
    return [];
  }
}
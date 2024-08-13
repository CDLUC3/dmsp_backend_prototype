import { formatLogMessage } from "../logger";
import { MyContext } from '../context';

export class MySqlModel {
  // Initialize with fields common to all MySQL DB tables
  constructor(
    public id: number,
    public created: string = new Date().toUTCString(),
    public createdById: number = null,
    public modified: string = new Date().toUTCString(),
    public modifiedById: number = null,
  ){};

  // Execute a SQL query
  //    - apolloContext:   The Apollo server context
  //    - sqlStatement:    The SQL statement to perform e.g. `SELECT * FROM table WHERE id = ?`
  //    - reference:       A reference to contextualize log messages e.g. `users resolver`
  //    - values:          The values to inject into the SQL statement e.g. `[id.toString()]`
  static async query(
    apolloContext: MyContext,
    sqlStatement: string,
    values: string[] = [],
    reference: string = 'undefined caller',
  ): Promise<any[]> {
    const { logger, dataSources } = apolloContext;

    // The dataSource, logger and sqlStatement are required so bail if they are not provided
    if (logger && dataSources.sqlDataSource && sqlStatement) {
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

    formatLogMessage(logger).error(`${reference}, ERROR: apolloContext and sqlStatement are required.`);
    return [];
  }
}
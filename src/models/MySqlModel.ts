import { formatLogMessage } from "../logger";
import { MyContext } from '../context';
import { validateDate } from "../utils/helpers";
import { getCurrentDate } from "../utils/helpers";

type MixedArray<T> = T[];

export class MySqlModel {
  // Initialize with fields common to all MySQL DB tables
  constructor(
    public id?: number,
    public created: string = getCurrentDate(),
    public createdById?: number,
    public modified?: string,
    public modifiedById?: number,
    public errors: string[] = [],
  ) {
    // If no modifier was designated and this is a new record then use the creator's id
    if (!this.id && !this.modifiedById) {
      this.modifiedById = this.createdById;
    }
    if (!this.modified) {
      this.modified = this.id ? getCurrentDate() : this.created;
    }
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

  /**
   * Convert incoming value to appropriate type for insertion into a SQL query
   * @param val
   * @param type
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static prepareValue(val: any, type: any): any {
    // TODO: See if we need to do any checks here for SQL injection or if the MySQL package
    //       does this already.
    if (val === null || val === undefined) {
      return null;
    }
    switch (type) {
      case 'number':
        return Number(val);
      case 'json':
        return JSON.stringify(val);
      case Object:
      case Array:
        return JSON.stringify(val);
      case 'boolean':
        return Boolean(val);
      default:
        return String(val);

    }
  }

  // Fetches all of the property infor for the object to faciliate inserts and updates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static propertyInfo(obj: Record<string, any>, skipKeys: string[] = []): { name: string, value: string }[] {
    const excludedKeys = ['id', 'errors'];
    return Object.keys(obj)
      .filter((key) => ![...excludedKeys, ...skipKeys]
        .includes(key)).map((key) => ({
          name: key,
          value: obj[key]
        }));
  }

  // Run a query to check for the existence of a record in the database. Typically used to verify that
  // a foreign key relationship exists. (e.g. TemplateCollaborator runs a check to make sure the
  // templateId exists before creating a new record)
  //    - apolloContext:   The Apollo server context
  //    - tableName:       The name of the tabe to query
  //    - id:              The id of the record we are looking for
  //    - reference:       A reference to contextualize log messages e.g. `users resolver`
  static async exists(
    apolloContext: MyContext,
    tableName: string,
    id: number,
    reference = 'undefined caller'
  ): Promise<boolean> {
    const sql = `SELECT id FROM ${tableName} WHERE id = ?`;
    const results = await MySqlModel.query(apolloContext, sql, [id.toString()], reference);
    return results && results.length === 1;
  }

  // Execute a SQL query
  //    - apolloContext:   The Apollo server context
  //    - sqlStatement:    The SQL statement to perform e.g. `SELECT * FROM table WHERE id = ?`
  //    - reference:       A reference to contextualize log messages e.g. `users resolver`
  //    - values:          The values to inject into the SQL statement e.g. `[id.toString()]`
  static async query(
    apolloContext: MyContext,
    sqlStatement: string,
    values: MixedArray<string | boolean> = [],
    reference = 'undefined caller',
  ): Promise<any[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { logger, dataSources } = apolloContext;

    // The dataSource, logger and sqlStatement are required so bail if they are not provided
    if (dataSources && logger && dataSources.sqlDataSource && sqlStatement) {
      const sql = sqlStatement.split(/[\s\t\n]+/).join(' ');
      const logMessage = `${reference}, sql: ${sql}, vals: ${values}`;
      const vals = values.map((entry) => this.prepareValue(entry, typeof (entry)));

      try {
        formatLogMessage(logger).debug(logMessage);
        const resp = await dataSources.sqlDataSource.query(sql, vals);
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

  // Execute a SQL insert
  //    - apolloContext:   The Apollo server context
  //    - table:           The SQL table name
  //    - obj:             The MysqlModel instance
  //    - reference:       A reference to contextualize log messages e.g. `users resolver`
  // returns the newly inserted record's id
  static async insert(
    apolloContext: MyContext,
    table: string,
    obj: MySqlModel,
    reference = 'undefined caller',
    skipKeys?: string[]
  ): Promise<number> {
    // Update the creator/modifier info
    const currentDate = getCurrentDate();
    obj.createdById = apolloContext.token.id;
    obj.created = currentDate;
    obj.modifiedById = apolloContext.token.id;
    obj.modified = currentDate;

    // Fetch all of the data from the object
    const props = this.propertyInfo(obj, skipKeys);

    const sql = `INSERT INTO ${table} \
                  (${props.map((entry) => entry.name).join(', ')}) \
                 VALUES (${Array(props.length).fill('?').join(', ')})`

    const vals = props.map((entry) => this.prepareValue(entry.value, typeof (entry.value)));

    // Send the calcuated INSERT statement to the query function
    const result = await this.query(apolloContext, sql, vals, reference);
    return Array.isArray(result) ? result[0]?.insertId : null;
  }

  // Execute a SQL update
  //    - apolloContext:   The Apollo server context
  //    - table:           The SQL table name
  //    - obj:             The MysqlModel instance
  //    - reference:       A reference to contextualize log messages e.g. `users resolver`
  // returns the newly inserted record's id
  static async update(
    apolloContext: MyContext,
    table: string,
    obj: MySqlModel,
    reference = 'undefined caller',
    skipKeys?: string[],
    noTouch?: boolean,
  ): Promise<MySqlModel> {
    // Update the modifier info
    if (!noTouch) {
      obj.modifiedById = apolloContext.token.id;
      const currentDate = getCurrentDate();
      obj.modified = currentDate;
      obj.created = currentDate;
    }

    // Fetch all of the data from the object
    const props = this.propertyInfo(obj, skipKeys);

    props.map((entry) => `${entry.name} = ?`)

    const sql = `UPDATE ${table} \
                 SET ${props.map((entry) => `${entry.name} = ?`).join(', ')} \
                 WHERE id = ?`;

    const vals = props.map((entry) => this.prepareValue(entry.value, typeof (entry.value)));

    vals.push(obj.id.toString());

    // Send the calcuated INSERT statement to the query function
    const result = await this.query(apolloContext, sql, vals, reference);
    return Array.isArray(result) ? result[0] : null;
  }


  // Execute a SQL delete
  //    - apolloContext:   The Apollo server context
  //    - table:           The SQL table name
  //    - id:              The record id
  //    - reference:       A reference to contextualize log messages e.g. `users resolver`
  // returns the newly inserted record's id
  static async delete(
    apolloContext: MyContext,
    table: string,
    id: number,
    reference = 'undefined caller',
  ): Promise<boolean> {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const result = await this.query(apolloContext, sql, [id.toString()], reference);
    return Array.isArray(result) && result[0].affectedRows ? true : false;
  }
}

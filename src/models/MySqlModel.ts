import { formatLogMessage } from "../logger";
import { MyContext } from '../context';
import { validateDate } from "../utils/helpers";
import { getCurrentDate } from "../utils/helpers";
import { formatISO9075, isDate } from "date-fns";

type MixedArray<T> = T[];

export class MySqlModel {
  // Initialize with fields common to all MySQL DB tables
  constructor(
    public id?: number,
    public created: string = getCurrentDate(),
    public createdById?: number,
    public modified?: string,
    public modifiedById?: number,
    public errors: Record<string, string> = {},
  ) {
    // If no modifier was designated and this is a new record then use the creator's id
    if (!this.id && !this.modifiedById) {
      this.modifiedById = this.createdById;
    }
    if (!this.modified) {
      this.modified = this.id ? getCurrentDate() : this.created;
    }
    // Only initialize the errors object if it is not already set
    if (!this.errors) {
      this.errors = {};
    }
  };

  // Check to see if the object has errors
  hasErrors(): boolean {
    return this.errors
      && Array.isArray(Object.keys(this.errors))
      && Object.keys(this.errors).length > 0;
  }

  // Add an error to the errors array
  addError(property: string, error: string): void {
    this.errors[property] = error;
  }

  // Indicates whether or not the standard fields on the record are valid
  //   - created and modified should be dates
  //   - createdById and modifiedById should be numbers
  //   - id should be a number or null if its a new record
  async isValid(): Promise<boolean> {
    if (!validateDate(this.created)) this.addError('created', 'Created date can\'t be blank');

    if (!validateDate(this.modified)) this.addError('modified', 'Modified date can\'t be blank');

    if (this.createdById === null) this.addError('createdById', 'Created by can\'t be blank');

    if (this.modifiedById === null) this.addError('modifiedById', 'Modified by can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Check whether or not the value is a Date
  static valueIsDate(val: string): boolean {
    const date = new Date(val);
    return !isNaN(date.getTime());
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
        if (isDate(val)) {
          const date = new Date(val).toISOString();
          return formatISO9075(date);

        } else if (Array.isArray(val)) {
          return JSON.stringify(val);

        } else {
          return String(val);
        }
    }
  }

  // Fetches all of the property info for the object to faciliate inserts and updates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static propertyInfo(obj: Record<string, any>, skipKeys: string[] = []): { name: string, value: string }[] {
    const excludedKeys = ['id', 'errors', 'tableName'];

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
        formatLogMessage(apolloContext).debug(logMessage);
        const resp = await dataSources.sqlDataSource.query(apolloContext, sql, vals);
        return Array.isArray(resp) ? resp : [resp];
      } catch (err) {
        const msg = `${reference}, ERROR: ${err.message}`;
        formatLogMessage(apolloContext).error(err, msg);
        return [];
      }
    }
    const errMsg = `${reference}, ERROR: apolloContext and sqlStatement are required.`;
    if (logger) {
      formatLogMessage(apolloContext).error(errMsg);
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
    obj: MySqlModel & { userId?: number },
    reference = 'undefined caller',
    skipKeys?: string[]
  ): Promise<number> {
    // If the createdById and modifiedById have not alredy been set, use the value in the token or the userId
    if (!obj.createdById) {
      obj.createdById = apolloContext?.token?.id ?? obj.userId;
    }
    if (!obj.modifiedById) {
      obj.modifiedById = apolloContext?.token?.id ?? obj.userId;
    }

    // Update the created/modified dates
    const currentDate = getCurrentDate();
    obj.created = currentDate;
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
    if (noTouch !== true) {
      // Only update the modifiedById if we have a token otherwise leave it as is
      if (apolloContext?.token?.id) {
        obj.modifiedById = apolloContext?.token?.id;
      }
      const currentDate = getCurrentDate();
      obj.modified = currentDate;
    }

    // Fetch all of the data from the object
    let props = this.propertyInfo(obj, skipKeys);
    // We are updating, so remove the created info
    props = props.filter((entry) => { return !['created', 'createdById'].includes(entry.name) });

    props.map((entry) => `${entry.name} = ?`)

    const sql = `UPDATE ${table} \
                 SET ${props.map((entry) => `${entry.name} = ?`).join(', ')} \
                 WHERE id = ?`;

    const vals = props.map((entry) => this.prepareValue(entry.value, typeof (entry.value)));
    // Make sure the record id is the last value
    vals.push(obj.id.toString());

    // Send the calcuated UPDATE statement to the query function
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

  // A helper function that can be used when updating an Object that has a many to many relationship.
  // You pass in an array of the current ids for the relationship and another containing the desired
  // ids for the relationship.
  //     - idsOnCurrentRecord:  The foreign key ids that are in the DB now
  //     - idsOnNewRecord:      The foreign key ids we want
  // Return a list of the ids to delete, idsToBeRemoved,  and a list of ids to add idsToBeSaved
  static reconcileAssociationIds(
    idsOnCurrentRecord: number[],
    idsOnNewRecord: number[]
  ): { idsToBeRemoved: number[], idsToBeSaved: number[] } {
    const current = new Set<number>(idsOnCurrentRecord);
    const wanted = new Set<number>(idsOnNewRecord);

    return {
      idsToBeRemoved: idsOnCurrentRecord.filter((id) => !wanted.has(id)),
      idsToBeSaved: idsOnNewRecord.filter((id) => !current.has(id))
    }
  }
}

import { MySqlModel } from "./MySqlModel";

export class Question extends MySqlModel {
  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);
  }
}

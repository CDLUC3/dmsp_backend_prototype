import { MyContext } from '../context';
import { MySqlModel } from './MySqlModel';

export class Collaborator extends MySqlModel {
  constructor(
    public email: string,
    public invitedById: number = null,
    public createdById: number = null,
    public modifiedById: number = null,
    public userId: number = null,

    public id: number = null,
    public created: string = new Date().toUTCString(),
    public modified: string = new Date().toUTCString(),
  ){
    super(id, created, createdById, created, createdById);
  }
}

export class TemplateCollaborator extends Collaborator {
  public id: number;
  public email: string;
  public invitedById: number;
  public createdById: number;
  public modifiedById: number;
  public userId: number;

  public templateId: number;
  public created: string;
  public modified: string;

  constructor(options) {
    super(options.email, options.invitedById, options.createdById, options.modifiedById,
      options.userId, options.id, options.created, options.modified);

    this.templateId = options.templateId || null;
  }

  static async findByTemplateId(reference: string, context: MyContext, templateId: number) {
    const sql = 'SELECT * FROM templateCollaborators WHERE templateId = ? ORDER BY email ASC';
    return await TemplateCollaborator.query(context, sql, [templateId.toString()], reference);
  }
}

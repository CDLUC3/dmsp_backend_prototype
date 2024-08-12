export class Collaborator {
  constructor(
    public email: string,
    public invitedById: number,
    public userId: number = null,

    public created: string = new Date().toUTCString(),
  ){}
}

export class TemplateCollaborator extends Collaborator {
  constructor(
    public templateId: number,
    public email: string,
    public invitedById: number,
    public userId: number = null,

    public created: string = new Date().toUTCString(),
  ){
    super(email, invitedById, userId, created);
  }
}
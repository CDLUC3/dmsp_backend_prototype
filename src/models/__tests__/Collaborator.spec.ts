import casual from 'casual';
import { Collaborator, TemplateCollaborator } from "../Collaborator";

describe('Collaborator', () => {
  it('constructor should initialize as expected', () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);

    const templateCollaborator = new Collaborator(email, invitedById);

    expect(templateCollaborator.email).toEqual(email);
    expect(templateCollaborator.invitedById).toEqual(invitedById);
    expect(templateCollaborator.userId).toBeFalsy();
    expect(templateCollaborator.created).toBeTruthy();
  });
});


describe('TemplateCollaborator', () => {
  it('constructor should initialize as expected', () => {
    const email = casual.email;
    const templateId = casual.integer(1, 999);
    const invitedById = casual.integer(1, 999);

    const templateCollaborator = new TemplateCollaborator(templateId, email, invitedById);

    expect(templateCollaborator.email).toEqual(email);
    expect(templateCollaborator.templateId).toEqual(templateId);
    expect(templateCollaborator.invitedById).toEqual(invitedById);
    expect(templateCollaborator.userId).toBeFalsy();
    expect(templateCollaborator.created).toBeTruthy();
  });
});

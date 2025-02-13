import casual from "casual";
import { getCurrentDate } from "../../utils/helpers";
import { TemplateCollaborator } from "../Collaborator";

export let templateCollaboratorStore = [];
export let projectCollaboratorStore = [];

// Mock the collaborator tables
export const resetCollaboratorStore = (tableName: string) => {
  switch (tableName) {
    case 'templateCollaborators':
      templateCollaboratorStore = [];
      break;
    case 'projectCollaborators':
      projectCollaboratorStore = [];
      break;
  }
}

// Get the appropriate store based on the table name
function getStore(tableName: string) {
  switch (tableName) {
    case 'templateCollaborators':
      return templateCollaboratorStore;
    case 'projectCollaborators':
      return projectCollaboratorStore;
  }
}

// Seed the collaborators table
export const seedCollaboratorStore = (tableName = 'templateCollaborators', count = 10) => {
  for (let i = 0; i < count; i++) {
    const tstamp = getCurrentDate();

    const opts = {
      id: casual.integer(1, 9999),
      createdById: casual.integer(1, 9999),
      created: tstamp,
      modifiedById: casual.integer(1, 9999),
      modified: tstamp,
      errors: null,

      email: casual.email,
      invitedById: casual.integer(1, 9999),
      userId: casual.integer(1, 9999),
    };

    switch (tableName) {
      case 'templateCollaborators':
        templateCollaboratorStore.push({ ...opts, templateId: casual.integer(1, 9999) });
        break;
      case 'projectCollaborators':
        projectCollaboratorStore.push({ ...opts, projectId: casual.integer(1, 9999) });
        break;
    }
  }
}

// Mock the TemplateCollaborator queries
export const mockFindTemplateCollaboratorById = async (_, __, id) => {
  const result = templateCollaboratorStore.find((entry) => { return entry.id === id });
  return result ? new TemplateCollaborator(result) : null;
}

export const mockFindTemplateCollaboratorByInviterId = async (_, __, invitedById) => {
  const results = templateCollaboratorStore.filter((entry) => { return entry.invitedById === invitedById });
  return results ? results.map((entry) => { return new TemplateCollaborator(entry) }) : [];
}

export const mockFindTemplateCollaboratorByEmail = async (_, __, email) => {
  const results = templateCollaboratorStore.filter((entry) => {
    return entry.email.toLowerCase().trim() === email.toLowerCase().trim()
  });
  return results ? results.map((entry) => { return new TemplateCollaborator(entry) }) : [];
}

export const mockFindTemplateCollaboratorByTemplateIdAndEmail = async (_, __, templateId, email) => {
  const result = templateCollaboratorStore.find((entry) => {
    return entry.templateId === templateId && entry.email.toLowerCase().trim() === email.toLowerCase().trim()
  });
  return result ? new TemplateCollaborator(result) : null;
}

export const mockFindTemplateCollaboratorByTemplateId = async (_, __, templateId) => {
  const results = templateCollaboratorStore.filter((entry) => { return entry.templateId === templateId });
  return results ? results.map((entry) => { return new TemplateCollaborator(entry) }) : [];
}

// Mock the mutations
export const mockInsert = async (_, tableName, collaborator) => {
  const collaboratorStore = getStore(tableName);

  const tstamp = getCurrentDate();
  collaborator.id = casual.integer(1, 9999);
  collaborator.createdById = casual.integer(1, 9999);
  collaborator.created = tstamp;
  collaborator.modifiedById = casual.integer(1, 9999);
  collaborator.modified = tstamp;

  collaboratorStore.push(collaborator);
  return collaborator.id;
}

export const mockUpdate = async (_, tableName, collaborator) => {
  const collaboratorStore = getStore(tableName);

  const index = collaboratorStore.findIndex((entry) => { return entry.id === collaborator.id });
  const tstamp = getCurrentDate();
  const updatedEntry = {
    ...collaboratorStore[index],
    modifiedById: casual.integer(1, 9999),
    modified: tstamp,
    errors: null,

    ...collaborator,
  };

  collaboratorStore[index] = updatedEntry;
  return updatedEntry;
}

export const mockDelete = async (_, tableName, collaborator) => {
  const collaboratorStore = getStore(tableName);

  const index = collaboratorStore.findIndex((entry) => { return entry.id === collaborator.id });
  const deletedEntry = { ...collaboratorStore[index] };

  collaboratorStore.splice(index, 1);
  return deletedEntry;
}

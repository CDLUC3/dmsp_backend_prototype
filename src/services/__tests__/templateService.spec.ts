import casual from 'casual';
 import { Template, TemplateVisibility } from "../../models/Template";
 import { VersionedTemplate, TemplateVersionType } from '../../models/VersionedTemplate';
 import { cloneTemplate, generateTemplateVersion, hasPermissionOnTemplate } from '../templateService';
import { TemplateCollaborator } from '../../models/Collaborator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { isSuperAdmin } from '../authService';
import { logger } from '../../__mocks__/logger';
import { MySQLDataSource } from '../../datasources/mySQLDataSource';
import { buildContext, mockToken } from '../../__mocks__/context';

// Pulling context in here so that the MySQLDataSource gets mocked
jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('hasPermissionOnTemplate', () => {
  let template;
  let mockQuery;
  let mockIsSuperAdmin;
  let mockFindByTemplateAndEmail;
  let context;

  beforeEach(() => {
    jest.resetAllMocks();

    // Cast getInstance to a jest.Mock type to use mockReturnValue
    (MySQLDataSource.getInstance as jest.Mock).mockReturnValue({
      query: jest.fn(), // Initialize the query mock function here
    });

    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
    context = { logger, dataSources: { sqlDataSource: { query: mockQuery } } };

    mockIsSuperAdmin = jest.fn();
    (isSuperAdmin as jest.Mock) = mockIsSuperAdmin;

    mockFindByTemplateAndEmail = jest.fn();
    (TemplateCollaborator.findByTemplateIdAndEmail as jest.Mock) = mockFindByTemplateAndEmail;

    template = new Template({
      id: casual.integer(1, 999),
      name: casual.sentence,
      ownerId: casual.url,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns true if the current user is a Super Admin', async () => {
    mockIsSuperAdmin.mockResolvedValueOnce(true);

    context.token = { affiliationId: 'https://test.example.com/foo' };
    expect(await hasPermissionOnTemplate(context, template)).toBe(true)
    expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
  });

  it('returns true if the current user\'s affiliation is the same as the template\'s owner', async () => {
    mockIsSuperAdmin.mockResolvedValueOnce(false);

    context.token = { affiliationId: template.ownerId };
    expect(await hasPermissionOnTemplate(context, template)).toBe(true)
    expect(mockIsSuperAdmin).toHaveBeenCalledTimes(0);

  });

  it('returns true if the current user is a collaborator for the template', async () => {
    mockIsSuperAdmin.mockResolvedValue(false);
    mockFindByTemplateAndEmail.mockResolvedValueOnce(template);

    context.token = { affiliationId: 'https://test.example.com/foo' };
    expect(await hasPermissionOnTemplate(context, template)).toBe(true)
    expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
    expect(mockFindByTemplateAndEmail).toHaveBeenCalledTimes(1);
  });

  it('returns false when the user does not have permission', async () => {
    mockIsSuperAdmin.mockResolvedValueOnce(false);
    mockFindByTemplateAndEmail.mockResolvedValueOnce(null);

    context.token = { affiliationId: 'https://test.example.com/foo' };
    expect(await hasPermissionOnTemplate(context, template)).toBe(false)
    expect(mockIsSuperAdmin).toHaveBeenCalledTimes(1);
    expect(mockFindByTemplateAndEmail).toHaveBeenCalledTimes(1);
  });
});

describe('generateTemplateVersion', () => {
   let id;
   let name;
   let description;
   let createdById;
   let ownerId;
   let tmplt;

   beforeEach(() => {
     id = casual.integer(1, 999);
     name = casual.title;
     description = casual.sentences(3);
     ownerId = casual.url;
     createdById = casual.integer(1, 999);

     tmplt = new Template({ name, description, ownerId, createdById });
     tmplt.id = id;
   });

   it('throws an error if the specified Template has no id (it hasn\'t been saved!)', async () => {
     tmplt.id = null;
     const expectedMessage = 'Cannot publish unsaved Template';
     expect(await generateTemplateVersion(context, tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(Error);
     expect(await generateTemplateVersion(context, tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(expectedMessage);
   });

   it('throws an error if the specified Template has a current version but no changes', async () => {
     tmplt.currentVersion = 'v1'
     tmplt.isDirty = false
     const expectedMessage = 'There are no changes to publish';
     expect(await generateTemplateVersion(context, tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(Error);
     expect(await generateTemplateVersion(context, tmplt, [], ownerId, 'Testing unsaved')).rejects.toThrow(expectedMessage);
   });

   it('initializes a new VersionedTemplate and sets the currentVersion number', async () => {
     const publisher = casual.integer(1, 999);
     const comment = casual.sentences(10);

     const versionedTemplate = await generateTemplateVersion(context, tmplt, [], publisher, comment);
     expect(versionedTemplate).toBeInstanceOf(VersionedTemplate);
     expect(versionedTemplate.templateId).toEqual(tmplt.id);
     expect(versionedTemplate.name).toEqual(tmplt.name);
     expect(versionedTemplate.visibility).toEqual(tmplt.visibility);
     expect(versionedTemplate.version).toEqual('v1');
     expect(versionedTemplate.versionedById).toEqual(publisher);
     expect(versionedTemplate.comment).toEqual(comment);
     expect(versionedTemplate.active).toBe(true);
   });

   it('initializes a new VersionedTemplate and bumps the currentVersion number', async () => {
     const publisher = casual.integer(1, 999);
     const comment = casual.sentences(10);

     const ver = casual.integer(1, 999);
     const priorVersion = new VersionedTemplate({
       id: tmplt.id,
       version: `v${ver}`,
       name: 'Prior version',
       ownerId,
       createdById: casual.integer(1, 999),
       visibility: TemplateVisibility.PUBLIC,
       comment: 'This was the prior version',
       active: true,
     });
     tmplt.currentVersion = ver;

     const versionedTemplate = await generateTemplateVersion(context, tmplt, [priorVersion], publisher, comment);
     expect(versionedTemplate).toBeInstanceOf(VersionedTemplate);
     expect(versionedTemplate.templateId).toEqual(tmplt.id);
     expect(versionedTemplate.name).toEqual(tmplt.name);
     expect(versionedTemplate.visibility).toEqual(tmplt.visibility);
     expect(versionedTemplate.version).toEqual(`v${ver + 1}`);
     expect(versionedTemplate.versionedById).toEqual(publisher);
     expect(versionedTemplate.comment).toEqual(comment);
     expect(versionedTemplate.active).toBe(true);
   });
 });

 describe('cloneTemplate', () => {
   let id;
   let name;
   let description;
   let createdById;
   let ownerId;
   let tmplt;

   beforeEach(() => {
     id = casual.integer(1, 999);
     name = casual.title;
     description = casual.sentences(3);
     ownerId = casual.url;
     createdById = casual.integer(1, 999);

     tmplt = new Template({ id, name, description, ownerId, createdById });
   });

   it('Clone retains the expected parts of the specified Template', () => {
     const clonedById = casual.integer(1, 99);
     const newOwnerId = casual.url;
     const copy = cloneTemplate(clonedById, newOwnerId, tmplt);

     expect(copy).toBeInstanceOf(Template);
     expect(copy.id).toBeFalsy();
     expect(copy.sourceTemplateId).toEqual(tmplt.id);
     expect(copy.name).toEqual(`Copy of ${tmplt.name}`);
     expect(copy.ownerId).toEqual(newOwnerId);
     expect(copy.visibility).toEqual(TemplateVisibility.PRIVATE);
     expect(copy.currentVersion).toBeFalsy();
     expect(copy.errors).toEqual([]);
     expect(copy.description).toEqual(description);
     expect(copy.created).toBeTruthy();
     expect(copy.createdById).toEqual(clonedById)
     expect(copy.modified).toBeTruthy();
   });

   it('Clone retains the expected parts of the specified VersionedTemplate', () => {
     const clonedById = casual.integer(1, 999);
     const newOwnerId = casual.url;
     const published = new VersionedTemplate({
       templateId: tmplt.id,
       version: `v34`,
       name: 'Published version',
       description,
       ownerId: casual.url,
       VersionType: TemplateVersionType.DRAFT,
       createdById: casual.integer(1, 9999),
     });

     const copy = cloneTemplate(clonedById, newOwnerId, published);

     expect(copy).toBeInstanceOf(Template);
     expect(copy.id).toBeFalsy();
     expect(copy.sourceTemplateId).toEqual(published.templateId);
     expect(copy.name).toEqual(`Copy of ${published.name}`);
     expect(copy.ownerId).toEqual(newOwnerId);
     expect(copy.visibility).toEqual(TemplateVisibility.PRIVATE);
     expect(copy.currentVersion).toBeFalsy();
     expect(copy.errors).toEqual([]);
     expect(copy.createdById).toEqual(clonedById);
     expect(copy.description).toEqual(description);
     expect(copy.created).toBeTruthy();
     expect(copy.modified).toBeTruthy();
   });
 });

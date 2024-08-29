import casual from 'casual';
import { Collaborator, TemplateCollaborator } from "../Collaborator";
import { Template } from '../Template';
import mockLogger from '../../__tests__/mockLogger';
import { User } from '../User';
import { buildContext, mockToken } from '../../__mocks__/context';

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(mockLogger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Collaborator', () => {
  it('constructor should initialize as expected', () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const collaborator = new Collaborator({ email, invitedById, createdById });

    expect(collaborator.email).toEqual(email);
    expect(collaborator.invitedById).toEqual(invitedById);
    expect(collaborator.userId).toBeFalsy();
  });

  it('isValid returns true when the email and invitedById are present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const collaborator = new Collaborator({ email, invitedById, createdById });
    expect(await collaborator.isValid()).toBe(true);
  });

  it('isValid returns false when the email is NOT present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const collaborator = new Collaborator({ email, invitedById, createdById });
    collaborator.email = null;
    expect(await collaborator.isValid()).toBe(false);
    expect(collaborator.errors.length).toBe(1);
    expect(collaborator.errors[0].includes('Email')).toBe(true);
  });

  it('isValid returns false when the invitedById is NOT present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const collaborator = new Collaborator({ email, invitedById, createdById });
    collaborator.invitedById = null;
    expect(await collaborator.isValid()).toBe(false);
    expect(collaborator.errors.length).toBe(1);
    expect(collaborator.errors[0].includes('Invited by')).toBe(true);
  });
});

describe('TemplateCollaborator', () => {
  it('constructor should initialize as expected', () => {
    const email = casual.email;
    const templateId = casual.integer(1, 999);
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const templateCollaborator = new TemplateCollaborator({ templateId, email, invitedById, createdById });

    expect(templateCollaborator.email).toEqual(email);
    expect(templateCollaborator.templateId).toEqual(templateId);
    expect(templateCollaborator.invitedById).toEqual(invitedById);
    expect(templateCollaborator.userId).toBeFalsy();
  });

  it('isValid returns true when the templateId is present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);
    const templateId = casual.integer(1, 999);

    const collaborator = new TemplateCollaborator({ email, invitedById, createdById, templateId });
    expect(await collaborator.isValid()).toBe(true);
  });

  it('isValid returns false when the templateId is NOT present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);
    const templateId = casual.integer(1, 999);

    const collaborator = new TemplateCollaborator({ email, invitedById, createdById, templateId });
    collaborator.templateId = null;
    expect(await collaborator.isValid()).toBe(false);
    expect(collaborator.errors.length).toBe(1);
    expect(collaborator.errors[0].includes('Template')).toBe(true);
  });
});

describe('create', () => {
  let insertQuery;
  let collaborator;

  beforeEach(() => {
    insertQuery = jest.fn();
    (TemplateCollaborator.insert as jest.Mock) = insertQuery;

    collaborator = new TemplateCollaborator({
      createdById: casual.integer(1, 999),
      templateId: casual.integer(1, 999),
      email: casual.email,
    })
  });

  it('returns the TemplateCollaborator with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (collaborator.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await collaborator.create(context)).toBe(collaborator);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the TemplateCollaborator with an error if the template already has that email', async () => {
    const localValidator = jest.fn();
    (collaborator.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindBy = jest.fn();
    (TemplateCollaborator.findByTemplateIdAndEmail as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(collaborator);

    const result = await collaborator.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Collaborator has already been added');
  });

  it('returns the TemplateCollaborator with an error is the Tempate doesn\'t exist', async () => {
    const localValidator = jest.fn();
    (collaborator.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindBy = jest.fn();
    (TemplateCollaborator.findByTemplateIdAndEmail as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValue(null);

    const mockExists = jest.fn();
    (Template.exists as jest.Mock) = mockExists;
    mockExists.mockResolvedValueOnce(false);

    const result = await collaborator.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(mockExists).toHaveBeenCalledTimes(1);

    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Template does not exist');
  });

  it('returns the newly added TemplateCollaborator', async () => {
    const localValidator = jest.fn();
    (collaborator.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindBy = jest.fn();
    (TemplateCollaborator.findByTemplateIdAndEmail as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);
    mockFindBy.mockResolvedValue(collaborator);

    const mockUser = jest.fn();
    (User.findByEmail as jest.Mock) = mockUser;
    mockUser.mockResolvedValueOnce(null);

    const mockExists = jest.fn();
    (Template.exists as jest.Mock) = mockExists;
    mockExists.mockResolvedValueOnce(true);

    insertQuery.mockResolvedValueOnce(casual.integer(1, 999));

    const result = await collaborator.create(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockFindBy).toHaveBeenCalledTimes(2);
    expect(mockExists).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(collaborator);
  });
});

describe('update', () => {
  let updateQuery;
  let collaborator;

  beforeEach(() => {
    updateQuery = jest.fn();
    (TemplateCollaborator.update as jest.Mock) = updateQuery;

    collaborator = new TemplateCollaborator({
      id: casual.integer(1, 99),
      createdById: casual.integer(1, 999),
      templateId: casual.integer(1, 999),
      email: casual.email,
    })
  });

  it('returns the TemplateCollaborator with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (collaborator.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await collaborator.update(context)).toBe(collaborator);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the TemplateCollaborator has no id', async () => {
    const localValidator = jest.fn();
    (collaborator.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    collaborator.id = null;
    const result = await collaborator.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Collaborator has never been saved before');
  });

  it('returns the TemplateCollaborator with an error is the Tempate doesn\'t exist', async () => {
    const localValidator = jest.fn();
    (collaborator.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockExists = jest.fn();
    (Template.exists as jest.Mock) = mockExists;
    mockExists.mockResolvedValueOnce(false);

    const result = await collaborator.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockExists).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Template does not exist');
  });

  it('returns the updated TemplateCollaborator', async () => {
    const localValidator = jest.fn();
    (collaborator.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockExists = jest.fn();
    (Template.exists as jest.Mock) = mockExists;
    mockExists.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(collaborator);

    const result = await collaborator.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(mockExists).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(collaborator);
  });
});

describe('delete', () => {
  let collaborator;

  beforeEach(() => {
    collaborator = new TemplateCollaborator({
      id: casual.integer(1, 99),
      createdById: casual.integer(1, 999),
      templateId: casual.integer(1, 999),
      email: casual.email,
    });
  })

  it('returns false if the TemplateCollaborator has no id', async () => {
    collaborator.id = null;
    expect(await collaborator.delete(context)).toBe(false);
  });

  it('returns false if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (TemplateCollaborator.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await collaborator.delete(context)).toBe(false);
  });

  it('returns true if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (TemplateCollaborator.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(collaborator);
    expect(await collaborator.delete(context)).toBe(true);
  });
});

describe('findBy queries', () => {
  let localQuery;
  let context;
  let templateCollaborator;

  beforeEach(() => {
    jest.resetAllMocks();

    localQuery = jest.fn();
    (TemplateCollaborator.query as jest.Mock) = localQuery;

    context = buildContext(mockLogger, mockToken());

    templateCollaborator = new TemplateCollaborator({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      templateId: casual.integer(1, 99),
      email: casual.email,
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findByTemplateId returns all of the Collaborators for the Template', async () => {
    localQuery.mockResolvedValueOnce([templateCollaborator]);

    const templateId = templateCollaborator.templateId;
    const result = await TemplateCollaborator.findByTemplateId('Test', context, templateId);
    const expectedSql = 'SELECT * FROM templateCollaborators WHERE templateId = ? ORDER BY email ASC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [templateId.toString()], 'Test')
    expect(result).toEqual([templateCollaborator]);
  });

  it('findByTemplateId returns an empty array if the Template has no Collaborators', async () => {
    localQuery.mockResolvedValueOnce([]);

    const templateId = templateCollaborator.templateId;
    const result = await TemplateCollaborator.findByTemplateId('Test', context, templateId);
    const expectedSql = 'SELECT * FROM templateCollaborators WHERE templateId = ? ORDER BY email ASC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [templateId.toString()], 'Test')
    expect(result).toEqual([]);
  });

  it('findById returns the Collaborator', async () => {
    localQuery.mockResolvedValueOnce([templateCollaborator]);

    const id = templateCollaborator.id;
    const result = await TemplateCollaborator.findById('Test', context, id);
    const expectedSql = 'SELECT * FROM templateCollaborators WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'Test')
    expect(result).toEqual(templateCollaborator);
  });

  it('findById returns null if there is no Collaborator', async () => {
    localQuery.mockResolvedValueOnce([]);

    const id = templateCollaborator.id;
    const result = await TemplateCollaborator.findById('Test', context, id);
    const expectedSql = 'SELECT * FROM templateCollaborators WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'Test')
    expect(result).toEqual(null);
  });

  it('findByEmail returns the Collaborator', async () => {
    localQuery.mockResolvedValueOnce([templateCollaborator]);

    const email = templateCollaborator.email;
    const result = await TemplateCollaborator.findByEmail('Test', context, email);
    const expectedSql = 'SELECT * FROM templateCollaborators WHERE email = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [email], 'Test')
    expect(result).toEqual([templateCollaborator]);
  });

  it('findByEmail returns null if there is no Collaborator', async () => {
    localQuery.mockResolvedValueOnce([]);

console.log('THIS ONE IS PASSING')

    const email = templateCollaborator.email;
    const result = await TemplateCollaborator.findByEmail('Test', context, email);
    const expectedSql = 'SELECT * FROM templateCollaborators WHERE email = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [email], 'Test')
    expect(result).toEqual([]);
  });

  it('findByTemplateIdAndEmail returns the Collaborator', async () => {
    localQuery.mockResolvedValueOnce([templateCollaborator]);

    const templateId = templateCollaborator.templateId;
    const email = templateCollaborator.email;
    const result = await TemplateCollaborator.findByTemplateIdAndEmail('Test', context, templateId, email);
    const expectedSql = 'SELECT * FROM templateCollaborators WHERE templateId = ? AND email = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [templateId.toString(), email], 'Test')
    expect(result).toEqual(templateCollaborator);
  });

  it('findByTemplateIdAndEmail returns null if there is no Collaborator', async () => {
    localQuery.mockResolvedValue([]);

console.log('THIS ONE IS FAILING')

    const templateId = templateCollaborator.templateId;
    const email = templateCollaborator.email;
    const result = await TemplateCollaborator.findByTemplateIdAndEmail('Test', context, templateId, email);
    const expectedSql = 'SELECT * FROM templateCollaborators WHERE templateId = ? AND email = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [templateId.toString(), email], 'Test')
    expect(result).toEqual(null);
  });

});

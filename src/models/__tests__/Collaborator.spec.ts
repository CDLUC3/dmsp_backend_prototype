import casual from 'casual';
import { Collaborator, TemplateCollaborator } from "../Collaborator";
import { Template } from '../Template';
import { User } from '../User';
import { buildContext, mockToken } from '../../__mocks__/context';
import { logger } from '../../__mocks__/logger';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendTemplateCollaborationEmail } from '../../services/emailService';

jest.mock('../../logger.ts');
jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
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
    expect(Object.keys(collaborator.errors).length).toBe(1);
    expect(collaborator.errors['email']).toBeTruthy()
  });

  it('isValid returns false when the invitedById is NOT present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const collaborator = new Collaborator({ email, invitedById, createdById });
    collaborator.invitedById = null;
    expect(await collaborator.isValid()).toBe(false);
    expect(Object.keys(collaborator.errors).length).toBe(1);
    expect(collaborator.errors['invitedById']).toBeTruthy()
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
    expect(Object.keys(collaborator.errors).length).toBe(1);
    expect(collaborator.errors['templateId']).toBeTruthy()
  });

  describe('findBy queries', () => {
    const originalQuery = TemplateCollaborator.query;

    let localQuery;
    let context;
    let templateCollaborator;

    beforeEach(() => {
      jest.resetAllMocks();

      localQuery = jest.fn();
      (TemplateCollaborator.query as jest.Mock) = localQuery;

      context = buildContext(logger, mockToken());

      templateCollaborator = new TemplateCollaborator({
        id: casual.integer(1, 9),
        createdById: casual.integer(1, 999),
        templateId: casual.integer(1, 99),
        email: casual.email,
        invitedById: casual.integer(1, 999),
      })
    });

    afterEach(() => {
      jest.clearAllMocks();
      TemplateCollaborator.query = originalQuery;
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

    it('findByInvitedById returns the Collaborator records', async () => {
      localQuery.mockResolvedValueOnce([templateCollaborator]);

      const invitedById = templateCollaborator.invitedById;
      const result = await TemplateCollaborator.findByInvitedById('Test', context, invitedById);
      const expectedSql = 'SELECT * FROM templateCollaborators WHERE invitedById = ?';
      expect(localQuery).toHaveBeenCalledTimes(1);
      expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [invitedById.toString()], 'Test')
      expect(result).toEqual([templateCollaborator]);
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

      const templateId = templateCollaborator.templateId;
      const email = templateCollaborator.email;
      const result = await TemplateCollaborator.findByTemplateIdAndEmail('Test', context, templateId, email);
      const expectedSql = 'SELECT * FROM templateCollaborators WHERE templateId = ? AND email = ?';
      expect(localQuery).toHaveBeenCalledTimes(1);
      expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [templateId.toString(), email], 'Test')
      expect(result).toEqual(null);
    });

  });

  describe('create', () => {
    const originalFindByTemplateIdAndEmail = TemplateCollaborator.findByTemplateIdAndEmail;

    let insertQuery;
    let collaborator;

    beforeEach(() => {
      insertQuery = jest.fn();
      (TemplateCollaborator.insert as jest.Mock) = insertQuery;

      collaborator = new TemplateCollaborator({
        createdById: casual.integer(1, 999),
        templateId: casual.integer(1, 999),
        email: casual.email,
      });

      const mockNotification = jest.fn();
      (sendTemplateCollaborationEmail as jest.Mock) = mockNotification;
    });

    afterEach(() => {
      jest.resetAllMocks();
      TemplateCollaborator.findByTemplateIdAndEmail = originalFindByTemplateIdAndEmail;
    })

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
      expect(Object.keys(result.errors).length).toBe(1);
      expect(result.errors['general']).toBeTruthy();
    });

    it('returns the newly added TemplateCollaborator', async () => {
      const localValidator = jest.fn();
      (collaborator.isValid as jest.Mock) = localValidator;
      localValidator.mockResolvedValueOnce(true);

      const mockFindBy = jest.fn();
      (TemplateCollaborator.findByTemplateIdAndEmail as jest.Mock) = mockFindBy;
      mockFindBy.mockResolvedValue(null);

      const mockUser = jest.fn();
      (User.findByEmail as jest.Mock) = mockUser;
      mockUser.mockResolvedValueOnce(null);

      insertQuery.mockResolvedValueOnce(casual.integer(1, 999));

      const inviter = new User({ givenName: casual.first_name, surName: casual.last_name });
      const mockFindUserById = jest.fn().mockResolvedValueOnce(inviter);
      (User.findById as jest.Mock) = mockFindUserById;

      const tName = casual.sentence;
      const mockFindTemplateById = jest.fn().mockResolvedValueOnce(new Template({ name: tName }));
      (Template.findById as jest.Mock) = mockFindTemplateById;

      const mockSendEmail = jest.fn();
      (sendTemplateCollaborationEmail as jest.Mock) = mockSendEmail;

      const mockFindById = jest.fn();
      (TemplateCollaborator.findById as jest.Mock) = mockFindById;
      mockFindById.mockResolvedValue(collaborator);

      const result = await collaborator.create(context);
      expect(localValidator).toHaveBeenCalledTimes(1);
      expect(mockFindBy).toHaveBeenCalledTimes(1);
      expect(insertQuery).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledWith(
        context, tName, inviter.getName(), collaborator.email, collaborator.userId
      );
      expect(Object.keys(result.errors).length).toBe(0);
      expect(result).toEqual(collaborator);
    });
  });

  describe('update', () => {
    const originalUpdate = TemplateCollaborator.update;

    let updateQuery;
    let collaborator;

    beforeEach(() => {
      jest.resetAllMocks();
      updateQuery = jest.fn();
      (TemplateCollaborator.update as jest.Mock) = updateQuery;

      collaborator = new TemplateCollaborator({
        id: casual.integer(1, 99),
        createdById: casual.integer(1, 999),
        templateId: casual.integer(1, 999),
        email: casual.email,
      })
    });

    afterEach(() => {
      jest.clearAllMocks();
      TemplateCollaborator.update = originalUpdate;
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
      expect(Object.keys(result.errors).length).toBe(1);
      expect(result.errors['general']).toBeTruthy();
    });

    it('returns the updated TemplateCollaborator', async () => {
      const localValidator = jest.fn();
      (collaborator.isValid as jest.Mock) = localValidator;
      localValidator.mockResolvedValueOnce(true);

      updateQuery.mockResolvedValueOnce(collaborator);

      const result = await collaborator.update(context);
      expect(localValidator).toHaveBeenCalledTimes(1);
      expect(updateQuery).toHaveBeenCalledTimes(1);
      expect(Object.keys(result.errors).length).toBe(0);
      expect(result).toEqual(collaborator);
    });
  });

  describe('delete', () => {
    let collaborator;

    beforeEach(() => {
      jest.resetAllMocks();

      collaborator = new TemplateCollaborator({
        id: casual.integer(1, 99),
        createdById: casual.integer(1, 999),
        templateId: casual.integer(1, 999),
        email: casual.email,
      });
    })

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('returns null if the TemplateCollaborator has no id', async () => {
      collaborator.id = null;
      expect(await collaborator.delete(context)).toBe(null);
    });

    it('returns the original record with an error if it was not able to delete the record', async () => {
      const deleteQuery = jest.fn();
      const findQuery = jest.fn();
      (TemplateCollaborator.findById as jest.Mock) = findQuery;
      (TemplateCollaborator.delete as jest.Mock) = deleteQuery;

      findQuery.mockResolvedValueOnce(collaborator);
      deleteQuery.mockResolvedValueOnce(null);
      const result = await collaborator.delete(context);
      expect(result.errors?.general).toBeDefined();
    });

    it('returns the original record if it was able to delete the record', async () => {
      const findQuery = jest.fn();
      const deleteQuery = jest.fn();
      (TemplateCollaborator.findById as jest.Mock) = findQuery;
      (TemplateCollaborator.delete as jest.Mock) = deleteQuery;

      findQuery.mockResolvedValueOnce(collaborator);
      deleteQuery.mockResolvedValueOnce(collaborator);
      expect(await collaborator.delete(context)).toBe(collaborator);
    });
  });
});

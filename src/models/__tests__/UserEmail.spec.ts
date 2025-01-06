import casual from "casual";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { User } from "../User";
import { UserEmail } from "../UserEmail";
import { TemplateCollaborator } from "../Collaborator";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendEmailConfirmationNotification } from "../../services/emailService";

let context;
let mockUser;

beforeEach(() => {
  jest.resetAllMocks();

  mockUser = new User({
    id: casual.integer(1, 999),
    email: casual.email,
    givenName: casual.first_name,
    surName: casual.last_name,
    affiliationId: casual.url,
    acceptedTerms: true,
  });

  context = buildContext(logger, mockToken(mockUser));
});

afterEach(() => {
  jest.clearAllMocks();
})

describe('constructor', () => {
  it('should set the expected properties', () => {
    const props = {
      id: casual.integer(1, 99999),
      email: casual.email,
      userId: casual.integer(1, 999),
      isPrimary: casual.boolean,
      isConfirmed: casual.boolean,
    }

    const userEmail = new UserEmail(props);
    expect(userEmail.id).toEqual(props.id);
    expect(userEmail.email).toEqual(props.email);
    expect(userEmail.userId).toEqual(props.userId);
    expect(userEmail.isPrimary).toEqual(props.isPrimary);
    expect(userEmail.isConfirmed).toEqual(props.isConfirmed);
  });

  it('should set the defaults properly', () => {
    const props = {
      email: casual.email,
      userId: casual.integer(1, 99),
      createdById: casual.integer(1, 99),
    };
    const userEmail = new UserEmail(props);
    expect(userEmail.id).toBeFalsy();
    expect(userEmail.email).toEqual(props.email);
    expect(userEmail.userId).toEqual(props.userId);
    expect(userEmail.isPrimary).toBe(false);
    expect(userEmail.isConfirmed).toBe(false);
    expect(userEmail.created).toBeTruthy();
    expect(userEmail.createdById).toEqual(props.createdById);
    expect(userEmail.modified).toBeTruthy();
    expect(userEmail.modifiedById).toBe(props.createdById);
  });
});

describe('validate a new UserEmail', () => {
  let mockUserEmail;

  beforeEach(() => {
    mockUserEmail = new UserEmail({
      email: casual.email,
      userId: casual.integer(1, 999),
      isPrimary: casual.boolean,
      isConfirmed: casual.boolean,
      createdById: casual.integer(1, 99),
      modifiedById: casual.integer(1, 99),
    });
  })

  it('should return true when we have a new user with a valid password', async () => {
    expect(await mockUserEmail.isValid()).toBe(true);
  });

  it('should return false when the email is missing', async () => {
    mockUserEmail.email = null;
    expect(await mockUserEmail.isValid()).toBe(false);
    expect(mockUserEmail.errors.length).toBe(1);
    expect(mockUserEmail.errors[0].includes('Enter valid email')).toBe(true);
  });

  it('should return false when the userId is missing', async () => {
    mockUserEmail.userId = null;
    expect(await mockUserEmail.isValid()).toBe(false);
    expect(mockUserEmail.errors.length).toBe(1);
    expect(mockUserEmail.errors[0].includes('User can\'t be blank')).toBe(true);
  });
});

describe('findBy functions', () => {
  let mockUserEmail;

  let mockQuery;

  beforeEach(() => {
    mockUserEmail = new UserEmail({
      id: casual.integer(1, 9999),
      email: casual.email,
      userId: casual.integer(1, 999),
      isPrimary: casual.boolean,
      isConfirmed: casual.boolean,
    });

    mockQuery = jest.fn();
    (UserEmail.query as jest.Mock) = mockQuery;
  });

  it('findById returns the UserEmail', async () => {
    mockQuery.mockResolvedValueOnce([mockUserEmail]);

    const id = mockUserEmail.id;
    const result = await UserEmail.findById('Test', context, id);
    const expectedSql = 'SELECT * FROM userEmails WHERE id = ?';
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'Test')
    expect(result).toEqual(mockUserEmail);
  });

  it('findById returns null if the record does not exist', async () => {
    mockQuery.mockResolvedValueOnce([]);

    const result = await UserEmail.findById('Test', context, mockUserEmail.id);
    expect(result).toEqual(null);
  });

  it('findByUserIdAndEmail returns the UserEmail', async () => {
    mockQuery.mockResolvedValueOnce([mockUserEmail]);

    const id = mockUserEmail.userId;
    const email = mockUserEmail.email;
    const result = await UserEmail.findByUserIdAndEmail('Test', context, id, email);
    const expectedSql = 'SELECT * FROM userEmails WHERE userId = ? AND email = ?';
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString(), email], 'Test')
    expect(result).toEqual(mockUserEmail);
  });

  it('findByUserIdAndEmail returns null if the record does not exist', async () => {
    mockQuery.mockResolvedValueOnce([]);

    const id = mockUserEmail.userId;
    const email = mockUserEmail.email;
    const result = await UserEmail.findByUserIdAndEmail('Test', context, id, email);
    expect(result).toEqual(null);
  });

  it('findByUserId returns the UserEmail', async () => {
    mockQuery.mockResolvedValueOnce([mockUserEmail]);

    const id = mockUserEmail.userId;
    const result = await UserEmail.findByUserId('Test', context, id);
    const expectedSql = 'SELECT * FROM userEmails WHERE userId = ?';
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenLastCalledWith(context, expectedSql, [id.toString()], 'Test')
    expect(result).toEqual([mockUserEmail]);
  });

  it('findByUserId returns null if the record does not exist', async () => {
    mockQuery.mockResolvedValueOnce([]);

    const result = await UserEmail.findByUserId('Test', context, mockUserEmail.userId);
    expect(result).toEqual([]);
  });

  it('findByEmail returns the UserEmail', async () => {
    mockQuery.mockResolvedValueOnce([mockUserEmail]);

    const result = await UserEmail.findByEmail('Test', context, mockUserEmail.email);
    const expectedSql = 'SELECT * FROM userEmails WHERE email = ?';
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenLastCalledWith(context, expectedSql, [mockUserEmail.email], 'Test')
    expect(result).toEqual([mockUserEmail]);
  });

  it('findByEmail returns null if the record does not exist', async () => {
    mockQuery.mockResolvedValueOnce([]);

    const result = await UserEmail.findByEmail('Test', context, mockUserEmail.email);
    expect(result).toEqual([]);
  });
});

describe('confirmEmail', () => {
  let mockUserEmail;
  let mockOtherEmails;
  let mockTemplateCollaborators;

  let mockFindUserEmailById;
  let mockFindUserEmailByUserIdAndEmail;
  let mockFindUserEmailByEmail;
  let mockUpdate;
  let mockFindTemplateCollaboratorByEmail;
  let mockDelete;

  beforeEach(() => {
    mockUserEmail = new UserEmail({ id: casual.integer(1, 99), email: mockUser.email, userId: mockUser.id });

    mockOtherEmails = [
      new UserEmail({ id: 1, email: mockUser.email, userId: casual.integer(99991, 999999) }),
      new UserEmail({ id: 2, email: mockUser.email, userId: casual.integer(99991, 999999) }),
    ];

    mockTemplateCollaborators = [
      new TemplateCollaborator({ id: 1, email: mockUser.email, templateId: casual.integer(1, 999) }),
      new TemplateCollaborator({ id: 2, email: mockUser.email, templateId: casual.integer(1, 999) }),
    ]

    mockFindUserEmailById = jest.fn();
    (UserEmail.findById as jest.Mock) = mockFindUserEmailById;

    mockFindUserEmailByUserIdAndEmail = jest.fn();
    (UserEmail.findByUserIdAndEmail as jest.Mock) = mockFindUserEmailByUserIdAndEmail;

    mockFindUserEmailByEmail = jest.fn();
    (UserEmail.findByEmail as jest.Mock) = mockFindUserEmailByEmail;

    mockFindTemplateCollaboratorByEmail = jest.fn();
    (TemplateCollaborator.findByEmail as jest.Mock) = mockFindTemplateCollaboratorByEmail;

    mockUpdate = jest.fn();
    (UserEmail.update as jest.Mock) = mockUpdate;
    (TemplateCollaborator.update as jest.Mock) = mockUpdate;

    mockDelete = jest.fn();
    (UserEmail.delete as jest.Mock) = mockDelete;
  });

  it('returns null if the UserEmail does not exist', async () => {
    mockFindUserEmailByUserIdAndEmail.mockResolvedValue(null);
    expect(await UserEmail.confirmEmail(context, mockUser.id, mockUser.email)).toBeFalsy();
  });

  it('returns the UserEmail with errors if it was already confirmed by another user', async () => {
    mockFindUserEmailByUserIdAndEmail.mockResolvedValue(mockUserEmail);

    mockOtherEmails[0].isConfirmed = true;
    mockFindUserEmailByEmail.mockResolvedValue(mockOtherEmails);
    const result = await UserEmail.confirmEmail(context, mockUser.id, mockUser.email)
    expect(result).toEqual(mockUserEmail);
    expect(result.errors.includes('Email has already been confirmed')).toBe(true);
  });

  it('returns the confirmed UserEmail if successful', async () => {
    mockFindUserEmailByUserIdAndEmail.mockResolvedValue(mockUserEmail);
    mockFindUserEmailByEmail.mockResolvedValue([]);
    const confirmedEmail = structuredClone(mockUserEmail);
    confirmedEmail.isConfirmed = true;
    mockFindUserEmailById.mockResolvedValue(confirmedEmail);
    mockFindTemplateCollaboratorByEmail.mockResolvedValue([]);

    const result = await UserEmail.confirmEmail(context, mockUser.id, mockUser.email)
    expect(result).toEqual(confirmedEmail);
    expect(result.errors.length).toBe(0);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  it('claims open collaboration invites if successful', async () => {
    mockFindUserEmailByUserIdAndEmail.mockResolvedValue(mockUserEmail);
    mockFindUserEmailByEmail.mockResolvedValue([]);
    const confirmedEmail = structuredClone(mockUserEmail);
    confirmedEmail.isConfirmed = true;
    mockFindUserEmailById.mockResolvedValue(confirmedEmail);
    mockFindTemplateCollaboratorByEmail.mockResolvedValue(mockTemplateCollaborators);

    const result = await UserEmail.confirmEmail(context, mockUser.id, mockUser.email)
    expect(result).toEqual(confirmedEmail);
    expect(result.errors.length).toBe(0);
    expect(mockUpdate).toHaveBeenCalledTimes(3);
  });

  it('removes other unconfirmed records associated with other users if successful', async () => {
    mockFindUserEmailByUserIdAndEmail.mockResolvedValue(mockUserEmail);
    mockFindUserEmailByEmail.mockResolvedValue(mockOtherEmails);
    const confirmedEmail = structuredClone(mockUserEmail);
    confirmedEmail.isConfirmed = true;
    mockFindUserEmailById.mockResolvedValue(confirmedEmail);
    mockFindTemplateCollaboratorByEmail.mockResolvedValue([]);

    const result = await UserEmail.confirmEmail(context, mockUser.id, mockUser.email)
    expect(result).toEqual(confirmedEmail);
    expect(result.errors.length).toBe(0);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledTimes(2);
  });
});

describe('create', () => {
  let mockUserEmail;

  let mockValid;
  let mockFindByEmail;
  let mockFindById;
  let mockInsert;

  beforeEach(() => {
    mockUserEmail = new UserEmail({
      email: casual.email,
      userId: casual.integer(1, 999),
      isPrimary: casual.boolean,
      isConfirmed: casual.boolean,
    });

    mockValid = jest.fn();
    (mockUserEmail.isValid as jest.Mock) = mockValid;

    mockFindByEmail = jest.fn();
    (UserEmail.findByEmail as jest.Mock) = mockFindByEmail;

    mockFindById = jest.fn();
    (UserEmail.findById as jest.Mock) = mockFindById;

    mockInsert = jest.fn().mockResolvedValue(mockUserEmail);
    (UserEmail.insert as jest.Mock) = mockInsert;

    const mockEmail = jest.fn();
    (sendEmailConfirmationNotification as jest.Mock) = mockEmail;
  });

  it('returns the UserEmail with errors if it is not valid', async () => {
    mockValid.mockResolvedValueOnce(false);

    expect(await mockUserEmail.create(context)).toBe(mockUserEmail);
    expect(mockValid).toHaveBeenCalledTimes(1);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns the UserEmail with an error if the record already exists', async () => {
    mockValid.mockResolvedValueOnce(true);
    mockFindByEmail.mockResolvedValueOnce([mockUserEmail]);

    const result = await mockUserEmail.create(context);
    expect(mockValid).toHaveBeenCalledTimes(1);
    expect(mockFindByEmail).toHaveBeenCalledTimes(1);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(result.errors.length > 0).toBe(true);
    expect(result.errors[0]).toEqual('Email is already associated with this account');
  });

  it('returns the UserEmail with an error if the record belongs to another user', async () => {
    mockValid.mockResolvedValueOnce(true);
    mockFindByEmail.mockResolvedValueOnce([
      new UserEmail({
        email: mockUserEmail.email,
        userId: casual.integer(1, 999),
        isConfirmed: true,
      }),
    ]);

    const result = await mockUserEmail.create(context);
    expect(mockValid).toHaveBeenCalledTimes(1);
    expect(mockFindByEmail).toHaveBeenCalledTimes(1);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('Email has already been confirmed by another account');
  });

  it('returns the newly added UserEmail', async () => {
    mockValid.mockResolvedValueOnce(true);
    mockFindByEmail.mockResolvedValueOnce([]);
    mockFindById.mockResolvedValue(mockUserEmail);

    const result = await mockUserEmail.create(context);
    expect(mockValid).toHaveBeenCalledTimes(1);
    expect(mockFindByEmail).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalled();
    expect(result.errors.length).toBe(0);
  });
});

describe('update', () => {
  let mockUserEmail;

  let mockValid;
  let mockFindById;
  let mockUpdate;

  beforeEach(() => {
    mockUserEmail = new UserEmail({
      id: casual.integer(1, 9999),
      email: casual.email,
      userId: casual.integer(1, 999),
      isPrimary: casual.boolean,
      isConfirmed: true,
    });

    mockValid = jest.fn();
    (mockUserEmail.isValid as jest.Mock) = mockValid;

    mockFindById = jest.fn();
    (UserEmail.findById as jest.Mock) = mockFindById;

    mockUpdate = jest.fn().mockResolvedValue(mockUserEmail);
    (UserEmail.update as jest.Mock) = mockUpdate;
  });

  it('returns an error if the UserEmail has never been created', async () => {
    mockUserEmail.id = null;
    const result = await mockUserEmail.update(context);
    expect(result.errors.includes('Email has not been created yet')).toBe(true);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns an error if the UserEmail is invalid', async () => {
    mockValid.mockResolvedValueOnce(false);

    await mockUserEmail.update(context);
    expect(mockValid).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns an error if the UserEmail has not been confirmed yet', async () => {
    mockUserEmail.isConfirmed = false;
    mockValid.mockResolvedValueOnce(true);
    mockFindById.mockResolvedValueOnce(mockUserEmail);

    const result = await mockUserEmail.update(context);
    expect(mockValid).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(result.errors.includes('Email has not yet been confirmed')).toBe(true);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('updates the UserEmail successfully', async () => {
    mockValid.mockResolvedValueOnce(true);
    mockFindById.mockResolvedValue(mockUserEmail);

    const result = await mockUserEmail.update(context);
    expect(mockValid).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(2);
    expect(result.errors.length).toBe(0);
    expect(mockUpdate).toHaveBeenCalled();
  });
});

describe('delete', () => {
  let mockUserEmail;

  let mockFindById;
  let mockDelete;

  beforeEach(() => {
    mockUserEmail = new UserEmail({
      id: casual.integer(1, 9999),
      email: casual.email,
      userId: casual.integer(1, 999),
      isPrimary: casual.boolean,
      isConfirmed: true,
    });

    mockFindById = jest.fn();
    (UserEmail.findById as jest.Mock) = mockFindById;

    mockDelete = jest.fn().mockResolvedValue(mockUserEmail);
    (UserEmail.delete as jest.Mock) = mockDelete;
  });

  it('returns the UserEmail with errors if it has not been saved', async () => {
    mockUserEmail.id = null;
    const result = await mockUserEmail.delete(context);
    expect(result.errors.includes('Email has not been created yet')).toBe(true);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('returns null if the UserEmail doesn\'t exist', async () => {
    mockFindById.mockResolvedValueOnce(null);

    const result = await mockUserEmail.delete(context);
    expect(result).toBeFalsy();
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('returns null if the UserEmail could not be deletd', async () => {
    mockFindById.mockResolvedValueOnce(mockUserEmail);
    mockDelete.mockResolvedValueOnce(null);

    const result = await mockUserEmail.delete(context);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(result).toBeFalsy();
    expect(mockDelete).toHaveBeenCalled();
  });

  it('returns the deleted UserEmail if successful', async () => {
    mockFindById.mockResolvedValue(mockUserEmail);
    mockDelete.mockResolvedValueOnce(null);

    const result = await mockUserEmail.delete(context);
    expect(result).toBeFalsy();
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalled();
  });
});

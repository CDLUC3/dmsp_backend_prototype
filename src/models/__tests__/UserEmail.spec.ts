import casual from "casual";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { User } from "../User";
import { UserEmail } from "../UserEmail";
import { TemplateCollaborator } from "../Collaborator";

let context;
let mockUser;

let mockQuery;

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
      primary: casual.boolean,
      confirmed: casual.boolean,
    }

    const userEmail = new UserEmail(props);
    expect(userEmail.id).toEqual(props.id);
    expect(userEmail.email).toEqual(props.email);
    expect(userEmail.userId).toEqual(props.userId);
    expect(userEmail.primary).toEqual(props.primary);
    expect(userEmail.confirmed).toEqual(props.confirmed);
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
    expect(userEmail.primary).toBe(false);
    expect(userEmail.confirmed).toBe(false);
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
      primary: casual.boolean,
      confirmed: casual.boolean,
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
    expect(mockUserEmail.errors[0].includes('Email can\'t be blank')).toBe(true);
  });

  it('should return false when the userId is missing', async () => {
    mockUserEmail.userId = null;
    expect(await mockUserEmail.isValid()).toBe(false);
    expect(mockUserEmail.errors.length).toBe(1);
    expect(mockUserEmail.errors[0].includes('User can\'t be blank')).toBe(true);
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
      new UserEmail({ id: 1, email: mockUser.email, userId: casual.integer(99991, 999999)}),
      new UserEmail({ id: 2, email: mockUser.email, userId: casual.integer(99991, 999999)}),
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

    mockOtherEmails[0].confirmed = true;
    mockFindUserEmailByEmail.mockResolvedValue(mockOtherEmails);
    const result = await UserEmail.confirmEmail(context, mockUser.id, mockUser.email)
    expect(result).toEqual(mockUserEmail);
    expect(result.errors.includes('Email has already been confirmed')).toBe(true);
  });

  it('returns the confirmed UserEmail if successful', async () => {
    mockFindUserEmailByUserIdAndEmail.mockResolvedValue(mockUserEmail);
    mockFindUserEmailByEmail.mockResolvedValue([]);
    const confirmedEmail = structuredClone(mockUserEmail);
    confirmedEmail.confirmed = true;
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
    confirmedEmail.confirmed = true;
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
    confirmedEmail.confirmed = true;
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

});

describe('update', () => {

});

describe('delete', () => {

});

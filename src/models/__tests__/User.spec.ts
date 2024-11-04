import 'jest-expect-message';
import { LogInType, User, UserRole } from '../User';
import bcrypt from 'bcryptjs';
import casual from 'casual';
import { logger } from '../../__mocks__/logger';
import { buildContext } from '../../context';
import { defaultLanguageId, supportedLanguages } from '../Language';
import { mockToken } from '../../__mocks__/context';
import { getRandomEnumValue } from '../../__tests__/helpers';

jest.mock('../../context.ts');

let mockDebug;
let mockError;
let mockQuery;
let mockUser;
let mockContext;

describe('constructor', () => {
  it('should set the expected properties', () => {
    const lang = supportedLanguages.find((entry) => { return entry.id !== defaultLanguageId });

    const props = {
      id: casual.integer(1, 99999),
      email: casual.email,
      password: casual.password,
      affiliationId: casual.url,
      role: UserRole.ADMIN,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: '0000-0000-0000-000X',
      ssoId: casual.uuid,
      languageId: lang.id,
    }

    const user = new User(props);
    expect(user.id).toEqual(props.id);
    expect(user.email).toEqual(props.email);
    expect(user.password).toEqual(props.password);
    expect(user.affiliationId).toEqual(props.affiliationId);
    expect(user.givenName).toEqual(props.givenName);
    expect(user.surName).toEqual(props.surName);
    expect(user.orcid).toEqual(props.orcid);
    expect(user.ssoId).toEqual(props.ssoId);
    expect(user.role).toEqual(props.role);
    expect(user.languageId).toEqual(props.languageId);
  });

  it('should set the defaults properly', () => {
    const props = { email: casual.email, password: casual.password, affiliationId: casual.url };
    const user = new User(props);
    expect(user.id).toBeFalsy();
    expect(user.email).toEqual(props.email);
    expect(user.password).toEqual(props.password);
    expect(user.affiliationId).toEqual(props.affiliationId);
    expect(user.givenName).toBeFalsy();
    expect(user.surName).toBeFalsy();
    expect(user.orcid).toBeFalsy();
    expect(user.role).toEqual(UserRole.RESEARCHER);
    expect(user.languageId).toEqual(defaultLanguageId);
    expect(user.last_sign_in).toBeFalsy();
    expect(user.last_sign_in_via).toBeFalsy();
    expect(user.failed_sign_in_attemps).toEqual(0);
    expect(user.notify_on_comment_added).toEqual(true);
    expect(user.notify_on_template_shared).toEqual(true);
    expect(user.notify_on_feedback_complete).toEqual(true);
    expect(user.notify_on_plan_shared).toEqual(true);
    expect(user.notify_on_plan_visibility_change).toEqual(true);
    expect(user.locked).toEqual(false);
    expect(user.active).toEqual(true);
  });

  it('should ignore unexpected properties', () => {
    const props = { email: casual.email, password: casual.password };
    const user = new User({ ...props, test: 'blah' });
    expect(user.email).toEqual(props.email);
    expect(user.password).toEqual(props.password);
    expect(user['test']).toBeUndefined();
  });
});

describe('cleanup standardizes the format of properties', () => {
  it('should properly format the properties', () => {
    const user = new User({
      email: 'TESTer%40exaMPle.cOm',
      givenName: ' Test ',
      surName: '  user  ',
      languageId: 'test',
    });
    user.cleanup();
    expect(user.email).toEqual('TESTer@exaMPle.cOm');
    expect(user.givenName).toEqual('Test');
    expect(user.surName).toEqual('User');
    expect(user.role).toEqual(UserRole.RESEARCHER);
    expect(user.languageId).toEqual(defaultLanguageId);
  });
});

describe('validate a new User', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockUser = new User({
      email: casual.email,
      password: 'abcd3Fgh!JklM_m0$',
      givenName: casual.first_name,
      surName: casual.last_name,
      affiliationId: casual.url,
      role: UserRole.RESEARCHER,
      createdById: casual.integer(1, 999),
      acceptedTerms: true,
    });

    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;

    mockContext = buildContext as jest.MockedFunction<typeof buildContext>;

    const mockSqlDataSource = (buildContext(logger, null, null)).dataSources.sqlDataSource;
    mockQuery = mockSqlDataSource.query as jest.MockedFunction<typeof mockSqlDataSource.query>;
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when we have a new user with a valid password', async () => {
    expect(await mockUser.isValid()).toBe(true);
  });

  it('should return false when the password is missing', async () => {
    mockQuery.mockResolvedValueOnce(null);
    mockUser.password = null;
    expect(await mockUser.isValid()).toBe(false);
    expect(mockUser.errors.length).toBe(1);
    expect(mockUser.errors[0].includes('Password is required')).toBe(true);
  });

  it('should return false when we have an existing user', async () => {
    mockQuery.mockResolvedValueOnce([{ id: 0, email: mockUser.email }]);
    expect(await mockUser.isValid()).toBe(false);
    expect(mockUser.errors.length).toBe(1);
    expect(mockUser.errors[0].includes('Email address already in use')).toBe(true);
  });

  it('should return false when we have a new user without a valid email format', async () => {
    mockQuery.mockResolvedValueOnce(null);
    mockUser.email = 'abcde';
    expect(await mockUser.isValid()).toBe(false);
    expect(mockUser.errors.length).toBe(1);
    expect(mockUser.errors[0].includes('Invalid email address')).toBe(true);
  });

  it('should return false when we have a new user without an Affiliation', async () => {
    mockQuery.mockResolvedValueOnce(null);
    mockUser.affiliationId = null;
    expect(await mockUser.isValid()).toBe(false);
    expect(mockUser.errors.length).toBe(1);
    expect(mockUser.errors[0].includes('Affiliation')).toBe(true);
  });

  it('should return false when we have a new user without an createdById', async () => {
    mockQuery.mockResolvedValueOnce(null);
    mockUser.createdById = null;
    expect(await mockUser.isValid()).toBe(false);
    expect(mockUser.errors.length).toBe(1);
    expect(mockUser.errors[0].includes('Created by')).toBe(true);
  });

  it('should return false when we have a new user without a role', async () => {
    mockQuery.mockResolvedValueOnce(null);
    mockUser.role = null;
    expect(await mockUser.isValid()).toBe(false);
    expect(mockUser.errors.length).toBe(1);
    expect(mockUser.errors[0].includes('Role')).toBe(true);
  });
});

describe('Password validation', () => {
  it('should return true for a valid passwords', () => {
    expect(new User({ password: 'AbcdefgH1!' }).validatePassword()).toBe(true);
    expect(new User({ password: 'AbcdefgH1@#$%^&*-_+=?' }).validatePassword()).toBe(true);
    expect(new User({ password: 'Abcdef  gH1#' }).validatePassword()).toBe(true);
    expect(new User({ password: ' AbcdefgH1$' }).validatePassword()).toBe(true);
    expect(new User({ password: 'AbcdefgH1! ' }).validatePassword()).toBe(true);
  });

  it('should allow all of the approved special characters', () => {
    const chars = ['~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '-', "_", '+', '=', '?', ' '];
    for (const char of chars) {
      const valid = new User({ password: `Abcd3Fgh1jkL${char}`}).validatePassword();
      expect(valid, `Failed when testing character ${char}`).toBe(true);
    }
  });

  it('should fail for a new user with a password that is too short', async () => {
    const user = new User({ email: 'test.user@example.com', password: 'abcde' });
    expect(user.validatePassword()).toBe(false);
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  it('should fail for a new user if the password does not contain at least 1 uppercase letter', async () => {
    const user = new User({ password: 'abcd3fgh1jk' });
    expect(user.validatePassword()).toBe(false);
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });


  it('should return error if password is missing', async () => {
    const user = new User({ email: 'test.user@example.com', password: null });
    expect(user.validatePassword()).toBe(false);
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Password is required'));
  });

  it('should fail for a new user if the password does not contain at least 1 lowercase letter', async () => {
    const user = new User({ email: 'test.user@example.com', password: 'ABCD3FGH1JKL' });
    expect(user.validatePassword()).toBe(false);
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  it('should fail for a new user if the password does not contain at least 1 number letter', async () => {
    const user = new User({ email: 'test.user@example.com', password: 'Abcd$Fgh#jkL' });
    expect(user.validatePassword()).toBe(false);
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  it('should fail for a new user if the password does not contain at least 1 special character', async () => {
    const user = new User({ email: 'test.user@example.com', password: 'Abcd3Fgh1jkL' });
    expect(user.validatePassword()).toBe(false);
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  it('should fail for a new user if it contains special characters that are not allowed', () => {
    const badChars = ['(', ')', '{', '[', '}', ']', '|', '\\', ':', ';', '"', "'", '<', ',', '>', '.', '/'];
    for (const char of badChars) {
      const valid = new User({ password: `Abcd3Fgh1jkL${char}`}).validatePassword();
      expect(valid, `Failed when testing character ${char}`).toBe(false);
    }
  });
});

describe('authCheck', () => {
  let bcryptCompare;

  beforeEach(() => {
    jest.resetAllMocks();

    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;

    mockContext = buildContext(logger, null, null);
    const mockSqlDataSource = mockContext.dataSources.sqlDataSource;
    mockQuery = mockSqlDataSource.query as jest.MockedFunction<typeof mockSqlDataSource.query>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('it returns null if there is no User for the specified email', async () => {
    const email = casual.email;
    const password = 'Abcd3Fgh1jkL$';
    mockQuery.mockResolvedValueOnce([])
    expect(await User.authCheck('Testing authCheck', mockContext, email, password)).toBeFalsy();
    expect(mockDebug).toHaveBeenCalledTimes(2);
  });

  it('it returns null if the password does not match', async () => {
    const email = casual.email;
    const password = 'Abcd3Fgh1jkL$';
    mockQuery.mockResolvedValueOnce([mockUser]);

    bcryptCompare = jest.fn().mockResolvedValue(false);
    (bcrypt.compare as jest.Mock) = bcryptCompare;

    expect(await User.authCheck('Testing authCheck', mockContext, email, password)).toBeFalsy();
    expect(mockDebug).toHaveBeenCalledTimes(2);
  });

  it('it returns the user\'s id if the password matched', async () => {
    const email = casual.email;
    const password = 'Abcd3Fgh1jkL$';
    mockUser.id = 12345;
    mockQuery.mockResolvedValueOnce([mockUser]);

    bcryptCompare = jest.fn().mockResolvedValue(true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;

    expect(await User.authCheck('Testing authCheck', mockContext, email, password)).toEqual(12345);
    expect(mockDebug).toHaveBeenCalledTimes(2);
  });
});

describe('recordLogIn', () => {
  let context;

  let user;

  beforeEach(() => {
    jest.resetAllMocks();

    context = buildContext(logger, mockToken());

    user = new User({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      email: casual.sentence,
      affiliationId: casual.url,
      password: casual.password,
      givenName: casual.first_name,
      surName: casual.last_name,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('returns an error if the Section has no id', async () => {
    jest.spyOn(User, 'update').mockResolvedValueOnce(null);
    const result = await user.recordLogIn(context, getRandomEnumValue(LogInType));
    expect(result).toEqual(false);
  });

  it('updates the User last_sign_in fields', async () => {
    jest.spyOn(User, 'update').mockResolvedValueOnce(user);
    const result = await user.recordLogIn(context, getRandomEnumValue(LogInType));
    expect(result).toEqual(true);
  });
});

describe('login()', () => {
  let context;
  let mockAuthCheck;
  let mockUpdate;

  beforeEach(() => {
    jest.resetAllMocks();

    context = buildContext(logger, mockToken());

    mockAuthCheck = jest.fn();
    (User.authCheck as jest.Mock) = mockAuthCheck;

    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;

    mockContext = buildContext as jest.MockedFunction<typeof buildContext>;
    const mockSqlDataSource = (buildContext(logger, null, null)).dataSources.sqlDataSource;
    mockQuery = mockSqlDataSource.query as jest.MockedFunction<typeof mockSqlDataSource.query>;

    mockUpdate = jest.fn().mockResolvedValue(true);
    (User.update as jest.Mock) = mockUpdate;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed if user exists and its password matches with encrypted one', async () => {
    const user = new User({
      email: casual.email,
      password: 'abcd3Fgh!JklM_m0$',
    });
    mockAuthCheck.mockReturnValue(123);
    mockQuery.mockResolvedValue([{ id: 123, email: user.email, password: user.password }]);

    const response = await user.login(context);
    expect(response).not.toBeNull();
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockDebug).toHaveBeenCalledTimes(2);
    expect(mockError).toHaveBeenCalledTimes(0);
  });

  it('should return an error when authCheck does not return a userId', async () => {
    mockAuthCheck.mockReturnValue(null);
    const user = new User({ email: 'example.com', password: '@bcd3fGhijklmnop' });
    const response = await user.login(context);
    expect(response).toBe(null);
  });

  it('should return null when findEmail() throws an error', async () => {
    mockAuthCheck.mockImplementation(() => {
      throw new Error('Testing error handler');
    });
    const user = new User({ email: 'test.user@example.com', password: 'AbcdefgH1!' });
    const response = await user.login(context);
    expect(response).toBeNull();
    expect(mockError).toHaveBeenCalledTimes(1);
  });
});

describe('register()', () => {
  let context;

  const bcryptSalt = jest.fn().mockReturnValue('abc');
  (bcrypt.genSalt as jest.Mock) = bcryptSalt;

  const bcryptPassword = jest.fn().mockReturnValue('test.user@example.com');
  (bcrypt.hash as jest.Mock) = bcryptPassword;

  beforeEach(() => {
    jest.resetAllMocks();

    context = buildContext(logger, mockToken());

    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;

    mockContext = buildContext as jest.MockedFunction<typeof buildContext>;

    const mockSqlDataSource = (buildContext(logger, null, null)).dataSources.sqlDataSource;
    mockQuery = mockSqlDataSource.query as jest.MockedFunction<typeof mockSqlDataSource.query>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should not return null if user exists and its password matches with encrypted one', async () => {
    const mockedUser = { id: 1, email: 'test.user@example.com', name: '@bcd3fGhijklmnop' };
    // First call to Mock mysql query from findByEmail()
    mockQuery.mockResolvedValueOnce([mockedUser, []]);
    // Second call to Mock mysql query from register()
    mockQuery.mockResolvedValueOnce({ id: 1 });
    // Third call to Mock mysql query from findById()
    mockQuery.mockResolvedValueOnce([mockedUser, []]);

    const user = new User({
      email: 'test.user@example.com',
      password: '@bcd3fGhijklmnop',
      givenName: 'Test',
      surName: 'simple',
      affiliationId: casual.url,
      acceptedTerms: true,
    });
    jest.spyOn(user, 'validatePassword').mockReturnValue(true);

    const response = await user.register(context);
    expect(response).not.toBeNull();
    expect(user.validatePassword).toHaveBeenCalledTimes(1);
  });

  it('should return user object with an error if they did not accept the terms', async () => {
    const user = new User({
      email: 'test.user@example.com',
      password: '@bcd3fGhijklmnop',
      givenName: 'Test',
      surName: 'simple',
      affiliationId: casual.url,
    });
    const response = await user.register(context);
    expect(response).toBe(user);
    expect(response.errors).toEqual(['You must accept the terms and conditions']);
  });

  it('should return user object if there was an error creating user', async () => {
    const mockedUser = { id: 1, email: 'test.user@example.com', name: '@bcd3fGhijklmnop' };
    // First call to Mock mysql query from findByEmail()
    mockQuery.mockResolvedValueOnce([mockedUser, []]);
    // Second call to Mock mysql query from register()
    mockQuery.mockRejectedValueOnce('There was an error creating user');
    // Third call to Mock mysql query from findById()
    mockQuery.mockResolvedValueOnce([mockedUser, []]);

    const user = new User({
      email: 'test.user@example.com',
      password: '@bcd3fGhijklmnop',
      givenName: 'Test',
      surName: 'simple',
      affiliationId: casual.url,
      acceptedTerms: true
    });


    const response = await user.register(context);
    expect(response).toBe(user);
    expect(response.errors.length > 0).toBe(true);
  });

  it('should return the user with errors if there are errors validating the user', async () => {
    const mockedUser = { id: 1, email: 'test.user@example.com', name: '@bcd3fGhijklmnop' };
    // First call to Mock mysql query from findByEmail()
    mockQuery.mockResolvedValueOnce([{}, []]);
    // Second call to Mock mysql query from register()
    mockQuery.mockRejectedValueOnce('There was an error creating user');
    // Third call to Mock mysql query from findById()
    mockQuery.mockResolvedValueOnce([mockedUser, []]);

    const user = new User({
      email: 'test.user@example.com',
      password: '@bcd3fGhijklmnop',
      givenName: 'Test',
      surName: 'simple',
      acceptedTerms: true,
    });

    const response = await user.register(context);
    expect(response).toBeInstanceOf(User);
    expect((response as User).errors.length > 0).toBe(true);
  });

  it('should return the user with errors if the terms were not accepted', async () => {
    const user = new User({
      email: 'test.user@example.com',
      password: '@bcd3fGhijklmnop',
      givenName: 'Test',
      surName: 'simple',
      acceptedTerms: false,
    });
    // First call to Mock mysql query from findByEmail()
    mockQuery.mockResolvedValueOnce([{}, []]);

    const response = await user.register(context);
    expect(response).toBeInstanceOf(User);
    expect((response as User).errors.length > 0).toBe(true);
  });
});

describe('update', () => {
  let context;
  let updateQuery;
  let user;

  beforeEach(() => {
    context = buildContext(logger, mockToken());

    updateQuery = jest.fn();
    (User.update as jest.Mock) = updateQuery;

    user = new User({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      name: casual.sentence,
      affiliationId: casual.url,
      password: 'Or1ginalPa$$2',
    })
  });

  it('returns the User without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (user.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    expect(await user.update(context)).toBe(user);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the User has no id', async () => {
    const localValidator = jest.fn();
    (user.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    user.id = null;
    const result = await user.update(context);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual('User has never been saved');
  });

  it('returns the updated User', async () => {
    const localValidator = jest.fn();
    (user.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindById = jest.fn();
    (User.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValue(user);

    const result = await user.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(user);
  });

  it('prevents the password from being updated', async () => {
    const localValidator = jest.fn();
    (user.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    const mockFindById = jest.fn();
    (User.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValue(user);

    user.password = 'N3wPa$$word1';
    const result = await user.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(result.errors.length).toBe(0);
    expect(result).toEqual(user);
  });
});

describe('updatePassword', () => {
  let context;
  let updateQuery;
  let user;
  let oldPassword;
  let newPassword;

  let mockValidator;
  let mockAuthCheck;

  beforeEach(() => {
    jest.resetAllMocks();

    context = buildContext(logger, mockToken());

    oldPassword = 'Test0ldP@ssw1';
    oldPassword = 'TestN3wP@ssw2';

    user = new User({
      id: casual.integer(1, 9),
      createdById: casual.integer(1, 999),
      name: casual.sentence,
      affiliationId: casual.url,
    });

    mockAuthCheck = jest.fn();
    (User.authCheck as jest.Mock) = mockAuthCheck;

    mockValidator = jest.fn();
    (user.validatePassword as jest.Mock) = mockValidator;

    updateQuery = jest.fn().mockResolvedValue(user);
    (User.update as jest.Mock) = updateQuery;
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('returns the User without errors if it is valid and we could update the password', async () => {
    mockAuthCheck.mockResolvedValueOnce(true);
    mockValidator.mockReturnValue(true);
    const mockFindById = jest.fn().mockResolvedValue(user);
    (User.findById as jest.Mock) = mockFindById;

    expect(await user.updatePassword(context, oldPassword, newPassword)).toBe(user);
    expect(mockAuthCheck).toHaveBeenCalledTimes(1);
    expect(mockValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
  });

  it('returns the User with errors if new password is invalid', async () => {
    mockAuthCheck.mockResolvedValueOnce(true);
    mockValidator.mockReturnValueOnce(false);

    expect(await user.updatePassword(context, oldPassword, newPassword)).toBe(user);
    expect(mockAuthCheck).toHaveBeenCalledTimes(1);
    expect(mockValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).not.toHaveBeenCalled();
  });

  it('returns null if the oldPassword is invalid', async () => {
    mockAuthCheck.mockResolvedValueOnce(false);

    expect(await user.updatePassword(context, oldPassword, newPassword)).toBe(null);
    expect(mockAuthCheck).toHaveBeenCalledTimes(1);
    expect(mockValidator).not.toHaveBeenCalled();
    expect(updateQuery).not.toHaveBeenCalled();
  });
});

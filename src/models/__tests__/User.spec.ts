import 'jest-expect-message';
import { User, UserRole } from '../User';
import bcrypt from 'bcryptjs';
import casual from 'casual';
import { logger } from '../../__mocks__/logger';
import { buildContext } from '../../context';
import { defaultLanguageId, supportedLanguages } from '../Language';

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
    expect(user.role).toEqual(props.role);
    expect(user.languageId).toEqual(props.languageId);
  });

  it('should set the defaults properly', () => {
    const props = { email: casual.email, password: casual.password };
    const user = new User(props);
    expect(user.id).toBeFalsy();
    expect(user.email).toEqual(props.email);
    expect(user.password).toEqual(props.password);
    expect(user.affiliationId).toBeTruthy();
    expect(user.givenName).toBeFalsy();
    expect(user.surName).toBeFalsy();
    expect(user.orcid).toBeFalsy();
    expect(user.role).toEqual(UserRole.RESEARCHER);
    expect(user.languageId).toEqual(defaultLanguageId);
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
    });

    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;

    mockContext = buildContext as jest.MockedFunction<typeof buildContext>;

    const mockSqlDataSource = (buildContext(logger, null, null)).dataSources.sqlDataSource;
    mockQuery = mockSqlDataSource.query as jest.MockedFunction<typeof mockSqlDataSource.query>;

    // const sqlDataSource = mockDataSources.sqlDataSource;
    // mockQuery = sqlDataSource.query as jest.MockedFunction<typeof sqlDataSource.query>;
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when we have a new user with a valid password', async () => {
    expect(await mockUser.isValid()).toBe(true);
  });

  it('should return false when we have a new user with an invalid password', async () => {
    mockQuery.mockResolvedValueOnce(null);
    mockUser.password = 'abcde';
    expect(await mockUser.isValid()).toBe(false);
    expect(mockUser.errors.length).toBe(1);
    expect(mockUser.errors[0].includes('Invalid password format')).toBe(true);
  });

  it('should return false when we have an existing user', async () => {
    mockQuery.mockResolvedValueOnce([mockUser]);
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

describe('login()', () => {
  let mockAuthCheck;

  beforeEach(() => {
    jest.resetAllMocks();

    mockAuthCheck = jest.fn();
    (User.authCheck as jest.Mock) = mockAuthCheck;

    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;

    mockContext = buildContext as jest.MockedFunction<typeof buildContext>;
    const mockSqlDataSource = (buildContext(logger, null, null)).dataSources.sqlDataSource;
    mockQuery = mockSqlDataSource.query as jest.MockedFunction<typeof mockSqlDataSource.query>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not return null if user exists and its password matches with encrypted one', async () => {
    const user = new User({
      email: casual.email,
      password: 'abcd3Fgh!JklM_m0$',
    });
    mockAuthCheck.mockReturnValue(123);
    mockQuery.mockResolvedValue([user]);
    const response = await user.login();
    expect(response).not.toBeNull();
    expect(mockDebug).toHaveBeenCalledTimes(2);
    expect(mockError).toHaveBeenCalledTimes(0);
  });

  it('should return an error when authCheck does not return a userId', async () => {
    mockAuthCheck.mockReturnValue(null);
    const user = new User({ email: 'example.com', password: '@bcd3fGhijklmnop' });
    const response = await user.login();
    expect(response).toBe(null);
  });

  it('should return null when findEmail() throws an error', async () => {
    mockAuthCheck.mockImplementation(() => {
      throw new Error('Testing error handler');
    });
    const user = new User({ email: 'test.user@example.com', password: 'AbcdefgH1!' });
    const response = await user.login();
    expect(response).toBeNull();
    expect(mockError).toHaveBeenCalledTimes(1);
  });
});

describe('register()', () => {
  const bcryptSalt = jest.fn().mockReturnValue('abc');
  (bcrypt.genSalt as jest.Mock) = bcryptSalt;

  const bcryptPassword = jest.fn().mockReturnValue('test.user@example.com');
  (bcrypt.hash as jest.Mock) = bcryptPassword;

  beforeEach(() => {
    jest.resetAllMocks();

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
      surName: 'simple'
    });

    const response = await user.register();
    expect(response).not.toBeNull();
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
      surName: 'simple'
    });


    const response = await user.register();
    expect(response).toBe(user);
  });

  it('should return null if there are errors validating the user', async () => {
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
      surName: 'simple'
    });

    const response = await user.register();
    expect(response).toBeInstanceOf(User);
    expect((response as User).errors.length > 0).toBe(true);
  });
});
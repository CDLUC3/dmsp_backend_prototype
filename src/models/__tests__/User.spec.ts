import 'jest-expect-message';
import { User, UserRole } from '../User';
import bcrypt, { hash } from 'bcryptjs';
import casual from 'casual';
import { MySQLDataSource } from '../../datasources/mySQLDataSource';
import mockLogger from '../../__tests__/mockLogger';
import { buildContext } from '../../context';
import { mockToken } from '../../__mocks__/context';
import { MySqlModel } from '../MySqlModel';

jest.mock('../../context.ts');
jest.mock('../MySqlModel');

let logger;
let mockDebug;
let mockError;
let mockContext;
let mockQuery;
let mockUser;

describe('constructor', () => {
  it('should set the expected properties', () => {
    const props = {
      id: casual.integer(1, 99999),
      email: casual.email,
      password: casual.password,
      affiliationId: casual.url,
      role: UserRole.Admin,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: '0000-0000-0000-000X',
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
  });

  it('should set the defaults properly', () => {
    const props = { email: casual.email, password: casual.password };
    const user = new User(props);
    expect(user.id).toBeFalsy();
    expect(user.email).toEqual(props.email);
    expect(user.password).toEqual(props.password);
    expect(user.affiliationId).toBeFalsy();
    expect(user.givenName).toBeFalsy();
    expect(user.surName).toBeFalsy();
    expect(user.orcid).toBeFalsy();
    expect(user.role).toEqual(UserRole.Researcher);
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
    const user = new User({ email: 'TESTer%40exaMPle.cOm', givenName: ' Test ', surName: '  user  ' });
    user.cleanup();
    expect(user.email).toEqual('TESTer@exaMPle.cOm');
    expect(user.givenName).toEqual('Test');
    expect(user.surName).toEqual('User');
    expect(user.role).toEqual(UserRole.Researcher);
  });
});

describe('validate a new User', () => {
  beforeEach(async () => {
    jest.resetAllMocks();

    mockUser = new User({
      email: casual.email,
      password: 'abcd3Fgh!JklM_m0$',
      givenName: casual.first_name,
      surName: casual.last_name,
      affiliationId: casual.url,
      role: UserRole.Researcher
    });

    logger = mockLogger;
    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;
    mockQuery = MySqlModel.query as jest.MockedFunction<typeof MySqlModel.query>;
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

describe('login()', () => {
  let bcryptCompare;
  let bcryptSalt;
  let bcryptPassword;

  beforeEach(async () => {
    jest.resetAllMocks();

    bcryptCompare = jest.fn().mockResolvedValue(true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;

    bcryptSalt = jest.fn().mockReturnValue('abc');
    (bcrypt.genSalt as jest.Mock) = bcryptSalt;

    bcryptPassword = jest.fn().mockReturnValue('test.user@example.com');
    (bcrypt.hash as jest.Mock) = bcryptPassword;

    logger = mockLogger;
    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;
    mockQuery = MySqlModel.query as jest.MockedFunction<typeof MySqlModel.query>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not return null if user exists and its password matches with encrypted one', async () => {
    const user = new User({
      email: 'testFOOO@test.com',
      password: '@bcd3fGhij12klmnop',
    });
    const hashedPwd = await user.hashPassword('@bcd3fGhij12klmnop')
    mockQuery.mockResolvedValueOnce([user]);
    const response = await user.login();
    expect(response).not.toBeNull();
    expect(mockDebug).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledTimes(0);
  });

  it('should return an error when there is an invalid email', async () => {
    const mockedUser = { id: 1, email: 'test.user@example.com', name: '@bcd3fGhijklmnop' };
    mockQuery.mockResolvedValueOnce([mockedUser]);

    const user = new User({
      email: 'example.com',
      password: '@bcd3fGhijklmnop',
    });

    const response = await user.login();
    expect(user.errors.length === 1);
    expect(response).toBe(null);
  });

  it('should return an error when there is an invalid password', async () => {
    const mockedUser = { id: 1, email: 'test.user@example.com', name: '@bcd3fGhijklmnop' };
    mockQuery.mockResolvedValueOnce([mockedUser]);

    const user = new User({
      email: 'test.user@example.com',
      password: 'abc',
    });

    const response = await user.login();
    expect(user.errors.length === 1);
    expect(response).toBe(null);
  });

  it('should return null when findEmail() throws an error', async () => {
    mockQuery.mockImplementation(() => {
      throw new Error('Testing error handler');
    });
    const user = new User({ email: 'test.user@example.com', password: 'AbcdefgH1!' });
    const response = await user.login();
    expect(response).toBeNull();
    expect(mockDebug).toHaveBeenCalledTimes(1);
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

    // Cast getInstance to a jest.Mock type to use mockReturnValue
    (MySQLDataSource.getInstance as jest.Mock).mockReturnValue({
      query: jest.fn(), // Initialize the query mock function here
    });

    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
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
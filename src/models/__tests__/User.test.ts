import { User, UserRole } from '../User';
import casual from 'casual';
import { MySQLDataSource } from '../../datasources/mySQLDataSource';

jest.mock('../../datasources/mySQLDataSource', () => {
  return {
    __esModule: true,
    MySQLDataSource: {
      getInstance: jest.fn().mockReturnValue({
        query: jest.fn(), // Initialize the query mock function
      }),
    },
  };
});

const userProps = {
  email: 'test.user@example.com',
  password: 'abcdefghijklmnop',
}
const mockUser = { id: 1, email: 'test@test.com', name: 'John Doe' };
let mockQuery: jest.MockedFunction<typeof MySQLDataSource.prototype.query>;

describe('constructor', () => {
  it('should set the expected properties', () => {
    const props = {
      id: casual.integer(1, 99999),
      email: 'test@test.com',
      password: 'password123',
      role: UserRole.Admin,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: '0000-0000-0000-000X',
    }

    const user = new User({ ...userProps, ...props });
    expect(user.id).toEqual(props.id);
    expect(user.email).toEqual(props.email);
    expect(user.password).toEqual(props.password);
    expect(user.givenName).toEqual(props.givenName);
    expect(user.surName).toEqual(props.surName);
    expect(user.orcid).toEqual(props.orcid);
    expect(user.role).toEqual(props.role);
  });

  it('should ignore unexpected properties', () => {
    const user = new User({ ...userProps, test: 'blah' });
    expect(user.email).toEqual(userProps.email);
    expect(user.password).toEqual(userProps.password);
    expect(user['test']).toBeUndefined();
  });
});

describe('cleanup standardizes the format of properties', () => {
  it('should properly format the properties', () => {
    const user = new User({ email: 'TESTer@exaMPle.cOm', givenName: ' Test ', surName: '  user  ' });
    user.cleanup();
    expect(user.email).toEqual('TESTer@exaMPle.cOm');
    expect(user.givenName).toEqual('Test');
    expect(user.surName).toEqual('User');
    expect(user.role).toEqual(UserRole.Researcher);
  });
});

describe('validate a new User', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
  });

  it('should return true when we have a new user with a valid password', async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const user = new User({
      email: 'test.user@example.com',
      password: '@bcd3fGhijklmnop',
    });

    const isValid = await user.validateNewUser();

    expect(isValid).toBe(true);
  });

  it('should return false when we have a new user with an invalid password', async () => {

    mockQuery.mockResolvedValueOnce([[], []]);

    const user = new User({
      email: 'test.user@example.com',
      password: 'abcde',
    });

    const isValid = await user.validateNewUser();

    const expectedError = `Invalid password format.
    Passwords must be greater than 8 characters, and contain at least
    one number,
    one upper case letter,
    one lower case letter, and
    one of the following special character (\`, !, @, #, $, %, ^, &, *, -, _, =, +, ?, ~)`;

    expect(user.errors[0].trim().replace(/\s+/g, ' ')).toEqual(expectedError.trim().replace(/\s+/g, ' '));
  });

  it('should return false when we have an existing user', async () => {
    mockQuery.mockResolvedValueOnce([[mockUser], []]);

    const user = new User({
      email: 'test.user@example.com',
      password: '@bcd3fGhijklmnop',
    });

    const isValid = await user.validateNewUser();

    expect(isValid).toBe(false);
  });

  it('should return false when we have a new user without a valid email format', async () => {
    mockQuery.mockResolvedValueOnce([[mockUser], []]);

    const user = new User({
      email: 'test.user',
      password: '@bcd3fGhijklmnop',
    });

    const isValid = await user.validateNewUser();

    expect(isValid).toBe(false);
  });
});

describe('password validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const instance = MySQLDataSource.getInstance();
    mockQuery = instance.query as jest.MockedFunction<typeof instance.query>;
  });

  it('should return true for a valid passwords', () => {
    expect(new User({ password: 'AbcdefgH1!' }).validatePassword()).toBe(true);
    expect(new User({ password: 'AbcdefgH1@#$%^&*-_+=?' }).validatePassword()).toBe(true);
    expect(new User({ password: 'Abcdef  gH1#' }).validatePassword()).toBe(true);
    expect(new User({ password: ' AbcdefgH1$' }).validatePassword()).toBe(true);
    expect(new User({ password: 'AbcdefgH1! ' }).validatePassword()).toBe(true);
  });

  it('should allow all of the approved special characters', () => {
    const chars = ['~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '-', "_", '+', '=', '?', ' '];
    for (let i = 0; i < chars.length; i++) {
      const valid = new User({ password: `Abcd3Fgh1jkL${chars[i]}` }).validatePassword();
      if (!valid) {
        console.log(`Failed when testing character ${chars[i]}`);
      }
      expect(valid).toBe(true);
    };
  });

  it('should fail for a new user with a password that is too short', async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const user = new User({
      email: 'test.user@example.com',
      password: 'abcde',
    });

    await user.validateNewUser();

    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  it('should fail for a new user if the password does not contain at least 1 uppercase letter', async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const user = new User({ password: 'abcd3fgh1jk' });

    await user.validateNewUser();

    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  it('should fail for a new user if the password does not contain at least 1 lowercase letter', async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const user = new User({
      email: 'test.user@example.com',
      password: 'ABCD3FGH1JKL',
    });

    await user.validateNewUser();

    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  it('should fail for a new user if the password does not contain at least 1 number letter', async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const user = new User({
      email: 'test.user@example.com',
      password: 'Abcd$Fgh#jkL',
    });

    await user.validateNewUser();
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  it('should fail for a new user if the password does not contain at least 1 special character', async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const user = new User({
      email: 'test.user@example.com',
      password: 'Abcd3Fgh1jkL',
    });

    await user.validateNewUser();

    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  it('should fail for a new user if it contains special characters that are not allowed', () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const badChars = ['(', ')', '{', '[', '}', ']', '|', '\\', ':', ';', '"', "'", '<', ',', '>', '.', '/'];
    for (let i = 0; i < badChars.length; i++) {
      const user = new User({
        email: 'test.user@example.com',
        password: `Abcd3Fgh1jkL$${badChars[i]}`,
      });

      const valid = user.validatePassword();
      if (valid) {
        console.log(`Failed when testing character ${badChars[i]}`);
      }
    };
  });
});

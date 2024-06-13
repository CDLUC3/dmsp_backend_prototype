import { User, UserRole } from '../User';
import casual from 'casual';
import { MySQLDataSource } from '../../datasources/mySQLDataSource';

jest.mock('../../datasources/mySQLDataSource', () => {
  return {
    __esModule: true,
    MySQLDataSource: {
      getInstance: jest.fn().mockReturnValue({
        query: jest.fn().mockResolvedValue([]),
      }),
    },
  };
});

const userProps = {
  email: 'test.user@example.com',
  password: 'abcdefghijklmnop',
}

describe('constructor', () => {
  test('sets the expected properties', () => {
    const props = {
      id: casual.integer(1, 99999),
      role: UserRole.Admin,
      givenName: casual.first_name,
      surName: casual.last_name,
      orcid: '0000-0000-0000-000X',
    }
    const user = new User({ ...userProps, ...props });
    expect(user.id).toEqual(props.id);
    expect(user.email).toEqual(userProps.email);
    expect(user.password).toEqual(userProps.password);
    expect(user.givenName).toEqual(props.givenName);
    expect(user.surName).toEqual(props.surName);
    expect(user.orcid).toEqual(props.orcid);
    expect(user.role).toEqual(props.role);
  });

  test('ignores unexpected properties', () => {
    const user = new User({ ...userProps, test: 'blah' });
    expect(user.email).toEqual(userProps.email);
    expect(user.password).toEqual(userProps.password);
    expect(user['test']).toBeUndefined();
  });
});

describe('cleanup standardizes the format of properties', () => {
  test('properly formats the properties', () => {
    const user = new User({ email: 'TESTer@exaMPle.cOm', givenName: ' Test ', surName: '  user  ' });
    user.cleanup();
    expect(user.email).toEqual('tester@example.com');
    expect(user.givenName).toEqual('Test');
    expect(user.surName).toEqual('User');
    expect(user.email).toEqual('tester@example.com');
    expect(user.role).toEqual(UserRole.Researcher);
  });
});

describe('validate a new User', () => {
  let mockQuery: jest.Mock;

  beforeAll(() => {
    const mockPool = MySQLDataSource.getInstance();
    mockQuery = mockPool.query as jest.Mock;
  });

  test('returns true when the user is valid', () => {
    const user = new User({ ...userProps });
    // Mock the response
    mockQuery.mockResolvedValueOnce([]);

    expect(user.validateNewUser()).toBe(true);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  test('returns false when the email is not a valid email format', () => {

  });

  test('returns false when the email is not a valid email format', () => {

  });

  test('returns false when the password is not in a valid format', () => {

  });

  test('returns false when the role is not set', () => {

  });
});

describe('password validation', () => {
  test('returns true for valid passwords', () => {
    expect(new User({ password: 'AbcdefgH1!'}).validatePassword()).toBe(true);
    expect(new User({ password: 'AbcdefgH1@#$%^&*-_+=?'}).validatePassword()).toBe(true);
    expect(new User({ password: 'Abcdef  gH1#'}).validatePassword()).toBe(true);
    expect(new User({ password: ' AbcdefgH1$'}).validatePassword()).toBe(true);
    expect(new User({ password: 'AbcdefgH1! '}).validatePassword()).toBe(true);
  });

  test('allows all of the approved special characters', () => {
    const chars = ['~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '-', "_", '+', '=', '?', ' '];
    for(let i = 0; i < chars.length; i++) {
      const valid = new User({ password: `Abcd3Fgh1jkL${chars[i]}` }).validatePassword();
      if (!valid) {
        console.log(`Failed when testing character ${chars[i]}`);
      }
      expect(valid).toBe(true);
    };
  });

  test('fails if the password is too short', () => {
    const user = new User({ password: 'Abcd3$' });

console.log(user);

    expect(user.validatePassword()).toBe(false);

console.log(user.errors);

    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  test('fails if the password does not contain at least 1 uppercase letter', () => {
    const user = new User({ password: 'abcd3fgh1jkL' });
    expect(user.validatePassword()).toBe(false)
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  test('fails if the password does not contain at least 1 lowercase letter', () => {
    const user = new User({ password: 'ABCD3FGH1JKL' });
    expect(user.validatePassword()).toBe(false)
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  test('fails if the password does not contain at least 1 number letter', () => {
    const user = new User({ password: 'Abcd$Fgh#jkL' });
    expect(user.validatePassword()).toBe(false)
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  test('fails if the password does not contain at least 1 special character', () => {
    const user = new User({ password: 'Abcd3Fgh1jkL' });
    expect(user.validatePassword()).toBe(false)
    expect(user.errors.length === 1);
    expect(user.errors[0].includes('Invalid password'));
  });

  test('fails if it contains special characters that are not allowed', () => {
    const badChars = ['(', ')', '{', '[', '}', ']', '|', '\\', ':', ';', '"', "'", '<', ',', '>', '.', '/'];
    for(let i = 0; i < badChars.length; i++) {
      const user = new User({ password: `Abcd3Fgh1jkL$${badChars[i]}` });
      const valid = user.validatePassword();
      if (valid) {
        console.log(`Failed when testing character ${badChars[i]}`);
      }
      expect(valid).toBe(false);
      expect(user.errors.length === 1);
      expect(user.errors[0].includes('Invalid password'));
    };
  });
});

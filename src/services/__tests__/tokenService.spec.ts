import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { User, UserRole } from '../../models/User';
import { generateToken, verifyToken } from '../tokenService';
import { logger } from '../../__mocks__/logger';

describe('verifyToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('it can verify a valid token', () => {
    const user = new User({ id: 999, email: 'test@example.com', role: UserRole.RESEARCHER });

    const token = generateToken(user);
    const decoded = verifyToken(token, null);
    expect(decoded.id).toEqual(user.id);
    expect(decoded.email).toEqual(user.email);
    expect(decoded.role).toEqual(user.role);
  });

  test('it throws a GraphQLError when the token is invalid', () => {
    const user = new User({ id: 999, email: 'test@example.com', role: UserRole.RESEARCHER });
    const token = generateToken(user);
    expect(() => {
      verifyToken(token.substring(10), null);
    }).toThrow(GraphQLError);
  });

  test('it throws a GraphQLError if jwt throws an error', () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('Testing verifyToken error'); });

    const user = new User({ id: 999, email: 'test@example.com', role: UserRole.RESEARCHER });
    const token = generateToken(user);
    expect(() => {
      verifyToken(token, null);
    }).toThrow(GraphQLError);
  });
});

describe('generateToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('it returns a new JWT', () => {
    const user = new User({ id: 999, email: 'test@example.com', role: UserRole.RESEARCHER });
    const token = generateToken(user);
    expect(token).toBeDefined();
  });

  test('it returns Falsey if the User has no id (it hasn\'t been saved)', () => {
    const user = new User({ email: 'test@example.com', role: UserRole.RESEARCHER });
    const token = generateToken(user);
    expect(token).toBeFalsy();
  });

  test('it logs and error message if it fails', () => {
    jest.spyOn(jwt, 'sign').mockImplementation(() => { throw new Error('Testing generateToken error'); });
    const loggerSpy = jest.spyOn(logger, 'error');

    const user = new User({ id: 999, email: 'test@example.com', role: UserRole.RESEARCHER });
    generateToken(user);
    expect(loggerSpy).toHaveBeenCalledTimes(1);
  });
});

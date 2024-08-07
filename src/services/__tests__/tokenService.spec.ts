import { User, UserRole } from '../../models/User';
import { generateToken, verifyToken } from '../tokenService';

describe('generateToken', () => {
  test('it returns a new JWT', () => {
    const user = new User({ id: 999, email: 'test@example.com', role: UserRole.Researcher });
    const token = generateToken(user);
    expect(token).toBeDefined();
  });

  test('it returns Falsey if the User has no id (it hasn\'t been saved)', () => {
    const user = new User({ email: 'test@example.com', role: UserRole.Researcher });
    const token = generateToken(user);
    expect(token).toBeFalsy();
  });
});

describe('verifyToken', () => {
  test('it can verify a valid token', () => {
    const user = new User({ id: 999, email: 'test@example.com', role: UserRole.Researcher });
    const token = generateToken(user);
    const decoded = verifyToken(token, null);
    expect(decoded.id).toEqual(user.id);
    expect(decoded.email).toEqual(user.email);
    expect(decoded.role).toEqual(user.role);
  });

  test('it returns Falsey when the token cannot be validated', () => {
    const user = new User({ id: 999, email: 'test@example.com', role: UserRole.Researcher });
    const token = generateToken(user);
    const decoded = verifyToken(token.substring(10), null);
    expect(decoded).toBeFalsy();
  });
});
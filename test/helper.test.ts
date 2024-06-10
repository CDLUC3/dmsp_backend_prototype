import { validateEmail, stringToArray } from '../src/utils/helpers';

describe('Email validation', () => {
  test('returns true if the value is a valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('test-user@example.company')).toBe(true);
    expect(validateEmail('test.user@example.co')).toBe(true);
    expect(validateEmail('a@b.ab')).toBe(true);
  });

  test('returns true if the value is NOT an email', () => {
    expect(validateEmail('test.example.com')).toBe(false);
    expect(validateEmail('test-user@example')).toBe(false);
    expect(validateEmail('@example.co')).toBe(false);
  });
});

describe('Convert a string into an Array', () => {
  test('returns the string as string[]', () => {
    expect(stringToArray('foo bar baz')).toEqual(['foo', 'bar', 'baz']);
  });
  test('returns the default', () => {
    expect(stringToArray(null)).toEqual([]);
  });
  test('allows us to define the delimiter', () => {
    expect(stringToArray('foo, bar , baz', ',')).toEqual(['foo', 'bar', 'baz']);
  });
  test('allows us to define the default response', () => {
    expect(stringToArray(null, ',', ['test'])).toEqual(['test']);
  });
});

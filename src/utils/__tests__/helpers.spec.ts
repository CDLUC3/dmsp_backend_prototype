import {
  validateEmail,
  capitalizeFirstLetter,
  stringToArray,
  verifyCriticalEnvVariable
} from '../helpers';

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

describe('Capitalize the first letter of a string', () => {
  test('it works', () => {
    expect(capitalizeFirstLetter('test')).toEqual('Test');
    expect(capitalizeFirstLetter('   teSt  ')).toEqual('TeSt');
    expect(capitalizeFirstLetter(' van gogh')).toEqual('Van gogh');
    expect(capitalizeFirstLetter('van Gogh')).toEqual('Van Gogh');
  });

  test('it can handle an empty string', () => {
    expect(capitalizeFirstLetter('  ')).toEqual('');
  })
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

describe('Verify critical env variables', () => {
  test('does not log an error if the specified variable exist', () => {
    const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => { return null });
    verifyCriticalEnvVariable('NODE_ENV');
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
  test('logs an error if the specified variable does not exist', () => {
    const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => { return null });
    verifyCriticalEnvVariable('TEST_SECRET');
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});

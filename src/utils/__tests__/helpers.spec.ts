import { generalConfig } from '../../config/generalConfig';
import {
  validateDate,
  validateEmail,
  capitalizeFirstLetter,
  stringToArray,
  verifyCriticalEnvVariable,
  incrementVersionNumber,
  validateURL,
  getCurrentDate,
  randomHex,
  stripIdentifierBaseURL,
  stringToEnumValue,
} from '../helpers';

describe('Date validation', () => {
  test('returns true when the value is a date', async () => {
    expect(validateDate('2024-08-14T13:41:12.000Z')).toBe(true);
    expect(validateDate('2024-08-14T13:41:12Z')).toBe(true);
    expect(validateDate('2024-08-14T13:41:12')).toBe(true);
    expect(validateDate('2024-08-14 13:41:12')).toBe(true);
    expect(validateDate('2024-08-14 13:41')).toBe(true);
    expect(validateDate('08/14/2024')).toBe(true);

    const date = new Date();
    expect(validateDate(date.toDateString())).toBe(true);
    expect(validateDate(date.toISOString())).toBe(true);
    expect(validateDate(date.toLocaleDateString())).toBe(true);
    expect(validateDate(date.toLocaleString())).toBe(true);
    expect(validateDate(date.toISOString())).toBe(true);
    expect(validateDate(date.toString())).toBe(true);
  });

  test('returns false when the value is NOT a date', async () => {
    expect(validateDate('2024-AZ-14 13:BY:12')).toBe(false);
    expect(validateDate('425624756')).toBe(false);
    expect(validateDate('abcdef')).toBe(false);
    expect(validateDate('false')).toBe(false);
    expect(validateDate(null)).toBe(false);
    expect(validateDate('{"date": "2024-08-14T13:48:00Z"}')).toBe(false);

    const date = new Date();
    expect(validateDate(date.toTimeString())).toBe(false);
    expect(validateDate(date.toLocaleTimeString())).toBe(false);
  });
});

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

describe('URL validation', () => {
  test('returns true for valid URLs', () => {
    expect(validateURL('https://www.example.com')).toBe(true);
    expect(validateURL('http://www.example.com')).toBe(true);
    expect(validateURL('file://www.example.com')).toBe(true);
    expect(validateURL('http://example.com')).toBe(true);
    expect(validateURL('https://example.com/path/to/page')).toBe(true);
    expect(validateURL('https://example.com/path/to/page?qs=1&qs2=2')).toBe(true);
  });

  test('returns false for invalid URLs', () => {
    expect(validateURL('www.example/path/to/page')).toBe(false);
    expect(validateURL('example.com')).toBe(false);
    expect(validateURL('example.com/path')).toBe(false);
    expect(validateURL('hehgiehgehgerge')).toBe(false);
    expect(validateURL('58757899')).toBe(false);
  });
});

describe('Strips the protocol and domain from known identifiers', () => {
  test('it handles ORCIDs properly', () => {
    const orcidId = '0000-0000-0000-0000 ';
    expect(stripIdentifierBaseURL(`${generalConfig.orcidBaseURL}${orcidId}`)).toEqual(orcidId.trim());
    expect(stripIdentifierBaseURL(orcidId)).toEqual(orcidId.trim());
  });

  test('it handles RORs properly', () => {
    const rorId = 'a0000z ';
    expect(stripIdentifierBaseURL(`${generalConfig.rorBaseURL}${rorId}`)).toEqual(rorId.trim());
    expect(stripIdentifierBaseURL(rorId)).toEqual(rorId.trim());
  });

  test('it handles DOIs properly', () => {
    const dmpId = `${generalConfig.dmpIdShoulder}B2C3D4 `;
    expect(stripIdentifierBaseURL(`${generalConfig.dmpIdBaseURL}${dmpId}`)).toEqual(dmpId.trim());
    expect(stripIdentifierBaseURL(dmpId)).toEqual(dmpId.trim());
  });

  test('leaves others alone', () => {
    let id = 'http://test.com/0000-0000-0000-0000';
    expect(stripIdentifierBaseURL(id)).toEqual(id);
    id = 'http://orcid.org/0000';
    expect(stripIdentifierBaseURL(id)).toEqual(id);
    id = 'http://ror.org/0000-0000-0000-0000';
    expect(stripIdentifierBaseURL(id)).toEqual(id);
    id = 'http://doi.org/98724896247698457604597645067452706';
    expect(stripIdentifierBaseURL(id)).toEqual(id);
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
    expect(capitalizeFirstLetter('')).toEqual('');
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

describe('Version number incrementer', () => {
  test('returns the version as-is if it does not have a numeric part', () => {
    let newVersion = incrementVersionNumber('');
    expect(newVersion).toEqual('');
    newVersion = incrementVersionNumber('v');
    expect(newVersion).toEqual('v');
  });

  test('can increment a major only version number', () => {
    let newVersion = incrementVersionNumber('v1');
    expect(newVersion).toEqual('v2');
    newVersion = incrementVersionNumber('v12');
    expect(newVersion).toEqual('v13');
    newVersion = incrementVersionNumber('v12345');
    expect(newVersion).toEqual('v12346');
  });
});

describe('getCurrentDate', () => {
  it('returns a date (as string) in the expected format', () => {
    const result = getCurrentDate();
    expect(/[0-9]{4}-[0-9]{2}-[0-9]{2}\s([0-9]{2}:){2}[0-9]{2}/.test(result)).toBe(true);
  });
});

describe('randomHex', () => {
  it('returns a string in the expected format', () => {
    const val = randomHex(32);
    expect(/[a-z0-9]{32}/.test(val)).toBe(true);
  });
});

describe('stringToEnumValue', () => {
  enum testEnum {
    A = "A",
    B = "B"
  }

  it('returns null if the string is not one of the items in the enum', () => {
    expect(stringToEnumValue(testEnum, 'C')).toBe(null);
  });

  it('returns the enum value for the string', () => {
    expect(stringToEnumValue(testEnum, 'B')).toBe(testEnum.B);
  });
});

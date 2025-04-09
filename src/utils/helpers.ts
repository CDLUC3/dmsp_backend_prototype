// Convert a string into an Array (return the default or an empty array if it is null or undefined)
//

import { formatISO9075 } from "date-fns";
import { generalConfig } from "../config/generalConfig";

export const ORCID_REGEX = /^(https?:\/\/)?(www\.)?(sandbox\.)?(orcid\.org\/)?([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X])$/;

// Ensure that the ORCID is in the correct format (https://orcid.org/0000-0000-0000-0000)
export function formatORCID(orcidIn: string): string {
  // If it is blank or already in the correct format, return it
  if (!valueIsEmpty(orcidIn) && (orcidIn.match(ORCID_REGEX) && orcidIn.startsWith('http'))) return normaliseHttpProtocol(orcidIn);

  // If it matches the ORCID format but didn't start with http then its just the id
  if (!valueIsEmpty(orcidIn) && orcidIn.match(ORCID_REGEX)) {
    return normaliseHttpProtocol(`${generalConfig.orcidBaseURL}${orcidIn.split('/').pop()}`);
  }

  // Otherwise it's not an ORCID
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringToArray(array: any, delimiter = ' ', defaultResponse: string[] = []): string[] {
  if (typeof array === 'string') {
    return array.split(delimiter).map((item) => item.trim());
  }
  return array || defaultResponse;
}

// Convert a string to a value within an enum
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export function stringToEnumValue<T extends { [key: string]: string }>(
  enumType: T,
  str: string
): T[keyof T] | null {
  return Object.values(enumType).includes(str as T[keyof T]) ? (str as T[keyof T]) : null;
}

// Capitalize the first letter of the string.
export function capitalizeFirstLetter(str: string): string {
  if (str) {
    const val = str.trim();

    if (val.length > 0) {
      return val.charAt(0).toUpperCase() + val.slice(1);
    }
    return val;
  }
  return '';
}

// Remove know Protocol and Domain portions of identifiers from the string
// Handles removal of http:// and https:// protocols by removing them from string and base URLs
export function stripIdentifierBaseURL(str: string): string {
  if (!str) return '';

  const normalisedStr = normaliseHttpProtocol(str);
  for (const baseUrl of [
    generalConfig.dmpIdBaseURL,
    generalConfig.orcidBaseURL,
    generalConfig.rorBaseURL,
  ]) {
    const normalisedBase = normaliseHttpProtocol(baseUrl);
    if (normalisedStr.startsWith(normalisedBase)) {
      return normalisedStr
        .slice(normalisedBase.length)
        .trim();
    }
  }

  return str
    .replace(/^\//, '') // Strip leading /
    .trim();
}

// Verify that a string is a valid identifier
export function isNullOrUndefined(value: unknown): boolean {
  return value === null || value === undefined;
}

// Verify that a string is a valid identifier
export function valueIsEmpty(value: string | number | boolean): boolean {
  // Check if the value is null or undefined
  if (isNullOrUndefined(value)) {
    return true;
  }
  // Check if the value is a string
  if (typeof value === 'string') {
    return value.trim() === '';
  }

  return false;
}

// Date validation
export function validateDate(date: string): boolean {
  return date !== null && !isNaN(new Date(date).getTime());
}

// Email address validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL validation
export function validateURL(url: string): boolean {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return true;
}

// Helper that will log and error and terminate the Node process if a critical env variable is missing.
export function verifyCriticalEnvVariable(variable: string): void {
  if (process.env[variable] === undefined) {
    console.log(Error(`FATAL ERROR: No ${variable} defined in the environment!`));
  }
}

// Increment a version number that is a string with a `v` prefix (e.g. v1)
export function incrementVersionNumber(version: string): string {
  // Extract the numeric part using a regular expression
  const match = version.match(/(\d+)$/);
  if (match) {
    // Extract the numeric part
    let numericPart = parseInt(match[0], 10);

    // Increment the numeric part
    numericPart += 1;

    // Replace the old numeric part with the new one
    return version.replace(/(\d+)$/, numericPart.toString());
  }
  // If no numeric part is found, return the original version string
  return version;
}

// Get current date and put it into format that is acceptable to mariaDB
export function getCurrentDate(): string {
  return formatISO9075(new Date());
}

// Generate a random hex code
export function randomHex(size: number): string {
  return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Normalises dates
export function normaliseDate (date: string | null): string {
  if (date === null || date === undefined) {
    return null;
  }

  // Split into parts, convert to integers and only continue if 3 integer parts
  const parts = date
    .split("-")
    .map((p) => parseInt(p.trim(), 10))
    .filter((p) => Number.isInteger(p));
  if (parts.length !== 3) {
    return null;
  }

  // Convert to numbers
  return `${parts[0]}-${String(parts[1]).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}`;
}

export function stripHttpProtocol(input: string | null) {
  if (isNullOrUndefined(input)) {
    return null;
  }
  return input.trim().replace(/^https?:\/\//, '');
}

export function normaliseHttpProtocol(input: string | null) {
  if (isNullOrUndefined(input)) {
    return null;
  }
  return input.trim().replace(/^http:\/\//, 'https://');
}


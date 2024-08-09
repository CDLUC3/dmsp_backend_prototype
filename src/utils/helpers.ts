// Convert a string into an Array (return the default or an empty array if it is null or undefined)
export function stringToArray(array: any, delimiter: string = ' ', defaultResponse: string[] = []): string[] {
  if (typeof array === 'string') {
    return array.split(delimiter).map((item) => item.trim());
  }
  return array || defaultResponse;
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

// Email address validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

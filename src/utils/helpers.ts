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

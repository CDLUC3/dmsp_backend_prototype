
// Convert a string into an Array (return the default or an empty array if it is null or undefined)
export function stringToArray(array: any, dflt: string[] = []): string[] {
  if (array instanceof String) {
    return array.split(',').map((item) => item.trim());
  }
  return array || dflt || [];
}

// Email address validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

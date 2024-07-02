import { validateDmspId } from '../resolvers/scalars/dmspId';
import { validateOrcid } from '../resolvers/scalars/orcid';
import { validateRor } from '../resolvers/scalars/ror';

const emailRegex = new RegExp(/^[a-zA-Z0–9._-]+@[a-zA-Z0–9.-]+\.[a-zA-Z]{2,4}$/);
const timestampRegex = new RegExp(/[0-9]{4}-[0-9]{2}-[0-9]{2}\s([0-9]{2}:){2}[0-9]{2}/);
const urlRegex = new RegExp(/(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})(\.[a-zA-Z0-9]{2,})?/);

// Assertion helpers
export function assertDmspId(val) {
  try {
    return validateDmspId(val).length > 0;
  } catch {
    return false;
  }
}

export function assertEmailAddress(val) {
  return emailRegex.test(val);
}

export function assertOrcid(val) {
  try {
    return validateOrcid(val).length > 0;
  } catch {
    return false;
  }
}

export function assertRor(val) {
  try {
    return validateRor(val).length > 0;
  } catch {
    return false;
  }
}

export function assertTimestamp(val) {
  return timestampRegex.test(val)
}

export function assertUrl(val) {
  return urlRegex.test(val);
}

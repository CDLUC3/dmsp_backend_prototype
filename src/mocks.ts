import casual from 'casual';
import { DMSP_BASE_URL, validateDmspId } from './resolvers/scalars/dmspId';
import { validateOrcid } from './resolvers/scalars/orcid';
import { ROR_DOMAIN, validateRor } from './resolvers/scalars/ror';

import { mock as userMock } from './mocks/user';
import { mock as contributorRoleMock } from './mocks/contributorRole';

// Mock resolvers for our custom Scalars
function mockOrcid() {
  return validateOrcid(casual.card_number().toString().match(/[0-9]{4}/g).join('-'));
}
function mockRor() {
  return validateRor(`${ROR_DOMAIN}${casual.rgb_hex.replace('#', '')}`);
}
function mockDmspId() {
  return validateDmspId(`${DMSP_BASE_URL}${casual.rgb_hex.replace('#', '').toUpperCase()}`);
}

const scalarMocks = {
  // Mocks for generic scalars
  Int: () => casual.integer(1, 1000),
  Float: () => casual.double(1.0, 999.99),
  String: () => casual.sentence,

  // Mocks for graphql-tools custom scalars
  URL: () => casual.url,
  DateTimeISO: () => casual.date('YYYY-MM-DD HH:mm:ss'),
  EmailAddress: () => casual.email,

  // Mocks for custom scalars
  Orcid: () => mockOrcid(),
  Ror: () => mockRor(),
  DmspId: () => mockDmspId(),
};

// Gather all of the mock defintions
export const mocks = {
  ...scalarMocks,
  ...contributorRoleMock,
  ...userMock
};

export function mockDate(): String {
  return casual.date('YYYY-MM-DD HH:mm:ss.123Z');
}

// Simulated Success response from a Mutation
export function mockSuccess(code: Number, message: String) {
  return {
    code: code as number || casual.integer(200, 201),
    success: true as boolean,
    message: message as string || casual.sentence
  }
}

// TODO: Consider making a class that our Mocks can use for all this!

// Simulated Error response from a Mutation
export function mockError(code: Number, message: String) {
  return {
    code: code as number || casual.integer(400, 500),
    success: false as boolean,
    message: message as string || casual.sentence
  }
}

// Standardized way to create a new mock record for a MySQL table
export function prepareNewMySQLRecord(args) {
  return {
    id: casual.uuid,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    ...args
  }
}

export function prepareUpdatedMySQLRecord(args) {
  return {
    modified: new Date().toISOString(),
    ...args
  }
}

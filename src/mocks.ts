import casual from 'casual';
import { DMSP_BASE_URL, validateDmspId } from './resolvers/scalars/dmspId';
import { validateOrcid } from './resolvers/scalars/orcid';
import { ROR_DOMAIN, validateRor } from './resolvers/scalars/ror';

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

export const mocks = {
  ...scalarMocks,
};

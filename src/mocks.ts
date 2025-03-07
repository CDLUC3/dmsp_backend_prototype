import casual from 'casual';
import { validateDmspId } from './resolvers/scalars/dmspId';
import { validateOrcid } from './resolvers/scalars/orcid';
import { validateRor } from './resolvers/scalars/ror';
import { generalConfig } from './config/generalConfig';

// Mock resolvers for our custom Scalars
function mockOrcid() {
  return validateOrcid(casual.card_number().toString().match(/[0-9]{4}/g).join('-'));
}
function mockRor() {
  return validateRor(`${generalConfig.rorBaseURL}${casual.rgb_hex.replace('#', '')}`);
}
function mockDmspId() {
  const dmpBase = `${generalConfig.dmpIdBaseURL}${generalConfig.dmpIdShoulder}`;
  return validateDmspId(`${dmpBase}${casual.rgb_hex.replace('#', '').toUpperCase()}`);
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

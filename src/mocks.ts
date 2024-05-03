import casual from 'casual';
import { DmspId } from './schemas/scalars/dmspId';
import { Orcid } from './schemas/scalars/orcid';
import { Ror } from './schemas/scalars/ror';
import { mock as userMock } from './mocks/user';

// Mock resolvers for our custom Scalars
function mockOrcid() {
  const id = casual.card_number().toString().match(/[0-9]{4}/g).join('-');
  return new Orcid(`${Orcid.baseURL}${id}`);
}
function mockRor() {
  return new Ror(`${Ror.baseURL}${casual.rgb_hex.replace('#', '')}`);
}
function mockDmspId() {
  return new DmspId(`${DmspId.baseURL}${casual.rgb_hex.replace('#', '').toUpperCase()}`);
}

export const scalarMocks = {
  // Mocks for generic scalars
  Int: () => casual.integer(1, 1000),
  Float: () => casual.double(1.0, 999.99),
  String: () => casual.sentence,

  // Mocks for graphql-tools custom scalars
  URL: () => casual.url,
  DateTimeISO: () => casual.date('YYYY-MM-DDThh:mm:ssZ'),

  // Mocks for custom scalars
  Orcid: () => mockOrcid(),
  Ror: () => mockRor(),
  DmspId: () => mockDmspId(),
};

export const mocks = { ...scalarMocks, ...userMock };

import casual from 'casual';
import { mock as userMock } from './mocks/user';

export const scalarMocks = {
  // Mocks for generic scalars
  Int: () => casual.integer(1, 1000),
  Float: () => casual.double(1.0, 999.99),
  String: () => casual.sentence,

  // Mocks for graphql-tools custom scalars
  URL: () => casual.url,
  DateTimeISO: () => casual.date('YYYY-MM-DDThh:mm:ssZ'),
};

export const mocks = { ...scalarMocks, ...userMock };

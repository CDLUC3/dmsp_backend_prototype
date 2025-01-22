import { GraphQLScalarType, Kind } from 'graphql';
import { generalConfig } from '../../config/generalConfig';

const ORCID_ID_REGEX = /^([0-9a-zA-Z]{4}-){3}[0-9a-zA-Z]{4}$/;
const ORCID_URL_REGEX = /^https?:\/\/orcid.org\/([0-9a-zA-Z]{4}-){3}[0-9a-zA-Z]{4}/;

// Function to ensure the ORCID is properly formatted
export function validateOrcid(val) {
  const match = val.startsWith('http') ? val.match(ORCID_URL_REGEX) : val.match(ORCID_ID_REGEX);
  if (match && match.length > 0) {
    // Prepend the ORCID URL to the id if it doesn't have it
    return val.startsWith('http') ? val : `${generalConfig.orcidBaseURL}${val}`;
  }
  throw new Error(`Invalid ORCID format. Expected: "https://orcid.org/0000-0000-0000-0000" or "0000-0000-0000-0000"`);
};

// GraphQL Scalar definition for a researcher ORCID
export const orcidScalar = new GraphQLScalarType({
  name: 'Orcid',
  description: 'A researcher ORCID',

  serialize(orcid) {
    return validateOrcid(orcid.toString())
  },

  parseValue(value) {
    return validateOrcid(value.toString());
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      // Convert hard-coded AST string to string and then to Orcid
      return validateOrcid(ast.value);
    }
    // Invalid hard-coded value (not a string)
    return null;
  },
});
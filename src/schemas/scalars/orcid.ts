import { GraphQLScalarType, Kind } from 'graphql';

// A researcher ORCID
export class Orcid {
  value: string;

  static baseURL: string = 'https://orcid.org/';
  static idRegex: RegExp = /^([0-9a-zA-Z]{4}\-){3}[0-9a-zA-Z]{4}$/;
  static urlRegex: RegExp = /^https?:\/\/orcid.org\/([0-9a-zA-Z]{4}\-){3}[0-9a-zA-Z]{4}/;

  static validFormats: string = '"https://orcid.org/0000-0000-0000-0000" or "0000-0000-0000-0000"';

  constructor(val: string) {
    this.value = this.validate(val);
  };

  validate(val) {
    const match = val.startsWith('http') ? val.match(Orcid.urlRegex) : val.match(Orcid.idRegex);
    if (match.length > 0) {
      // Prepend the ORCID URL to the id if it doesn't have it
      return val.startsWith('http') ? val : `${Orcid.baseURL}${val}`;
    }
    throw new Error(`Invalid ORCID. Expected: ${Orcid.validFormats}`);
  };
};

// GraphQL Scalar definition for a researcher ORCID
export const orcidScalar = new GraphQLScalarType({
  name: 'Orcid',
  description: 'A researcher ORCID',

  serialize(orcid) {
    if (orcid instanceof Orcid) {
      return orcid.value; // Convert outgoing Orcid to a String for JSON
    }
    throw Error('GraphQL Orcid Scalar serializer expected an `Orcid` object');
  },

  parseValue(value) {
    if (typeof value === 'string') {
      return new Orcid(value); // Convert incoming string to Orcid
    }
    throw new Error(`GraphQL Orcid Scalar expected a string in the ${Orcid.validFormats} formats`);
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      // Convert hard-coded AST string to string and then to Orcid
      return new Orcid(ast.value.toString());
    }
    // Invalid hard-coded value (not a string)
    return null;
  },
});
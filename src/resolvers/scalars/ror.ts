import { GraphQLScalarType, Kind } from 'graphql';

// An organization ROR ID
export class Ror {
  identifier: string;
  type: string;

  static baseURL: string = 'https://ror.org/';
  static idRegex: RegExp = /^[0-9a-zA-Z]+$/;
  static urlRegex: RegExp = /^https?:\/\/ror.org\/[0-9a-zA-Z]+/;

  static validFormats: string = '"https://ror.org/abcd1234"';

  constructor(val: string) {
    this.identifier = this.validate(val);
    this.type = 'ror';
  };

  validate(val) {
    if (val.match(Ror.urlRegex).length > 0) {
      return val;
    }
    throw new Error(`Invalid ROR. Expected: ${Ror.validFormats}`);
  };
};

// GraphQL Scalar definition for an organization's ORCID
export const rorScalar = new GraphQLScalarType({
  name: 'Ror',
  description: 'An organization\'s ROR ID',

  serialize(ror) {
    if (ror instanceof Ror) {
      return { type: ror.type, identifier: ror.identifier};
    }
    throw Error('GraphQL Ror Scalar serializer expected an `Ror` object');
  },

  parseValue(value) {
    if (typeof value === 'string') {
      return new Ror(value);
    }
    throw new Error(`GraphQL Ror Scalar expected a string in the ${Ror.validFormats} formats`);
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      // Convert hard-coded AST string to string and then to Ror
      return new Ror(ast.value.toString());
    } else if (ast.kind === Kind.OBJECT) {
      return new Ror(ast.fields['identifier']);
    }
    // Invalid hard-coded value (not a string)
    return null;
  },
});
import { GraphQLScalarType, Kind } from "graphql";

// Regex to validate a 32-character hex string
const MD5_REGEX = /^[a-fA-F0-9]{32}$/;

const parseMd5 = (md5String) => {
  if (typeof md5String === "string" && MD5_REGEX.test(md5String)) {
    return Buffer.from(md5String, "hex");
  }
  throw new Error("Invalid MD5 hash format. Must be a 32-character hex string.");
};

export const md5Scalar = new GraphQLScalarType({
  name: "MD5",
  description: "An MD5 hash, represented as a 32-character hexadecimal string.",

  // Converts MySQL Buffer representation to a string for JSON
  serialize(value) {
    // If we already have an MD5 string, return it
    if (typeof value === "string" && MD5_REGEX.test(value)) {
      return value;
    }

    // mysql2 returns binary data in this format: base64:type254:xMpCOKC5I4INzFCab3WEmw==
    // convert to Buffer and then to hex string
    if (typeof value === 'string' && value.startsWith('base64:type')) {
      const parts = value.split(":");
      return Buffer.from(parts[parts.length - 1], "base64").toString("hex");
    }

    // If we have a Buffer, then convert to hex
    if (Buffer.isBuffer(value)) {
      return value.toString("hex");
    }

    throw new Error("MD5Scalar could not serialise value.");
  },

  // Converts string representation to a Buffer for MySQL
  parseValue(value) {
    return parseMd5(value);
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return parseMd5(ast.value);
    }
    throw new Error("MD5 hash must be a string literal");
  },
});

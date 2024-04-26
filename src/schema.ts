import gql from "graphql-tag";

import fs from 'fs';
import path from 'path';

export const typeDefs = gql`
  ${fs.readFileSync(path.resolve(__dirname, "./schemas/*.graphql").toString())}
`;

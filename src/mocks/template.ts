import casual from "casual";
import { Visibility } from "../models/Template";

export const data = [
  {
    id: casual.integer(1, 9999),
    name: casual.sentence,
    // ownerId: 123
    // affiliationId": "http://example.com/orgs/123",
    visibility: casual.integer(0, 1) == 1 ? Visibility.Private : Visibility.Public,
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    modified: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    currentVersion: `v${casual.integer(1, 99)}`,
    isDirty: true,
  },
  {
    id: casual.integer(1, 9999),
    name: casual.sentence,
    // ownerId: 123
    // affiliationId": "http://example.com/orgs/123",
    visibility: casual.integer(0, 1) == 1 ? Visibility.Private : Visibility.Public,
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    modified: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    currentVersion: `v${casual.integer(1, 99)}`,
    isDirty: false,
  },
  {
    id: casual.integer(1, 9999),
    name: casual.sentence,
    // ownerId: 123
    // affiliationId": "http://example.com/orgs/123",
    visibility: casual.integer(0, 1) == 1 ? Visibility.Private : Visibility.Public,
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    modified: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    isDirty: true,
  },
  {
    id: casual.integer(1, 9999),
    name: casual.sentence,
    // ownerId: 123
    // affiliationId": "http://example.com/orgs/123",
    visibility: casual.integer(0, 1) == 1 ? Visibility.Private : Visibility.Public,
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    modified: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    currentVersion: `v${casual.integer(1, 99)}`,
    isDirty: false,
  }
];

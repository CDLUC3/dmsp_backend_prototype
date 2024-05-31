import { Resolvers } from "../types";
import { MockMySQLTable } from './MockMySQLTable';

// Seed records for the ContributorRoles table
const mockItems = [
  {
    id: '1',
    givenName: 'Mose',
    surName: 'Allison',
    email: 'mose@example.com',
    role: 'RESEARCHER'
  },
  {
    id: '2',
    givenName: 'Paul',
    surName: 'Desmond',
    email: 'paul@example.com',
    role: 'ADMIN'
  },
  {
    id: '3',
    givenName: 'Nina',
    surName: 'Simone',
    email: 'nina@example.com',
    role: 'SUPER'
  },
];

export const mockStore = new MockMySQLTable(mockItems);

export const resolvers: Resolvers = {
  Query: {
    me: (_, __, { mockStores }) => {
      return mockStores.users.randomItem();
    },
    users: (_, __, { mockStores }) => {
      return mockStores.users.items();
    },
  },
}

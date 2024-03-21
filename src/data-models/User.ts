
const ROLES = <const>["user", "admin", "super-admin"];

export interface User {
  // PK: string;
  // SK: string;
  id: string;
  email: string;
  password: string;
  givenName: string;
  surname: string;
  role: string;
  // modified: string;
  created: string;
  lastSignIn: string;

  token: string;
}

const users: Array<User>= [
  {
    token: 'Bearer iuerhgfuy-eg93th93ht34',
    id: '1',
    givenName: 'Maurice',
    surname: 'Moss',
    email: 'maurice@moss.com',
    password: 'abcdefg',
    created: '2024-03-21',
    lastSignIn: '2024-03-21',
    role: 'admin'
  },
  {
    token: '837465786134859635',
    id: '2',
    givenName: 'Roy',
    surname: 'Trenneman',
    email: 'roy@trenneman.com',
    password: 'imroy',
    created: '2024-03-11',
    lastSignIn: '2024-03-21',
    role: 'user'
  }
];

export const User = {
  getAll: () => {
    return users;
  },
  getByToken: (token: String) => {
    return users.find(item => item.token === token);
  },
  addUser: (user: User) => {
    users.push(user);
  }
};

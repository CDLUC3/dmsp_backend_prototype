import casual from 'casual';

export const mock = {
  // User account mock
  User: () => ({
    id: casual.integer(1, 10000),
    givenName: casual.first_name,
    surName: casual.last_name,
    email: casual.email,
    role: casual.integer(0, 1) == 1 ? 'ADMIN' : 'RESEARCHER'
  }),
};

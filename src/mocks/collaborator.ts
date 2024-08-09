import casual from "casual";

export const data = [
  {
    email: casual.email,
    invitedById: casual.integer(1, 999),
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    userId: casual.integer(1, 999),
  },
  {
    email: casual.email,
    invitedById: casual.integer(1, 999),
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
  },
  {
    email: casual.email,
    invitedById: casual.integer(1, 999),
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    userId: casual.integer(1, 999),
  },
  {
    email: casual.email,
    invitedById: casual.integer(1, 999),
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
  },
];

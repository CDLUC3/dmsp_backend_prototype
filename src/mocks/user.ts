import casual from "casual";

export const mockOrcid = () => {
  const id = `${casual.integer(1, 9999)}-${casual.integer(1, 9999)}-${casual.integer(1, 9999)}-${casual.integer(1, 9999)}`;
  return `https://orcid.org/${id}`;
}

export const data = [
  {
    givenName: casual.first_name,
    surName: casual.last_name,
    email: casual.email,
    affiliationId: casual.url,
    role: casual.integer(0, 1) == 1 ? 'Admin' : 'Researcher',
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    modified: new Date(casual.date('YYYY-MM-DD')).toISOString(),
  },
  {
    givenName: casual.first_name,
    surName: casual.last_name,
    email: casual.email,
    affiliationId: casual.url,
    orcid: mockOrcid(),
    role: casual.integer(0, 1) == 1 ? 'Admin' : 'Researcher',
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    modified: new Date(casual.date('YYYY-MM-DD')).toISOString(),
  },
  {
    givenName: casual.first_name,
    surName: casual.last_name,
    email: casual.email,
    affiliationId: casual.url,
    role: casual.integer(0, 1) == 1 ? 'Admin' : 'Researcher',
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    modified: new Date(casual.date('YYYY-MM-DD')).toISOString(),
  },
  {
    givenName: casual.first_name,
    surName: casual.last_name,
    email: casual.email,
    affiliationId: casual.url,
    orcid: mockOrcid(),
    role: casual.integer(0, 1) == 1 ? 'Admin' : 'Researcher',
    created: new Date(casual.date('YYYY-MM-DD')).toISOString(),
    modified: new Date(casual.date('YYYY-MM-DD')).toISOString(),
  },
];

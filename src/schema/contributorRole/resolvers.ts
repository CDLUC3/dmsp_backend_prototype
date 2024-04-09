import DataSource from "../../data-sources/PostgresDBSource.js";

// TODO: Have a read through the FullStack example and change up the way all of this is done
//       https://www.apollographql.com/tutorials/fullstack-quickstart/03-connecting-to-data-sources

interface ContributorRole {
  id: string;
  url: string;
  label: string;
  description: string;
  created: string;
  modified: string;
}

type ContributorRoleAddArgs = {
  url: string;
  label: string;
  description: string;
};

type ContributorRoleUpdateArgs = {
  id: string;
  url: string;
  label: string;
  description: string;
}

type ContributorRoleRemoveArgs = {
  id: string;
}

function getContributorRoles(): Promise<ContributorRole> {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM contributor_roles ORDER BY label';
    DataSource.query(query, [])
              .then(result => resolve(result.rows))
              .catch(error => reject(error));
  });
}

function getContributorRoleByUrl(url: string): Promise<ContributorRole> {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM contributor_roles WHERE url = $1';
    DataSource.query(query, [url])
              .then(result => resolve(result.rows[0]))
              .catch(error => reject(error));
  });
}

function getContributorRoleById(id: string): Promise<ContributorRole> {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM contributor_roles WHERE id = $1';
    DataSource.query(query, [id])
              .then(result => resolve(result.rows[0]))
              .catch(error => reject(error));
  });
}

// Add a new ContributorRecord
function addContributorRole(args: ContributorRoleAddArgs): Promise<ContributorRole> {
  return new Promise((resolve, reject) => {
    const newRecordId = DataSource.generateRecordId();
    const tstamp = DataSource.generateTimestamp();
    const query = `
      INSERT INTO contributor_roles (id, url, label, description, created, modified)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    DataSource.query(query, [newRecordId, args.url, args.label, args.description, tstamp, tstamp])
              .then(_results => resolve(getContributorRoleByUrl(args.url)))
              .catch(error => reject(error));
  });
}

function updateContributorRoleLabel(id: string, label: string): Promise<ContributorRole> {
  return new Promise((resolve, reject) => {
    const tstamp = DataSource.generateTimestamp();
    if (label) {
      const query = 'UPDATE contributor_roles SET label = $1, modified = $2 WHERE id = $3';
      DataSource.query(query, [label, tstamp, id])
                .then(results => resolve(results))
                .catch(error => reject(error));
    } else {
      reject('Label cannot be blank')
    }
  });
}

function updateContributorRoleUrl(id: string, url: string): Promise<ContributorRole> {
  return new Promise((resolve, reject) => {
    const tstamp = DataSource.generateTimestamp();
    if (url) {
      const query = 'UPDATE contributor_roles SET url = $1, modified = $2 WHERE id = $3';
      DataSource.query(query, [url, tstamp, id])
                .then(results => resolve(results))
                .catch(error => reject(error));
    } else {
      reject('URL cannot be blank')
    }
  });
}

function updateContributorRoleDescription(id: string, description: string): Promise<ContributorRole> {
  return new Promise((resolve, reject) => {
    const tstamp = DataSource.generateTimestamp();
    const query = 'UPDATE contributor_roles SET description = $1, modified = $2 WHERE id = $3';
    DataSource.query(query, [description, tstamp, id])
              .then(results => resolve(results))
              .catch(error => reject(error));
  });
}

function removeContributorRole(id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM contributor_roles WHERE id = $1 RETURNING *';
    DataSource.query(query, [id])
              .then(_results => {
                console.log(_results);
                resolve(true)
              })
              .catch(error => reject(error));
  });
}

const Resolver = {
  Query: {
    contributorRoles: async () => {
      try {
        return await getContributorRoles();
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch the list of contributor roles');
      }
    },
    contributorRoleById: async (_: any, { id }: { id: string }) => {
      try {
        return await getContributorRoleById(id);
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch contributor role');
      }
    },
    contributorRoleByUrl: async (_: any, { url }: { url: string }) => {
      try {
        return await getContributorRoleByUrl(url);
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch contributor role');
      }
    },
  },

  Mutation: {
    addContributorRole: async (_: any, { url, label, description }: ContributorRoleAddArgs): Promise<ContributorRole | null> => {
      try {
        return await addContributorRole({ url, label, description });
      } catch (error) {
        throw new Error(`Failed to add the contributor role: ${error}`);
      }
    },
    updateContributorRole: async (_: any, { id, url, label, description }: ContributorRoleUpdateArgs): Promise<ContributorRole | null> => {
      try {
        if (!url && !label && !description) {
          throw new Error('Cannot set URL and/or label to a null value!');
        }

        // This is inefficent, a generic method to examine each arg and set it based on it's present or 'null'
        // would be better
        if (url) {
          await updateContributorRoleUrl(id, url);
        }
        if (label) {
          await updateContributorRoleLabel(id, label);
        }
        if (description) {
          await updateContributorRoleDescription(id, description);
        }
        return await getContributorRoleById(id);
      } catch (error) {
        throw new Error(`Failed to update the contributor role: ${error}`);
      }
    },
    removeContributorRole: async (_: any, { id }: ContributorRoleRemoveArgs): Promise<boolean | false> => {
      try {
        return await removeContributorRole(id);
      } catch (error) {
        throw new Error(`Failed to remove the contributor role: ${error}`);
      }
    },
  },
};

export default Resolver;

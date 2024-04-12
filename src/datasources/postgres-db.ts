import { SQLDataSource } from 'datasource-sql';
import { ContributorRole } from '../models/ContributorRoleModel';

/**
 * TODO: Investigate caching
 */
export class PostgresDB extends SQLDataSource {
  getContributorRoles() {
    return this.knex.select<ContributorRole[]>("*").from("contributor_roles");
  }

  getContributorRoleById(contributorRoleId: string) {
    return this.knex.select<ContributorRole>("*").where({ id: contributorRoleId });
  }

  getContributorRoleByURL(contributorRoleURL: string) {
    return this.knex.select<ContributorRole>("*").where({ url: contributorRoleURL });
  }
}

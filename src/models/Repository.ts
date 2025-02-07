import { MyContext } from "../context";
import { formatLogMessage } from "../logger";
import { randomHex, validateURL } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";
import { ResearchDomain } from "./ResearchDomain";

export const DEFAULT_DMPTOOL_REPOSITORY_URL = 'https://dmptool.org/repositories/';;

export enum RepositoryType {
  GENERALIST = 'GENERALIST',        // A general purpose repository to store any output type (e.g. Dryad, Zenodo)
  DISCIPLINARY = 'DISCIPLINARY',    // A repository that stores discipline specific output (e.g. genomes, DNA)
  INSTITUTIONAL = 'INSTITUTIONAL',  // A repository owned and managed by a specific institution (e.g. UC, Stanford)
}

export class Repository extends MySqlModel {
  public name: string;
  public uri: string;
  public description?: string;
  public website?: string;
  public researchDomains: ResearchDomain[];
  public repositoryTypes: RepositoryType[];
  public keywords: string[];

  private tableName = 'repositories';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById);

    this.id = options.id;
    this.name = options.name;
    this.uri = options.uri;
    this.description = options.description;
    this.website = options.website;
    this.researchDomains = options.researchDomains ?? [];
    this.repositoryTypes = options.repositoryTypes ?? [];
    this.keywords = options.keywords ?? [];
  }

  // Validation to be used prior to saving the record
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.name) this.addError('name', 'Name can\'t be blank');
    if (!validateURL(this.uri)) this.addError('uri', 'Invalid URL');
    if (this.website && !validateURL(this.website)) this.addError('website', 'Invalid website format');

    return Object.keys(this.errors).length === 0;
  }

  // Ensure data integrity
  prepForSave(): void {
    if (!Array.isArray(this.researchDomains)) {
      this.researchDomains = []
    }
    if (!Array.isArray(this.repositoryTypes)) {
      this.repositoryTypes = []
    }
    if (!Array.isArray(this.keywords)) {
      this.keywords = []
    }
    // Remove leading/trailing blank spaces
    this.name = this.name?.trim();
    this.uri = this.uri?.trim();
    this.description = this.description?.trim();
    this.website = this.website?.trim();

    // make sure all keywords are lower cased and trimmed
    this.keywords = this.keywords.filter((item) => item).map((entry) => entry.toLowerCase().trim());
  }

  // Some of the properties are stored as JSON strings in the DB so we need to parse them
  // after fetching them
  static processResult(repository: Repository): Repository {
    if (repository?.keywords && typeof repository.keywords === 'string') {
      repository.keywords = JSON.parse(repository.keywords);
    }
    return repository;
  }

  //Create a new Repository
  async create(context: MyContext): Promise<Repository> {
    const reference = 'Repository.create';

    // If no URI is present, then use the DMP Tool's default URI
    if (!this.uri) {
      this.uri = `${DEFAULT_DMPTOOL_REPOSITORY_URL}${randomHex(6)}`;
    }

    // First make sure the record is valid
    if (await this.isValid()) {
      let current = await Repository.findByURI(reference, context, this.uri);
      if (!current) {
        current = await Repository.findByName(reference, context, this.name.toString());
      }

      // Then make sure it doesn't already exist
      if (current) {
        this.addError('general', 'Repository already exists');
      } else {
        // Save the record and then fetch it
        const newId = await Repository.insert(context, this.tableName, this, reference, ['researchDomains']);
        const response = await Repository.findById(reference, context, newId);
        return response;
      }
    }
    // Otherwise return as-is with all the errors
    return this;
  }

  //Update an existing Repository
  async update(context: MyContext, noTouch = false): Promise<Repository> {
    const id = this.id;

    if (await this.isValid()) {
      if (id) {
        await Repository.update(context, this.tableName, this, 'Repository.update', ['researchDomains'], noTouch);
        return await Repository.findById('Repository.update', context, id);
      }
      // This template has never been saved before so we cannot update it!
      this.addError('general', 'Repository has never been saved');
    }
    return this;
  }

  //Delete the Repository
  async delete(context: MyContext): Promise<Repository> {
    if (this.id) {
      const deleted = await Repository.findById('Repository.delete', context, this.id);

      const successfullyDeleted = await Repository.delete(
        context,
        this.tableName,
        this.id,
        'Repository.delete'
      );
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
  }

  // Add this Repository to a ProjectOutput
  async addToProjectOutput(context: MyContext, projectOutputId: number): Promise<boolean> {
    const reference = 'Repository.addToProjectOutput';
    let sql = 'INSERT INTO projectOutputRepositories (repositoryId, projectOutputId, createdById,';
    sql += 'modifiedById) VALUES (?, ?, ?, ?)';
    const userId = context.token?.id?.toString();
    const vals = [this.id?.toString(), projectOutputId?.toString(), userId, userId];
    const results = await Repository.query(context, sql, vals, reference);

    if (!results) {
      const payload = { researchDomainId: this.id, projectOutputId };
      const msg = 'Unable to add the repository to the project output';
      formatLogMessage(context).error(payload, `${reference} - ${msg}`);
      return false;
    }
    return true;
  }

  // Remove this Repository from a ProjectOutput
  async removeFromProjectOutput(context: MyContext, projectOutputId: number): Promise<boolean> {
    const reference = 'Repository.removeFromProjectOutput';
    const sql = 'DELETE FROM projectOutputRepositories WHERE repositoryId = ? AND projectOutputId = ?';
    const vals = [this.id?.toString(), projectOutputId?.toString()];
    const results = await Repository.query(context, sql, vals, reference);

    if (!results) {
      const payload = { researchDomainId: this.id, projectOutputId };
      const msg = 'Unable to remove the repository from the project output';
      formatLogMessage(context).error(payload, `${reference} - ${msg}`);
      return false;
    }
    return true;
  }

  // Search for Repositories
  static async search(
    reference: string,
    context: MyContext,
    term: string,
    researchDomainId: number,
    repositoryType: RepositoryType
  ): Promise<Repository[]> {
    const searchTerm = (term ?? '');
    const qryVal = `%${searchTerm?.toLowerCase()?.trim()}%`;

    let sql = 'SELECT * FROM repositories WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? ';
    sql += 'OR keywords LIKE ?';

    const vals = [qryVal, qryVal, qryVal];
    if (repositoryType) {
      sql = `${sql} AND JSON_CONTAINS(repositoryTypes, ?, '$')`;
      vals.push(repositoryType);
    }

    const results = await Repository.query(context, `${sql} ORDER BY name`, vals, reference);

    // Apply any filters
    if (Array.isArray(results) && researchDomainId) {
      const repos = await Repository.findByResearchDomainId(
        reference,
        context,
        researchDomainId
      );
      if (repos) {
        const repoIds = repos.map((repo) => repo.id);
        return results.filter((repo) => repoIds.includes(repo.id))
      }
    }

    // No need to reinitialize all of the results to objects here because they're just search results
    if (Array.isArray(results) && results.length !== 0){
      return results.map((res) => Repository.processResult(res))
    }
    return [];
  }

  // Fetch a Repository by it's id
  static async findById(reference: string, context: MyContext, repositoryId: number): Promise<Repository> {
    const sql = `SELECT * FROM repositories WHERE id = ?`;
    const results = await Repository.query(context, sql, [repositoryId?.toString()], reference);
    if (Array.isArray(results) && results.length !== 0){
      return Repository.processResult(new Repository(results[0]));
    }
    return null;
  }

  static async findByURI(reference: string, context: MyContext, uri: string): Promise<Repository> {
    const sql = `SELECT * FROM repositories WHERE uri = ?`;
    const results = await Repository.query(context, sql, [uri], reference);
    if (Array.isArray(results) && results.length !== 0){
      return Repository.processResult(new Repository(results[0]));
    }
    return null;
  }

  static async findByName(reference: string, context: MyContext, name: string): Promise<Repository> {
    const sql = `SELECT * FROM repositories WHERE LOWER(name) = ?`;
    const searchTerm = (name ?? '');
    const results = await Repository.query(context, sql, [searchTerm?.toLowerCase()?.trim()], reference);
    if (Array.isArray(results) && results.length !== 0){
      return Repository.processResult(new Repository(results[0]));
    }
    return null;
  }

  // Fetch all of the Repositories associated with a ResearchDomain
  static async findByResearchDomainId(
    reference: string,
    context: MyContext,
    researchDomainId: number
  ): Promise<Repository[]> {
    const sql = 'SELECT r.* FROM repositories r';
    const joinClause = 'INNER JOIN repositoryResearchDomains rrd ON r.id = rrd.repositoryId';
    const whereClause = 'WHERE rrd.researchDomainId = ?';
    const vals = [researchDomainId?.toString()];
    const results = await Repository.query(context, `${sql} ${joinClause} ${whereClause}`, vals, reference);
    // No need to reinitialize all of the results to objects here because they're just search results
    if (Array.isArray(results) && results.length !== 0){
      return results.map((res) => Repository.processResult(res))
    }
    return [];
  }

  // Fetch all of the Repositories associated with a ProjectOutput
  static async findByProjectOutputId(
    reference: string,
    context: MyContext,
    projectOutputId: number
  ): Promise<Repository[]> {
    const sql = 'SELECT r.* FROM repositories r';
    const joinClause = 'INNER JOIN projectOutputRepositories por ON r.id = por.repositoryId';
    const whereClause = 'WHERE por.projectOutputId = ?';
    const vals = [projectOutputId?.toString()];

    const results = await Repository.query(context, `${sql} ${joinClause} ${whereClause}`, vals, reference);
    // No need to reinitialize all of the results to objects here because they're just search results
    if (Array.isArray(results) && results.length !== 0){
      return results.map((res) => Repository.processResult(res))
    }
    return [];
  }
};

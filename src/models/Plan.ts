
// Represents an entry from the projectPlans table

import { MyContext } from "../context";
import { DMPStatus, DMPVisibility } from "./DMP";
import { MySqlModel } from "./MySqlModel";

// A high level overview of a plan
export class PlanSearchResult {
  public id: number;
  public createdBy: string;
  public created: string;
  public modifiedBy: string;
  public modified: string;
  public versionedTemplateId: number;
  public title: string;
  public status: DMPStatus;
  public visibility: DMPVisibility;
  public dmpId: string;
  public registeredBy: string;
  public registered: string;
  public featured: boolean;
  public funder: string;
  public contributors: string[];

  constructor(options) {
    this.id = options.id;
    this.createdBy = options.createdBy;
    this.created = options.created;
    this.modifiedBy = options.modifiedBy;
    this.modified = options.modified;
    this.versionedTemplateId = options.versionedTemplateId;
    this.title = options.title;
    this.status = options.status ?? DMPStatus.DRAFT;
    this.visibility = options.visibility ?? DMPVisibility.PRIVATE;
    this.dmpId = options.dmpId;
    this.registeredBy = options.registeredBy;
    this.registered = options.registered;
    this.featured = options.featured ?? false;
    this.funder = options.funder;
    this.contributors = options.contributors ?? [];
  }

  // Find all of the high level details about the plans for a project
  static async findByProjectId(reference: string, context: MyContext, projectId: number): Promise<PlanSearchResult[]> {
    const sql = 'SELECT plans.id id, ' +
                'CONCAT(users.givenName, CONCAT(\' \', users.surName)) createdBy, plans.created created ' +
                'CONCAT(users2.givenName, CONCAT(\' \', users2.surName)) modifiedBy, plans.modified modified ' +
                'versionedTemplates.id versionedTemplateId, versionedTemplates.name title ' +
                'plans.status status, plans.visibility visibility, plans.dmpId dmpId ' +
                'CONCAT(users3.givenName, CONCAT(\' \', users3.surName)) registeredBy, plans.registered registered ' +
                'plans.featured featured ' +
                'GROUP_CONCAT(DISTINCT CONCAT(contributors.givenName, CONCAT(\' \', contributors.surName, CONCAT(\' (\', CONCAT(roles.label, \')\'))))) contributors ' +
                'GROUP_CONCAT(DISTINCT funders.name) funder ' +
              'FROM plans ' +
                'LEFT JOIN users ON users.id = plans.createdById ' +
                'LEFT JOIN users users2 ON users2.id = plans.modifiedById ' +
                'LEFT JOIN users users3 ON users3.id = plans.registeredById ' +
                'LEFT JOIN versionedTemplates ON versionedTemplates.id = plans.versionedTemplateId ' +
                'LEFT JOIN planContributors ON planContributors.planId = plans.id ' +
                  'LEFT JOIN projectContributors contributors ON contributors.id = planContributors.projectContributorId ' +
                  'LEFT JOIN planContributorRoles ON planContributors.id = planContributorRoles.planContributorId ' +
                    'LEFT JOIN contributorRoles roles ON planContributorRoles.contributorRoleId = roles.id ' +
                'LEFT JOIN planFunders ON planFunders.planId = plans.id ' +
                  'LEFT JOIN projectFunders ON projectFunders.id = planFunders.projectFunderId ' +
                    'LEFT JOIN affiliations funders ON projectFunders.affiliationId = funders.uri ' +
              'WHERE projectId = ? ' +
              'GROUP BY plans.id, users.givenName, users.surName, users2.givenName, users2.surName, ' +
                'versionedTemplates.id, versionedTemplates.name, plans.status, plans.visibility, ' +
                'plans.dmpId, users3.givenName, users3.surName, plans.registered, plans.featured ' +
              'ORDER BY plans.created DESC;';
    const results = await Plan.query(context, sql, [projectId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new PlanSearchResult(entry)) : [];
  }
}

// A DMP/Plan
export class Plan extends MySqlModel {
  public projectId: number;
  public versionedTemplateId: number;
  public dmpId: string;
  public status: DMPStatus;
  public visibility: DMPVisibility;
  public registeredById: number;
  public registered: string;
  public languageId: string;
  public featured: boolean;
  public lastSynced: string;

  private static tableName = 'plans';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.projectId = options.projectId;
    this.versionedTemplateId = options.versionedTemplateId;

    this.dmpId = options.dmpId;
    this.status = options.status ?? DMPStatus.DRAFT;
    this.visibility = options.visibility ?? DMPVisibility.PRIVATE;
    this.languageId = options.languageId ?? 'en-US';
    this.featured = options.featured ?? false;
    this.registeredById = options.registeredById;
    this.registered = options.registered;
    this.lastSynced = options.lastSynced;
  }

  // Make sure the plan is valid
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.projectId) this.addError('projectId', 'Project can\'t be blank');
    if (!this.versionedTemplateId) this.addError('versionedTemplateId', 'Versioned template can\'t be blank');
    if (!this.dmpId) this.addError('dmpId', 'DMP ID can\'t be blank');

    return Object.keys(this.errors).length === 0;
  }

  // Find the plan by its id
  static async findById(reference: string, context: MyContext, planId: number): Promise<Plan | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const results = await Plan.query(context, sql, [planId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Find the plan by its DMP ID
  static async findByDMPId(reference: string, context: MyContext, dmpId: string): Promise<Plan | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE dmpId = ?`;
    const results = await Plan.query(context, sql, [dmpId?.toString()], reference);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  // Find all of the plans for a project
  static async findByProjectId(reference: string, context: MyContext, projectId: number): Promise<Plan[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE projectId = ?`;
    const results = await Plan.query(context, sql, [projectId?.toString()], reference);
    return Array.isArray(results) ? results : [];
  }
}

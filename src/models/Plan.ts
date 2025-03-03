
// Represents an entry from the projectPlans table

import { MyContext } from "../context";
import { MySqlModel } from "./MySqlModel";

export enum PlanStatus {
  DRAFT = 'DRAFT',
  COMPLETE = 'COMPLETE',
  PUBLISHED = 'PUBLISHED',
}

export enum PlanVisibility {
  ORGANIZATIONAL = 'ORGANIZATIONAL',
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

// A high level overview of a plan
export class PlanSearchResult {
  public id: number;
  public createdBy: string;
  public created: string;
  public modifiedBy: string;
  public modified: string;
  public title: string;
  public status: PlanStatus;
  public visibility: PlanVisibility;
  public dmpId: string;
  public registeredBy: string;
  public registered: string;
  public featured: boolean;
  public funder: string;
  public contributors: string;
  public templateTitle: string;

  constructor(options) {
    this.id = options.id;
    this.createdBy = options.createdBy;
    this.created = options.created;
    this.modifiedBy = options.modifiedBy;
    this.modified = options.modified;
    this.title = options.title;
    this.status = options.status ?? PlanStatus.DRAFT;
    this.visibility = options.visibility ?? PlanVisibility.PRIVATE;
    this.dmpId = options.dmpId;
    this.registeredBy = options.registeredBy;
    this.registered = options.registered;
    this.featured = options.featured ?? false;
    this.funder = options.funder;
    this.contributors = options.contributors;
    this.templateTitle = options.title;
  }

  // Find all of the high level details about the plans for a project
  static async findByProjectId(reference: string, context: MyContext, projectId: number): Promise<PlanSearchResult[]> {
    const sql = 'SELECT p.id, ' +
                'CONCAT(cu.givenName, CONCAT(\' \', cu.surName)) createdBy, p.created, ' +
                'CONCAT(cm.givenName, CONCAT(\' \', cm.surName)) modifiedBy, p.modified, ' +
                'p.versionedTemplateId, vt.name title, p.status, p.visibility, p.dmpId, ' +
                'CONCAT(cr.givenName, CONCAT(\' \', cr.surName)) registeredBy, p.registered, p.featured, ' +
                'GROUP_CONCAT(DISTINCT CONCAT(prc.givenName, CONCAT(\' \', prc.surName, ' +
                  'CONCAT(\' (\', CONCAT(r.label, \')\'))))) contributors, ' +
                'GROUP_CONCAT(DISTINCT funders.name) funder ' +
              'FROM plans p ' +
                'LEFT JOIN users cu ON cu.id = p.createdById ' +
                'LEFT JOIN users cm ON cm.id = p.modifiedById ' +
                'LEFT JOIN users cr ON cr.id = p.registeredById ' +
                'LEFT JOIN versionedTemplates vt ON vt.id = p.versionedTemplateId ' +
                'LEFT JOIN planContributors plc ON plc.planId = p.id ' +
                  'LEFT JOIN projectContributors prc ON prc.id = plc.projectContributorId ' +
                  'LEFT JOIN planContributorRoles plcr ON plc.id = plcr.planContributorId ' +
                    'LEFT JOIN contributorRoles r ON plcr.contributorRoleId = r.id ' +
                'LEFT JOIN planFunders ON planFunders.planId = p.id ' +
                  'LEFT JOIN projectFunders ON projectFunders.id = planFunders.projectFunderId ' +
                    'LEFT JOIN affiliations funders ON projectFunders.affiliationId = funders.uri ' +
              'WHERE p.projectId = ? ' +
              'GROUP BY p.id, cu.givenName, cu.surName, cm.givenName, cm.surName, ' +
                'vt.id, vt.name, p.status, p.visibility, ' +
                'p.dmpId, cr.givenName, cr.surName, p.registered, p.featured ' +
              'ORDER BY p.created DESC;';
    const results = await Plan.query(context, sql, [projectId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new PlanSearchResult(entry)) : [];
  }
}

// Represents a high level snapshot of the progress that has been made on a section of the plan
export class PlanSectionProgress {
  public sectionId: number;
  public sectionTitle: string;
  public displayOrder: number;
  public totalQuestions: number;
  public answeredQuestions: number;

  constructor(options) {
    this.sectionId = options.sectionId;
    this.sectionTitle = options.sectionTitle;
    this.displayOrder = options.displayOrder;
    this.totalQuestions = options.totalQuestions;
    this.answeredQuestions = options.answeredQuestions;
  }

  // Return the progress information for a section on the plan
  static async findByPlanId(reference: string, context: MyContext, planId: number): Promise<PlanSectionProgress[]> {
    const sql = 'SELECT vs.id sectionId, vs.displayOrder, vs.name sectionTitle, ' +
                  'COUNT(DISTINCT vq.id) totalQuestions, ' +
                  'COUNT(DISTINCT CASE WHEN a.answerText IS NOT NULL THEN vs.id END) answeredQuestions ' +
                'FROM plans p ' +
                  'INNER JOIN versionedTemplates vt ON p.versionedTemplateId = vt.id ' +
                  'INNER JOIN versionedSections vs ON vt.id = vs.versionedTemplateId ' +
                  'LEFT JOIN versionedQuestions vq ON vs.id = vq.versionedSectionId ' +
                  'LEFT JOIN answers a ON p.id = a.planId AND vs.id = a.versionedSectionId ' +
                'WHERE p.id = ? ' +
                'GROUP BY vs.id, vs.displayOrder, vs.name ' +
                'ORDER BY vs.displayOrder;';
    const results = await Plan.query(context, sql, [planId?.toString()], reference);
    return Array.isArray(results) ? results.map((entry) => new PlanSectionProgress(entry)) : [];
  }
}


// A DMP/Plan
export class Plan extends MySqlModel {
  public projectId: number;
  public versionedTemplateId: number;
  public dmpId: string;
  public status: PlanStatus;
  public visibility: PlanVisibility;
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
    this.status = options.status ?? PlanStatus.DRAFT;
    this.visibility = options.visibility ?? PlanVisibility.PRIVATE;
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
    if (!this.dmpId && this.registered) this.addError('dmpId', 'A published plan must have a DMP ID');
    if (!this.registered && this.dmpId) this.addError('registered', 'A published plan must have a registration date');

    return Object.keys(this.errors).length === 0;
  }

  //Create a new Project
  async create(context: MyContext): Promise<Plan> {
    const reference = 'Project.create';

    // First make sure the record is valid
    if (await this.isValid()) {
      // Save the record and then fetch it
      const newId = await Plan.insert(context, Plan.tableName, this, reference);
      const response = await Plan.findById(reference, context, newId);
      return response;
    }
    // Otherwise return as-is with all the errors
    return new Plan(this);
  }

  //Update an existing Project
  async update(context: MyContext, noTouch = false): Promise<Plan> {
    const reference = 'Project.update';

    if (this.id) {
      if (await this.isValid()) {
        await Plan.update(context, Plan.tableName, this, reference, [], noTouch);
      }
    } else {
      // This plan has never been saved before so we cannot update it!
      this.addError('general', 'Plan has never been saved');
    }
    return new Plan(this);
  }

  //Delete the Project
  async delete(context: MyContext): Promise<Plan> {
    const reference = 'Project.delete';
    if (this.id) {
      const deleted = await Plan.findById(reference, context, this.id);

      const successfullyDeleted = await Plan.delete(context, Plan.tableName, this.id, reference);
      if (successfullyDeleted) {
        return deleted;
      } else {
        return null
      }
    }
    return null;
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

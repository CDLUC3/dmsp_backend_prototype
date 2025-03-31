// Represents an entry from the projectPlans table

import { generalConfig } from "../config/generalConfig";
import { MyContext } from "../context";
import { getCurrentDate, randomHex, valueIsEmpty } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";
import { addVersion, removeVersions, updateVersion } from "./PlanVersion";

export const DEFAULT_TEMPORARY_DMP_ID_PREFIX = 'temp-dmpId-';

export enum PlanStatus {
  ARCHIVED = 'ARCHIVED',
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
  public featured: boolean;
  public funder: string;
  public contributors: string;
  public templateTitle: string;

  // The following fields will only be set when the plan is published!
  public dmpId: string;
  public registeredBy: string;
  public registered: string;

  constructor(options) {
    this.id = options.id;
    this.createdBy = options.createdBy;
    this.created = options.created;
    this.modifiedBy = options.modifiedBy;
    this.modified = options.modified;
    this.title = options.title;
    this.status = options.status ?? PlanStatus.DRAFT;
    this.visibility = options.visibility ?? PlanVisibility.PRIVATE;
    this.featured = options.featured ?? false;
    this.funder = options.funder;
    this.contributors = options.contributors;
    this.templateTitle = options.title;

    this.dmpId = options.dmpId;
    this.registeredBy = options.registeredBy;
    this.registered = options.registered;
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

// A Data management plan
export class Plan extends MySqlModel {
  public projectId: number;
  public versionedTemplateId: number;
  public status: PlanStatus;
  public visibility: PlanVisibility;
  public languageId: string;
  public featured: boolean;

  // The following fields should only be set when the plan is published!
  public dmpId: string;
  public registeredById: number;
  public registered: string;

  private static tableName = 'plans';

  constructor(options) {
    super(options.id, options.created, options.createdById, options.modified, options.modifiedById, options.errors);

    this.projectId = options.projectId;
    this.versionedTemplateId = options.versionedTemplateId;

    this.status = options.status ?? PlanStatus.DRAFT;
    this.visibility = options.visibility ?? PlanVisibility.PRIVATE;
    this.languageId = options.languageId ?? 'en-US';
    this.featured = options.featured ?? false;

    this.dmpId = options.dmpId;
    this.registeredById = options.registeredById;
    this.registered = options.registered;
  }

  // Generate a new DMP ID
  async generateDMPId(context: MyContext): Promise<string> {
    // If the Plan already has a DMP ID, just return it
    if (!valueIsEmpty(this.dmpId)) return this.dmpId;

    const dmpIdPrefix = `${generalConfig.dmpIdBaseURL}${generalConfig.dmpIdShoulder}`;
    let id = randomHex(16);
    let i = 0;

    // Check if the ID already exists up to 5 times
    while (i < 5) {
      const dmpId = `${dmpIdPrefix}${id}`;
      const sql = `SELECT dmpId FROM ${Plan.tableName} WHERE dmpId = ?`;
      const results = await Plan.query(context, sql, [dmpId], 'Plan.generateDMPId');
      if (Array.isArray(results) && results.length <= 0) {
        return dmpId;
      }
      id = randomHex(16);
      i++;
    }
    return `${DEFAULT_TEMPORARY_DMP_ID_PREFIX}${id}`;
  }

  // Make sure the plan is valid
  async isValid(): Promise<boolean> {
    await super.isValid();

    if (!this.projectId) this.addError('projectId', 'Project can\'t be blank');
    if (!this.versionedTemplateId) this.addError('versionedTemplateId', 'Versioned template can\'t be blank');
    if (valueIsEmpty(this.dmpId) && !valueIsEmpty(this.registered)) {
      this.addError('dmpId', 'A published plan must have a DMP ID');
    }
    if (valueIsEmpty(this.registered) && this.status === PlanStatus.PUBLISHED) {
      this.addError('registered', 'A published plan must have a registration date');
    }

    return Object.keys(this.errors).length === 0;
  }

  // Publish the plan (register a DOI)
  async publish(context: MyContext): Promise<Plan> {
    if (this.id) {
      // Make sure the plan is valid
      if (await this.isValid()) {
        if (valueIsEmpty(this.dmpId) && valueIsEmpty(this.registered)) {
          // Generate a new DMP ID
          const dmpId = await this.generateDMPId(context);
          if (dmpId) {
            this.dmpId = dmpId;
            this.status = PlanStatus.PUBLISHED;
            this.registered = getCurrentDate();
            this.registeredById = context.token.id;

            // Update the plan
            return await this.update(context);

            // TODO: Eventually make a asyncronous call to EZID to register the DMP ID (DOI)

          } else {
            this.addError('dmpId', 'Unable to generate a DMP ID');
          }
        } else {
          this.addError('general', 'The plan is already registered');
        }
      }
    }
    // Otherwise return as-is with all the errors
    return new Plan(this);
  }

  //Create a new Plan
  async create(context: MyContext): Promise<Plan> {
    const reference = 'Plan.create';

    if (!this.id) {
      // First make sure the record is valid
      if (await this.isValid()) {
        // Create the new Plan
        const newId = await Plan.insert(context, Plan.tableName, this, reference);

        // Create the original version snapshot of the DMP
        if (newId) {
          let newPlan = await Plan.findById(reference, context, newId);
          if (newPlan && !newPlan.hasErrors()) {
            // Generate the version history of the DMP
            newPlan = await addVersion(context, newPlan, reference);
          }
          return new Plan(newPlan);
        }
      }
    }
    // Otherwise return as-is with all the errors
    return new Plan(this);
  }

  //Update an existing Plan
  async update(context: MyContext, noTouch = false): Promise<Plan> {
    const reference = 'Plan.update';

    if (this.id) {
      if (await this.isValid()) {
        // Update the plan
        const updated = await Plan.update(context, Plan.tableName, this, reference, [], noTouch);

        // Do not update any version info if the plan has not been modified or noTouch is true
        if (!noTouch && updated && !updated.hasErrors()) {
          // Update the version history of the DMP
          return await updateVersion(context, this, reference);
        }
      }
    } else {
      // This plan has never been saved before so we cannot update it!
      this.addError('general', 'Plan has never been saved');
    }
    return new Plan(this);
  }

  //Delete the Plan
  async delete(context: MyContext): Promise<Plan | null> {
    const reference = 'Plan.delete';
    if (this.id) {
      const toDelete = await Plan.findById(reference, context, this.id);

      if (toDelete) {
        // Delete the plan
        const successfullyDeleted = await Plan.delete(context, Plan.tableName, this.id, reference);
        if (successfullyDeleted) {
          return await removeVersions(context, this, reference);
        }
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

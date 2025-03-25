
// Represents an entry from the projectPlans table

import { generalConfig } from "../config/generalConfig";
import { MyContext } from "../context";
import { dynamo } from "../datasources/dynamo";
import { planToDMPCommonStandard } from "../services/commonStandardService";
import { DMPCommonStandard } from "../types/DMP";
import { getCurrentDate, randomHex, valueIsEmpty } from "../utils/helpers";
import { MySqlModel } from "./MySqlModel";

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

// A Data management plan
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
    if (!this.dmpId && this.status === PlanStatus.PUBLISHED) {
      this.addError('dmpId', 'A published plan must have a DMP ID');
    }
    if (!this.registered && this.status === PlanStatus.PUBLISHED) {
      this.addError('registered', 'A published plan must have a registration date');
    }

    return Object.keys(this.errors).length === 0;
  }

  // Comvert the Plan into the JSON RDA Common Metadata Standard for DMPs
  async toCommonStandard(context: MyContext, reference = 'Plan.toCommonStandard'): Promise<DMPCommonStandard> {
    // Convert the plan to the DMP Common Standard
    return await planToDMPCommonStandard(context, reference, this);
  }

  // Manage the version history of the DMP
  async generateVersion(context: MyContext, reference = 'Plan.generateVersion'): Promise<Plan> {
    // Convert the plan to the DMP Common Standard
    const commonStandard = await this.toCommonStandard(context, reference);
    if (!commonStandard) {
      this.addError('general', 'Unable to convert the plan to the DMP Common Standard');
      return new Plan(this);
    }

    // Fetch the latest version of the DMP
    const existingDMP = await dynamo.getDMP(this.dmpId, null);
    if (Array.isArray(existingDMP) && existingDMP.length > 0) {
      // If the lastSynced date is not within the last hour, create a new version snapshot
      const lastSynced = new Date(this.lastSynced);
      const now = new Date();
      // Calculate the difference in hours between the lastSynced and now
      const diff = Math.abs(now.getTime() - lastSynced.getTime()) / 36e5;
      // If the change happened more than one hour since the lastSync date then generate a version snapshot
      if (diff >= 1) {
        // Create the version snapshot
        const newVersion = await dynamo.createDMP(this.dmpId, existingDMP[0], existingDMP[0].modified);
        if (!newVersion) {
          this.addError('general', 'Unable to modify the version history of the DMP');
        }
      }

      // Update the the latest version of the DMP
      const updatedVersion = await dynamo.updateDMP(commonStandard);
      if (!updatedVersion) {
        this.addError('general', 'Unable to update the version history of the DMP');
      }

    } else {
      // This is the first time so create the initial version
      const firstVersion = await dynamo.createDMP(this.dmpId, commonStandard);
      if (!firstVersion) {
        this.addError('general', 'Unable to create the initial version of the DMP');
      }
    }

    if (!this.hasErrors()) {
      // Update the lastSync date if the version snapshot updates were successful
      this.lastSynced = getCurrentDate();
      this.update(context, true);
    }
    return new Plan(this);
  }

  //Create a new Plan
  async create(context: MyContext): Promise<Plan> {
    const reference = 'Plan.create';

    if (!this.id) {
      // First make sure the record is valid
      if (await this.isValid()) {
        // Assign the new DMP Id
        this.dmpId = await this.generateDMPId(context);

        // Create the new Plan
        const newId = await Plan.insert(context, Plan.tableName, this, reference);

        // Create the original version snapshot of the DMP
        if (newId) {
          const newPlan = await Plan.findById(reference, context, newId);
          if (newPlan && !newPlan.hasErrors()) {
            // Generate the version history of the DMP
            await newPlan.generateVersion(context, reference);
          }
          return newPlan;
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
          this.generateVersion(context, reference);
        }
      }
    } else {
      // This plan has never been saved before so we cannot update it!
      this.addError('general', 'Plan has never been saved');
    }
    return new Plan(this);
  }

  //Delete the Plan
  async delete(context: MyContext): Promise<Plan> {
    const reference = 'Plan.delete';
    if (this.id) {
      const deleted = await Plan.findById(reference, context, this.id);

      // Delete the plan
      const successfullyDeleted = await Plan.delete(context, Plan.tableName, this.id, reference);
      if (successfullyDeleted) {
        // If the plan was registered then tombstone the DMP otherwise delete it
        if (deleted.registered) {
          const tombstoned = await dynamo.tombstoneDMP(deleted.dmpId);
          if (!tombstoned) {
            this.addError('general', 'Unable to tombstone the DMP');
          }
        } else {
          await dynamo.deleteDMP(deleted.dmpId);
        }

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

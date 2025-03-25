import casual from "casual";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { getRandomEnumValue } from "../../__tests__/helpers";
import {
  DEFAULT_TEMPORARY_DMP_ID_PREFIX,
  Plan,
  PlanSearchResult,
  PlanSectionProgress,
  PlanStatus,
  PlanVisibility
} from "../Plan";
import { defaultLanguageId } from "../Language";
import { generalConfig } from "../../config/generalConfig";
import { dynamo } from "../../datasources/dynamo";
import { getCurrentDate } from "../../utils/helpers";

jest.mock('../../context.ts');

let context;
let commonStandard;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());

  commonStandard = {
    title: 'testTitle',
    created: '2025-03-20T07:51:43.000Z',
    modified: '2025-03-20T07:51:43.000Z',
    language: 'eng',
    ethical_issues_exist: 'unknown',
    dmphub_provenance_id: 'testProvenanceId',
    dmproadmap_featured: '0',
    dmproadmap_privacy: 'public',
    dmproadmap_status: 'draft',
    dmp_id: { identifier: 'testDmpId', type: 'other' },
    contact: {
      name: 'testContactName',
      mbox: 'testContactEmail',
      contact_id: { identifier: 'testContactId', type: 'other' }
    },
    project: [{
      title: 'testProjectTitle',
    }],
    dataset: [{
      title: 'testDatasetTitle',
      type: 'dataset',
      personal_data: 'unknown',
      sensitive_data: 'no',
      dataset_id: { identifier: 'testDatasetId', type: 'other' }
    }],
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('PlanSearchResult', () => {
  let searchResult;

  const searchResultData = {
    id: casual.integer(1, 99),
    versionedTemplateId: casual.integer(1, 99),
    title: casual.sentence,
    dmpId: casual.uuid,
    registeredBy: casual.full_name,
    registered: casual.date('YYYY-MM-DD'),
    funder: casual.company_name,
    contributors: [casual.full_name, casual.full_name],
    createdBy: casual.full_name,
    created: casual.date('YYYY-MM-DD'),
    modifiedBy: casual.full_name,
    modified: casual.date('YYYY-MM-DD'),
  }
  beforeEach(() => {
    searchResult = new PlanSearchResult(searchResultData);
  });

  it('should initialize options as expected', () => {
    expect(searchResult.id).toEqual(searchResultData.id);
    expect(searchResult.title).toEqual(searchResultData.title);
    expect(searchResult.dmpId).toEqual(searchResultData.dmpId);
    expect(searchResult.registered).toEqual(searchResultData.registered);
    expect(searchResult.registeredBy).toEqual(searchResultData.registeredBy);
    expect(searchResult.funder).toEqual(searchResultData.funder);
    expect(searchResult.createdBy).toEqual(searchResultData.createdBy);
    expect(searchResult.created).toEqual(searchResultData.created);
    expect(searchResult.modifiedBy).toEqual(searchResultData.modifiedBy);
    expect(searchResult.modified).toEqual(searchResultData.modified);
    expect(searchResult.featured).toBe(false);
    expect(searchResult.contributors).toEqual(searchResultData.contributors);
    expect(searchResult.status).toEqual(PlanStatus.DRAFT);
    expect(searchResult.visibility).toEqual(PlanVisibility.PRIVATE);
  });
});

describe('PlanSearchResult.findByProjectId', () => {
  const originalQuery = Plan.query;

  let localQuery;
  let planSearchResult;

  beforeEach(() => {
    localQuery = jest.fn();
    (Plan.query as jest.Mock) = localQuery;

    planSearchResult = new PlanSearchResult({
      id: casual.integer(1, 99),
      title: casual.sentence,
      dmpId: casual.uuid,
      registeredBy: casual.full_name,
      registered: casual.date('YYYY-MM-DD'),
      funder: casual.company_name,
      createdBy: casual.full_name,
      created: casual.date('YYYY-MM-DD'),
      modifiedBy: casual.full_name,
      modified: casual.date('YYYY-MM-DD'),
      featured: casual.boolean,
      contributors: [casual.full_name, casual.full_name],
      status: getRandomEnumValue(PlanStatus),
      visibility: getRandomEnumValue(PlanVisibility),
    });
  });

  afterEach(() => {
    Plan.query = originalQuery;
  });

  it('should call the correct SQL query', async () => {
    localQuery.mockResolvedValueOnce([planSearchResult]);
    const projectId = casual.integer(1, 99);
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
    const result = await PlanSearchResult.findByProjectId('testing', context, projectId);
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, sql, [projectId.toString()], 'testing')
    expect(result).toEqual([planSearchResult]);
  });

  it('should return an empty array if no results are found', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await PlanSearchResult.findByProjectId('testing', context, projectId);
    expect(result).toEqual([]);
  });
});

describe('PlanSectionProgress', () => {
  let progress;

  const progressData = {
    sectionId: casual.integer(1, 99),
    sectionTitle: casual.sentence,
    displayOrder: casual.integer(1, 9),
    totalQuestions: casual.integer(1, 9),
    answeredQuestions: casual.integer(1, 9),
  }
  beforeEach(() => {
    progress = new PlanSectionProgress(progressData);
  });

  it('should initialize options as expected', () => {
    expect(progress.sectionId).toEqual(progressData.sectionId);
    expect(progress.sectionTitle).toEqual(progressData.sectionTitle);
    expect(progress.displayOrder).toEqual(progressData.displayOrder);
    expect(progress.totalQuestions).toEqual(progressData.totalQuestions);
    expect(progress.answeredQuestions).toEqual(progressData.answeredQuestions);
  });
});

describe('PlanSectionProgress.findByPlanId', () => {
  const originalQuery = Plan.query;

  let localQuery;
  let progress;

  beforeEach(() => {
    localQuery = jest.fn();
    (Plan.query as jest.Mock) = localQuery;

    progress = new PlanSectionProgress({
      sectionId: casual.integer(1, 99),
      sectionTitle: casual.sentence,
      displayOrder: casual.integer(1, 9),
      totalQuestions: casual.integer(1, 9),
      answeredQuestions: casual.integer(1, 9),
    });
  });

  afterEach(() => {
    Plan.query = originalQuery;
  });

  it('should call the correct SQL query', async () => {
    localQuery.mockResolvedValueOnce([progress]);
    const planId = casual.integer(1, 99);
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
    const result = await PlanSectionProgress.findByPlanId('testing', context, planId);
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, sql, [planId.toString()], 'testing')
    expect(result).toEqual([progress]);
  });

  it('should return an empty array if no results are found', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await PlanSectionProgress.findByPlanId('testing', context, projectId);
    expect(result).toEqual([]);
  });
});

describe('Plan', () => {
  let plan;

  const planData = {
    projectId: casual.integer(1, 99),
    versionedTemplateId: casual.integer(1, 99),
    dmpId: casual.uuid,
    registeredById: casual.integer(1, 99),
    registered: casual.date('YYYY-MM-DD'),
    lastSynced: casual.date('YYYY-MM-DD'),
  }

  beforeEach(() => {
    plan = new Plan(planData);
  });

  it('should initialize options as expected', () => {
    expect(plan.projectId).toEqual(planData.projectId);
    expect(plan.versionedTemplateId).toEqual(planData.versionedTemplateId);
    expect(plan.dmpId).toEqual(planData.dmpId);
    expect(plan.registeredById).toEqual(planData.registeredById);
    expect(plan.registered).toEqual(planData.registered);
    expect(plan.lastSynced).toEqual(planData.lastSynced);
    expect(plan.featured).toEqual(false);
    expect(plan.status).toEqual(PlanStatus.DRAFT);
    expect(plan.visibility).toEqual(PlanVisibility.PRIVATE);
    expect(plan.languageId).toEqual(defaultLanguageId);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await plan.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the projectId field is missing', async () => {
    plan.projectId = null;
    expect(await plan.isValid()).toBe(false);
    expect(Object.keys(plan.errors).length).toBe(1);
    expect(plan.errors['projectId']).toBeTruthy();
  });

  it('should return false when calling isValid if the versionedTemplateId field is missing', async () => {
    plan.versionedTemplateId = null;
    expect(await plan.isValid()).toBe(false);
    expect(Object.keys(plan.errors).length).toBe(1);
    expect(plan.errors['versionedTemplateId']).toBeTruthy();
  });

  it('should return false when calling isValid if the dmpId field is missing and the status is PUBLISHED', async () => {
    plan.dmpId = null;
    plan.status = PlanStatus.PUBLISHED;
    expect(await plan.isValid()).toBe(false);
    expect(Object.keys(plan.errors).length).toBe(1);
    expect(plan.errors['dmpId']).toBeTruthy();
  });

  it('should return false when calling isValid if the registered field is missing and status is PUBLISHED', async () => {
    plan.registered = null;
    plan.status = PlanStatus.PUBLISHED;
    expect(await plan.isValid()).toBe(false);
    expect(Object.keys(plan.errors).length).toBe(1);
    expect(plan.errors['registered']).toBeTruthy();
  });

  it('generateDMPId should return the existing DMP Id', async () => {
    plan.dmpId = casual.uuid;

    const dmpId = await plan.generateDMPId(context);
    expect(dmpId).toEqual(plan.dmpId);
  });

  it('generateDMPId should generate a new DMP Id', async () => {
    plan.dmpId = null;
    jest.spyOn(Plan, 'query').mockResolvedValue([]);

    const dmpId = await plan.generateDMPId(context);
    expect(Plan.query).toHaveBeenCalledTimes(1);
    expect(dmpId.startsWith(`${generalConfig.dmpIdBaseURL}${generalConfig.dmpIdShoulder}`)).toBe(true);
  });

  it('generateDMPId should generate a DMP Id with the temporary prefix if unable to generate a unique DMP Id', async () => {
    plan.dmpId = null;
    jest.spyOn(Plan, 'query').mockResolvedValue([plan]);

    const dmpId = await plan.generateDMPId(context);
    expect(Plan.query).toHaveBeenCalledTimes(5);
    expect(dmpId.startsWith(DEFAULT_TEMPORARY_DMP_ID_PREFIX)).toBe(true);
  });
});

describe('findBy Queries', () => {
  const originalQuery = Plan.query;

  let localQuery;
  let plan;

  beforeEach(() => {
    localQuery = jest.fn();
    (Plan.query as jest.Mock) = localQuery;

    plan = new Plan({
      projectId: casual.integer(1, 99),
      versionedTemplateId: casual.integer(1, 99),
      dmpId: casual.uuid,
      registeredById: casual.integer(1, 99),
      registered: casual.date('YYYY-MM-DD'),
      lastSynced: casual.date('YYYY-MM-DD'),
      status: getRandomEnumValue(PlanStatus),
      visibility: getRandomEnumValue(PlanVisibility),
      languageId: defaultLanguageId,
      featured: casual.boolean,
      createdById: casual.integer(1, 99),
      modifiedById: casual.integer(1, 99),
      created: casual.date('YYYY-MM-DD'),
      modified: casual.date('YYYY-MM-DD'),
      id: casual.integer(1, 99),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    Plan.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([plan]);
    const planId = casual.integer(1, 999);
    const result = await Plan.findById('testing', context, planId);
    const expectedSql = 'SELECT * FROM plans WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [planId.toString()], 'testing')
    expect(result).toEqual(plan);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const planId = casual.integer(1, 999);
    const result = await Plan.findById('testing', context, planId);
    expect(result).toEqual(null);
  });

  it('findByDMPId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([plan]);
    const dmpId = casual.uuid;
    const result = await Plan.findByDMPId('testing', context, dmpId);
    const expectedSql = 'SELECT * FROM plans WHERE dmpId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [dmpId.toString()], 'testing')
    expect(result).toEqual(plan);
  });

  it('findByDMPId should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const dmpId = casual.uuid;
    const result = await Plan.findByDMPId('testing', context, dmpId);
    expect(result).toEqual(null);
  });

  it('findByProjectId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([plan]);
    const projectId = casual.integer(1, 999);
    const result = await Plan.findByProjectId('testing', context, projectId);
    const expectedSql = 'SELECT * FROM plans WHERE projectId = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString()], 'testing')
    expect(result).toEqual([plan]);
  });

  it('findByProjectId should return an empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await Plan.findByProjectId('testing', context, projectId);
    expect(result).toEqual([]);
  });
});

describe('generateVersion', () => {
  let plan;

  beforeEach(() => {
    plan = new Plan({
      projectId: casual.integer(1, 99),
      versionedTemplateId: casual.integer(1, 99),
      dmpId: casual.url,
      status: getRandomEnumValue(PlanStatus),
      visibility: getRandomEnumValue(PlanVisibility),
      registeredById: casual.integer(1, 99),
      registered: casual.date('YYYY-MM-DD'),
      lastSynced: '2025-01-01T00:00:00.000Z',
      languageId: defaultLanguageId,
      featured: casual.boolean,
    });
  });

  it('Fails if the Plan could not be converted to the DMP Common Standard', async () => {
    jest.spyOn(plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'toCommonStandard').mockResolvedValueOnce(null);
    jest.spyOn(dynamo, 'getDMP').mockResolvedValueOnce([]);
    jest.spyOn(dynamo, 'createDMP').mockResolvedValueOnce(null);
    jest.spyOn(dynamo, 'updateDMP').mockResolvedValueOnce(null);

    const result = await plan.generateVersion(context);
    expect(plan.update).toHaveBeenCalledTimes(0);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.toCommonStandard).toHaveBeenCalledTimes(1);
    expect(dynamo.getDMP).toHaveBeenCalledTimes(0);
    expect(dynamo.createDMP).toHaveBeenCalledTimes(0);
    expect(dynamo.updateDMP).toHaveBeenCalledTimes(0);
  });

  it('Creates the initial version', async () => {
    jest.spyOn(plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'toCommonStandard').mockResolvedValueOnce(commonStandard);
    jest.spyOn(dynamo, 'getDMP').mockResolvedValueOnce([]);
    jest.spyOn(dynamo, 'createDMP').mockResolvedValueOnce(commonStandard);
    jest.spyOn(dynamo, 'updateDMP').mockResolvedValueOnce(null);

    const result = await plan.generateVersion(context);
    expect(plan.update).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.toCommonStandard).toHaveBeenCalledTimes(1);
    expect(dynamo.getDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.createDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.updateDMP).toHaveBeenCalledTimes(0);
  });

  it('Returns and error if unable to create the initial version', async () => {
    jest.spyOn(plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'toCommonStandard').mockResolvedValueOnce(commonStandard);
    jest.spyOn(dynamo, 'getDMP').mockResolvedValueOnce([]);
    jest.spyOn(dynamo, 'createDMP').mockResolvedValueOnce(null);
    jest.spyOn(dynamo, 'updateDMP').mockResolvedValueOnce(null);

    const result = await plan.generateVersion(context);
    expect(plan.update).toHaveBeenCalledTimes(0);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.toCommonStandard).toHaveBeenCalledTimes(1);
    expect(dynamo.getDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.createDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.updateDMP).toHaveBeenCalledTimes(0);
  });

  it('updates the current version and does not generate a version snapshot', async () => {
    plan.lastSynced = getCurrentDate();
    jest.spyOn(plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'toCommonStandard').mockResolvedValueOnce(commonStandard);
    jest.spyOn(dynamo, 'getDMP').mockResolvedValueOnce([commonStandard]);
    jest.spyOn(dynamo, 'createDMP').mockResolvedValueOnce(null);
    jest.spyOn(dynamo, 'updateDMP').mockResolvedValueOnce(commonStandard);

    const result = await plan.generateVersion(context);
    expect(plan.update).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.toCommonStandard).toHaveBeenCalledTimes(1);
    expect(dynamo.getDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.createDMP).toHaveBeenCalledTimes(0);
    expect(dynamo.updateDMP).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the update to the current version fails', async () => {
    plan.lastSynced = getCurrentDate();
    jest.spyOn(plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'toCommonStandard').mockResolvedValueOnce(commonStandard);
    jest.spyOn(dynamo, 'getDMP').mockResolvedValueOnce([commonStandard]);
    jest.spyOn(dynamo, 'createDMP').mockResolvedValueOnce(null);
    jest.spyOn(dynamo, 'updateDMP').mockResolvedValueOnce(null);

    const result = await plan.generateVersion(context);
    expect(plan.update).toHaveBeenCalledTimes(0);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.toCommonStandard).toHaveBeenCalledTimes(1);
    expect(dynamo.getDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.createDMP).toHaveBeenCalledTimes(0);
    expect(dynamo.updateDMP).toHaveBeenCalledTimes(1);
  });

  it('creates a snapshot version and then updates the current version', async () => {
    jest.spyOn(plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'toCommonStandard').mockResolvedValueOnce(commonStandard);
    jest.spyOn(dynamo, 'getDMP').mockResolvedValueOnce([commonStandard]);
    jest.spyOn(dynamo, 'createDMP').mockResolvedValueOnce(commonStandard);
    jest.spyOn(dynamo, 'updateDMP').mockResolvedValueOnce(commonStandard);

    const result = await plan.generateVersion(context);
    expect(plan.update).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.toCommonStandard).toHaveBeenCalledTimes(1);
    expect(dynamo.getDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.createDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.updateDMP).toHaveBeenCalledTimes(1);
  });

  it('fails if unable to create a snapshot version', async () => {
    jest.spyOn(plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'toCommonStandard').mockResolvedValueOnce(commonStandard);
    jest.spyOn(dynamo, 'getDMP').mockResolvedValueOnce([commonStandard]);
    jest.spyOn(dynamo, 'createDMP').mockResolvedValueOnce(null);
    jest.spyOn(dynamo, 'updateDMP').mockResolvedValueOnce(null);

    const result = await plan.generateVersion(context);
    expect(plan.update).toHaveBeenCalledTimes(0);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.toCommonStandard).toHaveBeenCalledTimes(1);
    expect(dynamo.getDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.createDMP).toHaveBeenCalledTimes(1);
    expect(dynamo.updateDMP).toHaveBeenCalledTimes(1);
  });
});

describe('create', () => {
  const originalInsert = Plan.insert;
  let insertQuery;
  let plan;

  beforeEach(() => {
    insertQuery = jest.fn();
    (Plan.insert as jest.Mock) = insertQuery;

    plan = new Plan({
      projectId: casual.integer(1, 99),
      versionedTemplateId: casual.integer(1, 99),
      dmpId: casual.url,
      status: getRandomEnumValue(PlanStatus),
      visibility: getRandomEnumValue(PlanVisibility),
      registeredById: casual.integer(1, 99),
      registered: casual.date('YYYY-MM-DD'),
      lastSynced: casual.date('YYYY-MM-DD'),
      languageId: defaultLanguageId,
      featured: casual.boolean,
    });
  });

  afterEach(() => {
    Plan.insert = originalInsert;
  });

  it('returns the Plan with errors if it is invalid', async () => {
    plan.projectId = undefined;
    const response = await plan.create(context);
    expect(response.errors['projectId']).toBe('Project can\'t be blank');
  });

  it('returns the newly added Plan', async () => {
    const createdPlan = new Plan({ ...plan, id: 123 });
    insertQuery.mockResolvedValueOnce(createdPlan);
    const mockFindById = jest.fn();
    (Plan.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(createdPlan);
    jest.spyOn(plan, 'generateDMPId').mockResolvedValueOnce('12345');
    jest.spyOn(plan, 'generateVersion').mockResolvedValueOnce(createdPlan);

    const result = await plan.create(context);

    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.generateDMPId).toHaveBeenCalledTimes(1);
    expect(plan.generateVersion).toHaveBeenCalledTimes(1);
  });

  it('returns an error about creating the initial DMP version', async () => {
    const createdPlan = new Plan({ ...plan, id: 123 });
    const planWithErrors = new Plan({ ...createdPlan, errors: { general: 'Error creating DMP version' } });
    insertQuery.mockResolvedValueOnce(createdPlan);
    const mockFindById = jest.fn();
    (Plan.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(createdPlan);
    jest.spyOn(plan, 'generateDMPId').mockResolvedValueOnce('12345');
    jest.spyOn(plan, 'generateVersion').mockResolvedValueOnce(planWithErrors);

    const result = await plan.create(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(plan.generateDMPId).toHaveBeenCalledTimes(1);
    expect(plan.generateVersion).toHaveBeenCalledTimes(1);
  });
});

describe('update', () => {
  let updateQuery;
  let plan;

  beforeEach(() => {
    updateQuery = jest.fn();
    (Plan.update as jest.Mock) = updateQuery;

    plan = new Plan({
      id: casual.integer(1, 999),
      projectId: casual.integer(1, 99),
      versionedTemplateId: casual.integer(1, 99),
      dmpId: casual.url,
      status: getRandomEnumValue(PlanStatus),
      visibility: getRandomEnumValue(PlanVisibility),
      registeredById: casual.integer(1, 99),
      registered: casual.date('YYYY-MM-DD'),
      lastSynced: casual.date('YYYY-MM-DD'),
      languageId: defaultLanguageId,
      featured: casual.boolean,
    })
  });

  it('returns the Plan with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (plan.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await plan.update(context);
    expect(result instanceof Plan).toBe(true);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the Plan has no id', async () => {
    const localValidator = jest.fn();
    (plan.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    plan.id = null;
    const result = await plan.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the updated Plan', async () => {
    const localValidator = jest.fn();
    (plan.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValue(true);

    updateQuery.mockResolvedValueOnce(plan);

    jest.spyOn(Plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'generateVersion').mockResolvedValueOnce([commonStandard]);

    const result = await plan.update(context);
    expect(localValidator).toHaveBeenCalledTimes(2);
    expect(updateQuery).toHaveBeenCalledTimes(2);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.generateVersion).toHaveBeenCalledTimes(1);
  });

  it('does not do any versioning if noTouch is true', async () => {
    const localValidator = jest.fn();
    (plan.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValue(true);

    updateQuery.mockResolvedValueOnce(plan);

    jest.spyOn(Plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'generateVersion').mockResolvedValueOnce([]);

    const result = await plan.update(context, true);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.generateVersion).toHaveBeenCalledTimes(0);
  });

  it('does not do any versioning if the Plan update failed', async () => {
    const localValidator = jest.fn();
    (plan.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValue(true);

    updateQuery.mockResolvedValueOnce(null);

    jest.spyOn(Plan, 'update').mockResolvedValueOnce(plan);
    jest.spyOn(plan, 'generateVersion').mockResolvedValueOnce(commonStandard);

    const result = await plan.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Plan);
    expect(plan.generateVersion).toHaveBeenCalledTimes(0);
  });
});

describe('delete', () => {
  let plan;

  beforeEach(() => {
    plan = new Plan({
      id: casual.integer(1, 999),
      projectId: casual.integer(1, 99),
      versionedTemplateId: casual.integer(1, 99),
      dmpId: casual.url,
      languageId: defaultLanguageId,
      featured: casual.boolean,
    });
  })

  it('returns null if the Plan has no id', async () => {
    plan.id = null;
    expect(await plan.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Plan.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await plan.delete(context)).toBe(null);
  });

  it('returns the Plan if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Plan.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(plan);

    const mockFindById = jest.fn();
    (Plan.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(plan);

    jest.spyOn(dynamo, 'deleteDMP').mockResolvedValueOnce(commonStandard);
    jest.spyOn(dynamo, 'tombstoneDMP').mockResolvedValueOnce(null);

    const result = await plan.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Plan);
    expect(dynamo.deleteDMP).toHaveBeenCalledTimes(1);
    expect(deleteQuery).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(dynamo.tombstoneDMP).toHaveBeenCalledTimes(0);
  });

  it('tombstones the DMP if it was registered', async () => {
    plan.registered = '2025-03-20T07:51:43.000Z';
    const deleteQuery = jest.fn();
    (Plan.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(plan);

    const mockFindById = jest.fn();
    (Plan.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(plan);

    jest.spyOn(dynamo, 'deleteDMP').mockResolvedValueOnce(null);
    jest.spyOn(dynamo, 'tombstoneDMP').mockResolvedValueOnce(commonStandard);

    const result = await plan.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Plan);
    expect(dynamo.deleteDMP).toHaveBeenCalledTimes(0);
    expect(deleteQuery).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(dynamo.tombstoneDMP).toHaveBeenCalledTimes(1);
  });

  it('deletes the Plan but returns an error if tombstoning fails', async () => {
    plan.registered = '2025-03-20T07:51:43.000Z';
    const deleteQuery = jest.fn();
    (Plan.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(plan);

    const mockFindById = jest.fn();
    (Plan.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(plan);

    jest.spyOn(dynamo, 'deleteDMP').mockResolvedValueOnce(null);
    jest.spyOn(dynamo, 'tombstoneDMP').mockResolvedValueOnce(null);

    const result = await plan.delete(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result).toBeInstanceOf(Plan);
    expect(dynamo.deleteDMP).toHaveBeenCalledTimes(0);
    expect(deleteQuery).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(dynamo.tombstoneDMP).toHaveBeenCalledTimes(1);
  });
});
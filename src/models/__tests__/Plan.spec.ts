import casual from "casual";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { getRandomEnumValue } from "../../__tests__/helpers";
import { Plan, PlanSearchResult, PlanSectionProgress, PlanStatus, PlanVisibility } from "../Plan";
import { defaultLanguageId } from "../Language";

jest.mock('../../context.ts');

let context;

beforeEach(() => {
  jest.resetAllMocks();

  context = buildContext(logger, mockToken());
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

  it('should return false when calling isValid if the dmpId field is missing and registered is true', async () => {
    plan.dmpId = null;
    plan.registered = '2023-10-01';
    expect(await plan.isValid()).toBe(false);
    expect(Object.keys(plan.errors).length).toBe(1);
    expect(plan.errors['dmpId']).toBeTruthy();
  });

  it('should return false when calling isValid if the registered field is missing and dmpId is true', async () => {
    plan.registered = null;
    plan.dmpId = '12345';
    expect(await plan.isValid()).toBe(false);
    expect(Object.keys(plan.errors).length).toBe(1);
    expect(plan.errors['registered']).toBeTruthy();
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

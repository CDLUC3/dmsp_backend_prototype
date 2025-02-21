import casual from "casual";
import { logger } from '../../__mocks__/logger';
import { buildContext, mockToken } from "../../__mocks__/context";
import { Project } from "../Project";

jest.mock('../../context.ts');

let context;

beforeEach(async () => {
  jest.resetAllMocks();

  context = await buildContext(logger, mockToken());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Project', () => {
  let project;

  const projectData = {
    title: casual.sentence,
    abstractText: casual.sentences(4),
    startDate: '2024-12-13',
    endDate: '2026-01-21',
    researchDomainId: casual.integer(1, 99),
  }
  beforeEach(() => {
    project = new Project(projectData);
  });

  it('should initialize options as expected', () => {
    expect(project.title).toEqual(projectData.title);
    expect(project.abstractText).toEqual(projectData.abstractText);
    expect(project.startDate).toEqual(projectData.startDate);
    expect(project.endDate).toEqual(projectData.endDate);
    expect(project.researchDomainId).toEqual(projectData.researchDomainId);
    expect(project.isTestProject).toBe(false);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await project.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the title field is missing', async () => {
    project.title = null;
    expect(await project.isValid()).toBe(false);
    expect(Object.keys(project.errors).length).toBe(1);
    expect(project.errors['title']).toBeTruthy();
  });

  it('should return false when calling isValid if the startDate field is not in a valid date', async () => {
    project.startDate = '123A-12-1';
    expect(await project.isValid()).toBe(false);
    expect(Object.keys(project.errors).length).toBe(1);
    expect(project.errors['startDate']).toBeTruthy();
  });

  it('should return false when calling isValid if the endDate field is not in a valid date', async () => {
    project.endDate = '123A-12-1';
    expect(await project.isValid()).toBe(false);
    expect(Object.keys(project.errors).length).toBe(1);
    expect(project.errors['endDate']).toBeTruthy();
  });

  it('should return false when calling isValid if the endDate is less than the startDate', async () => {
    project.startDate = '2025-01-21';
    project.endDate = '2025-01-01'
    expect(await project.isValid()).toBe(false);
    expect(Object.keys(project.errors).length).toBe(1);
    expect(project.errors['endDate']).toBeTruthy();
  });

  it('should return false when calling isValid if the endDate is equal to than the startDate', async () => {
    project.startDate = '2025-01-21';
    project.endDate = '2025-01-21'
    expect(await project.isValid()).toBe(false);
    expect(Object.keys(project.errors).length).toBe(1);
    expect(project.errors['endDate']).toBeTruthy();
  });
});

describe('findBy Queries', () => {
  const originalQuery = Project.query;

  let localQuery;
  let context;
  let project;

  beforeEach(async () => {
    localQuery = jest.fn();
    (Project.query as jest.Mock) = localQuery;

    context = await buildContext(logger, mockToken());

    project = new Project({
      id: casual.integer(1, 999),
      title: casual.sentence,
      abstractText: casual.sentences(4),
      startDate: '2024-12-13',
      endDate: '2026-01-21',
      researchDomainId: casual.integer(1, 99),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    Project.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([project]);
    const projectId = casual.integer(1, 999);
    const result = await Project.findById('testing', context, projectId);
    const expectedSql = 'SELECT * FROM projects WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString()], 'testing')
    expect(result).toEqual(project);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await Project.findById('testing', context, projectId);
    expect(result).toEqual(null);
  });

  it('findByUserId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([project]);
    const userId = casual.integer(1, 999);
    const result = await Project.findByUserId('testing', context, userId);
    const expectedSql = 'SELECT * FROM projects WHERE createdById = ? ORDER BY created DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [userId.toString()], 'testing')
    expect(result).toEqual([project]);
  });

  it('findByUserId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const userId = casual.integer(1, 999);
    const result = await Project.findByUserId('testing', context, userId);
    expect(result).toEqual([]);
  });

  it('findByAffiliation should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([project]);
    const affiliationId = casual.url;
    const result = await Project.findByAffiliation('testing', context, affiliationId);
    let expectedSql = 'SELECT projects.* FROM projects INNER JOIN users ON projects.createdById = users.id';
    expectedSql += ' WHERE users.affiliationId = ? ORDER BY created DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [affiliationId], 'testing')
    expect(result).toEqual([project]);
  });

  it('findByAffiliation should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const affiliationId = casual.url;
    const result = await Project.findByAffiliation('testing', context, affiliationId);
    expect(result).toEqual([]);
  });

  it('findByOwnerAndTitle should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([project]);
    const title = casual.sentence;
    const result = await Project.findByOwnerAndTitle('testing', context, title, context.token.id);
    const expectedSql = 'SELECT * FROM projects WHERE createdById = ? AND LOWER(title) LIKE ?';
    const expectedVals = [context.token.id.toString(), `%${title.toLowerCase().trim()}%`]
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, expectedVals, 'testing')
    expect(result).toEqual(project);
  });

  it('findByOwnerAndTitle should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const title = casual.sentence;
    const result = await Project.findByOwnerAndTitle('testing', context, title, context.token.id);
    expect(result).toEqual(null);
  });
});

describe('update', () => {
  let updateQuery;
  let project;

  beforeEach(() => {
    updateQuery = jest.fn();
    (Project.update as jest.Mock) = updateQuery;

    project = new Project({
      id: casual.integer(1, 999),
      title: casual.sentence,
      abstractText: casual.sentences(4),
      startDate: '2024-12-13',
      endDate: '2026-01-21',
      researchDomainId: casual.integer(1, 99),
      isTestProject: casual.boolean,
    })
  });

  it('returns the Project with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (project.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await project.update(context);
    expect(result instanceof Project).toBe(true);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the Project has no id', async () => {
    const localValidator = jest.fn();
    (project.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    project.id = null;
    const result = await project.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the updated Project', async () => {
    const localValidator = jest.fn();
    (project.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(project);

    const mockFindById = jest.fn();
    (Project.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(project);

    const result = await project.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Project);
  });
});

describe('create', () => {
  const originalInsert = Project.insert;
  let insertQuery;
  let project;

  beforeEach(() => {
    insertQuery = jest.fn();
    (Project.insert as jest.Mock) = insertQuery;

    project = new Project({
      title: casual.sentence,
      abstractText: casual.sentences(4),
      startDate: '2024-12-13',
      endDate: '2026-01-21',
      researchDomainId: casual.integer(1, 99),
      isTestProject: casual.boolean,
    });
  });

  afterEach(() => {
    Project.insert = originalInsert;
  });

  it('returns the Project without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (project.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await project.create(context);
    expect(result instanceof Project).toBe(true);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the Project with errors if it is invalid', async () => {
    project.title = undefined;
    const response = await project.create(context);
    expect(response.errors['title']).toBe('Title can\'t be blank');
  });

  it('returns the Project with an error if the question already exists', async () => {
    const mockFindBy = jest.fn();
    (Project.findByOwnerAndTitle as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(project);

    const result = await project.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the newly added Project', async () => {
    const mockFindBy = jest.fn();
    (Project.findByOwnerAndTitle as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (Project.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(project);

    const result = await project.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Project);
  });
});

describe('delete', () => {
  let project;

  beforeEach(() => {
    project = new Project({
      id: casual.integer(1, 999),
      title: casual.sentence,
    });
  })

  it('returns null if the Project has no id', async () => {
    project.id = null;
    expect(await project.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Project.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await project.delete(context)).toBe(null);
  });

  it('returns the Project if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (Project.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(project);

    const mockFindById = jest.fn();
    (Project.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(project);

    const result = await project.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(Project);
  });
});

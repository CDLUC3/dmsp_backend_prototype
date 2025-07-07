import casual from "casual";
import { buildMockContextWithToken } from "../../__mocks__/context";
import { ProjectOutput, OutputAccessLevel } from "../Output";
import { logger } from "../../logger";

jest.mock('../../context.ts');

let context;

beforeEach(async () => {
  jest.resetAllMocks();

  context = await buildMockContextWithToken(logger);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ProjectOutput', () => {
  let projectOutput;

  const outputData = {
    projectId: casual.integer(1, 9),
    outputTypeId: casual.integer(1, 9),
    title: casual.sentence,
    description: casual.sentences(4),
    initialLicenseId: casual.integer(1, 999),
    anticipatedReleaseDate: casual.date('YYYY-MM-DD'),
  }
  beforeEach(() => {
    projectOutput = new ProjectOutput(outputData);
  });

  it('should initialize options as expected', () => {
    expect(projectOutput.projectId).toEqual(outputData.projectId);
    expect(projectOutput.outputTypeId).toEqual(outputData.outputTypeId);
    expect(projectOutput.title).toEqual(outputData.title);
    expect(projectOutput.description).toEqual(outputData.description);
    expect(projectOutput.mayContainSensitiveInformation).toEqual(false);
    expect(projectOutput.mayContainPII).toEqual(false);
    expect(projectOutput.initialAccessLevel).toEqual(OutputAccessLevel.UNRESTRICTED);
    expect(projectOutput.initialLicenseId).toEqual(outputData.initialLicenseId);
    expect(projectOutput.anticipatedReleaseDate).toEqual(outputData.anticipatedReleaseDate);
  });

  it('should return true when calling isValid if object is valid', async () => {
    expect(await projectOutput.isValid()).toBe(true);
  });

  it('should return false when calling isValid if the projectId field is missing', async () => {
    projectOutput.projectId = null;
    expect(await projectOutput.isValid()).toBe(false);
    expect(Object.keys(projectOutput.errors).length).toBe(1);
    expect(projectOutput.errors['projectId']).toBeTruthy();
  });

  it('should return false when calling isValid if the outputTypeId field is missing', async () => {
    projectOutput.outputTypeId = null;
    expect(await projectOutput.isValid()).toBe(false);
    expect(Object.keys(projectOutput.errors).length).toBe(1);
    expect(projectOutput.errors['outputTypeId']).toBeTruthy();
  });

  it('should return false when calling isValid if the title field is missing', async () => {
    projectOutput.title = null;
    expect(await projectOutput.isValid()).toBe(false);
    expect(Object.keys(projectOutput.errors).length).toBe(1);
    expect(projectOutput.errors['title']).toBeTruthy();
  });

  it('should return false when calling isValid if the anticipatedReleaseDate is not a date', async () => {
    projectOutput.anticipatedReleaseDate = '123A-12-1';
    expect(await projectOutput.isValid()).toBe(false);
    expect(Object.keys(projectOutput.errors).length).toBe(1);
    expect(projectOutput.errors['anticipatedReleaseDate']).toBeTruthy();
  });
});

describe('findBy Queries', () => {
  const originalQuery = ProjectOutput.query;

  let localQuery;
  let context;
  let projectOutput;

  beforeEach(async () => {
    localQuery = jest.fn();
    (ProjectOutput.query as jest.Mock) = localQuery;

    context = await buildMockContextWithToken(logger);

    projectOutput = new ProjectOutput({
      projectId: casual.integer(1, 9),
      outputTypeId: casual.integer(1, 9),
      title: casual.sentence,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    ProjectOutput.query = originalQuery;
  });

  it('findById should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectOutput]);
    const projectOutputId = casual.integer(1, 999);
    const result = await ProjectOutput.findById('testing', context, projectOutputId);
    const expectedSql = 'SELECT * FROM projectOutputs WHERE id = ?';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectOutputId.toString()], 'testing')
    expect(result).toEqual(projectOutput);
  });

  it('findById should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectOutputId = casual.integer(1, 999);
    const result = await ProjectOutput.findById('testing', context, projectOutputId);
    expect(result).toEqual(null);
  });

  it('findByProjectId should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectOutput]);
    const projectId = casual.integer(1, 999);
    const result = await ProjectOutput.findByProjectId('testing', context, projectId);
    const expectedSql = 'SELECT * FROM projectOutputs WHERE projectId = ? ORDER BY created DESC';
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, [projectId.toString()], 'testing')
    expect(result).toEqual([projectOutput]);
  });

  it('findByProjectId should return empty array if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 999);
    const result = await ProjectOutput.findByProjectId('testing', context, projectId);
    expect(result).toEqual([]);
  });

  it('findByProjectAndTitle should call query with correct params and return the default', async () => {
    localQuery.mockResolvedValueOnce([projectOutput]);
    const projectId = casual.integer(1, 9999);
    const title = casual.sentence;
    const result = await ProjectOutput.findByProjectAndTitle('testing', context, projectId, title);
    const expectedSql = 'SELECT * FROM projectOutputs WHERE projectId = ? AND LOWER(title) = ?';
    const vals = [projectId.toString(), title];
    expect(localQuery).toHaveBeenCalledTimes(1);
    expect(localQuery).toHaveBeenLastCalledWith(context, expectedSql, vals, 'testing')
    expect(result).toEqual(projectOutput);
  });

  it('findByProjectAndTitle should return null if it finds no default', async () => {
    localQuery.mockResolvedValueOnce([]);
    const projectId = casual.integer(1, 9999);
    const title = casual.sentence;
    const result = await ProjectOutput.findByProjectAndTitle('testing', context, projectId, title);
    expect(result).toEqual(null);
  });
});

describe('update', () => {
  let updateQuery;
  let projectOutput;

  beforeEach(() => {
    updateQuery = jest.fn();
    (ProjectOutput.update as jest.Mock) = updateQuery;

    projectOutput = new ProjectOutput({
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 9),
      outputTypeId: casual.integer(1, 9),
      title: casual.sentence,
    })
  });

  it('returns the ProjectOutput with errors if it is not valid', async () => {
    const localValidator = jest.fn();
    (projectOutput.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await projectOutput.update(context);
    expect(result instanceof ProjectOutput).toBe(true);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns an error if the ProjectOutput has no id', async () => {
    const localValidator = jest.fn();
    (projectOutput.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    projectOutput.id = null;
    const result = await projectOutput.update(context);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the updated ProjectOutput', async () => {
    const localValidator = jest.fn();
    (projectOutput.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(true);

    updateQuery.mockResolvedValueOnce(projectOutput);

    const mockFindById = jest.fn();
    (ProjectOutput.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectOutput);

    const result = await projectOutput.update(context);
    expect(localValidator).toHaveBeenCalledTimes(1);
    expect(updateQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectOutput);
  });
});

describe('create', () => {
  const originalInsert = ProjectOutput.insert;
  let insertQuery;
  let projectOutput;

  beforeEach(() => {
    insertQuery = jest.fn();
    (ProjectOutput.insert as jest.Mock) = insertQuery;

    projectOutput = new ProjectOutput({
      projectId: casual.integer(1, 9),
      outputTypeId: casual.integer(1, 9),
      title: casual.sentence,
      description: casual.sentences(4),
      initialLicenseId: casual.integer(1, 999),
      anticipatedReleaseDate: casual.date('YYYY-MM-DD'),
    });
  });

  afterEach(() => {
    ProjectOutput.insert = originalInsert;
  });

  it('returns the ProjectOutput without errors if it is valid', async () => {
    const localValidator = jest.fn();
    (projectOutput.isValid as jest.Mock) = localValidator;
    localValidator.mockResolvedValueOnce(false);

    const result = await projectOutput.create(context);
    expect(result instanceof ProjectOutput).toBe(true);
    expect(localValidator).toHaveBeenCalledTimes(1);
  });

  it('returns the ProjectOutput with errors if it is invalid', async () => {
    projectOutput.projectId = undefined;
    const response = await projectOutput.create(context);
    expect(response.errors['projectId']).toBe('Project can\'t be blank');
  });

  it('returns the ProjectOutput with an error if the question already exists', async () => {
    const mockFindBy = jest.fn();
    (ProjectOutput.findByProjectAndTitle as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(projectOutput);

    const result = await projectOutput.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors['general']).toBeTruthy();
  });

  it('returns the newly added ProjectOutput', async () => {
    const mockFindBy = jest.fn();
    (ProjectOutput.findByProjectAndTitle as jest.Mock) = mockFindBy;
    mockFindBy.mockResolvedValueOnce(null);

    const mockFindById = jest.fn();
    (ProjectOutput.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectOutput);

    const result = await projectOutput.create(context);
    expect(mockFindBy).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(insertQuery).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectOutput);
  });
});

describe('delete', () => {
  let projectOutput;

  beforeEach(() => {
    projectOutput = new ProjectOutput({
      id: casual.integer(1, 9999),
      projectId: casual.integer(1, 9),
      outputTypeId: casual.integer(1, 9),
      title: casual.sentence,
    });
  })

  it('returns null if the ProjectOutput has no id', async () => {
    projectOutput.id = null;
    expect(await projectOutput.delete(context)).toBe(null);
  });

  it('returns null if it was not able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ProjectOutput.delete as jest.Mock) = deleteQuery;

    deleteQuery.mockResolvedValueOnce(null);
    expect(await projectOutput.delete(context)).toBe(null);
  });

  it('returns the ProjectOutput if it was able to delete the record', async () => {
    const deleteQuery = jest.fn();
    (ProjectOutput.delete as jest.Mock) = deleteQuery;
    deleteQuery.mockResolvedValueOnce(projectOutput);

    const mockFindById = jest.fn();
    (ProjectOutput.findById as jest.Mock) = mockFindById;
    mockFindById.mockResolvedValueOnce(projectOutput);

    const result = await projectOutput.delete(context);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result).toBeInstanceOf(ProjectOutput);
  });
});

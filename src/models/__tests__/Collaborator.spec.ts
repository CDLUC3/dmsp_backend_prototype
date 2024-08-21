import casual from 'casual';
import { Collaborator, TemplateCollaborator } from "../Collaborator";
import mockLogger from '../../__tests__/mockLogger';
import { buildContext } from '../../context';

jest.mock('../../context.ts');

describe('Collaborator', () => {
  it('constructor should initialize as expected', () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const collaborator = new Collaborator({ email, invitedById, createdById });

    expect(collaborator.email).toEqual(email);
    expect(collaborator.invitedById).toEqual(invitedById);
    expect(collaborator.userId).toBeFalsy();
  });

  it('isValid returns true when the email and invitedById are present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const collaborator = new Collaborator({ email, invitedById, createdById });
    expect(await collaborator.isValid()).toBe(true);
  });

  it('isValid returns false when the email is NOT present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const collaborator = new Collaborator({ email, invitedById, createdById });
    collaborator.email = null;
    expect(await collaborator.isValid()).toBe(false);
    expect(collaborator.errors.length).toBe(1);
    expect(collaborator.errors[0].includes('Email')).toBe(true);
  });

  it('isValid returns false when the invitedById is NOT present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const collaborator = new Collaborator({ email, invitedById, createdById });
    collaborator.invitedById = null;
    expect(await collaborator.isValid()).toBe(false);
    expect(collaborator.errors.length).toBe(1);
    expect(collaborator.errors[0].includes('Invited by')).toBe(true);
  });
});

describe('TemplateCollaborator', () => {
  it('constructor should initialize as expected', () => {
    const email = casual.email;
    const templateId = casual.integer(1, 999);
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);

    const templateCollaborator = new TemplateCollaborator({ templateId, email, invitedById, createdById });

    expect(templateCollaborator.email).toEqual(email);
    expect(templateCollaborator.templateId).toEqual(templateId);
    expect(templateCollaborator.invitedById).toEqual(invitedById);
    expect(templateCollaborator.userId).toBeFalsy();
  });

  it('isValid returns true when the templateId is present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);
    const templateId = casual.integer(1, 999);

    const collaborator = new TemplateCollaborator({ email, invitedById, createdById, templateId });
    expect(await collaborator.isValid()).toBe(true);
  });

  it('isValid returns false when the templateId is NOT present', async () => {
    const email = casual.email;
    const invitedById = casual.integer(1, 999);
    const createdById = casual.integer(1, 999);
    const templateId = casual.integer(1, 999);

    const collaborator = new TemplateCollaborator({ email, invitedById, createdById, templateId });
    collaborator.templateId = null;
    expect(await collaborator.isValid()).toBe(false);
    expect(collaborator.errors.length).toBe(1);
    expect(collaborator.errors[0].includes('Template')).toBe(true);
  });
});

describe('save', () => {
  let logger;
  let mockDebug;
  let mockError;
  let mockContext;
  let mockInsert;

  beforeEach(async () => {
    jest.resetAllMocks();

    logger = mockLogger;
    mockDebug = logger.debug as jest.MockedFunction<typeof logger.debug>;
    mockError = logger.error as jest.MockedFunction<typeof logger.error>;

    mockContext = buildContext as jest.MockedFunction<typeof buildContext>;
    const mockSqlDataSource = (await buildContext(logger, null, null)).dataSources.sqlDataSource;
    mockInsert = mockSqlDataSource.query as jest.MockedFunction<typeof mockSqlDataSource.query>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('it adds an error if the specified template does not exist', async () => {

  });

  it('it adds an error if the email is already a collaborator for the template', async () => {

  });

  it('it adds an error if the save fails', async () => {

  });

  it('it adds the collaborator to the template and returns the new record', async () => {

  });
});

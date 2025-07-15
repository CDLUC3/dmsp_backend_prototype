import casual from "casual";
import { User, UserRole } from "../../models/User";
import { Project } from "../../models/Project";
import {
  ProjectCollaborator,
  ProjectCollaboratorAccessLevel,
  TemplateCollaborator,
} from '../../models/Collaborator';
import {
  addTableForTeardown,
  executeQuery,
  initResolverTest,
  mockToken,
  ResolverTest,
  teardownResolverTest,
  testNotFound,
  testStandardErrors,
} from "./resolverTestHelper";
import { mockUser, persistUser } from "../../models/__mocks__/User";
import { mockProject, persistProject } from "../../models/__mocks__/Project";
import assert from "assert";
import {
  mockProjectCollaborator,
  mockTemplateCollaborator,
  persistProjectCollaborator,
  persistTemplateCollaborator
} from "../../models/__mocks__/Collaborator";
import {Template} from "../../models/Template";
import { mockTemplate, persistTemplate } from "../../models/__mocks__/Template";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendProjectCollaborationEmail, sendTemplateCollaborationEmail } from "../../services/emailService";

// Mock and then import the logger (this has jest pick up and use src/__mocks__/logger.ts)
jest.mock('../../logger');
jest.mock("../../datasources/dmphubAPI");
jest.mock("../../services/emailService");

let resolverTest: ResolverTest;

beforeEach(async () => {
  jest.clearAllMocks();

  // Start up the Apollo server and initialize some test Affiliations and Users
  //
  // Be sure to add the table names of any objects you persist in your tests to
  // the resolverTest.tablesToCleanUp list. The teardownResolverTest will purge
  // any persisted records for you.
  resolverTest = await initResolverTest();
});

afterEach(async () => {
  jest.resetAllMocks();

  // Purge all test records from the test DB and shutdown the Apollo server
  await teardownResolverTest();
});

describe('templateCollaborators', () => {
  const query = `
    query TemplateCollaborators($templateId: Int!) {
      templateCollaborators (templateId: $templateId) {
        id
        createdById
        created
        modifiedById
        modified
        errors {
          general
        }

        email
        invitedBy {
          id
        }
      }
    }
  `;

  const addMutation = `
    mutation AddTemplateCollaborator($templateId: Int!, $email: String!) {
      addTemplateCollaborator (templateId: $templateId, email: $email) {
        id
        email
        createdByIdx
        created
        modifiedById
        modified
        invitedBy {
          id
        }
        user {
          id
        }
        errors {
          general
        }
      }
    }
  `;

  const removeMutation = `
    mutation RemoveTemplateCollaborator($templateId: Int!, $email: String!) {
      removeTemplateCollaborator (templateId: $templateId, email: $email) {
        id
      }
    }
  `;

  let template: Template;
  let emailer: jest.Mock;

  let creator: User;
  let existingCollaborator: TemplateCollaborator;

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryRemoveAccess(
    errContext: string,
    canQuery = true,
    canAddAndRemove = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { templateId: template.id };

    const qryResp = await executeQuery(query, queryVariables);
    if (canQuery) {
      assert(qryResp.body.kind === 'single');
      expect(qryResp.body.singleResult.errors, msg).toBeUndefined();
    } else {
      assert(qryResp.body.kind === 'single');
      expect(qryResp.body.singleResult.errors, msg).toBeDefined();
      expect(qryResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }

    const addVariables = {
      templateId: template.id,
      email: casual.email
    }

    if (canAddAndRemove) {
      const userId = resolverTest.context.token.id;

      // Should be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();

      const id = addResp.body.singleResult.data.addTemplateCollaborator.id;
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addTemplateCollaborator.invitedBy.id, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addTemplateCollaborator.email, msg).toEqual(addVariables.email);
      expect(addResp.body.singleResult.data.addTemplateCollaborator.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addTemplateCollaborator.modifiedById, msg).toEqual(userId);

      expect(emailer).toHaveBeenCalledWith(
        resolverTest.context,
        template.name,
        [resolverTest.context.token.givenName, resolverTest.context.token.surName].join(' '),
        addVariables.email,
        undefined,
      )

      // Should see the new record
      const qry2Resp = await executeQuery(query, queryVariables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.templateCollaborators.map(c => c.id), msg).toContain(id);

      // Should be able to remove
      const removeVariables = { templateId: template.id, email: addVariables.email };

      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removeTemplateCollaborator.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.templateCollaborators.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { templateId: template.id, email: existingCollaborator.email };
      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  beforeEach(async () => {
    emailer = jest.fn();
    (sendTemplateCollaborationEmail as jest.Mock) = emailer;

    // Generate the creator of the project
    creator = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }));
    // Make sure the token belongs to the creator
    resolverTest.context.token = await mockToken(resolverTest.context, creator);

    template = await persistTemplate(
      resolverTest.context,
      mockTemplate({ ownerId: resolverTest.adminAffiliationA.affiliationId })
    );
    addTableForTeardown(Template.tableName);

    existingCollaborator = await persistTemplateCollaborator(
      resolverTest.context,
      mockTemplateCollaborator({
        templateId: template.id,
      })
    );
    addTableForTeardown(TemplateCollaborator.tableName);
  });

  it('Super Admin flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);
    await testAddQueryRemoveAccess('SuperAdmin', true, true);

    // Emailer should have been called for existingCollaborator and one we added
    expect(emailer).toHaveBeenCalledTimes(2);
  });

  it('Admin of same affiliation flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.adminAffiliationA);
    await testAddQueryRemoveAccess('Admin, same affiliation', true, true);

    // Emailer should have been called for existingCollaborator and one we added
    expect(emailer).toHaveBeenCalledTimes(2);
  });

  it('Admin of other affiliation flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.adminAffiliationB);
    await testAddQueryRemoveAccess('Admin. other affiliation', false, false);

    // Emailer should have been called for existingCollaborator only
    expect(emailer).toHaveBeenCalledTimes(1);
  });

  it('Admin who is a collaborator flow', async () => {
    const admin = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationB.affiliationId,
      role: UserRole.ADMIN
    }))
    await persistTemplateCollaborator(
      resolverTest.context,
      mockTemplateCollaborator({
        templateId: template.id,
        email: await admin.getEmail(resolverTest.context),
      })
    )

    resolverTest.context.token = await mockToken(resolverTest.context, admin);
    await testAddQueryRemoveAccess('researcher, random', true, true);

    addTableForTeardown(User.tableName);
    addTableForTeardown(TemplateCollaborator.tableName);

    // Emailer should have been called for existingCollaborator, this collaborator and one we added
    expect(emailer).toHaveBeenCalledTimes(3);
  });

  it('returns the collaborator with errors if it is a duplicate', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);
    const variables = { templateId: template.id, email: existingCollaborator.email };

    const resp = await executeQuery(addMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.addTemplateCollaborator.errors['general']).toBeDefined();

    // Emailer should have been called for existingCollaborator only
    expect(emailer).toHaveBeenCalledTimes(1);
  });

  it('finds the userId for an existing User', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);
    const existingUser = await persistUser(
      resolverTest.context,
      mockUser({ affiliationId: resolverTest.adminAffiliationA.affiliationId })
    )
    const variables = { templateId: template.id, email: await existingUser.getEmail(resolverTest.context)};

    const resp = await executeQuery(addMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.addTemplateCollaborator.errors['general']).toBeNull();
    expect(resp.body.singleResult.data.addTemplateCollaborator.user.id).toEqual(existingUser.id);

    // Make sure an email was sent
    expect(emailer).toHaveBeenCalledWith(
      resolverTest.context,
      template.name,
      [resolverTest.context.token.givenName, resolverTest.context.token.surName].join(' '),
      variables.email,
      existingUser.id,
    )
  });

  it('Throws a 404 if the template does not exist', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    await testNotFound(query, { templateId: 99999999 });
    await testNotFound(addMutation, { templateId: 99999999, email: 'test' });
    await testNotFound(removeMutation, { templateId: 99999999, email: 'test' });
  });

  it('handles missing tokens and internal server errors', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: query,
      variables: { templateId: template.id },
      spyOnClass: TemplateCollaborator,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
      graphQL: addMutation,
      variables: { templateId: template.id, email: casual.email },
      spyOnClass: TemplateCollaborator,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    // Test standard error handling for remove
    await testStandardErrors({
      graphQL: removeMutation,
      variables: { templateId: template.id, email: existingCollaborator.email },
      spyOnClass: TemplateCollaborator,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    })
  });
});


describe('projectCollaborators', () => {
  const query = `
    query ProjectCollaborators($projectId: Int!) {
      projectCollaborators (projectId: $projectId) {
        id
        createdById
        created
        modifiedById
        modified
        errors {
          general
        }

        email
        invitedBy {
          id
        }
        user {
          id
        }
        project {
          id
        }
      }
    }
  `;

  const addMutation = `
    mutation AddProjectCollaborator($projectId: Int!, $email: String!, $accessLevel: ProjectCollaboratorAccessLevel) {
      addProjectCollaborator (projectId: $projectId, email: $email, accessLevel: $accessLevel) {
        id
        email
        accessLevel
        createdById
        created
        modifiedById
        modified
        invitedBy {
          id
        }
        user {
          id
        }
        errors {
          general
        }
      }
    }
  `;

  const updateMutation = `
    mutation UpdateProjectCollaborator($projectCollaboratorId: Int!, $accessLevel: ProjectCollaboratorAccessLevel!) {
      updateProjectCollaborator (projectCollaboratorId: $projectCollaboratorId, accessLevel: $accessLevel) {
        id
        email
        accessLevel
        createdById
        created
        modifiedById
        modified
        invitedBy {
          id
        }
        errors {
          general
        }
      }
    }
  `;

  const removeMutation = `
    mutation RemoveProjectCollaborator($projectCollaboratorId: Int!) {
      removeProjectCollaborator (projectCollaboratorId: $projectCollaboratorId) {
        id
      }
    }
  `;

  let project: Project;
  let emailer: jest.Mock;

  let creator: User;
  let existingCollaborator: ProjectCollaborator;

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryRemoveAccess(
    errContext: string,
    canQuery = true,
    canAddAndRemove = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { projectId: project.id };

    const qryResp = await executeQuery(query, queryVariables);
    if (canQuery) {
      assert(qryResp.body.kind === 'single');
      expect(qryResp.body.singleResult.errors, msg).toBeUndefined();
    } else {
      assert(qryResp.body.kind === 'single');
      expect(qryResp.body.singleResult.errors, msg).toBeDefined();
      expect(qryResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }

    const addVariables = {
      projectId: project.id,
      email: casual.email,
      accessLevel: ProjectCollaboratorAccessLevel.COMMENT
    }

    const updateVariables = {
      projectCollaboratorId: existingCollaborator.id,
      accessLevel: ProjectCollaboratorAccessLevel.EDIT
    }

    if (canAddAndRemove) {
      const userId = resolverTest.context.token.id;

      // Should be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();

      const id = addResp.body.singleResult.data.addProjectCollaborator.id;
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addProjectCollaborator.invitedBy.id, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addProjectCollaborator.email, msg).toEqual(addVariables.email);
      expect(addResp.body.singleResult.data.addProjectCollaborator.accessLevel, msg).toEqual(addVariables.accessLevel);
      expect(addResp.body.singleResult.data.addProjectCollaborator.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addProjectCollaborator.modifiedById, msg).toEqual(userId);

      // Make sure an email was sent
      expect(emailer).toHaveBeenCalledWith(
        resolverTest.context,
        project.title,
        [resolverTest.context.token.givenName, resolverTest.context.token.surName].join(' '),
        addVariables.email,
        undefined,
      )

      // Should see the new record
      const qry2Resp = await executeQuery(query, queryVariables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.projectCollaborators.map(c => c.id), msg).toContain(id);

      // Should be able to update
      const updResp = await executeQuery(updateMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      expect(updResp.body.singleResult.data.updateProjectCollaborator.id, msg).toEqual(existingCollaborator.id);
      expect(updResp.body.singleResult.data.updateProjectCollaborator.accessLevel, msg).toEqual(updateVariables.accessLevel);
      expect(updResp.body.singleResult.data.updateProjectCollaborator.modifiedById, msg).toEqual(userId);
      expect(updResp.body.singleResult.data.updateProjectCollaborator.email, msg).toEqual(existingCollaborator.email);
      expect(updResp.body.singleResult.data.updateProjectCollaborator.createdById, msg).toEqual(existingCollaborator.createdById);

      // Should be able to remove
      const removeVariables = { projectCollaboratorId: id }

      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removeProjectCollaborator.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.projectCollaborators.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to update
      const updResp = await executeQuery(updateMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeDefined();
      expect(updResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { projectCollaboratorId: existingCollaborator.id }
      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  beforeEach(async () => {
    emailer = jest.fn();
    (sendProjectCollaborationEmail as jest.Mock) = emailer;

    // Generate the creator of the project
    creator = await persistUser(
      resolverTest.context,
      mockUser({
        affiliationId: resolverTest.adminAffiliationA.affiliationId,
        role: UserRole.RESEARCHER
      })
    );
    addTableForTeardown(User.tableName);

    // Make sure the token belongs to the creator
    resolverTest.context.token = await mockToken(resolverTest.context, creator);
    project = await persistProject(resolverTest.context, mockProject({}));
    addTableForTeardown(Project.tableName);

    // Note that this triggers the emailer above so count it in tests above/below
    existingCollaborator = await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
      })
    );
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Super Admin flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);
    await testAddQueryRemoveAccess('SuperAdmin', true, true);

    // Should have emailed for the existingCollaborator and the one being added
    expect(emailer).toHaveBeenCalledTimes(2);
  });

  it('Admin of same affiliation flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.adminAffiliationA);
    await testAddQueryRemoveAccess('Admin, same affiliation', true, true);

    // Should have emailed for the existingCollaborator and the one being added
    expect(emailer).toHaveBeenCalledTimes(2);
  });

  it('Admin of other affiliation flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.adminAffiliationB);
    await testAddQueryRemoveAccess('Admin. other affiliation', false, false);

    // Generating the existingCollaborator caused the emailer to fire once
    expect(emailer).toHaveBeenCalledTimes(1);
  });

  it('Project creator flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, creator);
    await testAddQueryRemoveAccess('creator', true, true);

    // Should have emailed for the existingCollaborator and the one being added
    expect(emailer).toHaveBeenCalledTimes(2);
  });

  it('Research who is not the creator or a collaborator flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, random', false, false);

    // Generating the existingCollaborator caused the emailer to fire once
    expect(emailer).toHaveBeenCalledTimes(1);

    addTableForTeardown(User.tableName);
  });

  it('Research with comment level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: await researcher.getEmail(resolverTest.context),
        accessLevel: ProjectCollaboratorAccessLevel.COMMENT
      })
    )
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, commenter', true, false);

    // Generating the existingCollaborator and the commenter caused the emailer to fire twice
    expect(emailer).toHaveBeenCalledTimes(2);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Researcher with edit level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: await researcher.getEmail(resolverTest.context),
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      })
    )
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, editor', true, true);

    // Should have emailed for the existingCollaborator the editor and the one being added
    expect(emailer).toHaveBeenCalledTimes(3);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Researcher with owner level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationB.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: await researcher.getEmail(resolverTest.context),
        accessLevel: ProjectCollaboratorAccessLevel.OWN
      })
    )
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, owner', true, true);

    // Should have emailed for the existingCollaborator the owner and the one being added
    expect(emailer).toHaveBeenCalledTimes(3);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('returns the collaborator with errors if it is a duplicate', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);
    const variables = { projectId: project.id, email: existingCollaborator.email };
    const resp = await executeQuery(addMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.addProjectCollaborator.errors['general']).toBeDefined();

    // Generating the existingCollaborator caused the emailer to fire once
    expect(emailer).toHaveBeenCalledTimes(1);
  });

  it('finds the userId for an existing User', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);
    const existingUser = await persistUser(
      resolverTest.context,
      mockUser({
        affiliationId: resolverTest.adminAffiliationA.affiliationId,
        role: UserRole.RESEARCHER
      })
    )
    const variables = { projectId: project.id, email: await existingUser.getEmail(resolverTest.context)};

    const resp = await executeQuery(addMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.addProjectCollaborator.errors['general']).toBeNull();
    expect(resp.body.singleResult.data.addProjectCollaborator.user.id).toEqual(existingUser.id);

    // Make sure an email was sent
    expect(emailer).toHaveBeenCalledWith(
      resolverTest.context,
      project.title,
      [resolverTest.context.token.givenName, resolverTest.context.token.surName].join(' '),
      variables.email,
      existingUser.id,
    )
  });

  it('Throws a 404 if the project does not exist', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    await testNotFound(query, { projectId: 99999999 });
    await testNotFound(addMutation, { projectId: 99999999, email: 'test' });
    await testNotFound(updateMutation, {
      projectCollaboratorId: 99999999,
      accessLevel: ProjectCollaboratorAccessLevel.EDIT
    });
    await testNotFound(removeMutation, { projectCollaboratorId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: query,
      variables: { projectId: project.id },
      spyOnClass: ProjectCollaborator,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
      graphQL: addMutation,
      variables: {
        projectId: project.id,
        email: casual.email,
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      },
      spyOnClass: ProjectCollaborator,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    // Test standard error handling for update
    await testStandardErrors({
      graphQL: updateMutation,
      variables: {
        projectCollaboratorId: existingCollaborator.id,
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      },
      spyOnClass: ProjectCollaborator,
      spyOnFunction: 'update',
      mustBeAuthenticated: true
    });

    // Test standard error handling for remove
    await testStandardErrors({
      graphQL: removeMutation,
      variables: { projectCollaboratorId: existingCollaborator.id },
      spyOnClass: ProjectCollaborator,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});

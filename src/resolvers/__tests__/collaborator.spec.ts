import {ApolloServer} from "@apollo/server";
import casual from "casual";
import {buildContext, MyContext} from "../../context";
import {logger} from "../../__mocks__/logger";
import {User, UserRole} from "../../models/User";
import { Project } from "../../models/Project";
import {
  ProjectCollaborator,
  ProjectCollaboratorAccessLevel,
  TemplateCollaborator,
} from '../../models/Collaborator';
import { MySQLConnection } from "../../datasources/mysql";
import {
  executeQuery,
  initErrorMessage,
  initTestServer,
  mockToken, testNotFound, testStandardErrors,
} from "./resolverTestHelper";
import {randomAffiliation} from "../../models/__mocks__/Affiliation";
import {
  cleanUpAddedUser,
  mockUser,
  persistUser
} from "../../models/__mocks__/User";
import {
  cleanUpAddedProject,
  mockProject,
  persistProject
} from "../../models/__mocks__/Project";
import {Affiliation} from "../../models/Affiliation";
import assert from "assert";
import {
  cleanUpAddedProjectCollaborator, cleanUpAddedTemplateCollaborator,
  mockProjectCollaborator, mockTemplateCollaborator,
  persistProjectCollaborator, persistTemplateCollaborator
} from "../../models/__mocks__/Collaborator";
import {Template} from "../../models/Template";
import {
  cleanUpAddedTemplate,
  mockTemplate,
  persistTemplate
} from "../../models/__mocks__/Template";

jest.mock("../../datasources/dmphubAPI");

let mysqlInstance: MySQLConnection;
let testServer: ApolloServer;
let context: MyContext;

let affiliation: Affiliation;
let sameAffiliationAdmin: User;
let otherAffiliationAdmin: User;
let superAdmin: User;

beforeEach(async () => {
  jest.clearAllMocks();

  try {
    // Initialize the mysql connection pool
    mysqlInstance = new MySQLConnection();
    // Ensure the pool has finished initializing
    await mysqlInstance.initPromise;

    // Initialize the Apollo server
    testServer = initTestServer();
    await testServer.start();
  } catch (err) {
    console.error(initErrorMessage, err);
    process.exit(1);
  }

  // Build out the Apollo context
  context = buildContext(logger, null, null, mysqlInstance, null);

  // Get a random affiliation because a User needs one
  affiliation = await randomAffiliation(context);

  // Generate the test admin users
  sameAffiliationAdmin = await persistUser(
    context,
    mockUser({
      affiliationId: affiliation.uri,
      role: UserRole.ADMIN
    })
  );
  otherAffiliationAdmin = await persistUser(
    context,
    mockUser({
      affiliationId: 'https://test.example.com',
      role: UserRole.ADMIN
    })
  );
  superAdmin = await persistUser(
    context,
    mockUser({
      role: UserRole.SUPERADMIN
    })
  );
});

afterEach(async () => {
  try {
    // Delete all the DB records that were persisted during the tests
    await cleanUpAddedUser(context, sameAffiliationAdmin.id);
    await cleanUpAddedUser(context, otherAffiliationAdmin.id);
    await cleanUpAddedUser(context, superAdmin.id);

    // Close the mysql connection pool
    await mysqlInstance.close();

    // Shutdown the test server
    await testServer.stop();
  } catch (err) {
    console.error('Error cleaning up after tests', err);
    process.exit(1);
  }
});

describe('templateCollaborators', () => {
  let template: Template;

  let creator: User;
  let existingCollaborator: TemplateCollaborator;

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
    mutation RemoveTemplateCollaborator($templateId: Int!, $email: String!) {
      removeTemplateCollaborator (templateId: $templateId, email: $email) {
        id
      }
    }
  `;

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryRemoveAccess(
    contextIn: MyContext,
    errContext: string,
    canQuery = true,
    canAddAndRemove = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { templateId: template.id };

    const qryResp = await executeQuery(testServer, contextIn, query, queryVariables);
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
      const userId = context.token.id;

      // Should be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();

      const id = addResp.body.singleResult.data.addTemplateCollaborator.id;
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addTemplateCollaborator.invitedBy.id, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addTemplateCollaborator.email, msg).toEqual(addVariables.email);
      expect(addResp.body.singleResult.data.addTemplateCollaborator.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addTemplateCollaborator.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.templateCollaborators.map(c => c.id), msg).toContain(id);

      // Should be able to remove
      const removeVariables = { templateId: template.id, email: addVariables.email };

      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removeTemplateCollaborator.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.templateCollaborators.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { templateId: template.id, email: existingCollaborator.email };
      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  beforeEach(async () => {
    // Generate the creator of the project
    creator = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }));
    // Make sure the token belongs to the creator
    context.token = mockToken(creator);
    template = await persistTemplate(context, mockTemplate({ ownerId: affiliation.uri }));

    existingCollaborator = await persistTemplateCollaborator(context, mockTemplateCollaborator({
      templateId: template.id,
    }));
  });

  afterEach(async () => {
    // Clean up the project, user and collaborator records we generated
    await cleanUpAddedTemplate(context, template.id);
    await cleanUpAddedUser(context, creator.id);
  });

  it('Super Admin flow', async () => {
    context.token = mockToken(superAdmin);
    await testAddQueryRemoveAccess(context, 'SuperAdmin', true, true);
  });

  it('Admin of same affiliation flow', async () => {
    context.token = mockToken(sameAffiliationAdmin);
    await testAddQueryRemoveAccess(context, 'Admin, same affiliation', true, true);
  });

  it('Admin of other affiliation flow', async () => {
    context.token = mockToken(otherAffiliationAdmin);
    await testAddQueryRemoveAccess(context, 'Admin. other affiliation', false, false);
  });

  it('Admin who is a collaborator flow', async () => {
    const admin = await persistUser(context, mockUser({
      affiliationId: otherAffiliationAdmin.affiliationId,
      role: UserRole.ADMIN
    }))
    const collab = await persistTemplateCollaborator(
      context,
      mockTemplateCollaborator({
        templateId: template.id,
        email: admin.email,
      })
    )

    context.token = mockToken(admin);
    await testAddQueryRemoveAccess(context, 'researcher, random', true, true);

    await cleanUpAddedTemplateCollaborator(context, collab.id);
  });

  it('Throws a 404 if the template does not exist', async () => {
    context.token = mockToken(superAdmin);

    await testNotFound(testServer, context, query, { templateId: 99999999 });
    await testNotFound(testServer, context, addMutation, { templateId: 99999999, email: 'test' });
    await testNotFound(testServer, context, removeMutation, { templateId: 99999999, email: 'test' });
  });

  it('handles missing tokens and internal server errors', async () => {
    context.token = mockToken(superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: query,
      variables: { templateId: template.id },
      spyOnClass: TemplateCollaborator,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: addMutation,
      variables: { templateId: template.id, email: casual.email },
      spyOnClass: TemplateCollaborator,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    // Test standard error handling for remove
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: removeMutation,
      variables: { templateId: template.id, email: existingCollaborator.email },
      spyOnClass: TemplateCollaborator,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    })
  });
});


describe('projectCollaborators', () => {
  let project: Project;

  let creator: User;
  let existingCollaborator: ProjectCollaborator;

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

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryRemoveAccess(
    contextIn: MyContext,
    errContext: string,
    canQuery = true,
    canAddAndRemove = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { projectId: project.id };

    const qryResp = await executeQuery(testServer, contextIn, query, queryVariables);
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
      const userId = context.token.id;

      // Should be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();

      const id = addResp.body.singleResult.data.addProjectCollaborator.id;
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addProjectCollaborator.invitedBy.id, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addProjectCollaborator.email, msg).toEqual(addVariables.email);
      expect(addResp.body.singleResult.data.addProjectCollaborator.accessLevel, msg).toEqual(addVariables.accessLevel);
      expect(addResp.body.singleResult.data.addProjectCollaborator.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addProjectCollaborator.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.projectCollaborators.map(c => c.id), msg).toContain(id);

      // Should be able to update
      const updResp = await executeQuery(testServer, contextIn, updateMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      expect(updResp.body.singleResult.data.updateProjectCollaborator.id, msg).toEqual(existingCollaborator.id);
      expect(updResp.body.singleResult.data.updateProjectCollaborator.accessLevel, msg).toEqual(updateVariables.accessLevel);
      expect(updResp.body.singleResult.data.updateProjectCollaborator.modifiedById, msg).toEqual(userId);
      expect(updResp.body.singleResult.data.updateProjectCollaborator.email, msg).toEqual(existingCollaborator.email);
      expect(updResp.body.singleResult.data.updateProjectCollaborator.createdById, msg).toEqual(existingCollaborator.createdById);

      // Should be able to remove
      const removeVariables = { projectCollaboratorId: id }

      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removeProjectCollaborator.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.projectCollaborators.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to update
      const updResp = await executeQuery(testServer, contextIn, updateMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeDefined();
      expect(updResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { projectCollaboratorId: existingCollaborator.id }
      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  beforeEach(async () => {
    // Generate the creator of the project
    creator = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }));
    // Make sure the token belongs to the creator
    context.token = mockToken(creator);
    project = await persistProject(context, mockProject({}));

    existingCollaborator = await persistProjectCollaborator(context, mockProjectCollaborator({
      projectId: project.id,
    }));
  });

  afterEach(async () => {
    // Clean up the project, user and collaborator records we generated
    await cleanUpAddedProjectCollaborator(context, existingCollaborator.id);
    await cleanUpAddedProject(context, project.id);
    await cleanUpAddedUser(context, creator.id);
  });

  it('Super Admin flow', async () => {
    context.token = mockToken(superAdmin);
    await testAddQueryRemoveAccess(context, 'SuperAdmin', true, true);
  });

  it('Admin of same affiliation flow', async () => {
    context.token = mockToken(sameAffiliationAdmin);
    await testAddQueryRemoveAccess(context, 'Admin, same affiliation', true, true);
  });

  it('Admin of other affiliation flow', async () => {
    context.token = mockToken(otherAffiliationAdmin);
    await testAddQueryRemoveAccess(context, 'Admin. other affiliation', false, false);
  });

  it('Project creator flow', async () => {
    context.token = mockToken(creator);
    await testAddQueryRemoveAccess(context, 'creator', true, true);
  });

  it('Research who is not the creator or a collaborator flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(context, 'researcher, random', false, false);
  });

  it('Research with comment level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: otherAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    const collab = await persistProjectCollaborator(
      context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.COMMENT
      })
    )
    context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(context, 'researcher, commenter', true, false);

    await cleanUpAddedProjectCollaborator(context, collab.id);
  });

  it('Research with edit level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: otherAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    const collab = await persistProjectCollaborator(
      context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      })
    )
    context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(context, 'researcher, editor', true, true);

    await cleanUpAddedProjectCollaborator(context, collab.id);
  });

  it('Research with owner level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: otherAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    const collab = await persistProjectCollaborator(
      context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.OWN
      })
    )
    context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(context, 'researcher, owner', true, true);

    await cleanUpAddedProjectCollaborator(context, collab.id);
  });

  it('Throws a 404 if the template does not exist', async () => {
    context.token = mockToken(superAdmin);

    await testNotFound(testServer, context, query, { projectId: 99999999 });
    await testNotFound(testServer, context, addMutation, { projectId: 99999999, email: 'test' });
    await testNotFound(testServer, context, updateMutation, {
      projectCollaboratorId: 99999999,
      accessLevel: ProjectCollaboratorAccessLevel.EDIT
    });
    await testNotFound(testServer, context, removeMutation, { projectCollaboratorId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    context.token = mockToken(superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: query,
      variables: { projectId: project.id },
      spyOnClass: ProjectCollaborator,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
      server: testServer,
      context,
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
      server: testServer,
      context,
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
      server: testServer,
      context,
      graphQL: removeMutation,
      variables: { projectCollaboratorId: existingCollaborator.id },
      spyOnClass: ProjectCollaborator,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});

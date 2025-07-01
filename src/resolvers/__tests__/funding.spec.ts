import { ApolloServer } from "@apollo/server";
import casual from "casual";
import { buildContext, MyContext } from "../../context";
import { User, UserRole } from "../../models/User";
import { Project } from "../../models/Project";
import {
  PlanFunding,
  ProjectFunding,
  ProjectFundingStatus
} from '../../models/Funding';
import { MySQLConnection } from "../../datasources/mysql";
import {
  executeQuery,
  initErrorMessage,
  initTestServer,
  mockToken, testNotFound, testStandardErrors,
} from "./resolverTestHelper";
import {
  cleanUpAddedAffiliation,
  randomAffiliation
} from "../../models/__mocks__/Affiliation";
import {
  cleanUpAddedUser,
  mockUser,
  persistUser,
} from "../../models/__mocks__/User";
import {
  cleanUpAddedProject,
  mockProject,
  persistProject
} from "../../models/__mocks__/Project";
import { Affiliation } from "../../models/Affiliation";
import assert from "assert";
import {
  cleanUpAddedPlanFunding, cleanUpAddedPlanFundings,
  cleanUpAddedProjectFunding, cleanUpAddedProjectFundings,
  mockPlanFunding,
  mockProjectFunding, persistPlanFunding, persistProjectFunding,
} from "../../models/__mocks__/Funding";
import { getRandomEnumValue } from "../../__tests__/helpers";
import {
  cleanUpAddedProjectCollaborators,
  mockProjectCollaborator,
  persistProjectCollaborator
} from "../../models/__mocks__/Collaborator";
import { ProjectCollaboratorAccessLevel } from "../../models/Collaborator";
import { Plan } from "../../models/Plan";
import {
  cleanUpAddedPlan,
  mockPlan,
  persistPlan
} from "../../models/__mocks__/Plan";
import { VersionedTemplate } from "../../models/VersionedTemplate";
import { randomVersionedTemplate } from "../../models/__mocks__/VersionedTemplate";

// Mock and then import the logger (this has jest pick up and use src/__mocks__/logger.ts)
jest.mock('../../logger');
import { logger as mockLogger } from '../../logger';

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
  context = buildContext(mockLogger, null, null, mysqlInstance, null);

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


describe('projectFundings', () => {
  let project: Project;

  let creator: User;
  let otherFunder: Affiliation;
  let existingFunding: ProjectFunding;

  const query = `
    query projectFundingsQuery($projectId: Int!) {
      projectFundings (projectId: $projectId) {
        id
        createdById
        created
        modifiedById
        modified
        project {
          id
        }
        affiliation {
          uri
        }
        status
        grantId
        funderProjectNumber
        funderOpportunityNumber
      }
    }
  `;

  const querySingle = `
    query projectFundingQuery($projectFundingId: Int!) {
      projectFunding (projectFundingId: $projectFundingId) {
        id
        createdById
        created
        modifiedById
        modified
        project {
          id
        }
        affiliation {
          uri
        }
        status
        grantId
        funderProjectNumber
        funderOpportunityNumber
      }
    }
  `;

  const addMutation = `
    mutation AddProjectFunding($input: AddProjectFundingInput!) {
      addProjectFunding (input: $input) {
        id
        createdById
        modifiedById
        project {
          id
        }
        affiliation {
          uri
        }
        status
        grantId
        funderProjectNumber
        funderOpportunityNumber
        errors {
          general
        }
      }
    }
  `;

  const updateMutation = `
    mutation UpdateProjectFunding($input: UpdateProjectFundingInput!) {
      updateProjectFunding (input: $input) {
        id
        modifiedById
        createdById
        project {
          id
        }
        affiliation {
          uri
        }
        status
        grantId
        funderProjectNumber
        funderOpportunityNumber
        errors {
          general
        }
      }
    }
  `;

  const removeMutation = `
    mutation RemoveProjectFunding($projectFundingId: Int!) {
      removeProjectFunding (projectFundingId: $projectFundingId) {
        id
      }
    }
  `;

  // Test that the specified user/token is able to perform all actions
  async function testAddUpdateRemoveAccess(
    contextIn: MyContext,
    errContext: string,
    canQuery = true,
    canAddUpdateAndRemove = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { projectId: project.id };

    const qryResp = await executeQuery(testServer, contextIn, query, queryVariables);
    const qry2Variables = { projectFundingId: existingFunding.id };
    const qry2Resp = await executeQuery(testServer, contextIn, querySingle, qry2Variables);

    if (canQuery) {
      assert(qryResp.body.kind === 'single');
      expect(qryResp.body.singleResult.errors, msg).toBeUndefined();

      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
    } else {
      assert(qryResp.body.kind === 'single');
      expect(qryResp.body.singleResult.errors, msg).toBeDefined();
      expect(qryResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should not be able to fetch a single record
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeDefined();
      expect(qry2Resp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }

    const addVariables = {
      projectId: project.id,
      affiliationId: otherFunder.uri,
      status: getRandomEnumValue(ProjectFundingStatus),
      grantId: casual.url,
      funderProjectNumber: `${casual.word}-${casual.integer(1, 9999)}`,
      funderOpportunityNumber: `${casual.word}-${casual.integer(1, 9999)}`,
    }

    const updateVariables = {
      projectFundingId: existingFunding.id,
      status: getRandomEnumValue(ProjectFundingStatus),
      grantId: casual.url,
      funderProjectNumber: `${casual.word}-${casual.integer(1, 9999)}`,
      funderOpportunityNumber: `${casual.word}-${casual.integer(1, 9999)}`,
    }

    if (canAddUpdateAndRemove) {
      const userId = contextIn.token.id;

      // Should be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, { input: addVariables });
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();
      const id = addResp.body.singleResult.data.addProjectFunding.id;
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addProjectFunding.affiliation.uri, msg).toEqual(addVariables.affiliationId);
      expect(addResp.body.singleResult.data.addProjectFunding.status, msg).toEqual(addVariables.status);
      expect(addResp.body.singleResult.data.addProjectFunding.grantId, msg).toEqual(addVariables.grantId);
      expect(addResp.body.singleResult.data.addProjectFunding.funderProjectNumber, msg).toEqual(addVariables.funderProjectNumber);
      expect(addResp.body.singleResult.data.addProjectFunding.funderOpportunityNumber, msg).toEqual(addVariables.funderOpportunityNumber);
      expect(addResp.body.singleResult.data.addProjectFunding.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addProjectFunding.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Variables = { projectFundingId: id }
      const qry2Resp = await executeQuery(testServer, contextIn, querySingle, qry2Variables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.projectFunding.id, msg).toEqual(id);

      // Should be able to update
      const updResp = await executeQuery(testServer, contextIn, updateMutation, { input: updateVariables });
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      expect(updResp.body.singleResult.data.updateProjectFunding.id, msg).toEqual(existingFunding.id);
      expect(updResp.body.singleResult.data.updateProjectFunding.status, msg).toEqual(updateVariables.status);
      expect(updResp.body.singleResult.data.updateProjectFunding.grantId, msg).toEqual(updateVariables.grantId);
      expect(updResp.body.singleResult.data.updateProjectFunding.funderProjectNumber, msg).toEqual(updateVariables.funderProjectNumber);
      expect(updResp.body.singleResult.data.updateProjectFunding.funderOpportunityNumber, msg).toEqual(updateVariables.funderOpportunityNumber);

      // Should be able to remove
      const removeVariables = { projectFundingId: id }

      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removeProjectFunding.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.projectFundings.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, { input: addVariables });
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to update
      const updResp = await executeQuery(testServer, contextIn, updateMutation, { input: updateVariables });
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeDefined();
      expect(updResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { projectFundingId: existingFunding.id }
      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  beforeEach(async () => {
    jest.resetAllMocks();

    // Generate the creator of the project
    creator = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }));

    otherFunder = await randomAffiliation(context, true);

    // Make sure the token belongs to the creator
    context.token = mockToken(creator);
    project = await persistProject(context, mockProject({}));

    const mockFunding = mockProjectFunding({
      projectId: project.id,
      affiliationId: sameAffiliationAdmin.affiliationId,
    });
    existingFunding = await persistProjectFunding(context, mockFunding);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    // Clean up the project, user and Funding records we generated
    await cleanUpAddedProjectFunding(context, existingFunding.id);
    await cleanUpAddedProject(context, project.id);
    await cleanUpAddedAffiliation(context, otherFunder.id);
    await cleanUpAddedUser(context, creator.id);
  });

  it('Super Admin flow', async () => {
    context.token = mockToken(superAdmin);
    await testAddUpdateRemoveAccess(context, 'SuperAdmin', true, true);
  });

  it('Admin of same affiliation flow', async () => {
    context.token = mockToken(sameAffiliationAdmin);
    await testAddUpdateRemoveAccess(context, 'Admin, same affiliation', true, true);
  });

  it('Admin of other affiliation flow', async () => {
    context.token = mockToken(otherAffiliationAdmin);
    await testAddUpdateRemoveAccess(context, 'Admin. other affiliation', false, false);
  });

  it('Project creator flow', async () => {
    context.token = mockToken(creator);
    await testAddUpdateRemoveAccess(context, 'creator', true, true);
  });

  it('Research who is not the creator or a collaborator flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    context.token = mockToken(researcher);
    await testAddUpdateRemoveAccess(context, 'researcher, random', false, false);

    await cleanUpAddedUser(context, researcher.id);
  });

  it('Research with comment level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.COMMENT
      })
    )
    context.token = mockToken(researcher);
    await testAddUpdateRemoveAccess(context, 'researcher, commenter', true, false);

    await cleanUpAddedProjectCollaborators(context, project.id);
    await cleanUpAddedProjectFundings(context, project.id);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('Research with edit level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      })
    )
    context.token = mockToken(researcher);
    await testAddUpdateRemoveAccess(context, 'researcher, editor', true, true);

    await cleanUpAddedProjectCollaborators(context, project.id);
    await cleanUpAddedProjectFundings(context, project.id);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('Research with owner level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.OWN
      })
    )
    context.token = mockToken(researcher);
    await testAddUpdateRemoveAccess(context, 'researcher, owner', true, true);

    await cleanUpAddedProjectCollaborators(context, project.id);
    await cleanUpAddedProjectFundings(context, project.id);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('returns the Funding with errors if it is a duplicate', async () => {
    context.token = mockToken(superAdmin);

    // Existing Email
    const emailVariables = { input: { projectId: project.id, affiliationId: existingFunding.affiliationId } };
    const emailResp = await executeQuery(testServer, context, addMutation, emailVariables);

    assert(emailResp.body.kind === 'single');
    expect(emailResp.body.singleResult.errors).toBeUndefined();
    expect(emailResp.body.singleResult.data.addProjectFunding.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the project does not exist', async () => {
    context.token = mockToken(superAdmin);

    await testNotFound(testServer, context, query, { projectId: 99999999 });
    await testNotFound(testServer, context, querySingle, { projectFundingId: 99999999 });
    await testNotFound(testServer, context, addMutation, {
      input: {
        projectId: 99999999,
        affiliationId: otherFunder.uri,
        status: ProjectFundingStatus.DENIED
      }
    });
    await testNotFound(testServer, context, updateMutation, {
      input: {
        projectFundingId: 99999999,
        status: ProjectFundingStatus.PLANNED
      }
    });
    await testNotFound(testServer, context, removeMutation, { projectFundingId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    context.token = mockToken(superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: query,
      variables: { projectId: project.id },
      spyOnClass: ProjectFunding,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: querySingle,
      variables: { projectFundingId: existingFunding.id },
      spyOnClass: ProjectFunding,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: addMutation,
      variables: {
        input: {
          projectId: project.id,
          affiliationId: otherFunder.uri,
          status: getRandomEnumValue(ProjectFundingStatus),
        }
      },
      spyOnClass: ProjectFunding,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    // Test standard error handling for update
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: updateMutation,
      variables: {
        input: {
          projectFundingId: existingFunding.id,
          status: getRandomEnumValue(ProjectFundingStatus),
        }
      },
      spyOnClass: ProjectFunding,
      spyOnFunction: 'update',
      mustBeAuthenticated: true
    });

    // Test standard error handling for remove
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: removeMutation,
      variables: { projectFundingId: existingFunding.id },
      spyOnClass: ProjectFunding,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});



describe('planFundings', () => {
  let project: Project;
  let versionedTemplate: VersionedTemplate;
  let plan: Plan;

  let creator: User;
  let otherFunder: Affiliation;
  let existingProjectFunding: ProjectFunding;
  let otherProjectFunding: ProjectFunding;
  let existingFunding: PlanFunding;

  const query = `
    query planFundingsQuery($planId: Int!) {
      planFundings (planId: $planId) {
        id
        createdById
        created
        modifiedById
        modified
        plan {
          id
        }
        projectFunding {
          id
        }
      }
    }
  `;

  const addMutation = `
    mutation AddPlanFunding($planId: Int!, $projectFundingId: Int!) {
      addPlanFunding (planId: $planId, projectFundingId: $projectFundingId) {
        id
        createdById
        modifiedById
        plan {
          id
        }
        projectFunding {
          id
        }
        errors {
          general
        }
      }
    }
  `;

  const removeMutation = `
    mutation RemovePlanFunding($planFundingId: Int!) {
      removePlanFunding (planFundingId: $planFundingId) {
        id
      }
    }
  `;

  // Test that the specified user/token is able to perform all actions
  async function testAccess(
    contextIn: MyContext,
    errContext: string,
    canQuery = true,
    canAddAndRemove = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { planId: plan.id };

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
      planId: plan.id,
      projectFundingId: otherProjectFunding.id,
    }

    if (canAddAndRemove) {
      const userId = contextIn.token.id;

      // Should be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();
      const id = addResp.body.singleResult.data.addPlanFunding.id;
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addPlanFunding.plan.id, msg).toEqual(plan.id);
      expect(addResp.body.singleResult.data.addPlanFunding.projectFunding.id, msg).toEqual(otherProjectFunding.id);
      expect(addResp.body.singleResult.data.addPlanFunding.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addPlanFunding.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.planFundings.map(r => r.id), msg).toContain(id);

      // Should be able to remove
      const removeVariables = { planFundingId: id }

      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removePlanFunding.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.planFundings.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { planFundingId: existingFunding.id }
      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  beforeEach(async () => {
    jest.resetAllMocks();

    // Generate the creator of the project
    creator = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }));
    // Make sure the token belongs to the creator
    context.token = mockToken(creator);
    project = await persistProject(context, mockProject({}));

    otherFunder = await randomAffiliation(context, true);

    const mockProjFunding = mockProjectFunding({
      projectId: project.id,
      affiliationId: sameAffiliationAdmin.affiliationId,
    });
    existingProjectFunding = await persistProjectFunding(context, mockProjFunding);

    const mockOtherFunding = mockProjectFunding({
      projectId: project.id,
      affiliationId: otherFunder.uri,
    });
    otherProjectFunding = await persistProjectFunding(context, mockOtherFunding);

    // Persist a Plan
    versionedTemplate = await randomVersionedTemplate(context);
    plan = await persistPlan(context, mockPlan({
      versionedTemplateId: versionedTemplate.id,
      projectId: project.id
    }));

    const mockFunding = mockPlanFunding({
      planId: plan.id,
      projectFundingId: existingProjectFunding.id,
    })
    existingFunding = await persistPlanFunding(context, mockFunding);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    // Clean up the project, plan, user and Funding records we generated
    await cleanUpAddedPlanFunding(context, existingFunding.id);
    await cleanUpAddedProjectFunding(context, existingProjectFunding.id);
    await cleanUpAddedPlan(context, plan.id);
    await cleanUpAddedProject(context, project.id);
    await cleanUpAddedAffiliation(context, otherFunder.id);
    await cleanUpAddedUser(context, creator.id);
  });

  it('Super Admin flow', async () => {
    context.token = mockToken(superAdmin);
    await testAccess(context, 'SuperAdmin', true, true);
  });

  it('Admin of same affiliation flow', async () => {
    context.token = mockToken(sameAffiliationAdmin);
    await testAccess(context, 'Admin, same affiliation', true, true);
  });

  it('Admin of other affiliation flow', async () => {
    context.token = mockToken(otherAffiliationAdmin);
    await testAccess(context, 'Admin. other affiliation', false, false);
  });

  it('Project creator flow', async () => {
    context.token = mockToken(creator);
    await testAccess(context, 'creator', true, true);
  });

  it('Research who is not the creator or a collaborator flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    context.token = mockToken(researcher);
    await testAccess(context, 'researcher, random', false, false);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('Research with comment level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.COMMENT
      })
    )
    context.token = mockToken(researcher);
    await testAccess(context, 'researcher, commenter', true, false);

    await cleanUpAddedProjectCollaborators(context, project.id);
    await cleanUpAddedPlanFundings(context, plan.id);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('Research with edit level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      })
    )
    context.token = mockToken(researcher);
    await testAccess(context, 'researcher, editor', true, true);

    await cleanUpAddedProjectCollaborators(context, project.id);
    await cleanUpAddedPlanFundings(context, plan.id);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('Research with owner level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.OWN
      })
    )
    context.token = mockToken(researcher);
    await testAccess(context, 'researcher, owner', true, true);

    await cleanUpAddedProjectCollaborators(context, project.id);
    await cleanUpAddedPlanFundings(context, plan.id);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('returns the Funding with errors if it is a duplicate', async () => {
    context.token = mockToken(superAdmin);

    // Existing Email
    const variables = { planId: plan.id, projectFundingId: existingProjectFunding.id };
    const resp = await executeQuery(testServer, context, addMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.addPlanFunding.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the plan does not exist', async () => {
    context.token = mockToken(superAdmin);

    await testNotFound(testServer, context, query, { planId: 99999999 });
    await testNotFound(testServer, context, addMutation, { planId: 99999999, projectFundingId: existingProjectFunding.id });
    await testNotFound(testServer, context, addMutation, { planId: plan.id, projectFundingId: 99999999 });
    await testNotFound(testServer, context, removeMutation, { planFundingId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    context.token = mockToken(superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: query,
      variables: { planId: plan.id },
      spyOnClass: PlanFunding,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: addMutation,
      variables: {
        planId: plan.id,
        projectFundingId: otherProjectFunding.id,
      },
      spyOnClass: PlanFunding,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    // Test standard error handling for remove
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: removeMutation,
      variables: { planFundingId: existingFunding.id },
      spyOnClass: PlanFunding,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});

import casual from "casual";
import { User, UserRole } from "../../models/User";
import { Project } from "../../models/Project";
import {
  PlanFunding,
  ProjectFunding,
  ProjectFundingStatus
} from '../../models/Funding';
import {
  addTableForTeardown,
  executeQuery, generateFullTemplate, generateFullVersionedTemplate,
  initResolverTest,
  mockToken,
  ResolverTest,
  teardownResolverTest,
  testNotFound,
  testStandardErrors,
} from "./resolverTestHelper";
import { mockAffiliation, persistAffiliation } from "../../models/__mocks__/Affiliation";
import { mockUser, persistUser } from "../../models/__mocks__/User";
import { mockProject, persistProject } from "../../models/__mocks__/Project";
import { Affiliation } from "../../models/Affiliation";
import assert from "assert";
import {
  mockPlanFunding,
  mockProjectFunding,
  persistPlanFunding,
  persistProjectFunding,
} from "../../models/__mocks__/Funding";
import { getRandomEnumValue } from "../../__tests__/helpers";
import {
  mockProjectCollaborator,
  persistProjectCollaborator
} from "../../models/__mocks__/Collaborator";
import {
  ProjectCollaborator,
  ProjectCollaboratorAccessLevel
} from "../../models/Collaborator";
import { Plan } from "../../models/Plan";
import { mockPlan, persistPlan } from "../../models/__mocks__/Plan";
import { TemplateVersionType, VersionedTemplate } from "../../models/VersionedTemplate";

// Mock and then import the logger (this has jest pick up and use src/__mocks__/logger.ts)
jest.mock('../../logger');
import {TemplateVisibility} from "../../models/Template";

jest.mock("../../datasources/dmphubAPI");

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

describe('projectFundings', () => {
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

  let project: Project;

  let creator: User;
  let otherFunder: Affiliation;
  let existingFunding: ProjectFunding;

  // Test that the specified user/token is able to perform all actions
  async function testAddUpdateRemoveAccess(
    errContext: string,
    canQuery = true,
    canAddUpdateAndRemove = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { projectId: project.id };

    const qryResp = await executeQuery(query, queryVariables);
    const qry2Variables = { projectFundingId: existingFunding.id };
    const qry2Resp = await executeQuery(querySingle, qry2Variables);

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
      const userId = resolverTest.context.token.id;

      // Should be able to add
      const addResp = await executeQuery(addMutation, { input: addVariables });
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
      const qry2Resp = await executeQuery(querySingle, qry2Variables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.projectFunding.id, msg).toEqual(id);

      // Should be able to update
      const updResp = await executeQuery(updateMutation, { input: updateVariables });
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      expect(updResp.body.singleResult.data.updateProjectFunding.id, msg).toEqual(existingFunding.id);
      expect(updResp.body.singleResult.data.updateProjectFunding.status, msg).toEqual(updateVariables.status);
      expect(updResp.body.singleResult.data.updateProjectFunding.grantId, msg).toEqual(updateVariables.grantId);
      expect(updResp.body.singleResult.data.updateProjectFunding.funderProjectNumber, msg).toEqual(updateVariables.funderProjectNumber);
      expect(updResp.body.singleResult.data.updateProjectFunding.funderOpportunityNumber, msg).toEqual(updateVariables.funderOpportunityNumber);

      // Should be able to remove
      const removeVariables = { projectFundingId: id }

      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removeProjectFunding.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.projectFundings.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(addMutation, { input: addVariables });
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to update
      const updResp = await executeQuery(updateMutation, { input: updateVariables });
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeDefined();
      expect(updResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { projectFundingId: existingFunding.id }
      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  beforeEach(async () => {
    // Generate the creator of the project
    creator = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }));
    addTableForTeardown(User.tableName);

    otherFunder = await persistAffiliation(
      resolverTest.context,
      mockAffiliation({
        funder: true,
        fundrefId: casual.url,
      })
    );
    addTableForTeardown(Affiliation.tableName);

    // Make sure the token belongs to the creator
    resolverTest.context.token = mockToken(creator);
    project = await persistProject(resolverTest.context, mockProject({}));
    addTableForTeardown(Project.tableName);

    existingFunding = await persistProjectFunding(
      resolverTest.context,
      mockProjectFunding({
        projectId: project.id,
        affiliationId: resolverTest.funder.uri,
      })
    );
    addTableForTeardown(ProjectFunding.tableName);
  });

  it('Super Admin flow', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);
    await testAddUpdateRemoveAccess('SuperAdmin', true, true);
  });

  it('Admin of same affiliation flow', async () => {
    resolverTest.context.token = mockToken(resolverTest.adminAffiliationA);
    await testAddUpdateRemoveAccess('Admin, same affiliation', true, true);
  });

  it('Admin of other affiliation flow', async () => {
    resolverTest.context.token = mockToken(resolverTest.adminAffiliationB);
    await testAddUpdateRemoveAccess('Admin. other affiliation', false, false);
  });

  it('Project creator flow', async () => {
    resolverTest.context.token = mockToken(creator);
    await testAddUpdateRemoveAccess('creator', true, true);
  });

  it('Research who is not the creator or a collaborator flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    resolverTest.context.token = mockToken(researcher);
    await testAddUpdateRemoveAccess('researcher, random', false, false);

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
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.COMMENT
      })
    )
    resolverTest.context.token = mockToken(researcher);
    await testAddUpdateRemoveAccess('researcher, commenter', true, false);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Research with edit level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      })
    )
    resolverTest.context.token = mockToken(researcher);
    await testAddUpdateRemoveAccess('researcher, editor', true, true);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Research with owner level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.OWN
      })
    )
    resolverTest.context.token = mockToken(researcher);
    await testAddUpdateRemoveAccess('researcher, owner', true, true);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('returns the Funding with errors if it is a duplicate', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    // Existing Email
    const emailVariables = { input: { projectId: project.id, affiliationId: existingFunding.affiliationId } };
    const emailResp = await executeQuery(addMutation, emailVariables);

    assert(emailResp.body.kind === 'single');
    expect(emailResp.body.singleResult.errors).toBeUndefined();
    expect(emailResp.body.singleResult.data.addProjectFunding.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the project does not exist', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    await testNotFound(query, { projectId: 99999999 });
    await testNotFound(querySingle, { projectFundingId: 99999999 });
    await testNotFound(addMutation, {
      input: {
        projectId: 99999999,
        affiliationId: otherFunder.uri,
        status: ProjectFundingStatus.DENIED
      }
    });
    await testNotFound(updateMutation, {
      input: {
        projectFundingId: 99999999,
        status: ProjectFundingStatus.PLANNED
      }
    });
    await testNotFound(removeMutation, { projectFundingId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: query,
      variables: { projectId: project.id },
      spyOnClass: ProjectFunding,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: querySingle,
      variables: { projectFundingId: existingFunding.id },
      spyOnClass: ProjectFunding,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
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
      graphQL: removeMutation,
      variables: { projectFundingId: existingFunding.id },
      spyOnClass: ProjectFunding,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});



describe('planFundings', () => {
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

  let project: Project;
  let versionedTemplate: VersionedTemplate;
  let plan: Plan;

  let creator: User;
  let otherFunder: Affiliation;
  let existingProjectFunding: ProjectFunding;
  let otherProjectFunding: ProjectFunding;
  let existingFunding: PlanFunding;

  // Test that the specified user/token is able to perform all actions
  async function testAccess(
    errContext: string,
    canQuery = true,
    canAddAndRemove = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { planId: plan.id };

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
      planId: plan.id,
      projectFundingId: otherProjectFunding.id,
    }

    if (canAddAndRemove) {
      const userId = resolverTest.context.token.id;

      // Should be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();
      const id = addResp.body.singleResult.data.addPlanFunding.id;
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addPlanFunding.plan.id, msg).toEqual(plan.id);
      expect(addResp.body.singleResult.data.addPlanFunding.projectFunding.id, msg).toEqual(otherProjectFunding.id);
      expect(addResp.body.singleResult.data.addPlanFunding.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addPlanFunding.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Resp = await executeQuery(query, queryVariables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.planFundings.map(r => r.id), msg).toContain(id);

      // Should be able to remove
      const removeVariables = { planFundingId: id }

      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removePlanFunding.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.planFundings.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { planFundingId: existingFunding.id }
      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  beforeEach(async () => {
    // Generate the creator of the project
    creator = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }));
    // Make sure the token belongs to the creator
    resolverTest.context.token = mockToken(creator);
    project = await persistProject(resolverTest.context, mockProject({}));

    otherFunder = await persistAffiliation(
      resolverTest.context,
      mockAffiliation({
        funder: true,
        fundrefId: casual.url
      })
    );
    addTableForTeardown(Affiliation.tableName);

    existingProjectFunding = await persistProjectFunding(
      resolverTest.context,
      mockProjectFunding({
        projectId: project.id,
        affiliationId: resolverTest.adminAffiliationA.affiliationId,
      })
    );

    otherProjectFunding = await persistProjectFunding(
      resolverTest.context,
      mockProjectFunding({
        projectId: project.id,
        affiliationId: otherFunder.uri,
      })
    );
    addTableForTeardown(ProjectFunding.tableName);

    // Create a template for the funder and then a published version of it.
    // These functions add the corresponding tables to the teardown list
    const template = await generateFullTemplate(resolverTest);
    versionedTemplate = await generateFullVersionedTemplate(
      resolverTest,
      template.id,
      TemplateVisibility.PUBLIC,
      TemplateVersionType.PUBLISHED
    );

    // Persist a Plan
    plan = await persistPlan(
      resolverTest.context,
      mockPlan({
        versionedTemplateId: versionedTemplate.id,
        projectId: project.id
      })
    );
    addTableForTeardown(Plan.tableName);

    existingFunding = await persistPlanFunding(
      resolverTest.context,
      mockPlanFunding({
        planId: plan.id,
        projectFundingId: existingProjectFunding.id,
      })
    );
    addTableForTeardown(PlanFunding.tableName);
  });

  it('Super Admin flow', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);
    await testAccess('SuperAdmin', true, true);
  });

  it('Admin of same affiliation flow', async () => {
    resolverTest.context.token = mockToken(resolverTest.adminAffiliationA);
    await testAccess('Admin, same affiliation', true, true);
  });

  it('Admin of other affiliation flow', async () => {
    resolverTest.context.token = mockToken(resolverTest.adminAffiliationB);
    await testAccess('Admin. other affiliation', false, false);
  });

  it('Project creator flow', async () => {
    resolverTest.context.token = mockToken(creator);
    await testAccess('creator', true, true);
  });

  it('Research who is not the creator or a collaborator flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    resolverTest.context.token = mockToken(researcher);
    await testAccess('researcher, random', false, false);

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
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.COMMENT
      })
    )
    resolverTest.context.token = mockToken(researcher);
    await testAccess('researcher, commenter', true, false);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Research with edit level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      })
    )
    resolverTest.context.token = mockToken(researcher);
    await testAccess('researcher, editor', true, true);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Research with owner level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.OWN
      })
    )
    resolverTest.context.token = mockToken(researcher);
    await testAccess('researcher, owner', true, true);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('returns the Funding with errors if it is a duplicate', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    // Existing Email
    const variables = { planId: plan.id, projectFundingId: existingProjectFunding.id };
    const resp = await executeQuery(addMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.addPlanFunding.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the plan does not exist', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    await testNotFound(query, { planId: 99999999 });
    await testNotFound(addMutation, { planId: 99999999, projectFundingId: existingProjectFunding.id });
    await testNotFound(addMutation, { planId: plan.id, projectFundingId: 99999999 });
    await testNotFound(removeMutation, { planFundingId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: query,
      variables: { planId: plan.id },
      spyOnClass: PlanFunding,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
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
      graphQL: removeMutation,
      variables: { planFundingId: existingFunding.id },
      spyOnClass: PlanFunding,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});

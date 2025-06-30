import { ApolloServer } from "@apollo/server";
import casual from "casual";
import { buildContext, MyContext } from "../../context";
import { User, UserRole } from "../../models/User";
import { Project } from "../../models/Project";
import { PlanMember, ProjectMember } from '../../models/Member';
import { MySQLConnection } from "../../datasources/mysql";
import {
  executeQuery,
  initErrorMessage,
  initTestServer,
  mockToken,
  testNotFound,
  testStandardErrors,
} from "./resolverTestHelper";
import { randomAffiliation } from "../../models/__mocks__/Affiliation";
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
  cleanUpAddedPlanMember,
  cleanUpAddedProjectMember,
  mockPlanMember,
  mockProjectMember,
  persistPlanMember,
  persistProjectMember,
} from "../../models/__mocks__/Member";
import { getRandomEnumValue } from "../../__tests__/helpers";
import {
  cleanUpAddedProjectCollaborator,
  mockProjectCollaborator,
  persistProjectCollaborator
} from "../../models/__mocks__/Collaborator";
import { ProjectCollaboratorAccessLevel } from "../../models/Collaborator";
import { Plan, PlanStatus, PlanVisibility } from "../../models/Plan";
import {
  cleanUpAddedPlan,
  mockPlan,
  persistPlan
} from "../../models/__mocks__/Plan";
import { VersionedTemplate } from "../../models/VersionedTemplate";
import {
  randomVersionedTemplate
} from "../../models/__mocks__/VersionedTemplate";
import { defaultLanguageId } from "../../models/Language";
import { PlanFunding, ProjectFunding } from "../../models/Funding";
import { VersionedSection } from "../../models/VersionedSection";
import { VersionedQuestion } from "../../models/VersionedQuestion";
import {
  cleanUpAddedPlanFunding,
  cleanUpAddedProjectFunding,
  mockPlanFunding,
  mockProjectFunding,
  persistPlanFunding,
  persistProjectFunding
} from "../../models/__mocks__/Funding";

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
  jest.resetAllMocks();

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


describe('plan', () => {
  let project: Project;
  let versionedTemplate: VersionedTemplate;
  let sections: {
    sectionId: number,
    sectionTitle: string,
    displayOrder: number,
    totalQuestions: number,
    answeredQuestions: number,
  }[];

  let creator: User;
  let existingPlan: Plan;
  let existingProjectMembers: ProjectMember[];
  let existingPlanMembers: PlanMember[];
  let existingProjectFundings: ProjectFunding[];
  let existingPlanFundings: PlanFunding[];

  const query = `
    query plansQuery($projectId: Int!) {
      plans (projectId: $projectId) {
        id
        createdBy
        created
        modifiedBy
        modified
        title
        status
        visibility
        dmpId
        registeredBy
        registered
        funding
        members
        templateTitle
        sections {
          sectionId
          sectionTitle
          displayOrder
          totalQuestions
          answeredQuestions
        }
      }
    }
  `;

  const querySingle = `
    query planQuery($planId: Int!) {
      plan (planId: $planId) {
        id
        createdById
        created
        modifiedById
        modified
        project {
          id
        }
        versionedTemplate {
          id
        }
        dmpId
        status
        visibility
        registeredById
        registered
        languageId
        featured
        sections {
          sectionId
          sectionTitle
          displayOrder
          totalQuestions
          answeredQuestions
        }
        members {
          id
        }
        fundings {
          id
        }
        answers {
          id
        }
      }
    }
  `;

  const addMutation = `
    mutation AddPlanMutation($projectId: Int!, $versionedTemplateId: Int!) {
      addPlan (projectId: $projectId, versionedTemplateId: $versionedTemplateId) {
        id
        createdById
        created
        modifiedById
        modified
        project {
          id
        }
        versionedTemplate {
          id
        }
        dmpId
        status
        visibility
        registeredById
        registered
        languageId
        featured
        sections {
          sectionId
          sectionTitle
          displayOrder
          totalQuestions
          answeredQuestions
        }
        members {
          id
        }
        fundings {
          id
        }
        errors {
          general
        }
      }
    }
  `;

  const publishPlanMutation = `
    mutation PublishPlanMutation($planId: Int!, $visibility: PlanVisibility) {
      publishPlan (planId: $planId, visibility: $visibility) {
        id
        status
        visibility
        registeredById
        registered
        errors {
          general
          visibility
        }
      }
    }
  `;

  const updatePlanStatusMutation = `
    mutation UpdatePlanStatus($planId: Int!, $status: PlanStatus!) {
      updatePlanStatus(planId: $planId, status: $status) {
        id
        status
        errors {
          general
          status
        }
      }
    }
  `;

  const removeMutation = `
    mutation ArchivePlanMutation($planId: Int!) {
      archivePlan (planId: $planId) {
        id
        status
        errors {
          general
        }
      }
    }
  `;

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryRemoveAccess(
    contextIn: MyContext,
    errContext: string,
    canQuery = true,
    canAdd = true,
    canUpdatePublishAndArchive = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { projectId: project.id };

    const qryResp = await executeQuery(testServer, contextIn, query, queryVariables);
    const qry2Variables = { planId: existingPlan.id };
    const qry2Resp = await executeQuery(testServer, contextIn, querySingle, qry2Variables);

    if (canQuery) {
      assert(qryResp.body.kind === 'single');
      expect(qryResp.body.singleResult.errors, msg).toBeUndefined();
      expect(qryResp.body.singleResult.data.plans.map(c => c.id), msg).toContain(existingPlan.id);

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
      versionedTemplateId: versionedTemplate.id
    }

    const userId = contextIn.token.id;
    let planId = existingPlan.id;

    if (canAdd) {
      // Should be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();
      planId = addResp.body.singleResult.data.addPlan.id;
      expect(planId, msg).toBeDefined();

      expect(addResp.body.singleResult.data.addPlan.project.id, msg).toEqual(project.id);
      expect(addResp.body.singleResult.data.addPlan.versionedTemplate.id, msg).toEqual(versionedTemplate.id);
      expect(addResp.body.singleResult.data.addPlan.dmpId, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addPlan.status, msg).toEqual(PlanStatus.DRAFT);
      expect(addResp.body.singleResult.data.addPlan.visibility, msg).toEqual(PlanVisibility.PRIVATE);
      expect(addResp.body.singleResult.data.addPlan.languageId, msg).toEqual(defaultLanguageId);
      expect(addResp.body.singleResult.data.addPlan.featured, msg).toBeFalsy();
      expect(addResp.body.singleResult.data.addPlan.registeredBy, msg).toBeUndefined();
      // expect(addResp.body.singleResult.data.addPlan.registered, msg).toBeUndefined();
      expect(addResp.body.singleResult.data.addPlan.sections, msg).toEqual(sections);
      expect(addResp.body.singleResult.data.addPlan.members, msg).toEqual([]);
      expect(addResp.body.singleResult.data.addPlan.fundings, msg).toEqual([]);
      expect(addResp.body.singleResult.data.addPlan.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addPlan.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Resp = await executeQuery(testServer, contextIn, querySingle, { planId });
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.plan.id, msg).toEqual(planId);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }

    const updateVariables = { planId, status: getRandomEnumValue(PlanStatus) }
    const publishVariables = { planId, visibility: getRandomEnumValue(PlanVisibility) }

    if (canUpdatePublishAndArchive) {
      // Should be able to update
      const updResp = await executeQuery(testServer, contextIn, updatePlanStatusMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      expect(updResp.body.singleResult.data.updatePlanStatus.id, msg).toEqual(planId);
      expect(updResp.body.singleResult.data.updatePlanStatus.status, msg).toEqual(updateVariables.status);

      // Should be able to archive
      const removeVariables = { planId }

      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.archivePlan.id, msg).toEqual(planId);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.plans.map(c => c.id), msg).not.toContain(planId);

    } else {
      // Should NOT be able to update status
      const updResp = await executeQuery(testServer, contextIn, updatePlanStatusMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeDefined();
      expect(updResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to publish
      const pubResp = await executeQuery(testServer, contextIn, publishPlanMutation, publishVariables);
      assert(pubResp.body.kind === 'single');
      expect(pubResp.body.singleResult.errors, msg).toBeDefined();
      expect(pubResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { planId }
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
    project = await persistProject(context, mockProject({ isTestProject: false }));

    // Get a random Template and then catalog its sections
    versionedTemplate = await randomVersionedTemplate(context);
    const vSections = await VersionedSection.findByTemplateId(
      'resolver test',
      context,
      versionedTemplate.id
    );
    sections = [];
    for (const section of vSections) {
      const questions = await VersionedQuestion.findByVersionedSectionId(
        'resolver test',
        context,
        section.id
      );
      sections.push({
        sectionId: section.id,
        sectionTitle: section.name,
        displayOrder: section.displayOrder,
        totalQuestions: questions.length,
        answeredQuestions: 0
      });
    }

    // Add some ProjectMembers and ProjectFunding
    existingProjectMembers = [];
    existingProjectFundings = [];
    for (let i = 0; i < 3; i++) {
      const mockMember = await mockProjectMember(context, {
        projectId: project.id,
        affiliationId: sameAffiliationAdmin.affiliationId,
      });
      existingProjectMembers.push(await persistProjectMember(context, mockMember));

      const mockFunding = mockProjectFunding({
        projectId: project.id,
        affiliationId: (await randomAffiliation(context, true)).uri
      });
      existingProjectFundings.push(await persistProjectFunding(context, mockFunding));
    }

    // Create a plan
    const mockedPlan = mockPlan({
      projectId: project.id,
      versionedTemplateId: versionedTemplate.id,
      status: PlanStatus.DRAFT,
      visibility: PlanVisibility.PUBLIC
    });
    existingPlan = await persistPlan(context, mockedPlan);

    // Attach members and funding to the Plan
    existingPlanMembers = [];
    existingPlanFundings = [];
    existingPlanMembers.push(await persistPlanMember(context, await mockPlanMember(context, {
      planId: existingPlan.id,
      projectMemberId: existingProjectMembers[0].id
    })));

    existingPlanMembers.push(await persistPlanMember(context, await mockPlanMember(context, {
      planId: existingPlan.id,
      projectMemberId: existingProjectMembers[1].id
    })));

    existingPlanFundings.push(await persistPlanFunding(context, mockPlanFunding({
      planId: existingPlan.id,
      projectFundingId: existingProjectFundings[0].id
    })));
  });

  afterEach(async () => {
    jest.clearAllMocks();

    // Clean up the plan and its associated entities
    for (const planMember of existingPlanMembers) {
      await cleanUpAddedPlanMember(context, planMember.id);
    }
    for (const planFunding of existingPlanFundings) {
      await cleanUpAddedPlanFunding(context, planFunding.id);
    }
    await cleanUpAddedPlan(context, existingPlan.id);

    // Clean up the project and its associated entities
    for (const member of existingProjectMembers) {
      await cleanUpAddedProjectMember(context, member.id);
    }
    for (const funding of existingProjectFundings) {
      await cleanUpAddedProjectFunding(context, funding.id);
    }
    await cleanUpAddedProject(context, project.id);

    await cleanUpAddedUser(context, creator.id);
  });

  it('Super Admin flow', async () => {
    context.token = mockToken(superAdmin);
    await testAddQueryRemoveAccess(context, 'SuperAdmin', true, true, true);
  });

  it('Admin of same affiliation flow', async () => {
    context.token = mockToken(sameAffiliationAdmin);
    await testAddQueryRemoveAccess(context, 'Admin, same affiliation', true, true, true);
  });

  it('Admin of other affiliation flow', async () => {
    context.token = mockToken(otherAffiliationAdmin);
    await testAddQueryRemoveAccess(context, 'Admin. other affiliation', false, false, false);
  });

  it('Project creator flow', async () => {
    context.token = mockToken(creator);
    await testAddQueryRemoveAccess(context, 'creator', true, true, true);
  });

  it('Research who is not the creator or a collaborator flow (private plan)', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(context, 'researcher, random', false, false, false);

    await cleanUpAddedUser(context, researcher.id);
  });

  it('Research with comment level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
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
    await testAddQueryRemoveAccess(context, 'researcher, commenter', true, false, false);

    await cleanUpAddedProjectCollaborator(context, collab.id);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('Research with edit level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
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
    await testAddQueryRemoveAccess(context, 'researcher, editor', true, true, false);

    await cleanUpAddedProjectCollaborator(context, collab.id);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('Research with owner level access flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
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
    await testAddQueryRemoveAccess(context, 'researcher, owner', true, true, true);

    await cleanUpAddedProjectCollaborator(context, collab.id);
    await cleanUpAddedUser(context, researcher.id);
  });

  it('Allows a plan to be published', async () => {
    context.token = mockToken(superAdmin);
    const variables = { planId: existingPlan.id, visibility: getRandomEnumValue(PlanVisibility) }

    const resp = await executeQuery(testServer, context, publishPlanMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.publishPlan.id).toEqual(existingPlan.id);
    expect(resp.body.singleResult.data.publishPlan.visibility).toEqual(variables.visibility);
    expect(resp.body.singleResult.data.publishPlan.registeredById).toEqual(context.token.id);
    expect(resp.body.singleResult.data.publishPlan.registered).toBeDefined();
  });

  it('Doesn\'t allow plans of test projects to be published', async () => {
    context.token = mockToken(superAdmin);
    project.isTestProject = true;
    await project.update(context)

    const variables = { planId: existingPlan.id, visibility: getRandomEnumValue(PlanVisibility) }
    const resp = await executeQuery(testServer, context, publishPlanMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.publishPlan.errors['general']).toBeDefined();
  });

  it('Doesn\'t allow published plans to be published again', async () => {
    context.token = mockToken(superAdmin);
    existingPlan.registeredById = context.token.id;
    existingPlan.registered = casual.date('YYYY-MM-DD hh:mm:ss');
    await existingPlan.update(context)

    const variables = { planId: existingPlan.id, visibility: getRandomEnumValue(PlanVisibility) }
    const resp = await executeQuery(testServer, context, publishPlanMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.publishPlan.errors['general']).toBeDefined();
  });

  it('Doesn\'t allow a published plan to be archived', async () => {
    context.token = mockToken(superAdmin);
    existingPlan.registeredById = context.token.id;
    existingPlan.registered = casual.date('YYYY-MM-DD hh:mm:ss');
    await existingPlan.update(context)

    const variables = { planId: existingPlan.id }
    const resp = await executeQuery(testServer, context, removeMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.archivePlan.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the project does not exist', async () => {
    context.token = mockToken(superAdmin);

    await testNotFound(testServer, context, query, { projectId: 99999999 });
    await testNotFound(testServer, context, querySingle, { planId: 99999999 });
    await testNotFound(testServer, context, addMutation, { projectId: 99999999, versionedTemplateId: versionedTemplate.id });
    await testNotFound(testServer, context, addMutation, { projectId: project.id, versionedTemplateId: 99999999 });
    await testNotFound(testServer, context, updatePlanStatusMutation, { planId: 99999999, status: PlanStatus.COMPLETE });
    await testNotFound(testServer, context, publishPlanMutation, { planId: 99999999, visibility: PlanVisibility.PUBLIC });
    await testNotFound(testServer, context, removeMutation, { planId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    context.token = mockToken(superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: query,
      variables: { projectId: project.id },
      spyOnClass: Plan,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: querySingle,
      variables: { planId: existingPlan.id },
      spyOnClass: Plan,
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
        versionedTemplateId: versionedTemplate.id
      },
      spyOnClass: Plan,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    // Test standard error handling for status update
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: updatePlanStatusMutation,
      variables: {
        planId: existingPlan.id,
        status: getRandomEnumValue(PlanStatus)
      },
      spyOnClass: Plan,
      spyOnFunction: 'update',
      mustBeAuthenticated: true
    });

    // Test standard error handling for publish
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: publishPlanMutation,
      variables: {
        planId: existingPlan.id,
        visibility: getRandomEnumValue(PlanVisibility)
      },
      spyOnClass: Plan,
      spyOnFunction: 'update',
      mustBeAuthenticated: true
    });

    // Test standard error handling for remove
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: removeMutation,
      variables: { planId: existingPlan.id },
      spyOnClass: Plan,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});

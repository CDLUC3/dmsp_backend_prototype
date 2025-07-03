import casual from "casual";
import { User, UserRole } from "../../models/User";
import { Project } from "../../models/Project";
import { PlanMember, ProjectMember } from '../../models/Member';
import {
  addTableForTeardown,
  executeQuery,
  generateFullTemplate,
  generateFullVersionedTemplate,
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
  mockPlanMember,
  mockProjectMember,
  persistPlanMember,
  persistProjectMember,
} from "../../models/__mocks__/Member";
import { getRandomEnumValue } from "../../__tests__/helpers";
import {
  mockProjectCollaborator,
  persistProjectCollaborator
} from "../../models/__mocks__/Collaborator";
import { ProjectCollaborator, ProjectCollaboratorAccessLevel } from "../../models/Collaborator";
import { Plan, PlanStatus, PlanVisibility } from "../../models/Plan";
import { mockPlan, persistPlan } from "../../models/__mocks__/Plan";
import { TemplateVersionType, VersionedTemplate } from "../../models/VersionedTemplate";
import { defaultLanguageId } from "../../models/Language";
import { PlanFunding, ProjectFunding } from "../../models/Funding";
import {
  mockPlanFunding,
  mockProjectFunding,
  persistPlanFunding,
  persistProjectFunding
} from "../../models/__mocks__/Funding";
import { TemplateVisibility } from "../../models/Template";
import { VersionedSection } from "../../models/VersionedSection";
import { VersionedQuestion } from "../../models/VersionedQuestion";
import {
  mockMemberRole,
  persistMemberRole
} from "../../models/__mocks__/MemberRole";
import {MemberRole} from "../../models/MemberRole";

// Mock and then import the logger (this has jest pick up and use src/__mocks__/logger.ts)
jest.mock('../../logger');

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

describe('plan', () => {
  // Define all the queries and mutations. We will be using them to simulate
  // GraphQL calls from a client
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

  // Define any dependencies for the object you're testing (e.g. Plan requires a
  // Project and a VersionedTemplate)
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
  let existingProjectFunding: ProjectFunding[];

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryRemoveAccess(
    errContext: string,
    canQuery = true,
    canAdd = true,
    canUpdatePublishAndArchive = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { projectId: project.id };

    const qryResp = await executeQuery(query, queryVariables);
    const qry2Variables = { planId: existingPlan.id };
    const qry2Resp = await executeQuery(querySingle, qry2Variables);

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

    const userId = resolverTest.context.token.id;
    let planId = existingPlan.id;

    if (canAdd) {
      // Should be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();
      planId = addResp.body.singleResult.data.addPlan.id;
      expect(planId, msg).toBeDefined();

      const sections = await VersionedSection.findByTemplateId(
        msg,
        resolverTest.context,
        versionedTemplate.id
      );
      const questions = await VersionedQuestion.findByVersionedSectionId(
        msg,
        resolverTest.context,
        sections[0].id
      );

      const expectedSectionInfo = [{
        answeredQuestions: 0,
        displayOrder: sections[0].displayOrder,
        sectionId: sections[0].id,
        sectionTitle: sections[0].name,
        totalQuestions: questions.length
      }];

      expect(addResp.body.singleResult.data.addPlan.project.id, msg).toEqual(project.id);
      expect(addResp.body.singleResult.data.addPlan.versionedTemplate.id, msg).toEqual(versionedTemplate.id);
      expect(addResp.body.singleResult.data.addPlan.dmpId, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addPlan.status, msg).toEqual(PlanStatus.DRAFT);
      expect(addResp.body.singleResult.data.addPlan.visibility, msg).toEqual(PlanVisibility.PRIVATE);
      expect(addResp.body.singleResult.data.addPlan.languageId, msg).toEqual(defaultLanguageId);
      expect(addResp.body.singleResult.data.addPlan.featured, msg).toBeFalsy();
      expect(addResp.body.singleResult.data.addPlan.registeredBy, msg).toBeUndefined();
      expect(addResp.body.singleResult.data.addPlan.sections, msg).toEqual(expectedSectionInfo);
      expect(addResp.body.singleResult.data.addPlan.members, msg).toEqual([]);
      expect(addResp.body.singleResult.data.addPlan.fundings, msg).toEqual([]);
      expect(addResp.body.singleResult.data.addPlan.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addPlan.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Resp = await executeQuery(querySingle, { planId });
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.plan.id, msg).toEqual(planId);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }

    const updateVariables = { planId, status: getRandomEnumValue(PlanStatus) }
    const publishVariables = { planId, visibility: getRandomEnumValue(PlanVisibility) }

    if (canUpdatePublishAndArchive) {
      // Should be able to update
      const updResp = await executeQuery(updatePlanStatusMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      expect(updResp.body.singleResult.data.updatePlanStatus.id, msg).toEqual(planId);
      expect(updResp.body.singleResult.data.updatePlanStatus.status, msg).toEqual(updateVariables.status);

      // Should be able to archive
      const removeVariables = { planId }

      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.archivePlan.id, msg).toEqual(planId);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.plans.map(c => c.id), msg).not.toContain(planId);

    } else {
      // Should NOT be able to update status
      const updResp = await executeQuery(updatePlanStatusMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeDefined();
      expect(updResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to publish
      const pubResp = await executeQuery(publishPlanMutation, publishVariables);
      assert(pubResp.body.kind === 'single');
      expect(pubResp.body.singleResult.errors, msg).toBeDefined();
      expect(pubResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { planId }
      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  // Build all dependencies for the object we're testing
  beforeEach(async () => {
    // Generate the creator of the project
    creator = await persistUser(
      resolverTest.context,
      mockUser({
        affiliationId: resolverTest.researcherAffiliationA.affiliationId,
        role: UserRole.RESEARCHER
      })
    );
    addTableForTeardown(User.tableName);

    // Make sure the token belongs to the creator
    resolverTest.context.token = mockToken(creator);
    project = await persistProject(
      resolverTest.context,
      mockProject({
        isTestProject: false
      })
    );
    addTableForTeardown(Project.tableName);

    // Create a member role
    const role = await persistMemberRole(resolverTest.context, mockMemberRole({}));
    addTableForTeardown(MemberRole.tableName);

    // Create a template for the funder and then a published version of it.
    // These functions add the corresponding tables to the teardown list
    const template = await generateFullTemplate(resolverTest);
    versionedTemplate = await generateFullVersionedTemplate(
      resolverTest,
      template.id,
      TemplateVisibility.PUBLIC,
      TemplateVersionType.PUBLISHED
    );

    // Add some ProjectMembers and ProjectFunding
    existingProjectMembers = [];
    existingProjectFunding = [];
    for (let i = 0; i < 3; i++) {
      const mockMember = await mockProjectMember(
        resolverTest.context,
        {
          projectId: project.id,
          affiliationId: resolverTest.researcherAffiliationA.affiliationId,
          memberRoles: [role]
        }
      );
      existingProjectMembers.push(await persistProjectMember(resolverTest.context, mockMember));

      const mockFunding = mockProjectFunding({
        projectId: project.id,
        affiliationId: resolverTest.funder.uri,
      });
      existingProjectFunding.push(await persistProjectFunding(resolverTest.context, mockFunding));
    }
    addTableForTeardown(ProjectMember.tableName);
    addTableForTeardown(ProjectFunding.tableName);

    // Create a plan
    existingPlan = await persistPlan(
      resolverTest.context,
      mockPlan({
        projectId: project.id,
        versionedTemplateId: versionedTemplate.id,
        status: PlanStatus.DRAFT,
        visibility: PlanVisibility.PUBLIC
      })
    );
    addTableForTeardown(Plan.tableName);

    await persistPlanMember(
      resolverTest.context,
      await mockPlanMember(
        resolverTest.context,
        {
          planId: existingPlan.id,
          projectMemberId: existingProjectMembers[1].id,
          memberRoleIds: [role.id]
        }
      )
    );
    addTableForTeardown(PlanMember.tableName);

    await persistPlanFunding(
      resolverTest.context,
      mockPlanFunding({
        planId: existingPlan.id,
        projectFundingId: existingProjectFunding[0].id
      })
    );
    addTableForTeardown(PlanFunding.tableName);
  });

  it('Super Admin flow', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);
    await testAddQueryRemoveAccess(
      'SuperAdmin',
      true,
      true,
      true
    );
  });

  it('Admin of same affiliation flow', async () => {
    resolverTest.context.token = mockToken(resolverTest.adminAffiliationA);
    await testAddQueryRemoveAccess(
      'Admin, same affiliation',
      true,
      true,
      true
    );
  });

  it('Admin of other affiliation flow', async () => {
    resolverTest.context.token = mockToken(resolverTest.adminAffiliationB);
    await testAddQueryRemoveAccess(
      'Admin. other affiliation',
      false,
      false,
      false
    );
  });

  it('Project creator flow', async () => {
    resolverTest.context.token = mockToken(creator);
    await testAddQueryRemoveAccess(
      'creator',
      true,
      true,
      true
    );
  });

  it('Research who is not the creator or a collaborator flow (private plan)', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    resolverTest.context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(
      'researcher, random',
      false,
      false,
      false
    );
    addTableForTeardown(User.tableName);
  });

  it('Research with comment level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    const collab = await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.COMMENT
      })
    )
    resolverTest.context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(
      'researcher, commenter',
      true,
      false,
      false
    );
    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Research with edit level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    const collab = await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      })
    )
    resolverTest.context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(
      'researcher, editor',
      true,
      true,
      false
    );
    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Research with owner level access flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    const collab = await persistProjectCollaborator(
      resolverTest.context,
      mockProjectCollaborator({
        projectId: project.id,
        email: researcher.email,
        accessLevel: ProjectCollaboratorAccessLevel.OWN
      })
    )
    resolverTest.context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(
      'researcher, owner',
      true,
      true,
      true
    );
    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('Allows a plan to be published', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);
    const variables = { planId: existingPlan.id, visibility: getRandomEnumValue(PlanVisibility) }

    const resp = await executeQuery(publishPlanMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.publishPlan.id).toEqual(existingPlan.id);
    expect(resp.body.singleResult.data.publishPlan.visibility).toEqual(variables.visibility);
    expect(resp.body.singleResult.data.publishPlan.registeredById).toEqual(resolverTest.context.token.id);
    expect(resp.body.singleResult.data.publishPlan.registered).toBeDefined();
  });

  it('Doesn\'t allow plans of test projects to be published', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);
    project.isTestProject = true;
    await project.update(resolverTest.context)

    const variables = { planId: existingPlan.id, visibility: getRandomEnumValue(PlanVisibility) }
    const resp = await executeQuery(publishPlanMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.publishPlan.errors['general']).toBeDefined();
  });

  it('Doesn\'t allow published plans to be published again', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);
    existingPlan.registeredById = resolverTest.context.token.id;
    existingPlan.registered = casual.date('YYYY-MM-DD hh:mm:ss');
    await existingPlan.update(resolverTest.context)

    const variables = { planId: existingPlan.id, visibility: getRandomEnumValue(PlanVisibility) }
    const resp = await executeQuery(publishPlanMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.publishPlan.errors['general']).toBeDefined();
  });

  it('Doesn\'t allow a published plan to be archived', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);
    existingPlan.registeredById = resolverTest.context.token.id;
    existingPlan.registered = casual.date('YYYY-MM-DD hh:mm:ss');
    await existingPlan.update(resolverTest.context)

    const variables = { planId: existingPlan.id }
    const resp = await executeQuery(removeMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.archivePlan.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the project does not exist', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    await testNotFound(query, { projectId: 99999999 });
    await testNotFound(querySingle, { planId: 99999999 });
    await testNotFound(addMutation, { projectId: 99999999, versionedTemplateId: versionedTemplate.id });
    await testNotFound(addMutation, { projectId: project.id, versionedTemplateId: 99999999 });
    await testNotFound(updatePlanStatusMutation, { planId: 99999999, status: PlanStatus.COMPLETE });
    await testNotFound(publishPlanMutation, { planId: 99999999, visibility: PlanVisibility.PUBLIC });
    await testNotFound(removeMutation, { planId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    resolverTest.context.token = mockToken(resolverTest.superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: query,
      variables: { projectId: project.id },
      spyOnClass: Plan,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: querySingle,
      variables: { planId: existingPlan.id },
      spyOnClass: Plan,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
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
      graphQL: removeMutation,
      variables: { planId: existingPlan.id },
      spyOnClass: Plan,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});

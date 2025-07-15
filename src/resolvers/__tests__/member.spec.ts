import casual from "casual";
import { User, UserRole } from "../../models/User";
import { Project } from "../../models/Project";
import { PlanMember, ProjectMember } from '../../models/Member';
import { mockMemberRole, persistMemberRole } from '../../models/__mocks__/MemberRole';
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
import { mockUser, persistUser } from "../../models/__mocks__/User";
import { mockProject, persistProject } from "../../models/__mocks__/Project";
import assert from "assert";
import {
  mockPlanMember,
  mockProjectMember,
  persistPlanMember,
  persistProjectMember,
} from "../../models/__mocks__/Member";
import { getMockORCID } from "../../__tests__/helpers";
import {
  mockProjectCollaborator,
  persistProjectCollaborator
} from "../../models/__mocks__/Collaborator";
import {
  ProjectCollaborator,
  ProjectCollaboratorAccessLevel
} from "../../models/Collaborator";
import { MemberRole } from "../../models/MemberRole";
import { Plan } from "../../models/Plan";
import { mockPlan, persistPlan } from "../../models/__mocks__/Plan";
import { TemplateVersionType, VersionedTemplate } from "../../models/VersionedTemplate";
import { TemplateVisibility } from "../../models/Template";

// Mock and then import the logger (this has jest pick up and use src/__mocks__/logger.ts)
jest.mock('../../logger');
jest.mock("../../datasources/dmphubAPI");

let resolverTest: ResolverTest;
let role: MemberRole;

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

describe('projectMembers', () => {
  const query = `
    query projectMembersQuery($projectId: Int!) {
      projectMembers (projectId: $projectId) {
        id
        createdById
        created
        modifiedById
        modified
        project {
          id
          title
        }
        affiliation {
          uri
          name
        }
        givenName
        surName
        orcid
        email
        memberRoles {
          id
          uri
          label
          description
          displayOrder
        }
      }
    }
  `;

  const querySingle = `
    query projectMemberQuery($projectMemberId: Int!) {
      projectMember (projectMemberId: $projectMemberId) {
        id
        createdById
        created
        modifiedById
        modified
        project {
          id
          title
        }
        affiliation {
          uri
          name
        }
        givenName
        surName
        orcid
        email
        memberRoles {
          id
          uri
          label
          description
          displayOrder
        }
      }
    }
  `;

  const addMutation = `
    mutation AddProjectMember($input: AddProjectMemberInput!) {
      addProjectMember (input: $input) {
        id
        createdById
        modifiedById
        project {
          id
        }
        affiliation {
          uri
        }
        givenName
        surName
        orcid
        email
        memberRoles {
          id
        }
        errors {
          general
          memberRoleIds
        }
      }
    }
  `;

  const updateMutation = `
    mutation UpdateProjectMember($input: UpdateProjectMemberInput!) {
      updateProjectMember (input: $input) {
        id
        modifiedById
        createdById
        project {
          id
        }
        affiliation {
          uri
        }
        givenName
        surName
        orcid
        email
        memberRoles {
          id
        }
        errors {
          general
        }
      }
    }
  `;

  const removeMutation = `
    mutation RemoveProjectMember($projectMemberId: Int!) {
      removeProjectMember (projectMemberId: $projectMemberId) {
        id
      }
    }
  `;

  let project: Project;

  let creator: User;
  let existingMember: ProjectMember;

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryRemoveAccess(
    errContext: string,
    canQuery = true,
    canAddAndRemove = true,
  ): Promise<void> {
    const msg = `Testing user ${errContext}`;

    const queryVariables = { projectId: project.id };

    const qryResp = await executeQuery(query, queryVariables);
    const qry2Variables = { projectMemberId: existingMember.id };
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
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      givenName: casual.first_name,
      surName: casual.last_name,
      email: `test.addMember.${casual.integer(1, 9999)}.${casual.email}`,
      orcid: getMockORCID(),
      memberRoleIds: [role.id]
    }

    const updateVariables = {
      projectMemberId: existingMember.id,
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      givenName: casual.first_name,
      surName: casual.last_name,
      email: `test.addMember.${casual.integer(1, 9999)}.${casual.email}`,
      orcid: getMockORCID(),
      memberRoleIds: [role.id]
    }

    if (canAddAndRemove) {
      const userId = resolverTest.context.token.id;

      // Should be able to add
      const addResp = await executeQuery(addMutation, { input: addVariables });
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();
      const id = addResp.body.singleResult.data.addProjectMember.id;
      const roleIds = addResp.body.singleResult.data.addProjectMember.memberRoles.map(r => r.id);
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addProjectMember.affiliation.uri, msg).toEqual(addVariables.affiliationId);
      expect(addResp.body.singleResult.data.addProjectMember.email, msg).toEqual(addVariables.email);
      expect(addResp.body.singleResult.data.addProjectMember.givenName, msg).toEqual(addVariables.givenName);
      expect(addResp.body.singleResult.data.addProjectMember.surName, msg).toEqual(addVariables.surName);
      expect(addResp.body.singleResult.data.addProjectMember.orcid, msg).toEqual(addVariables.orcid);
      expect(roleIds, msg).toEqual(addVariables.memberRoleIds);
      expect(addResp.body.singleResult.data.addProjectMember.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addProjectMember.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Variables = { projectMemberId: id }
      const qry2Resp = await executeQuery(querySingle, qry2Variables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.projectMember.id, msg).toEqual(id);

      // Should be able to update
      const updResp = await executeQuery(updateMutation, { input: updateVariables });
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      const newRoleIds = updResp.body.singleResult.data.updateProjectMember.memberRoles.map(r => r.id);
      expect(updResp.body.singleResult.data.updateProjectMember.id, msg).toEqual(existingMember.id);
      expect(updResp.body.singleResult.data.updateProjectMember.affiliation.uri, msg).toEqual(updateVariables.affiliationId);
      expect(updResp.body.singleResult.data.updateProjectMember.email, msg).toEqual(updateVariables.email);
      expect(updResp.body.singleResult.data.updateProjectMember.givenName, msg).toEqual(updateVariables.givenName);
      expect(updResp.body.singleResult.data.updateProjectMember.surName, msg).toEqual(updateVariables.surName);
      expect(updResp.body.singleResult.data.updateProjectMember.orcid, msg).toEqual(updateVariables.orcid);
      expect(newRoleIds, msg).toContain(Number(updateVariables.memberRoleIds[0]));

      // Should be able to remove
      const removeVariables = { projectMemberId: id }

      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removeProjectMember.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.projectMembers.map(c => c.id), msg).not.toContain(id);
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
      const removeVariables = { projectMemberId: existingMember.id }
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

    // Make sure the token belongs to the creator
    resolverTest.context.token = await mockToken(resolverTest.context, creator);
    project = await persistProject(resolverTest.context, mockProject({}));
    addTableForTeardown(Project.tableName);

    role = await persistMemberRole(resolverTest.context, mockMemberRole({}));
    addTableForTeardown(MemberRole.tableName);

    const mockMember = await mockProjectMember(resolverTest.context, {
      projectId: project.id,
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      memberRoles: [role]
    });
    existingMember = await persistProjectMember(resolverTest.context, mockMember);
    addTableForTeardown(ProjectMember.tableName);
  });

  it('Super Admin flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);
    await testAddQueryRemoveAccess('SuperAdmin', true, true);
  });

  it('Admin of same affiliation flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.adminAffiliationA);
    await testAddQueryRemoveAccess('Admin, same affiliation', true, true);
  });

  it('Admin of other affiliation flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.adminAffiliationB);
    await testAddQueryRemoveAccess('Admin. other affiliation', false, false);
  });

  it('Project creator flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, creator);
    await testAddQueryRemoveAccess('creator', true, true);
  });

  it('Research who is not the creator or a collaborator flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, random', false, false);

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
        email: await researcher.getEmail(resolverTest.context),
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      })
    )
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, editor', true, true);

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
        email: await researcher.getEmail(resolverTest.context),
        accessLevel: ProjectCollaboratorAccessLevel.OWN
      })
    )
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, owner', true, true);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('returns the member with errors if it is a duplicate', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    // Existing Email
    const emailVariables = { input: { projectId: project.id, email: existingMember.email } };
    const emailResp = await executeQuery(addMutation, emailVariables);

    assert(emailResp.body.kind === 'single');
    expect(emailResp.body.singleResult.errors).toBeUndefined();
    expect(emailResp.body.singleResult.data.addProjectMember.errors['general']).toBeDefined();

    // Existing ORCID
    const orcidVariables = { input: { projectId: project.id, orcid: existingMember.orcid } };
    const orcidResp = await executeQuery(addMutation, orcidVariables);

    assert(orcidResp.body.kind === 'single');
    expect(orcidResp.body.singleResult.errors).toBeUndefined();
    expect(orcidResp.body.singleResult.data.addProjectMember.errors['general']).toBeDefined();

    // Existing name
    const nameVariables = {
      projectId: project.id,
      givenName: existingMember.givenName,
      surName: existingMember.surName
    };
    const nameResp = await executeQuery(addMutation, { input: nameVariables });

    assert(nameResp.body.kind === 'single');
    expect(nameResp.body.singleResult.errors).toBeUndefined();
    expect(nameResp.body.singleResult.data.addProjectMember.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the project does not exist', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    await testNotFound(query, { projectId: 99999999 });
    await testNotFound(querySingle, { projectMemberId: 99999999 });
    await testNotFound(addMutation, { input: { projectId: 99999999, email: 'test' } });
    await testNotFound(updateMutation, { input: { projectMemberId: 99999999, email: casual.email } });
    await testNotFound(removeMutation, { projectMemberId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: query,
      variables: { projectId: project.id },
      spyOnClass: ProjectMember,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: querySingle,
      variables: { projectMemberId: existingMember.id },
      spyOnClass: ProjectMember,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
      graphQL: addMutation,
      variables: {
        input: {
          projectId: project.id,
          email: casual.email,
        }
      },
      spyOnClass: ProjectMember,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    // Test standard error handling for update
    await testStandardErrors({
      graphQL: updateMutation,
      variables: {
        input: {
          projectMemberId: existingMember.id,
          email: casual.email,
        }
      },
      spyOnClass: ProjectMember,
      spyOnFunction: 'update',
      mustBeAuthenticated: true
    });

    // Test standard error handling for remove
    await testStandardErrors({
      graphQL: removeMutation,
      variables: { projectMemberId: existingMember.id },
      spyOnClass: ProjectMember,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});



describe('planMembers', () => {
  const query = `
    query planMembersQuery($planId: Int!) {
      planMembers (planId: $planId) {
        id
        createdById
        created
        modifiedById
        modified
        plan {
          id
        }
        projectMember {
          id
        }
        isPrimaryContact
        memberRoles {
          id
        }
      }
    }
  `;

  const addMutation = `
    mutation AddPlanMember($planId: Int!, $projectMemberId: Int!, $roleIds: [Int!]) {
      addPlanMember (planId: $planId, projectMemberId: $projectMemberId, roleIds: $roleIds) {
        id
        createdById
        modifiedById
        plan {
          id
        }
        projectMember {
          id
        }
        isPrimaryContact
        memberRoles {
          id
        }
        errors {
          general
          memberRoleIds
        }
      }
    }
  `;

  const updateMutation = `
    mutation UpdatePlanMember($planId: Int!, $planMemberId: Int!, $isPrimaryContact: Boolean,
                              $memberRoleIds: [Int!]) {
      updatePlanMember (planId: $planId, planMemberId: $planMemberId, isPrimaryContact: $isPrimaryContact,
                        memberRoleIds: $memberRoleIds) {
        id
        modifiedById
        createdById
        plan {
          id
        }
        projectMember {
          id
        }
        isPrimaryContact
        memberRoles {
          id
        }
        errors {
          general
        }
      }
    }
  `;

  const removeMutation = `
    mutation RemovePlanMember($planMemberId: Int!) {
      removePlanMember (planMemberId: $planMemberId) {
        id
      }
    }
  `;

  let project: Project;
  let versionedTemplate: VersionedTemplate;
  let plan: Plan;
  let role: MemberRole;

  let creator: User;
  let existingProjectMember: ProjectMember;
  let otherProjectMember: ProjectMember;
  let existingMember: PlanMember;

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryRemoveAccess(
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
      projectMemberId: otherProjectMember.id,
      roleIds: [role.id]
    }

    if (canAddAndRemove) {
      const userId = resolverTest.context.token.id;

      // Should be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();
      const id = addResp.body.singleResult.data.addPlanMember.id;
      const roleIds = addResp.body.singleResult.data.addPlanMember.memberRoles.map(r => r.id);
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addPlanMember.plan.id, msg).toEqual(plan.id);
      expect(addResp.body.singleResult.data.addPlanMember.projectMember.id, msg).toEqual(otherProjectMember.id);
      expect(addResp.body.singleResult.data.addPlanMember.isPrimaryContact, msg).toEqual(false);
      expect(roleIds, msg).toEqual(addVariables.roleIds);
      expect(addResp.body.singleResult.data.addPlanMember.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addPlanMember.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Resp = await executeQuery(query, queryVariables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.planMembers.map(r => r.id), msg).toContain(id);

      const updateVariables = {
        planId: plan.id,
        planMemberId: id,
        isPrimaryContact: casual.boolean,
        memberRoleIds: [role.id]
      }

      // Should be able to update
      const updResp = await executeQuery(updateMutation, updateVariables);

      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      const newRoleIds = updResp.body.singleResult.data.updatePlanMember.memberRoles.map(r => r.id);
      expect(updResp.body.singleResult.data.updatePlanMember.id, msg).toEqual(id);
      expect(updResp.body.singleResult.data.updatePlanMember.isPrimaryContact, msg).toEqual(updateVariables.isPrimaryContact);
      expect(newRoleIds, msg).toContain(Number(updateVariables.memberRoleIds[0]));

      // Should be able to remove
      const removeVariables = { planMemberId: id }

      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removePlanMember.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.planMembers.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to update
      const updateVariables = {
        planId: plan.id,
        planMemberId: existingMember.id,
        isPrimaryContact: casual.boolean
      }
      const updResp = await executeQuery(updateMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeDefined();
      expect(updResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { planMemberId: existingMember.id }
      const remResp = await executeQuery(removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeDefined();
      expect(remResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');
    }
  }

  beforeEach(async () => {
    jest.resetAllMocks();

    // Generate the creator of the project
    creator = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }));
    addTableForTeardown(User.tableName);

    // Make sure the token belongs to the creator
    resolverTest.context.token = await mockToken(resolverTest.context, creator);
    project = await persistProject(resolverTest.context, mockProject({}));
    addTableForTeardown(Project.tableName);

    role = await persistMemberRole(resolverTest.context, mockMemberRole({}));
    addTableForTeardown(MemberRole.tableName);

    const mockProjMember = await mockProjectMember(resolverTest.context, {
      projectId: project.id,
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      memberRoles: [role]
    });
    existingProjectMember = await persistProjectMember(resolverTest.context, mockProjMember);

    const mockOtherMember = await mockProjectMember(resolverTest.context, {
      projectId: project.id,
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      memberRoles: [role]
    });
    otherProjectMember = await persistProjectMember(resolverTest.context, mockOtherMember);
    addTableForTeardown(ProjectMember.tableName);

    // Persist a Plan
    // Create a template for the funder and then a published version of it.
    // These functions add the corresponding tables to the teardown list
    const template = await generateFullTemplate(resolverTest);
    versionedTemplate = await generateFullVersionedTemplate(
      resolverTest,
      template.id,
      TemplateVisibility.PUBLIC,
      TemplateVersionType.PUBLISHED
    );

    plan = await persistPlan(resolverTest.context, mockPlan({
      versionedTemplateId: versionedTemplate.id,
      projectId: project.id
    }));
    addTableForTeardown(Plan.tableName);

    const mockMember = await mockPlanMember(resolverTest.context, {
      planId: plan.id,
      projectMemberId: existingProjectMember.id,
      memberRoleIds: [role.id]
    })
    existingMember = await persistPlanMember(resolverTest.context, mockMember);
    addTableForTeardown(PlanMember.tableName);
  });

  it('Super Admin flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);
    await testAddQueryRemoveAccess('SuperAdmin', true, true);
  });

  it('Admin of same affiliation flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.adminAffiliationA);
    await testAddQueryRemoveAccess('Admin, same affiliation', true, true);
  });

  it('Admin of other affiliation flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.adminAffiliationB);
    await testAddQueryRemoveAccess('Admin. other affiliation', false, false);
  });

  it('Project creator flow', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, creator);
    await testAddQueryRemoveAccess('creator', true, true);
  });

  it('Research who is not the creator or a collaborator flow', async () => {
    const researcher = await persistUser(resolverTest.context, mockUser({
      affiliationId: resolverTest.adminAffiliationA.affiliationId,
      role: UserRole.RESEARCHER
    }))
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, random', false, false);

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
        email: await researcher.getEmail(resolverTest.context),
        accessLevel: ProjectCollaboratorAccessLevel.EDIT
      })
    )
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, editor', true, true);

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
        email: await researcher.getEmail(resolverTest.context),
        accessLevel: ProjectCollaboratorAccessLevel.OWN
      })
    )
    resolverTest.context.token = await mockToken(resolverTest.context, researcher);
    await testAddQueryRemoveAccess('researcher, owner', true, true);

    addTableForTeardown(User.tableName);
    addTableForTeardown(ProjectCollaborator.tableName);
  });

  it('returns the member with errors if it is a duplicate', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    // Existing Email
    const variables = { planId: plan.id, projectMemberId: existingProjectMember.id };
    const resp = await executeQuery(addMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.addPlanMember.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the plan does not exist', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    await testNotFound(query, { planId: 99999999 });
    await testNotFound(addMutation, { planId: 99999999, projectMemberId: existingProjectMember.id });
    await testNotFound(addMutation, { planId: plan.id, projectMemberId: 99999999 });
    await testNotFound(updateMutation, { planId: plan.id, planMemberId: 99999999, isPrimaryContact: false });
    await testNotFound(removeMutation, { planMemberId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    resolverTest.context.token = await mockToken(resolverTest.context, resolverTest.superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      graphQL: query,
      variables: { planId: plan.id },
      spyOnClass: PlanMember,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for add
    await testStandardErrors({
      graphQL: addMutation,
      variables: {
        planId: plan.id,
        projectMemberId: otherProjectMember.id,
        roleIds: [role.id]
      },
      spyOnClass: PlanMember,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    // Test standard error handling for update
    await testStandardErrors({
      graphQL: updateMutation,
      variables: {
        planId: plan.id,
        planMemberId: existingMember.id,
        isPrimaryContact: casual.boolean,
      },
      spyOnClass: PlanMember,
      spyOnFunction: 'update',
      mustBeAuthenticated: true
    });

    // Test standard error handling for remove
    await testStandardErrors({
      graphQL: removeMutation,
      variables: { planMemberId: existingMember.id },
      spyOnClass: PlanMember,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});

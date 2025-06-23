import { ApolloServer } from "@apollo/server";
import casual from "casual";
import { buildContext, MyContext } from "../../context";
import { logger } from "../../__mocks__/logger";
import { User, UserRole } from "../../models/User";
import { Project } from "../../models/Project";
import { PlanMember, ProjectMember } from '../../models/Member';
import { randomMemberRole } from '../../models/__mocks__/MemberRole';
import { MySQLConnection } from "../../datasources/mysql";
import {
  executeQuery,
  initErrorMessage,
  initTestServer,
  mockToken, testNotFound, testStandardErrors,
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
  mockProjectMember, persistPlanMember, persistProjectMember,
} from "../../models/__mocks__/Member";
import {getMockORCID} from "../../__tests__/helpers";
import {
  cleanUpAddedProjectCollaborator,
  mockProjectCollaborator,
  persistProjectCollaborator
} from "../../models/__mocks__/Collaborator";
import { ProjectCollaboratorAccessLevel } from "../../models/Collaborator";
import { MemberRole } from "../../models/MemberRole";
import { Plan } from "../../models/Plan";
import {
  cleanUpAddedPlan,
  mockPlan,
  persistPlan
} from "../../models/__mocks__/Plan";
import { VersionedTemplate } from "../../models/VersionedTemplate";
import { randomVersionedTemplate } from "../../models/__mocks__/VersionedTemplate";

jest.mock("../../datasources/dmphubAPI");

let mysqlInstance: MySQLConnection;
let testServer: ApolloServer;
let context: MyContext;

let affiliation: Affiliation;
let sameAffiliationAdmin: User;
let otherAffiliationAdmin: User;
let superAdmin: User;
let roles: MemberRole[];

// Fetch a random role but ensure no duplicates!
async function getRandomMemberRole(context: MyContext): Promise<MemberRole> {
  let role: MemberRole;
  while (!role) {
    const newRole = await randomMemberRole(context);
    if (!roles.find(r => r.id === newRole.id)) {
      role = newRole;
      roles.push(newRole);
    }
  }
  return role;
}

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

  roles = [];
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


describe('projectMembers', () => {
  let project: Project;

  let creator: User;
  let existingMember: ProjectMember;

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
    const qry2Variables = { projectMemberId: existingMember.id };
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
      affiliationId: sameAffiliationAdmin.affiliationId,
      givenName: casual.first_name,
      surName: casual.last_name,
      email: `test.addMember.${casual.integer(1, 9999)}.${casual.email}`,
      orcid: getMockORCID(),
      memberRoleIds: [
        (await getRandomMemberRole(context)).id,
        (await getRandomMemberRole(context)).id
      ]
    }

    const updateVariables = {
      projectMemberId: existingMember.id,
      affiliationId: sameAffiliationAdmin.affiliationId,
      givenName: casual.first_name,
      surName: casual.last_name,
      email: `test.addMember.${casual.integer(1, 9999)}.${casual.email}`,
      orcid: getMockORCID(),
      memberRoleIds: [(await getRandomMemberRole(context)).id]
    }

    if (canAddAndRemove) {
      const userId = contextIn.token.id;

      // Should be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, { input: addVariables });
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
      expect(roleIds, msg).toContain(Number(addVariables.memberRoleIds[0]));
      expect(roleIds, msg).toContain(Number(addVariables.memberRoleIds[1]));
      expect(addResp.body.singleResult.data.addProjectMember.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addProjectMember.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Variables = { projectMemberId: id }
      const qry2Resp = await executeQuery(testServer, contextIn, querySingle, qry2Variables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.projectMember.id, msg).toEqual(id);

      // Should be able to update
      const updResp = await executeQuery(testServer, contextIn, updateMutation, { input: updateVariables });
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

      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removeProjectMember.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.projectMembers.map(c => c.id), msg).not.toContain(id);
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
      const removeVariables = { projectMemberId: existingMember.id }
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

    const mockMember = await mockProjectMember(context, {
      projectId: project.id,
      affiliationId: sameAffiliationAdmin.affiliationId,
    });
    existingMember = await persistProjectMember(context, mockMember);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    // Clean up the project, user and member records we generated
    await cleanUpAddedProjectMember(context, existingMember.id);
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
    await testAddQueryRemoveAccess(context, 'researcher, commenter', true, false);

    await cleanUpAddedProjectCollaborator(context, collab.id);
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
    await testAddQueryRemoveAccess(context, 'researcher, editor', true, true);

    await cleanUpAddedProjectCollaborator(context, collab.id);
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
    await testAddQueryRemoveAccess(context, 'researcher, owner', true, true);

    await cleanUpAddedProjectCollaborator(context, collab.id);
  });

  it('returns the member with errors if it is a duplicate', async () => {
    context.token = mockToken(superAdmin);

    // Existing Email
    const emailVariables = { input: { projectId: project.id, email: existingMember.email } };
    const emailResp = await executeQuery(testServer, context, addMutation, emailVariables);

    assert(emailResp.body.kind === 'single');
    expect(emailResp.body.singleResult.errors).toBeUndefined();
    expect(emailResp.body.singleResult.data.addProjectMember.errors['general']).toBeDefined();

    // Existing ORCID
    const orcidVariables = { input: { projectId: project.id, orcid: existingMember.orcid } };
    const orcidResp = await executeQuery(testServer, context, addMutation, orcidVariables);

    assert(orcidResp.body.kind === 'single');
    expect(orcidResp.body.singleResult.errors).toBeUndefined();
    expect(orcidResp.body.singleResult.data.addProjectMember.errors['general']).toBeDefined();

    // Existing name
    const nameVariables = {
      projectId: project.id,
      givenName: existingMember.givenName,
      surName: existingMember.surName
    };
    const nameResp = await executeQuery(testServer, context, addMutation, { input: nameVariables });

    assert(nameResp.body.kind === 'single');
    expect(nameResp.body.singleResult.errors).toBeUndefined();
    expect(nameResp.body.singleResult.data.addProjectMember.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the project does not exist', async () => {
    context.token = mockToken(superAdmin);

    await testNotFound(testServer, context, query, { projectId: 99999999 });
    await testNotFound(testServer, context, querySingle, { projectMemberId: 99999999 });
    await testNotFound(testServer, context, addMutation, { input: { projectId: 99999999, email: 'test' } });
    await testNotFound(testServer, context, updateMutation, { input: { projectMemberId: 99999999, email: casual.email } });
    await testNotFound(testServer, context, removeMutation, { projectMemberId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    context.token = mockToken(superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: query,
      variables: { projectId: project.id },
      spyOnClass: ProjectMember,
      spyOnFunction: 'query',
      mustBeAuthenticated: true
    });

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: querySingle,
      variables: { projectMemberId: existingMember.id },
      spyOnClass: ProjectMember,
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
          email: casual.email,
        }
      },
      spyOnClass: ProjectMember,
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
      server: testServer,
      context,
      graphQL: removeMutation,
      variables: { projectMemberId: existingMember.id },
      spyOnClass: ProjectMember,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});



describe('planMembers', () => {
  let project: Project;
  let versionedTemplate: VersionedTemplate;
  let plan: Plan;

  let creator: User;
  let existingProjectMember: ProjectMember;
  let otherProjectMember: ProjectMember;
  let existingMember: PlanMember;

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

  // Test that the specified user/token is able to perform all actions
  async function testAddQueryRemoveAccess(
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
      projectMemberId: otherProjectMember.id,
      roleIds: [
        (await getRandomMemberRole(context)).id,
        (await getRandomMemberRole(context)).id
      ]
    }

    if (canAddAndRemove) {
      const userId = contextIn.token.id;

      // Should be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeUndefined();
      const id = addResp.body.singleResult.data.addPlanMember.id;
      const roleIds = addResp.body.singleResult.data.addPlanMember.memberRoles.map(r => r.id);
      expect(id, msg).toBeDefined();
      expect(addResp.body.singleResult.data.addPlanMember.plan.id, msg).toEqual(plan.id);
      expect(addResp.body.singleResult.data.addPlanMember.projectMember.id, msg).toEqual(otherProjectMember.id);
      expect(addResp.body.singleResult.data.addPlanMember.isPrimaryContact, msg).toEqual(false);
      expect(roleIds, msg).toContain(Number(addVariables.roleIds[0]));
      expect(roleIds, msg).toContain(Number(addVariables.roleIds[1]));
      expect(addResp.body.singleResult.data.addPlanMember.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addPlanMember.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.planMembers.map(r => r.id), msg).toContain(id);

      const updateVariables = {
        planId: plan.id,
        planMemberId: id,
        isPrimaryContact: casual.boolean,
        memberRoleIds: [(await getRandomMemberRole(context)).id]
      }

      // Should be able to update
      const updResp = await executeQuery(testServer, contextIn, updateMutation, updateVariables);

      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      const newRoleIds = updResp.body.singleResult.data.updatePlanMember.memberRoles.map(r => r.id);
      expect(updResp.body.singleResult.data.updatePlanMember.id, msg).toEqual(id);
      expect(updResp.body.singleResult.data.updatePlanMember.isPrimaryContact, msg).toEqual(updateVariables.isPrimaryContact);
      expect(newRoleIds, msg).toContain(Number(updateVariables.memberRoleIds[0]));

      // Should be able to remove
      const removeVariables = { planMemberId: id }

      const remResp = await executeQuery(testServer, contextIn, removeMutation, removeVariables);
      assert(remResp.body.kind === 'single');
      expect(remResp.body.singleResult.errors, msg).toBeUndefined();
      expect(remResp.body.singleResult.data.removePlanMember.id, msg).toEqual(id);

      // Should no longer be able to see new record
      const qry3Resp = await executeQuery(testServer, contextIn, query, queryVariables);
      assert(qry3Resp.body.kind === 'single');
      expect(qry3Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry3Resp.body.singleResult.data.planMembers.map(c => c.id), msg).not.toContain(id);
    } else {
      // Should NOT be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
      assert(addResp.body.kind === 'single');
      expect(addResp.body.singleResult.errors, msg).toBeDefined();
      expect(addResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to update
      const updateVariables = {
        planId: plan.id,
        planMemberId: existingMember.id,
        isPrimaryContact: casual.boolean
      }
      const updResp = await executeQuery(testServer, contextIn, updateMutation, updateVariables);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeDefined();
      expect(updResp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

      // Should NOT be able to remove
      const removeVariables = { planMemberId: existingMember.id }
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

    const mockProjMember = await mockProjectMember(context, {
      projectId: project.id,
      affiliationId: sameAffiliationAdmin.affiliationId,
    });
    existingProjectMember = await persistProjectMember(context, mockProjMember);

    const mockOtherMember = await mockProjectMember(context, {
      projectId: project.id,
      affiliationId: sameAffiliationAdmin.affiliationId,
    });
    otherProjectMember = await persistProjectMember(context, mockOtherMember);

    // Persist a Plan
    versionedTemplate = await randomVersionedTemplate(context);
    plan = await persistPlan(context, mockPlan({
      versionedTemplateId: versionedTemplate.id,
      projectId: project.id
    }));

    const mockMember = await mockPlanMember(context, {
      planId: plan.id,
      projectMemberId: existingProjectMember.id,
    })
    existingMember = await persistPlanMember(context, mockMember);

    roles = [];
  });

  afterEach(async () => {
    jest.clearAllMocks();

    // Clean up the project, plan, user and member records we generated
    await cleanUpAddedPlanMember(context, existingMember.id);
    await cleanUpAddedProjectMember(context, existingProjectMember.id);
    await cleanUpAddedPlan(context, plan.id);
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
    await testAddQueryRemoveAccess(context, 'researcher, commenter', true, false);

    await cleanUpAddedProjectCollaborator(context, collab.id);
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
    await testAddQueryRemoveAccess(context, 'researcher, editor', true, true);

    await cleanUpAddedProjectCollaborator(context, collab.id);
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
    await testAddQueryRemoveAccess(context, 'researcher, owner', true, true);

    await cleanUpAddedProjectCollaborator(context, collab.id);
  });

  it('returns the member with errors if it is a duplicate', async () => {
    context.token = mockToken(superAdmin);

    // Existing Email
    const variables = { planId: plan.id, projectMemberId: existingProjectMember.id };
    const resp = await executeQuery(testServer, context, addMutation, variables);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data.addPlanMember.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the plan does not exist', async () => {
    context.token = mockToken(superAdmin);

    await testNotFound(testServer, context, query, { planId: 99999999 });
    await testNotFound(testServer, context, addMutation, { planId: 99999999, projectMemberId: existingProjectMember.id });
    await testNotFound(testServer, context, addMutation, { planId: plan.id, projectMemberId: 99999999 });
    await testNotFound(testServer, context, updateMutation, { planId: plan.id, planMemberId: 99999999, isPrimaryContact: false });
    await testNotFound(testServer, context, removeMutation, { planMemberId: 99999999 });
  });

  it('handles missing tokens and internal server errors', async () => {
    context.token = mockToken(superAdmin);

    // Test standard error handling for query
    await testStandardErrors({
      server: testServer,
      context,
      graphQL: query,
      variables: { planId: plan.id },
      spyOnClass: PlanMember,
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
        projectMemberId: otherProjectMember.id,
        roleIds: [
          (await getRandomMemberRole(context)).id
        ]
      },
      spyOnClass: PlanMember,
      spyOnFunction: 'insert',
      mustBeAuthenticated: true
    });

    // Test standard error handling for update
    await testStandardErrors({
      server: testServer,
      context,
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
      server: testServer,
      context,
      graphQL: removeMutation,
      variables: { planMemberId: existingMember.id },
      spyOnClass: PlanMember,
      spyOnFunction: 'delete',
      mustBeAuthenticated: true
    });
  });
});

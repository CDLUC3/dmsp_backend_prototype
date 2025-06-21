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
  persistUser, randomUser
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
  mockProjectMember, persistProjectMember,
} from "../../models/__mocks__/Member";
import {getMockORCID} from "../../__tests__/helpers";
import {
  cleanUpAddedProjectCollaborator,
  mockProjectCollaborator,
  persistProjectCollaborator
} from "../../models/__mocks__/Collaborator";
import {ProjectCollaboratorAccessLevel} from "../../models/Collaborator";

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


describe('projectMembers', () => {
  let project: Project;
  let emailer: jest.Mock;

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
    mutation AddProjectMember($projectId: Int!, $affiliationId: String,
                              $givenName: String, $surName: String, $orcid: String,
                              $email: String, $memberRoleIds: [Int!]) {
      addProjectMember (projectId: $projectId, affiliationId: $affiliationId,
                        givenName: $givenName, surName: $surName, orcid: $orcid,
                        email: $email, memberRoleId: $memberRoleIds) {}
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
        }
      }
    }
  `;

  const updateMutation = `
    mutation UpdateProjectMember($projectMemberId: Int!, $affiliationId: String,
                                 $givenName: String, $surName: String, $orcid: String,
                                 $email: String, $memberRoleIds: [Int!]) {
      updateProjectMember (projectMemberId: $projectMemberId, affiliationId: $affiliationId,
                           givenName: $givenName, surName: $surName, orcid: $orcid,
                           email: $email, memberRoleId: $memberRoleIds) {}
        id
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
      affiliationId: otherAffiliationAdmin.affiliationId,
      givenName: casual.first_name,
      surName: casual.last_name,
      email: `test.addMember.${casual.integer(1, 9999)}.${casual.email}`,
      orcid: getMockORCID(),
      memberRoleIds: [(await randomMemberRole(context)).id]
    }

    const updateVariables = {
      projectMemberId: existingMember.id,
      affiliationId: otherAffiliationAdmin.affiliationId,
      givenName: casual.first_name,
      surName: casual.last_name,
      email: `test.addMember.${casual.integer(1, 9999)}.${casual.email}`,
      orcid: getMockORCID(),
      memberRoleIds: [(await randomMemberRole(context)).id]
    }

    if (canAddAndRemove) {
      const userId = contextIn.token.id;

      // Should be able to add
      const addResp = await executeQuery(testServer, contextIn, addMutation, addVariables);
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
      expect(roleIds, msg).toContain(addVariables.memberRoleIds[0]);
      expect(addResp.body.singleResult.data.addProjectMember.createdById, msg).toEqual(userId);
      expect(addResp.body.singleResult.data.addProjectMember.modifiedById, msg).toEqual(userId);

      // Should see the new record
      const qry2Variables = { projectMemberId: id }
      const qry2Resp = await executeQuery(testServer, contextIn, querySingle, qry2Variables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeUndefined();
      expect(qry2Resp.body.singleResult.data.projectMember.id, msg).toContain(id);

      // Should be able to update
      const updResp = await executeQuery(testServer, contextIn, updateMutation, updateVariables);
      const newRoleIds = addResp.body.singleResult.data.updateProjectMember.memberRoles.map(r => r.id);
      assert(updResp.body.kind === 'single');
      expect(updResp.body.singleResult.errors, msg).toBeUndefined();
      expect(updResp.body.singleResult.data.updateProjectMember.id, msg).toEqual(existingMember.id);
      expect(addResp.body.singleResult.data.updateProjectMember.affiliation.uri, msg).toEqual(updateVariables.affiliationId);
      expect(addResp.body.singleResult.data.updateProjectMember.email, msg).toEqual(updateVariables.email);
      expect(addResp.body.singleResult.data.updateProjectMember.givenName, msg).toEqual(updateVariables.givenName);
      expect(addResp.body.singleResult.data.updateProjectMember.surName, msg).toEqual(updateVariables.surName);
      expect(addResp.body.singleResult.data.updateProjectMember.orcid, msg).toEqual(updateVariables.orcid);
      expect(newRoleIds, msg).toContain(updateVariables.memberRoleIds[0]);
      expect(updResp.body.singleResult.data.updateProjectMember.createdById, msg).toEqual(existingMember.createdById);

      // Should be able to remove
      const removeVariables = { projectCollaboratorId: id }

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
      // Should not be able to fetch a single record
      const qry2Variables = { projectMemberId: existingMember.id };
      const qry2Resp = await executeQuery(testServer, contextIn, querySingle, qry2Variables);
      assert(qry2Resp.body.kind === 'single');
      expect(qry2Resp.body.singleResult.errors, msg).toBeDefined();
      expect(qry2Resp.body.singleResult.errors[0].extensions.code, msg).toEqual('FORBIDDEN');

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
      const removeVariables = { projectCollaboratorId: existingMember.id }
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

    // Note that this triggers the emailer above so count it in tests above/below
    const mockMember = await mockProjectMember(context, { projectId: project.id });
    existingMember = await persistProjectMember(context, mockMember);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    // Clean up the project, user and collaborator records we generated
    await cleanUpAddedProjectMember(context, existingMember.id);
    await cleanUpAddedProject(context, project.id);
    await cleanUpAddedUser(context, creator.id);
  });

  it('Super Admin flow', async () => {
    context.token = mockToken(superAdmin);
    await testAddQueryRemoveAccess(context, 'SuperAdmin', true, true);

    // Should have emailed for the existingMember and the one being added
    expect(emailer).toHaveBeenCalledTimes(2);
  });

  it('Admin of same affiliation flow', async () => {
    context.token = mockToken(sameAffiliationAdmin);
    await testAddQueryRemoveAccess(context, 'Admin, same affiliation', true, true);

    // Should have emailed for the existingMember and the one being added
    expect(emailer).toHaveBeenCalledTimes(2);
  });

  it('Admin of other affiliation flow', async () => {
    context.token = mockToken(otherAffiliationAdmin);
    await testAddQueryRemoveAccess(context, 'Admin. other affiliation', false, false);

    // Generating the existingMember caused the emailer to fire once
    expect(emailer).toHaveBeenCalledTimes(1);
  });

  it('Project creator flow', async () => {
    context.token = mockToken(creator);
    await testAddQueryRemoveAccess(context, 'creator', true, true);

    // Should have emailed for the existingMember and the one being added
    expect(emailer).toHaveBeenCalledTimes(2);
  });

  it('Research who is not the creator or a collaborator flow', async () => {
    const researcher = await persistUser(context, mockUser({
      affiliationId: sameAffiliationAdmin.affiliationId,
      role: UserRole.RESEARCHER
    }))
    context.token = mockToken(researcher);
    await testAddQueryRemoveAccess(context, 'researcher, random', false, false);

    // Generating the existingMember caused the emailer to fire once
    expect(emailer).toHaveBeenCalledTimes(1);
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

  it('returns the member with errors if it is a duplicate', async () => {
    context.token = mockToken(superAdmin);

    // Existing Email
    const emailVariables = { projectId: project.id, email: existingMember.email };
    const emailResp = await executeQuery(testServer, context, addMutation, emailVariables);

    assert(emailResp.body.kind === 'single');
    expect(emailResp.body.singleResult.errors).toBeUndefined();
    expect(emailResp.body.singleResult.data.addProjectMember.errors['general']).toBeDefined();

    // Existing ORCID
    const orcidVariables = { projectId: project.id, orcid: existingMember.orcid };
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
    const nameResp = await executeQuery(testServer, context, addMutation, nameVariables);

    assert(nameResp.body.kind === 'single');
    expect(nameResp.body.singleResult.errors).toBeUndefined();
    expect(nameResp.body.singleResult.data.addProjectMember.errors['general']).toBeDefined();
  });

  it('Throws a 404 if the project does not exist', async () => {
    context.token = mockToken(superAdmin);

    await testNotFound(testServer, context, query, { projectId: 99999999 });
    await testNotFound(testServer, context, querySingle, { projectMemberId: 99999999 });
    await testNotFound(testServer, context, addMutation, { projectId: 99999999, email: 'test' });
    await testNotFound(testServer, context, updateMutation, {
      projectMemberId: 99999999,
      accessLevel: ProjectCollaboratorAccessLevel.EDIT
    });
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
        projectId: project.id,
        email: casual.email,
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
        projectMemberId: existingMember.id,
        email: casual.email,
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

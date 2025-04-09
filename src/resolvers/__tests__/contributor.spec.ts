import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../../schema";
import { resolvers } from "../../resolver";
import assert from "assert";
import { buildContext, mockToken } from "../../__mocks__/context";
import { logger } from "../../__mocks__/logger";
import { JWTAccessToken } from "../../services/tokenService";

import { User, UserRole } from "../../models/User";
import { Affiliation } from "../../models/Affiliation";
import { Project } from "../../models/Project";
import { Plan } from "../../models/Plan";
import { ContributorRole } from "../../models/ContributorRole";
import { ProjectCollaborator, ProjectCollaboratorAccessLevel } from "../../models/Collaborator";
import { PlanContributor, ProjectContributor } from "../../models/Contributor";

import { MyContext } from "../../context";

import { clearProjectCollaboratorsStore, initProjectCollaboratorsStore, mockFindProjectCollaboratorByProjectId } from "../../models/__mocks__/Collaborator";
import { clearProjectStore, initProjectStore, mockFindProjectById } from "../../models/__mocks__/Project";
import {
  clearPlanStore,
  initPlanStore,
  mockFindPlanById,
  mockFindPlansByProjectId,
} from "../../models/__mocks__/Plan";
import {
  clearContributorRoles,
  initContributorRoles,
  mockAddContributorRoleToPlanContributor,
  mockAddContributorRoleToProjectContributor,
  mockFindByPlanContributorId,
  mockFindByProjectContributorId,
  mockFindContributorRoleById,
  mockRemoveContributorRoleFromPlanContributor,
  mockRemoveContributorRoleFromProjectContributor
} from "../../models/__mocks__/ContributorRole";
import {
  clearPlanContributorStore,
  clearProjectContributorStore,
  initPlanContributorStore,
  initProjectContributorStore,
  mockDeletePlanContributor,
  mockDeleteProjectContributor,
  mockFindPlanContributorById,
  mockFindPlanContributorsByPlanId,
  mockFindProjectContributorById,
  mockFindProjectContributorsByProjectId,
  mockInsertPlanContributor,
  mockInsertProjectContributor,
  mockUpdatePlanContributor,
  mockUpdateProjectContributor
} from "../../models/__mocks__/Contributor";
import { clearAffiliationStore, initAffiliationStore, mockFindAffiliationByURI } from "../../models/__mocks__/Affiliation";
import { clearUserStore, initUserStore, mockFindUserById } from "../../models/__mocks__/User";

jest.mock('../../context.ts');
jest.mock('../../services/emailService');

let context: MyContext;
let testServer: ApolloServer;

let userStore: User[];
let affiliationStore: Affiliation[];
let contributorRoleStore: ContributorRole[];
let projectStore: Project[];
let planStore: Plan[];
let projectCollaboratorStore: ProjectCollaborator[];
let projectContributorStore: ProjectContributor[];
let planContributorStore: PlanContributor[];

let researcherToken: JWTAccessToken;
let adminToken: JWTAccessToken;
let superAdminToken: JWTAccessToken;

let query: string;

// Proxy call to the Apollo server test server
async function executeQuery (
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any,
  context: MyContext
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  return await testServer.executeOperation(
    { query, variables },
    { contextValue: context },
  );
}

beforeEach(async () => {
  affiliationStore = initAffiliationStore(1);
  userStore = initUserStore(3);

  // Assign the roles and affiliations to the users
  userStore[0].role = UserRole.RESEARCHER;
  userStore[0].affiliationId = affiliationStore[0].uri;
  userStore[1].role = UserRole.ADMIN;
  userStore[1].affiliationId = affiliationStore[0].uri;
  userStore[2].role = UserRole.SUPERADMIN;

  // Generate tokens for each user type
  researcherToken = mockToken(new User(userStore[0]));
  adminToken = mockToken(new User(userStore[1]));
  superAdminToken = mockToken(new User(userStore[2]));

  // Build the mock Apollo context
  context = buildContext(logger, researcherToken, researcherToken);

  // Initialize the Apollo server
  testServer = new ApolloServer({
    typeDefs, resolvers
  });

  // Add initial data to the mock database tables
  projectStore = initProjectStore(1);
  planStore = initPlanStore(1);
  projectCollaboratorStore = initProjectCollaboratorsStore(1);
  contributorRoleStore = initContributorRoles(3);
  projectContributorStore = initProjectContributorStore(3);
  planContributorStore = initPlanContributorStore(3);

  // Make sure the plan is associated with the first project
  planStore[0].projectId = projectStore[0].id;

  // Make sure the first plan is associated with the first project
  projectContributorStore[0].projectId = projectStore[0].id;

  // Make sure the researcher is the creator of the project and plan
  projectStore[0].createdById = researcherToken.id;
  projectStore[0].createdById = researcherToken.id;

  // Attach the contributors to the projects and plans
  projectContributorStore.forEach(contributor => {
    contributor.affiliationId = affiliationStore[0].uri; // Set the affiliation for the contributor
    contributor.projectId = projectStore[0].id; // Attach to the first project
    contributor.createdById = researcherToken.id; // Set the creator to the researcher
    contributor.modifiedById = researcherToken.id; // Set the modifier to the researcher
  });
  planContributorStore.forEach((contributor, idx) => {
    contributor.planId = planStore[0].id; // Attach to the first plan
    contributor.createdById = researcherToken.id; // Set the creator to the researcher
    contributor.modifiedById = researcherToken.id; // Set the modifier to the researcher
    contributor.projectContributorId = projectContributorStore[idx].id;
  });

  // Mock affiliation, User and ProjectCollaborator lookups
  jest.spyOn(Affiliation, 'findByURI').mockImplementation(mockFindAffiliationByURI);
  jest.spyOn(User, 'findById').mockImplementation(mockFindUserById);
  jest.spyOn(ProjectCollaborator, 'findByProjectId').mockImplementation(mockFindProjectCollaboratorByProjectId);

  // Use spys to mock the database queries for Project and Plan
  jest.spyOn(Project, 'findById').mockImplementation(mockFindProjectById);
  jest.spyOn(Plan, 'findById').mockImplementation(mockFindPlanById);
  jest.spyOn(Plan, 'findByProjectId').mockImplementation(mockFindPlansByProjectId);

  // Use spys to monitor the database queries for ProjectContributor
  jest.spyOn(ProjectContributor, 'findById').mockImplementation(mockFindProjectContributorById);
  jest.spyOn(ProjectContributor, 'findByProjectId').mockImplementation(mockFindProjectContributorsByProjectId);
  jest.spyOn(PlanContributor, 'findById').mockImplementation(mockFindPlanContributorById);
  jest.spyOn(PlanContributor, 'findByPlanId').mockImplementation(mockFindPlanContributorsByPlanId);

  // Use spys to monitor the database queries for ContributorRole
  jest.spyOn(ContributorRole, 'findById').mockImplementation(mockFindContributorRoleById);
  jest.spyOn(ContributorRole, 'findByProjectContributorId').mockImplementation(mockFindByProjectContributorId);
  jest.spyOn(ContributorRole, 'findByPlanContributorId').mockImplementation(mockFindByPlanContributorId);
  jest.spyOn(ContributorRole, 'defaultRole').mockResolvedValue(contributorRoleStore[0]);

  // Spy on the association methods for ContributorRole
  jest.spyOn(ContributorRole.prototype, 'addToProjectContributor')
      .mockImplementation(async function (this: ContributorRole, context, projectContributorId) {
    if (this) {
      return await mockAddContributorRoleToProjectContributor(context, this.id, projectContributorId);
    }
    return false;
  });
  jest.spyOn(ContributorRole.prototype, 'removeFromProjectContributor')
      .mockImplementation(async function (this: ContributorRole, context, projectContributorId) {
    if (this) {
      return await mockRemoveContributorRoleFromProjectContributor(context, this.id, projectContributorId);
    }
    return false;
  });
  jest.spyOn(ContributorRole.prototype, 'addToPlanContributor')
      .mockImplementation(async function (this: ContributorRole, context, planContributorId) {
    if (this) {
      return await mockAddContributorRoleToPlanContributor(context, this.id, planContributorId);
    }
    return false;
  });
  jest.spyOn(ContributorRole.prototype, 'removeFromPlanContributor')
      .mockImplementation(async function (this: ContributorRole, context, planContributorId) {
    if (this) {
      return await mockRemoveContributorRoleFromPlanContributor(context, this.id, planContributorId);
    }
    return false;
  });

  // Use spys to mock the database mutations for a Project and Plan Contributors
  jest.spyOn(ProjectContributor, 'insert').mockImplementation(mockInsertProjectContributor);
  jest.spyOn(ProjectContributor, 'update').mockImplementation(mockUpdateProjectContributor);
  jest.spyOn(ProjectContributor, 'delete').mockImplementation(mockDeleteProjectContributor);
  jest.spyOn(PlanContributor, 'insert').mockImplementation(mockInsertPlanContributor);
  jest.spyOn(PlanContributor, 'update').mockImplementation(mockUpdatePlanContributor);
  jest.spyOn(PlanContributor, 'delete').mockImplementation(mockDeletePlanContributor);

  // Attach the contributors to roles
  contributorRoleStore.forEach((role, idx) => {
    const contributorRole = new ContributorRole(role);
    contributorRole.addToProjectContributor(context, projectContributorStore[idx].id);
    contributorRole.addToPlanContributor(context, planContributorStore[idx].id);
  });
});

afterEach(() => {
  jest.clearAllMocks();

  // Reset the mock database
  clearAffiliationStore();
  clearUserStore();
  clearProjectStore();
  clearPlanStore();
  clearProjectCollaboratorsStore();
  clearContributorRoles();
  clearProjectContributorStore();
  clearPlanContributorStore();
});

describe('projectContributors query', () => {
  beforeEach(() => {
    query = `
      query projectContributorsQuery($projectId: Int!) {
        projectContributors (projectId: $projectId) {
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
          contributorRoles {
            id
            uri
            label
            description
            displayOrder
          }
        }
      }
    `;
  });

  it('returns the projectContributors for the project when the current user is the creator of the project', async () => {
    const variables = { projectId: projectStore[0].id };
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.projectContributors.length).toBe(3);
    // verify all the properties are returned
    expect(resp.body.singleResult.data?.projectContributors[0]?.id).toEqual(projectContributorStore[0].id);
    expect(resp.body.singleResult.data?.projectContributors[0]?.givenName).toEqual(projectContributorStore[0].givenName);
    expect(resp.body.singleResult.data?.projectContributors[0]?.surName).toEqual(projectContributorStore[0].surName);
    expect(resp.body.singleResult.data?.projectContributors[0]?.orcid).toEqual(projectContributorStore[0].orcid);
    expect(resp.body.singleResult.data?.projectContributors[0]?.email).toEqual(projectContributorStore[0].email);
    expect(resp.body.singleResult.data?.projectContributors[0]?.project.id).toEqual(projectStore[0].id);
    expect(resp.body.singleResult.data?.projectContributors[0]?.project.title).toEqual(projectStore[0].title);
    expect(resp.body.singleResult.data?.projectContributors[0]?.affiliation.uri).toEqual(affiliationStore[0].uri);
    expect(resp.body.singleResult.data?.projectContributors[0]?.affiliation.name).toEqual(affiliationStore[0].name);
    expect(resp.body.singleResult.data?.projectContributors[0]?.contributorRoles.length).toBeGreaterThan(0);

    expect(resp.body.singleResult.data?.projectContributors[0]?.created).toEqual(projectContributorStore[0].created);
    expect(resp.body.singleResult.data?.projectContributors[0]?.createdById).toEqual(context.token.id);
    expect(resp.body.singleResult.data?.projectContributors[0]?.modified).toEqual(projectContributorStore[0].modified);
    expect(resp.body.singleResult.data?.projectContributors[0]?.modifiedById).toEqual(context.token.id);
  });

  it('returns the projectContributors for the project when the current user is a collaborator on the project', async () => {
    const variables = { projectId: projectStore[0].id };
    context.token = mockToken();
    // Make the last user in the userStore a collaborator on the project
    projectCollaboratorStore[0].projectId = projectStore[0].id;
    projectCollaboratorStore[0].userId = context.token.id
    projectCollaboratorStore[0].accessLevel = ProjectCollaboratorAccessLevel.EDIT;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.projectContributors.length).toBe(3);
  });

  it('returns the projectContributors for the project when the current user is the an admin for the org that created the project', async () => {
    const variables = { projectId: projectStore[0].id };
    context.token = adminToken;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.projectContributors.length).toBe(3);
  });

  it('returns the projectContributors for the project when the current user is a super admin', async () => {
    const variables = { projectId: projectStore[0].id };
    context.token = superAdminToken;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.projectContributors.length).toBe(3);
  });

  it('returns a 403 when the current user is not a collaborator on the project', async () => {
    const variables = { projectId: projectStore[0].id };
    context.token = mockToken(new User({ id: 999999, affiliationId: 'fake-org', role: UserRole.RESEARCHER }));
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.projectContributors).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('returns a 403 when the current user is an Admin but not for the affiliation of the project creator', async () => {
    const variables = { projectId: projectStore[0].id };
    adminToken.affiliationId = 'fake-org.edu';
    context.token = adminToken;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.projectContributors).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('returns a 401 when the current user is not authenticated', async () => {
    const variables = { projectId: projectStore[0].id };
    context.token = null;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.projectContributors).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
  });

  it('returns a 500 when a fatal error occurs', async () => {
    jest.spyOn(Project, 'findById').mockImplementation(() => { throw new Error('Error!') });

    const variables = { projectId: projectStore[0].id };
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.projectContributors).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  });
});

describe('projectContributor query', () => {
  beforeEach(() => {
    query = `
      query projectContributorQuery($projectContributorId: Int!) {
        projectContributor (projectContributorId: $projectContributorId) {
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
          contributorRoles {
            id
            uri
            label
            description
            displayOrder
          }
        }
      }
    `;
  });

  it('returns the projectContributor for the project when the current user is the creator of the project', async () => {
    const variables = { projectContributorId: projectContributorStore[0].id };
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.projectContributor).toBeTruthy();
    // verify all the properties are returned
    expect(resp.body.singleResult.data?.projectContributor?.id).toEqual(projectContributorStore[0].id);
    expect(resp.body.singleResult.data?.projectContributor?.givenName).toEqual(projectContributorStore[0].givenName);
    expect(resp.body.singleResult.data?.projectContributor?.surName).toEqual(projectContributorStore[0].surName);
    expect(resp.body.singleResult.data?.projectContributor?.orcid).toEqual(projectContributorStore[0].orcid);
    expect(resp.body.singleResult.data?.projectContributor?.email).toEqual(projectContributorStore[0].email);
    expect(resp.body.singleResult.data?.projectContributor?.project.id).toEqual(projectStore[0].id);
    expect(resp.body.singleResult.data?.projectContributor?.project.title).toEqual(projectStore[0].title);
    expect(resp.body.singleResult.data?.projectContributor?.affiliation.uri).toEqual(affiliationStore[0].uri);
    expect(resp.body.singleResult.data?.projectContributor?.affiliation.name).toEqual(affiliationStore[0].name);
    expect(resp.body.singleResult.data?.projectContributor?.contributorRoles.length).toBeGreaterThan(0);

    expect(resp.body.singleResult.data?.projectContributor?.created).toEqual(projectContributorStore[0].created);
    expect(resp.body.singleResult.data?.projectContributor?.createdById).toEqual(context.token.id);
    expect(resp.body.singleResult.data?.projectContributor?.modified).toEqual(projectContributorStore[0].modified);
    expect(resp.body.singleResult.data?.projectContributor?.modifiedById).toEqual(context.token.id);
  });

  it('returns the projectContributor for the project when the current user is a collaborator on the project', async () => {
    const variables = { projectContributorId: projectContributorStore[0].id };
    context.token = mockToken();
    // Make the last user in the userStore a collaborator on the project
    projectCollaboratorStore[0].projectId = projectStore[0].id;
    projectCollaboratorStore[0].userId = context.token.id
    projectCollaboratorStore[0].accessLevel = ProjectCollaboratorAccessLevel.EDIT;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.projectContributor).toBeTruthy();
    expect(resp.body.singleResult.data?.projectContributor.id).toEqual(projectContributorStore[0].id);
  });

  it('returns the projectContributor for the project when the current user is the an admin for the org that created the project', async () => {
    const variables = { projectContributorId: projectContributorStore[0].id };
    context.token = adminToken;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.projectContributor).toBeTruthy();
    expect(resp.body.singleResult.data?.projectContributor.id).toEqual(projectContributorStore[0].id);
  });

  it('returns the projectContributor for the project when the current user is a super admin', async () => {
    const variables = { projectContributorId: projectContributorStore[0].id };
    context.token = superAdminToken;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.projectContributor).toBeTruthy();
    expect(resp.body.singleResult.data?.projectContributor.id).toEqual(projectContributorStore[0].id);
  });

  it('returns a 403 when the current user is not a collaborator on the project', async () => {
    const variables = { projectContributorId: projectContributorStore[0].id };
    context.token = mockToken(new User({ id: 999999, affiliationId: 'fake-org', role: UserRole.RESEARCHER }));
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.projectContributor).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('returns a 403 when the current user is an Admin but not for the affiliation of the project creator', async () => {
    const variables = { projectContributorId: projectContributorStore[0].id };
    adminToken.affiliationId = 'fake-org.edu';
    context.token = adminToken;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.projectContributor).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('returns a 401 when the current user is not authenticated', async () => {
    const variables = { projectContributorId: projectContributorStore[0].id };
    context.token = null;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.projectContributor).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
  });

  it('returns a 500 when a fatal error occurs', async () => {
    jest.spyOn(Project, 'findById').mockImplementation(() => { throw new Error('Error!') });

    const variables = { projectContributorId: projectContributorStore[0].id };
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.projectContributor).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  });
});


describe('planContributors query', () => {
  beforeEach(() => {
    query = `
      query planContributorsQuery($planId: Int!) {
        planContributors (planId: $planId) {
          id
          createdById
          created
          modifiedById
          modified
          plan {
            id
          }
          projectContributor {
            id
            givenName
            surName
          }
          isPrimaryContact
          contributorRoles {
            id
            uri
            label
            description
            displayOrder
          }
        }
      }
    `;
  });

  it('returns the planContributors for the project when the current user is the creator of the project', async () => {
    const variables = { planId: projectStore[0].id };
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.planContributors.length).toBe(3);
    // verify all the properties are returned
    expect(resp.body.singleResult.data?.planContributors[0]?.id).toEqual(planContributorStore[0].id);
    expect(resp.body.singleResult.data?.planContributors[0]?.isPrimaryContact).toEqual(planContributorStore[0].isPrimaryContact);
    expect(resp.body.singleResult.data?.planContributors[0]?.plan.id).toEqual(planStore[0].id);
    expect(resp.body.singleResult.data?.planContributors[0]?.projectContributor.id).toEqual(projectContributorStore[0].id);
    expect(resp.body.singleResult.data?.planContributors[0]?.projectContributor.givenName).toEqual(projectContributorStore[0].givenName);
    expect(resp.body.singleResult.data?.planContributors[0]?.projectContributor.surName).toEqual(projectContributorStore[0].surName);
    expect(resp.body.singleResult.data?.planContributors[0]?.contributorRoles.length).toBeGreaterThan(0);

    expect(resp.body.singleResult.data?.planContributors[0]?.created).toEqual(planContributorStore[0].created);
    expect(resp.body.singleResult.data?.planContributors[0]?.createdById).toEqual(context.token.id);
    expect(resp.body.singleResult.data?.planContributors[0]?.modified).toEqual(planContributorStore[0].modified);
    expect(resp.body.singleResult.data?.planContributors[0]?.modifiedById).toEqual(context.token.id);
  });

  it('returns the planContributors for the plan when the current user is a collaborator on the project', async () => {
    const variables = { planId: planStore[0].id };
    context.token = mockToken();
    // Make the last user in the userStore a collaborator on the project
    projectCollaboratorStore[0].projectId = projectStore[0].id;
    projectCollaboratorStore[0].userId = context.token.id
    projectCollaboratorStore[0].accessLevel = ProjectCollaboratorAccessLevel.EDIT;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.planContributors.length).toBe(3);
  });

  it('returns the planContributors for the plan when the current user is the an admin for the org that created the project', async () => {
    const variables = { planId: planStore[0].id };
    context.token = adminToken;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.planContributors.length).toBe(3);
  });

  it('returns the planContributors for the plan when the current user is a super admin', async () => {
    const variables = { planId: planStore[0].id };
    context.token = superAdminToken;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeUndefined();
    expect(resp.body.singleResult.data?.planContributors.length).toBe(3);
  });

  it('returns a 403 when the current user is not a collaborator on the project', async () => {
    const variables = { planId: planStore[0].id };
    context.token = mockToken(new User({ id: 999999, affiliationId: 'fake-org', role: UserRole.RESEARCHER }));
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.planContributors).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('returns a 403 when the current user is an Admin but not for the affiliation of the project creator', async () => {
    const variables = { planId: planStore[0].id };
    adminToken.affiliationId = 'fake-org.edu';
    context.token = adminToken;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.planContributors).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('FORBIDDEN');
  });

  it('returns a 401 when the current user is not authenticated', async () => {
    const variables = { planId: planStore[0].id };
    context.token = null;
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.planContributors).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
  });

  it('returns a 500 when a fatal error occurs', async () => {
    jest.spyOn(Project, 'findById').mockImplementation(() => { throw new Error('Error!') });

    const variables = { planId: planStore[0].id };
    const resp = await executeQuery(query, variables, context);

    assert(resp.body.kind === 'single');
    expect(resp.body.singleResult.errors).toBeDefined();
    expect(resp.body.singleResult.data?.planContributors).toBeNull();
    expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  });
});

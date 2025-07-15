import casual from 'casual';
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../../schema";
import { resolvers } from "../../resolver";
import { buildContext, MyContext } from '../../context';
import { JWTAccessToken } from '../../services/tokenService';
import { User, UserRole } from '../../models/User';
import assert from "assert";
import { MySQLConnection } from "../../datasources/mysql";
import { logger as mockLogger } from "../../logger";
import { mockAffiliation, persistAffiliation } from "../../models/__mocks__/Affiliation";
import { mockUser, persistUser } from "../../models/__mocks__/User";
import { Affiliation } from "../../models/Affiliation";
import {mockTemplate, persistTemplate} from "../../models/__mocks__/Template";
import {Template, TemplateVisibility} from "../../models/Template";
import {mockSection, persistSection} from "../../models/__mocks__/Section";
import {Section} from "../../models/Section";
import {mockQuestion, persistQuestion} from "../../models/__mocks__/Question";
import {Question} from "../../models/Question";
import {
  TemplateVersionType,
  VersionedTemplate
} from "../../models/VersionedTemplate";
import {VersionedSection} from "../../models/VersionedSection";
import {VersionedQuestion} from "../../models/VersionedQuestion";
import {isNullOrUndefined} from "../../utils/helpers";
import {generateTemplateVersion} from "../../services/templateService";
import {getRandomEnumValue} from "../../__tests__/helpers";
import {
  VersionedQuestionCondition
} from "../../models/VersionedQuestionCondition";
import {QuestionCondition} from "../../models/QuestionCondition";
import {CURRENT_SCHEMA_VERSION} from "@dmptool/types";
import {
  mockMemberRole,
  persistMemberRole
} from "../../models/__mocks__/MemberRole";
import {MemberRole} from "../../models/MemberRole";

let mysqlInstance: MySQLConnection;
let testServer: ApolloServer;
let context: MyContext;
let tablesToCleanup: string[];

const initErrorMessage = 'Failed to initialize test. You need to ' +
  'run docker-compose in another window to make the test DB available!'

export interface ResolverTest {
  server: ApolloServer;
  context: MyContext;
  affiliations: Affiliation[];
  funder: Affiliation;
  superAdmin: User;
  adminAffiliationA: User;
  researcherAffiliationA: User;
  adminAffiliationB: User;
  researcherAffiliationB: User;
}

export function addTableForTeardown (tableName: string): void {
  if (!tablesToCleanup.includes(tableName)) {
    tablesToCleanup.push(tableName);
  }
}

export async function initResolverTest (): Promise<ResolverTest> {
  try {
    // Initialize the mysql connection pool
    mysqlInstance = new MySQLConnection();
    // Ensure the pool has finished initializing
    await mysqlInstance.initPromise;

    // Initialize the Apollo server
    testServer = new ApolloServer({
      typeDefs, resolvers
    });

    await testServer.start();
  } catch (err) {
    console.error(initErrorMessage, err);
    process.exit(1);
  }

  // Build out the Apollo context
  context = buildContext(
    mockLogger,
    null,
    null,
    mysqlInstance,
    null
  );

  try {
    // Create the initial SuperAdmin user with a bogus affiliationId
    const mockedUser = mockUser({ role: UserRole.SUPERADMIN });
    await mysqlInstance.query(context, 'SET FOREIGN_KEY_CHECKS = 0;', []);
    const initialUserId = await User.insert(
      context,
      User.tableName,
      mockedUser,
      'initResolverTest'
    )
    await mysqlInstance.query(context, 'SET FOREIGN_KEY_CHECKS = 1;', []);

    // Set the token to the SuperAdmin by default
    const superAdmin = await User.findById('initResolverTest', context, initialUserId);
    context.token = await mockToken(context, superAdmin);

    // Create a default MemberRole
    await persistMemberRole(context, mockMemberRole({ isDefault: true }));

    // Generate 4 affiliation records with the first being a funder
    const initialAffiliations = [];
    for (let i = 0; i < 3; i++) {
      const isFunder = i === 0;

      initialAffiliations.push(await persistAffiliation(
        context,
        mockAffiliation({funder: isFunder})
      ));
    }
    const funder = initialAffiliations[0];
    const affiliations = initialAffiliations.slice(1);

    // Set the affiliation for the super admin
    superAdmin.affiliationId = affiliations[1].uri;
    await superAdmin.update(context)

    tablesToCleanup = [Affiliation.tableName, MemberRole.tableName, User.tableName];

    return {
      server: testServer,
      context,
      affiliations,
      funder,
      superAdmin,
      adminAffiliationA: await persistUser(
        context,
        mockUser({affiliationId: affiliations[0].uri, role: UserRole.ADMIN})
      ),
      researcherAffiliationA: await persistUser(
        context,
        mockUser({
          affiliationId: affiliations[0].uri,
          role: UserRole.RESEARCHER
        })
      ),
      adminAffiliationB: await persistUser(
        context,
        mockUser({affiliationId: affiliations[1].uri, role: UserRole.ADMIN})
      ),
      researcherAffiliationB: await persistUser(
        context,
        mockUser({
          affiliationId: affiliations[1].uri,
          role: UserRole.RESEARCHER
        })
      )
    }

  } catch (e) {
    console.error('Error initializing test data', e);
    process.exit(1);
  }
}

export async function teardownResolverTest (): Promise<void> {
  const tableNames: string[] = Array.from(new Set([...tablesToCleanup]));

  try {
    // Tell MySQL to skip FKey checks
    await mysqlInstance.query(context,'SET FOREIGN_KEY_CHECKS = 0;', []);

    // Purge all records from the specified tables
    for (const table of tableNames) {
      await mysqlInstance.query(context,`DELETE FROM ${table};`, []);
    }

    // Re-enable FKey checks
    await mysqlInstance.query(context,'SET FOREIGN_KEY_CHECKS = 1;', []);
  } catch (e) {
    console.error('Error cleaning up after tests', e);
    process.exit(1);
  }

  // Close the mysql connection pool
  await mysqlInstance.close();

  // Shutdown the test server
  await testServer.stop();
}

// Generate a mock JWT
export const mockToken = async (
  context: MyContext,
  user: User
): Promise<JWTAccessToken> => {
  return {
    id: user.id,
    email: await user.getEmail(context),
    givenName: user.givenName,
    surName: user.surName,
    affiliationId: user.affiliationId,
    role: user.role,
    languageId: 'en-US',
    jti: casual.integer(1, 999999).toString(),
    expiresIn: casual.integer(1, 999999999),
  }
}

// Proxy call to the Apollo server test server
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeQuery (query: string, variables: any): Promise<any> {
  return await testServer.executeOperation(
    { query, variables },
    { contextValue: context },
  );
}

export interface standardErrorTestInput {
  graphQL: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any,
  mustBeAuthenticated: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spyOnClass: any,
  spyOnFunction: string
}

// Tests for Not Found error handling
export async function testNotFound (
  graphQL: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any
): Promise<void> {
  const resp = await executeQuery(graphQL, variables);
  // Test 500 Internal Server error handling
  assert(resp.body.kind === 'single');
  expect(resp.body.singleResult.errors).toBeDefined();
  expect(resp.body.singleResult.data[Object.keys(resp.body.singleResult.data)[0]]).toBeNull();
  expect(resp.body.singleResult.errors[0].extensions.code).toEqual('NOT_FOUND');
}

// Test out Unauthenticated and Internal Server errors
export async function testStandardErrors (input: standardErrorTestInput): Promise<void> {
  const originalToken = context.token;

  // Keep track of the original function and then add a spy
  const originalFunction = input.spyOnClass[input.spyOnFunction];
  jest.spyOn(input.spyOnClass, input.spyOnFunction).mockImplementation(async () => {
    throw new Error('Test Error');
  });

  const resp = await executeQuery(input.graphQL, input.variables);

  // Test 500 Internal Server error handling
  assert(resp.body.kind === 'single');
  expect(resp.body.singleResult.errors).toBeDefined();
  expect(resp.body.singleResult.data[Object.keys(resp.body.singleResult.data)[0]]).toBeNull();
  expect(resp.body.singleResult.errors[0].extensions.code).toEqual('INTERNAL_SERVER');
  // Restore the original function
  input.spyOnClass[input.spyOnFunction] = originalFunction;

  // If authentication is required
  if (input.mustBeAuthenticated) {
    // Test missing token handler
    context.token = null;

    const resp2 = await executeQuery(input.graphQL, input.variables);

    assert(resp2.body.kind === 'single');
    expect(resp2.body.singleResult.errors).toBeDefined();
    expect(resp2.body.singleResult.data[Object.keys(resp2.body.singleResult.data)[0]]).toBeNull();
    expect(resp2.body.singleResult.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
  }
  context.token = originalToken;
}

// Generate a template with one section and 3 questions
export async function generateFullTemplate (
  resolverTest: ResolverTest
): Promise<Template> {
  const reference = 'generateFullTemplate';
  const template = await persistTemplate(
    resolverTest.context,
    mockTemplate({
      ownerId: resolverTest.funder.uri
    })
  );

  if (isNullOrUndefined(template) || template.hasErrors()) {
    console.error(`ERROR in ${reference} for template - ${template.errors}`);
  } else {
    tablesToCleanup.push(Template.tableName);

    // Create a section for the template
    const section = await persistSection(
      resolverTest.context,
      mockSection({
        templateId: template.id,
        displayOrder: 1,
      })
    )

    if (isNullOrUndefined(section) || section.hasErrors()) {
      console.error(`ERROR in ${reference} for section - ${section.errors}`);
    } else {
      tablesToCleanup.push(Section.tableName);
      tablesToCleanup.push(Question.tableName);
      tablesToCleanup.push(QuestionCondition.tableName);

      // Create a couple of questions 2 text areas and one checkbox for the section
      const questions = [];
      for (let i = 0; i < 3; i++) {
        let json = JSON.stringify({
          type: "textArea",
          meta: {
            asRichText: true,
            schemaVersion: CURRENT_SCHEMA_VERSION
          }
        });

        if (i === 2) {
          json = JSON.stringify({
            type: "checkBoxes",
            options: [
              {
                type: "option",
                attributes: {
                  label: "A",
                  value: "a",
                  checked: true
                }
              },
              {
                type: "option",
                attributes: {
                  label: "B",
                  value: "b",
                  checked: false
                }
              }
            ],
            meta: {
              schemaVersion: CURRENT_SCHEMA_VERSION
            }
          });
        }

        const question = await persistQuestion(
          resolverTest.context,
          mockQuestion({
            templateId: template.id,
            json,
            sectionId: section.id,
            displayOrder: i + 1,
          })
        );
        if (isNullOrUndefined(question) || question.hasErrors()) {
          console.error(`ERROR in ${reference} for question - ${question.errors}`);
        } else {
          questions.push(question);
        }
      }
    }
    return template;
  }
  return null;
}

// Generate a version of the specified template
export async function generateFullVersionedTemplate (
  resolverTest: ResolverTest,
  templateId: number,
  visibility: TemplateVisibility = getRandomEnumValue(TemplateVisibility),
  versionType: TemplateVersionType = TemplateVersionType.PUBLISHED
): Promise<VersionedTemplate> {
  const reference = 'generateFullVersionedTemplate';
  const template = await Template.findById(reference, resolverTest.context, templateId);

  if (!isNullOrUndefined(template)) {
    tablesToCleanup.push(VersionedTemplate.tableName);
    tablesToCleanup.push(VersionedSection.tableName);
    tablesToCleanup.push(VersionedQuestion.tableName);
    tablesToCleanup.push(VersionedQuestionCondition.tableName);

    const versionedTemplate = await generateTemplateVersion(
      resolverTest.context,
      template,
      [],
      resolverTest.context.token.id,
      casual.sentence,
      visibility,
      versionType,
    );

    if (isNullOrUndefined(versionedTemplate) || versionedTemplate.hasErrors()) {
      console.error(`ERROR in ${reference} - ${versionedTemplate.errors}`);
    } else {
      return versionedTemplate;
    }
  }
  return null;
}

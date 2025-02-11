### Added
- Added `useSampleTextAsDefault` column to questions table and add `admins` to Template schema and chained it in the resolver
- Added `requestId` to the Apollo context
- Added `questionOptions` schema, resolver and `QuestionOption` model, which will be used for `option` question types
- Added a new query to get all versionedTemplates, called `myVersionedTemplates`, under user's affiliation, and added a new method in the model called `findByAffiliationId`
- Updated `templates` resolver to handle updates to `sections` and `questions` when copying a `template`
- Added "remove" method to SectionTag model. Updated "updateSection" method in Section resolvers to remove sectionTags when user is updating their Section. Added "getTagsToRemove" method to the Section resolver. Added associated unit tests.
- Added "lastPublishedDate" field to templates table, and changed "currentVersion" field to "lastPublishedVersion"
- Added support for creating "other" affiliations
- Added update and updatePassword to User
- Added resolvers for User
- Added userService to handle random password generation, anonymization and merging
- Added recordLogIn and update functions to User model
- Added data-fns package to help with Date validation and formatting
- Added Language model, resolver and type. Added LanguageId to User and Template
- Built Question resolvers and models(#13)
- Fixed some bugs to allow frontend to access token change(Frontend #116)
- Added data migrations for QuestionType, Question, QuestionCondition, VersionedQuestion and VersionedQuestionCondition
- Added missing VersionedQuestionCondition schema file
- Added schemas for Question, QuestionType, QuestionCondition and VersionedQuestion
- Added resolvers and models for Section, Tag and VersionedSection
- Added acceptedTerms to User schema and to user sql table
- Added schema for Section and Tag
- Initial schema, model, mocks and resolver for Templates
- Initial schema, model, mocks and resolver for Collaborators
- added templateService to assist with actions that work on a Template and all of it's child objects
- Added stub emailService as a placeholder for now. We will build that out once the AWS infrastructire is in place
- Added new `src/__mocks__/context` to mock the Apollo Server context object
- Added `insert`, `update` `delete` functions to the `MySqlModel` abstract class
- Missing data-migration for the dataMigrations table
- Script to nuke the DB so it can be easily rebuilt from scratch
- Added husky precommit tasks
- Added data migrations for Section and Tag
- Added Redis to the docker-compose file
- Added Cache data source (and tests)
- Added CSRF middleware
- Added signoutController and refreshTokenController
- Added tests for all Controllers
- Added supertest to support integration tests
- Added integration tests for token management (signin, signup, signout, refresh)
- Data migrations for affiliations table
- Added Project, ProjectContributor, ProjectFunder schemas and supporting tables
- Added Plan, PlanContributor, PlanCollaborator, PlanFunder, PlanFeedback, PlanFeedbackComment, Answer and AnswerComment schemas and supporting tables
- Added models and resolvers for MetadataStandard, Repository, ResearchDomain, and License
- Added models and resolvers for ProjectContributor, ProjectFunder, ProjectOutput and Project

### Updated
- Updated `formatLogMessage` to accept the Apollo context instead of the logger so that it can being to record the `requestId`, `jti` and `userId` (when available)
- Updated `questionTypes` table to remove 'Rich Text Editor' and to add `usageDescription`. Also, updated Question model's `create` method to allow for entries with duplicate `questionText`
- Updated User update method to prevent password manipulation
- Updated User registration so that the terms and conditions must have been accepted
- Updated User schema, model and data migrations with new properties
- Change default JWT TTL to 30 minutes
- Added user id to the JTI to help ensure uniqueness
- Update sign out controller to always clear the cookies and return 200 regardless of the state of the tokens
- Updated `src/context.ts` to use a `buildContext` wrapper function that can be called when building the context for Apollo Server and our `signin` and `signup` endpoints.
- Updated use of `toUTCString()` to `toISOString()`
- Updated `tokenService` to properly catch and throw errors
- Updated `graphQLErrors` with more error types
- Added MariaDB to docker-compose
- data-migrations/README.md with instructions on running migrations in the Docker container
- tokenService now supports refresh tokens, CSRF tokens and signout
- updated express middelware to fetch the access token and refresh tokens from the cookies instead of the headers
- removed old oauth-server package which had security vulnerabilities
- moved authMiddleware function from the router.ts into its own class in src/middelware
- updated Affiliation Schema, Resolver, Models to use new affiliations tables in the database
- updated all of the cache key structures to wrap them in `{}` due to the way Redis handles keys in cluster mode
- updated emailService to use nodemailer and to support emailConfirmation templateCollaboration and planCollaboration email messages
- added bestPractice flag to the Section

### Fixed
- Converted DateTimeISO to String in schemas so that dates could be inserted into mariaDB database, and updated MySqlModel and associated unit test

## v0.0.1
Initial Apollo Server build

### Added
- Added unit tests for User model and contributorRole resolver, and added @types/pino
- Added editor config
- initial Apollo server config
- Initial Schema for ContributorRole
- Initial Schema for DMSP
- Resolvers for ContributorRole
- Initial resolver to fetch a single DMSP from the DMPHub API
- Initial DMPHub API data source
- Initial MySQL data source
- Custom GraphQL scalars for ROR, ORCID and DMSP IDs
- Mechanism for Apollo to use mocks when a resolver has not yet been implemented
- Mocks for User
- Data migration mechanism `./data-migrations/process.sh`
- Documentation!
- Local Docker Compose config
- Pino logger with ECS formatter
- Plugin to log request/response lifecycle events
- Add Logger to the context and then used it in the resolvers
- Schema, Mocks, Models and Resolvers for Affiliations and tests for the Models and Resolvers
- Added new DataSource for the DmptoolApi with endpoints for Affiliations and a new mock for this data source for use in tests

### Updated
- Made some updates to auth code based on testing out recent changes with frontend [#34]
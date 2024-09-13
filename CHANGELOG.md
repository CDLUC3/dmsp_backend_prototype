
### Added
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

### Updated
- Updated `src/context.ts` to use a `buildContext` wrapper function that can be called when building the context for Apollo Server and our `signin` and `signup` endpoints.
- Updated use of `toUTCString()` to `toISOString()`
- Updated `tokenService` to properly catch and throw errors
- Updated `graphQLErrors` with more error types
- Added MariaDB to docker-compose
- data-migrations/README.md with instructions on running migrations in the Docker container

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
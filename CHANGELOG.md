
### Added
- Schema, Mocks, Models and Resolvers for Affiliations
- Added new DataSource for the DmptoolApi with endpoints for Affiliations

### Updated
- Updated schemas.ts, resolvers.ts, mocks.ts and codegen.ts to use new Affiliation files

## v0.1
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

### Updated
- Made some updates to auth code based on testing out recent changes with frontend [#34]
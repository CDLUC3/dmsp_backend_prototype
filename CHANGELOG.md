
### Added
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
- Logger to the context and then used it in the resolvers

# DMSP Backend Prototype

Apollo Server to support GraphQL interactions with the UI and external partners.

Our Apollo server installation consists of:
- Data Sources: Code used to communicate with external APIs, databases, file systems, etc.
- GraphQL Schemas: The definition of our Graph including types, queries and mutations
- Resolvers: The code that processes incoming queries and uses the available data sources to generate the results
- Mocks: Stub or placeholder data that can be returned when a resolver has not yet been developed

## Installation
- Clone this repository to your local machine
- Create your dotenv file the `cp ./.env.example ./.env`
- Update the new `.env` file if necessary (make sure it has no references to MYSQL unless you want to override the docker-compose db setings)
- Run `docker-compose build` to build the container
- Once the build has completed start the container with: `docker-compose up`
- In a separate tab run `docker-compose exec apollo bash ./data-migrations/process.sh` to build out the local database
- Visit `http://localhost:4000/graphql` to load the Apollo server explorer and verify that the system is running.

## Running current database migrations

**Local Docker container**
- While the Docker container is up and running, just run `docker-compose exec apollo bash ./data-migrations/process.sh` in a seperate terminal window.

**AWS Cloud9 Bastion Host**
- Login to the AWS console and start the bastion cloud9 instance.
- Navigate to this repo on the instance (clone it if it is not there)
- Checkout the appropriate branch/tag and pull down the latest
- Run `./data-migrations/process.sh [env]`

## Dropping all of the tables in the local database

In the event that you want to delete all of the tables and data from your database and rebuild a clean database you can run

**Local Docker container**
- Drop the tables: `docker-compose exec apollo bash ./data-migrations/nuke-db.sh`
- Rebuild the tables and seed them: `docker-compose exec apollo bash ./data-migrations/process.sh`

Note that the container must be running!

**AWS Cloud9 Bastion Host**

NEVER EVER do this in production! You will lose ALL data.

- Login to the AWS console and start the bastion cloud9 instance.
- Navigate to this repo on the instance (clone it if it is not there)
- Checkout the appropriate branch/tag and pull down the latest
- Drop the tables: `./data-migrations/nuke-db.sh`
- Rebuild the tables and seed them: `./data-migrations/process.sh`

## Adding or updating GraphQL functionality

If you need to add additional Queries and/or Mutations, you will typically need to update 3 distinct sections of the Apollo server framework.
1. GraphQL Schema: The definition of the structure of an object and any queries and mutations that can be performed against that object.
2. Resolvers: Handlers for determining out how to respond to Query and Mutation requests
3. Models: The business logic associated with an object as well as how to interact with it's underlying data source (e.g. API calls, SQL queries, etc.)

### GraphQL schemas

[Official Apollo Server docs for schemas](https://www.apollographql.com/docs/apollo-server/schema/schema)

To add Queries or Mutations you should locate the appropriate schema in the `src/schemas` directory. If you have a completely new entity you want to add, then create a new schema file in that directory (use an existing one as reference) and then be sure to import it into `src/schemas.ts` and make sure it is getting passed to the Apollo server.

Once a schema has been added/modified, you will need to run `npm run generate` this kicks off a script that builds out Typescript Types for the new schema and queries.

### Resolvers

[Official Apollo Server docs for resolvers](https://www.apollographql.com/docs/apollo-server/data/resolvers/)

Resolvers can be found in the `src/resolvers/` directory. You should have a corresponding Query and Mutation for each one defined within the GraphQL schema.

A resolver receives the following for each request:
- **parent**: The parent object (only applicable when chaining - see below)
- **input**: The query params received from the caller (e.g. templateId, email, etc.)
- **context**: The apollo server context (see below).
- **info**: N/A (so far)

#### Context
Our context is defined in `src/context.ts` and consists of several items that are instantiated when the server starts up or as part of processing the incoming request.
- **token**: The JWT token passed in the header of the request.
- **user**: The user info associated with the JWT token. Includes the `userId`, `email`, `givenName`, `surName`, `affiliationId` and `role`. This info can be used to authorize the request.
- **cache**: The Apollo server cache.
- **dataSources**: An object containing the MySQL DB connection pool and the DMPHub API wrapper

#### Chaining
GraphQL using a concept called [chaining](https://www.apollographql.com/docs/apollo-server/data/resolvers#resolver-chains) to resolve complex queries that request access to multiple object types.
When you define a relationship between objects within the GraphQL schema, resolvers will be called when appropriate to retrieve each object.

For example, assume the following schema:
```
extend type Query {
  user(userId: Int!): User
}

type User {
  id: Int
  email: String!
  affiliation: Affiliation!
}
```

In this schema, we have a query to fetch a user record. The User object exposes a reference to an asscoiated affiliation.

GraphQL allows the caller to dictate what data they want to receive back from a query request. So, if the caller requests:
```
query user($userId: Int!) {
  user(userId: $userId) {
    email
  }
}
{
  "userId": 1
}
```
Apollo server will call the resolver for the user to fetch the email from the database but will ignore the associated affiliation because the caller did not request it.

If on the other hand the caller asked for the affiliation in the request:
```
query user($userId: Int!) {
  user(userId: $userId) {
    email
    affiliation {
      id
      name
    }
  }
}
{
  "userId": 1
}
```
Apollo server will call the resolver to get the email and affiliationId for the user from the database. Once it has retreived the affiliationId, it will make a subsequent call to the DMPHub API to fetch the ROR id and the name of the affiliation.

To define chainging in the resolver you would do something like this:
```
  Query: {
    // Resolver exposed by GraphQL
    user: async (_, { userId }, context: MyContext): Promise<User> => {
      return await User.findById('user resolver', context, userId);
    },
  },

  User: {
    // Chained resolver to fetch the Affiliation info for a user
    affiliation: async (parent: User, _, context): Promise<Affiliation> => {
      return Affiliation.findById('Chained User.affiliation', context, parent.affiliationId);
    },
  },
```

If you added a new resolver, be sure to import it into the `src/resolvers.ts` file and include it for Apollo Server.


### Models

Models are used to perform business logic and interact with underlying datasources.

For example:
- If my data source returns a property called `funder_id` and I want to send a boolean flag called `isFunder` to the caller, I perform the logic in a Model.
- If I simply want to rename a property prior to returning it to the client like the data source returning `identifier` but needing to send `DMPId` to the caller.

There are abstract base classes available to help offload some of the redundant code. For example the MySqlModel provides standardized fields common to every DB record as well as a `query` function that handles calls to the DB.

### Mocks

In some situations, the data source will not be ready. In this scenario you can create a mock for use during development. Mocks live in `src/mocks/` and there is an example for affiliations there.

To use a mock, simply import it into your resolver and then setup your Query and Mutation handlers to interact with the canned mock data.

Note that mocks will refresh each time the server is restarted!

### Tests

You MUST add tests if you added or modified a Model! To do so, find the corresponding file (or add a new one) in the `src/models/__tests_/` directory.

Resolver tests are not yet particularly useful. We will be updating this to add these integration tests in the near future.

## Contributing

1. Clone this repo
2. Create a new branch prefixing branch with `bug`, `chore` or `feature` based on type of update: `git checkout -b feature/your-feature`
3. Add your changes and add commit message: `git add .; git commit -m "added new feature`. A pre-commit is run with the commit which checks to make sure linting and test coverage pass before a commit goes through
4. Push your branch up to this repo: `git push --set-upstream origin feature/your-feature`
5. Open a Pull Request in github

## Contributors

- [Brian Riley](https://github.com/briri)
- [Juliet Shin](https://github.com/jupiter007)
- [Andre Engelbrecht](https://github.com/andrewebdev)
- [Fraser Clark](https://github.com/fraserclark)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) for for details.

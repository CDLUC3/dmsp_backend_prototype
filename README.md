# DMSP Backend Prototype

Apollo Server to support GraphQL interactions with the UI and external partners.

Our Apollo server installation consists of:
- Data Sources: Code used to communicate with external APIs, databases, file systems, etc.
- GraphQL Schemas: The definition of our Graph including types, queries and mutations
- Resolvers: The code that processes incoming queries and uses the available data sources to generate the results
- Mocks: Stub or placeholder data that can be returned when a resolver has not yet been developed

## Installation
- Make a local copy of the example dotenv file: `cp .env-example .env`
- Setup MySQL:
  - If you are running on a Mac:
    - If you have homebrew installed, run `brew install mysql` and then start it `brew services start mysql`
  - Initialize the Database and the dataMigrations table: `./data-migrations/database-init.sh`
  - Run all database migrations: `./data-migrations/process.sh`
- Install all of the dependencies: `npm install`
- Generate the Typescript types: `npm run generate`
- Startup the application in development mode: `npm run dev`
- Navigate to `http://localhost:4000` in your browser

## Running current database migrations
- See the readme file in the `data-migrations` directory for instructions on running data migrations in your local environment.

## Adding a new query/mutation
You should always start by updating an existing GraphQL Schema file or adding a new one to the `src/schemas` directory.

Please include comments everywhere. These comments appear in the GraphQL explorer and help others undertand how to interact with the query or mutation.

If you added a new schema file, make sure you update the `src/schemas.ts` file to pull in the new file when the server starts up.

Once the schema has been added, you will need to run `npm run generate` this kicks off a script that builds out Typescript Types for the new schema and queries.

### Create a new Model
You will need to create a Model if your new query/mutation will need to transform the response from the data source in any way prior to sending it to the caller or to the data source.

For example:
- If my data source returns a property called `funder_id` and I want to send a boolean flag called `isFunder` to the caller, I perform the logic in a Model.
- If I simply want to rename a property prior to returning it to the client like the data source returning `identifier` but needing to send `DMPId` to the caller.

Make sure that you transform the raw response from the data source into your Model in your new resolver.
For example:
```
const response = await someDataSource.query('test');
return new MyModel(response);
```

### Create a Mock
If you will be unable to create the corresponding resolver(s) at this point because of time constraints or because the data source is not yet ready, then you should add a new Mock file to the `src/schemas/` directory (or update and existing one with your changes). If you add a new mock be sure to update the `src/mocks.ts` to pull in your new mock when the server starts up.

Note that mocks should represent the data structure that will be returned from your resolver to the caller. NOT the dtat structure that the resolver receives from the data source!

### Create a Resolver
If your data source is ready and you have the bandwidth, add a new Resolver to the `src/resolvers/` directory (or update one with your new query/mutation). If you add a new Resolver be sure to update the `src/resolvers.ts` file to make sure it is included when the server starts up.

### Add tests
You MUST add tests if you added or modified a Model! To do so, find the corresponding file (or add a new one) in the `src/models/__tests_/` directory.

Resolver tests are not yet particularly useful. We will be updating this to add these integration tests in the near future.

## Useful commands
- To run the Codegen utility to generate our Typescript types: `npm run generate`
- To run the server in development mode: `npm run dev`
- To run the server normally: `npm start`
- To build the application: `npm run build`

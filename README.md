# DMSP Backend Prototype

Apollo Server to support GraphQL interactions with the UI and external partners.

Our Apollo server installation consists of:
- Data Sources: Code used to communicate with external APIs, databases, file systems, etc.
- GraphQL Schemas: The definition of our Graph including types, queries and mutations
- Resolvers: The code that processes incoming queries and uses the available data sources to generate the results
- Mocks: Stub or placeholder data that can be returned when a resolver has not yet been developed

## Installation
- Clone this repository to your local machine
- Run `docker-compose build` to build the container
- In a separate tab Run `docker-compose exec apollo bash ./data-migrations/process.sh` to build out the local database
- Visit `http://localhost:4000/graphql` to load the Apollo server explorer and verify that the system is running.

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
In some situations you will need to create mock data because the data source is not yet available. To do this, add your schema and model per normal and then add a resolver.

Then create a mock in `src/mocks/` and create an array of records. Note that these records should reflect the response that GraphQL would send to the caller, NOT the structure of the record that will come from the data source.

Once the mocks have been created, you can add your query and mutation methods to the resolver, but instead of using the data sources provided in the Apollo server context, you can import the mocks and interact with them directly.

Note that when you do this, the mock data will reset itself between server startups.

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
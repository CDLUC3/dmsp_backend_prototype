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

## Useful commands
- To run the Codegen utility to generate our Typescript types: `npm run generate`
- To run the server in development mode: `npm run dev`
- To run the server normally: `npm start`
- To build the application: `npm run build`

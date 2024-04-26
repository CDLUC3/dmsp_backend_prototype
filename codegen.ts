import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // schema: "./src/schema.ts",
  schema: "./src/schemas/*.graphql",
  generates: {
    "./src/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        // federation: "true",
        contextType: "./context#DataSourceContext",
        // namingConvention: 'keep',
        mappers: {
          Dmsp: "./models/Dmsp#DmspModel",
          //ContributorRole: "./models#ContributorRoleModel",
        },
      },
    },
  },
};

export default config;

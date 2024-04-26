import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // schema: "./src/schema.ts",
  schema: "./src/schemas/*.ts",
  generates: {
    "./src/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        // federation: "true",
        contextType: "./context#DataSourceContext",
        // namingConvention: 'keep',
        mappers: {
          Dmsp: "./models/Dmsp#DmspModel",
          ContributorRole: "./models/ContributorRole#ContributorRoleModel",
        },
      },
    },
  },
};

export default config;

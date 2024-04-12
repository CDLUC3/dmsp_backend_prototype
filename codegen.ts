import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schemas/*.graphql",
  generates: {
    "./src/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        federation: "true",
        contextType: "./context#DataSourceContext",
        mappers: {
          ContributorRole: "./models#ContributorRoleModel",
          DMP: "./models#DMPModel"
        },
      },
    },
  },
};

export default config;

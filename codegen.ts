import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schemas/*.ts",
  generates: {
    "./src/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "./context#MyContext",
        enumsAsTypes: true,
        mappers: {
          Dmsp: "./models/Dmsp#DmspModel",
        },
      },
    },
  },
};

export default config;

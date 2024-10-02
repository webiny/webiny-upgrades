import { Context } from "../types";
import { createFileDefinition, createFilePath, createFiles } from "../utils";

export const setupFiles = (context: Context) => {
    /**
     * Add files that will be used at some point in the upgrade process.
     */
    const files = createFiles(context, [
        createFileDefinition({
            path: createFilePath(context, "${graphql}/src/index.ts"),
            tag: "gql",
            name: "api/graphql/index"
        }),
        createFileDefinition({
            path: createFilePath(context, "${graphql}/src/types.ts"),
            tag: "gql",
            name: "api/graphql/types"
        }),
        createFileDefinition({
            path: createFilePath(context, "${graphql}/package.json"),
            tag: "package.json",
            name: "api/package.json"
        })
    ]);

    return files.relevant();
};

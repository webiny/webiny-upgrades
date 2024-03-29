import { Context } from "../types";
import { createFileDefinition, createFilePath, createFiles } from "../utils";

export const setupFiles = (context: Context) => {
    /**
     * Add files that will be used at some point in the upgrade process.
     */
    const files = createFiles(context, [
        createFileDefinition({
            path: createFilePath(context, "${graphql}/src/security.ts"),
            tag: "gql",
            name: "api/graphql/security"
        }),
        createFileDefinition({
            path: createFilePath(context, "${graphql}/src/index.ts"),
            tag: "gql",
            name: "api/graphql/index"
        })
    ]);

    return files.relevant();
};

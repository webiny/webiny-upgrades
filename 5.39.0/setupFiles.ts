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
            path: createFilePath(context, "${graphql}/src/security.ts"),
            tag: "security",
            name: "api/graphql/security"
        }),
        createFileDefinition({
            path: createFilePath(context, "${graphql}/package.json"),
            tag: "package.json",
            name: "api/package.json"
        }),
        createFileDefinition({
            path: createFilePath(context, "${root}/package.json"),
            tag: "package.json",
            name: "package.json"
        })
    ]);

    return files.relevant();
};

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
            tag: "gql",
            name: "api/graphql/security"
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
        }),
        createFileDefinition({
            path: createFilePath(context, "${admin}/src/App.tsx"),
            tag: "admin",
            name: "admin/App"
        }),
        createFileDefinition({
            path: createFilePath(context, "${root}/webiny.project.ts"),
            tag: "root",
            name: "webiny.project.ts"
        }),
        createFileDefinition({
            path: createFilePath(context, "${extensions}/theme/src/index.ts"),
            tag: "extensions",
            name: "extensions/theme/index"
        }),
        createFileDefinition({
            path: createFilePath(context, "${website}/src/index.tsx"),
            tag: "website",
            name: "website/index"
        }),
        createFileDefinition({
            path: createFilePath(context, "${website}/src/App.tsx"),
            tag: "website",
            name: "website/App"
        })
    ]);

    return files.relevant();
};

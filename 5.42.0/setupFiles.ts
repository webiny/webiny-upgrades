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
        }),
        createFileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/formBuilder/richTextEditor.ts"),
            tag: "admin",
            name: "admin/fb/richTextEditor"
        }),
        createFileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/headlessCMS/richTextEditor.ts"),
            tag: "admin",
            name: "admin/cms/richTextEditor"
        }),
        createFileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/pageBuilder/richTextEditor.ts"),
            tag: "admin",
            name: "admin/pb/richTextEditor"
        })
    ]);

    return files.relevant();
};

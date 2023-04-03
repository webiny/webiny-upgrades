import { Context } from "../types";
import { createFilePath, Files, FileDefinition } from "../utils";

export const setupFiles = (context: Context): Files => {
    /**
     * Add files that will be used at some point in the upgrade process.
     */
    const files = new Files(context, [
        new FileDefinition({
            path: createFilePath(context, "${graphql}/src/index.ts"),
            tag: "gql",
            name: "graphql/index"
        }),
        new FileDefinition({
            path: createFilePath(context, "${website}/package.json"),
            tag: "website",
            name: "website/package.json"
        }),
        new FileDefinition({
            path: createFilePath(context, "${theme}/package.json"),
            tag: "theme",
            name: "theme/package.json"
        }),
        new FileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/pageBuilder/editorPlugins.ts"),
            tag: "admin",
            name: "admin/plugins/pageBuilder/editorPlugins.ts"
        })
    ]);

    return files.relevant();
};

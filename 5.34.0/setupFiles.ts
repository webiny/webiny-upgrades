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
            path: createFilePath(context, "${graphql}/src/types.ts"),
            tag: "gql",
            name: "graphql/types"
        }),
        new FileDefinition({
            path: createFilePath(context, "${admin}/src/plugins/headlessCms.ts"),
            tag: "gql",
            name: "admin/headlessCms"
        })
    ]);

    return files.relevant();
};

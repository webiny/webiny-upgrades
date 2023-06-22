import { Context } from "../types";
import { createFilePath, Files, FileDefinition } from "../utils";

export const setupFiles = (context: Context): Files => {
    /**
     * Add files that will be used at some point in the upgrade process.
     */
    const files = new Files(context, [
        new FileDefinition({
            path: createFilePath(context, "${graphql}/src/security.ts"),
            tag: "gql",
            name: "graphql/security"
        })
    ]);

    return files.relevant();
};

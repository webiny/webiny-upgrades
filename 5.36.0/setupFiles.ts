import { Context, IFiles } from "../types";
import { createFilePath, FileDefinition, Files } from "../utils";

export const setupFiles = (context: Context): IFiles => {
    /**
     * Add files that will be used at some point in the upgrade process.
     */
    const files = new Files(context, [
        new FileDefinition({
            path: createFilePath(context, "${graphql}/src/index.ts"),
            tag: "gql",
            name: "graphql/index"
        })
    ]);

    return files.relevant();
};

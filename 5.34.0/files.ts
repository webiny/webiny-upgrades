import { Context } from "../types";
import {
    createFilePath,
    getGraphQLPath,
    getIsElasticsearchProject,
    getIsPre529Project
} from "../utils";
import { Files } from "./classes/Files";
import { FileDefinition } from "./classes/FileDefinition";

export const getAllFiles = (context: Context): Files => {
    /**
     * Add new source file that will be changed at some point later on.
     */
    const isPre529Project = getIsPre529Project(context);
    const isElasticsearchProject = getIsElasticsearchProject(context, getGraphQLPath(context));
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
        })
    ]);

    return files.filter(file => {
        if (file.pre529 === true && !isPre529Project) {
            return false;
        } else if (file.elasticsearch === true && !isElasticsearchProject) {
            return false;
        }
        return true;
    });
};

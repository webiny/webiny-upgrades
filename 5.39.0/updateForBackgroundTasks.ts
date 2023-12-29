import {
    addPluginToCreateHandler,
    createProcessor,
    getGraphQLPath,
    getIsElasticsearchProject,
    insertImportToSourceFile
} from "../utils";
import { Context } from "../types";

const getModuleSpecifier = (context: Context) => {
    const apiGraphQLPath = getGraphQLPath(context);
    const isElasticsearch = getIsElasticsearchProject(context, apiGraphQLPath);
    if (isElasticsearch) {
        return "@webiny/api-background-tasks-es";
    }
    return "@webiny/api-background-tasks-ddb";
};
export const updateForBackgroundTasks = createProcessor(async params => {
    const { files, project } = params;

    const file = files.byName("api/graphql/index");
    const source = project.getSourceFile(file.path);

    insertImportToSourceFile({
        source,
        name: ["createBackgroundTasks"],
        moduleSpecifier: getModuleSpecifier(params.context),
        after: "@webiny/api-headless-cms"
    });

    addPluginToCreateHandler({
        after: "createAuditLogs",
        source,
        value: `createBackgroundTasks()`
    });
});

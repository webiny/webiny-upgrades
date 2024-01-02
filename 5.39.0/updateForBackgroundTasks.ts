import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    getGraphQLPath,
    getIsElasticsearchProject,
    insertImportToSourceFile
} from "../utils";
import { Context } from "../types";
import path from "path";

const getTasksPackage = (context: Context): string => {
    const apiGraphQLPath = getGraphQLPath(context);
    const isElasticsearch = getIsElasticsearchProject(context, apiGraphQLPath);
    if (isElasticsearch) {
        return "@webiny/api-background-tasks-es";
    }
    return "@webiny/api-background-tasks-ddb";
};
export const updateForBackgroundTasks = createProcessor(async params => {
    const { files, project, context } = params;

    const file = files.byName("api/graphql/index");
    const source = project.getSourceFile(file.path);

    const tasksPackage = getTasksPackage(context);

    insertImportToSourceFile({
        source,
        name: ["createBackgroundTasks"],
        moduleSpecifier: tasksPackage,
        after: "@webiny/api-headless-cms"
    });

    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    addPackagesToDependencies(context, apiPackageJsonPath, {
        [tasksPackage]: context.version
    });

    addPluginToCreateHandler({
        after: "createHeadlessCmsGraphQL",
        source,
        value: `createBackgroundTasks()`,
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createBackgroundTasks") === null;
            });
        }
    });
});

import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    extendInterface,
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

    const tasksPackage = getTasksPackage(context);
    /**
     * Common.
     */
    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    addPackagesToDependencies(context, apiPackageJsonPath, {
        [tasksPackage]: context.version,
        "@webiny/tasks": context.version
    });

    /**
     * GraphQL index.ts file.
     */
    const graphQlIndexFile = files.byName("api/graphql/index");
    const graphQlIndexSource = project.getSourceFile(graphQlIndexFile.path);

    insertImportToSourceFile({
        source: graphQlIndexSource,
        name: ["createBackgroundTasks"],
        moduleSpecifier: tasksPackage,
        after: "@webiny/api-headless-cms"
    });

    addPluginToCreateHandler({
        after: "createHeadlessCmsGraphQL",
        source: graphQlIndexSource,
        value: `createBackgroundTasks()`,
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createBackgroundTasks") === null;
            });
        }
    });
    /**
     * GraphQL types.ts file.
     */
    const graphQlTypesFile = files.byName("api/graphql/types");
    const graphQlTypesSource = project.getSourceFile(graphQlTypesFile.path);

    insertImportToSourceFile({
        source: graphQlTypesSource,
        name: {
            Context: "TaskContext"
        },
        moduleSpecifier: "@webiny/tasks/types",
        after: tasksPackage
    });

    extendInterface({
        source: graphQlTypesSource,
        target: "Context",
        add: "TaskContext"
    });
});

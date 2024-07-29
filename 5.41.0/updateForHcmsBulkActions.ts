import path from "path";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    extendInterface,
    insertImportToSourceFile,
    removeExtendsFromInterface,
    removeImportFromSourceFile,
    removePluginFromCreateHandler
} from "../utils";

export const updateForHcmsBulkActions = createProcessor(async params => {
    const { project, files, context } = params;

    const graphQlIndexFile = files.byName("api/graphql/index");
    const graphQlIndexSource = project.getSourceFile(graphQlIndexFile.path);
    const graphQlTypesFile = files.byName("api/graphql/types");
    const graphQlTypesSource = project.getSourceFile(graphQlTypesFile.path);

    context.log.info(
        `Adding new GraphQL API / Headless CMS - Tasks plugins (%s)...`,
        graphQlIndexFile.path
    );

    // Update theme package's package.json.
    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    const packageJson = await import(apiPackageJsonPath);
    if (packageJson.dependencies["@webiny/api-headless-cms-bulk-actions"]) {
        context.log.warning(
            "Looks like you already have the latest GraphQL API / Headless CMS - Bulk Actions plugins set up. Skipping..."
        );
        return;
    }

    // Update GraphQL index.ts file removing "createHcmsTasks" plugin.
    removeImportFromSourceFile(graphQlIndexSource, "@webiny/api-headless-cms-tasks");
    removePluginFromCreateHandler(graphQlIndexSource, "handler", "createHcmsTasks()");

    // Update GraphQL types.ts file removing "HcmsTasksContext".
    removeImportFromSourceFile(graphQlTypesSource, "@webiny/api-headless-cms-tasks/types");
    removeExtendsFromInterface(graphQlTypesSource, "Context", "HcmsTasksContext");

    // Update GraphQL package.json file removing "@webiny/api-headless-cms-tasks" package.
    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-headless-cms-tasks": null
    });

    // Update GraphQL index.ts file adding "createHcmsBulkActions" plugin.
    insertImportToSourceFile({
        source: graphQlIndexSource,
        name: ["createHcmsBulkActions"],
        moduleSpecifier: "@webiny/api-headless-cms-bulk-actions",
        after: "@webiny/api-headless-cms"
    });

    addPluginToCreateHandler({
        source: graphQlIndexSource,
        value: "createHcmsBulkActions()",
        before: "scaffoldsPlugins",
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createHcmsBulkActions") === null;
            });
        }
    });

    // Update GraphQL package.json file adding "@webiny/api-headless-cms-bulk-actions".
    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-headless-cms-bulk-actions": context.version
    });

    // Update GraphQL types.ts file adding "HcmsBulkActionsContext".
    insertImportToSourceFile({
        source: graphQlTypesSource,
        name: ["HcmsBulkActionsContext"],
        moduleSpecifier: "@webiny/api-headless-cms-bulk-actions/types",
        after: "@webiny/api-headless-cms"
    });

    extendInterface({
        source: graphQlTypesSource,
        target: "Context",
        add: "HcmsBulkActionsContext"
    });

    context.log.success("New GraphQL API / Headless CMS - Bulk Actions plugins added.");
});

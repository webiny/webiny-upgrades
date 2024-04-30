import path from "path";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    extendInterface,
    insertImportToSourceFile
} from "../utils";

export const updateForHcmsTasks = createProcessor(async params => {
    const { project, files, context } = params;

    const indexFile = files.byName("api/graphql/index");
    const source = project.getSourceFile(indexFile.path);

    context.log.info(
        `Adding new GraphQL API / Headless CMS - Tasks plugins (%s)...`,
        indexFile.path
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
    if (packageJson.dependencies["@webiny/api-headless-cms-tasks"]) {
        context.log.warning(
            "Looks like you already have the latest GraphQL API / Headless CMS - Tasks plugins set up. Skipping..."
        );
        return;
    }

    // Update GraphQL index.ts file adding both "createHcmsTasks" plugin.
    insertImportToSourceFile({
        source,
        name: ["createHcmsTasks"],
        moduleSpecifier: "@webiny/api-headless-cms-tasks",
        after: "@webiny/api-headless-cms"
    });

    addPluginToCreateHandler({
        source,
        value: "createHcmsTasks()",
        before: "scaffoldsPlugins",
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createHcmsTasks") === null;
            });
        }
    });

    // Update GraphQL package.json file adding "@webiny/api-headless-cms-tasks".
    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-headless-cms-tasks": context.version
    });

    // Update GraphQL types.ts file adding "HcmsTasksContext".
    const graphQlTypesFile = files.byName("api/graphql/types");
    const graphQlTypesSource = project.getSourceFile(graphQlTypesFile.path);

    insertImportToSourceFile({
        source: graphQlTypesSource,
        name: {
            Context: "HcmsTasksContext"
        },
        moduleSpecifier: "@webiny/api-headless-cms-tasks/types",
        after: "@webiny/api-headless-cms"
    });

    extendInterface({
        source: graphQlTypesSource,
        target: "Context",
        add: "HcmsTasksContext"
    });

    context.log.success("New GraphQL API / Headless CMS - Tasks plugins added.");
});

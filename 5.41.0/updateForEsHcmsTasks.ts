import {
    addPackagesToDependencies,
    createProcessor,
    findPackageInPackageJson,
    getIsElasticsearchProject,
    insertImportToSourceFile,
    removeImportFromSourceFile
} from "../utils";

export const updateForEsHcmsTasks = createProcessor(async params => {
    const { project, files, context } = params;

    const indexFile = files.byName("api/graphql/index");
    const source = project.getSourceFile(indexFile.path);

    context.log.info(
        `Adding new GraphQL API / Headless CMS - DDB-ES Tasks imports (%s)...`,
        indexFile.path
    );

    const isElasticsearchProject = getIsElasticsearchProject(params.context, "apps/api/graphql");
    if (!isElasticsearchProject) {
        context.log.info("Looks like this is a DDB project, skipping...");
        return;
    }

    // Update theme package's package.json.
    const apiPackageJsonPath = context.project.getFilePath("apps/api/graphql/package.json");
    const cmsTasksPackage = findPackageInPackageJson({
        file: apiPackageJsonPath,
        name: "@webiny/api-headless-cms-tasks-ddb-es"
    });
    if (cmsTasksPackage?.name) {
        context.log.warning(
            "Looks like you already have the latest GraphQL API / Headless CMS - Tasks plugins set up. Skipping..."
        );
        return;
    }

    // Update GraphQL index.ts file removing "@webiny/api-headless-cms-tasks" import.
    removeImportFromSourceFile(source, "@webiny/api-headless-cms-tasks");

    // Update GraphQL index.ts file adding "@webiny/api-headless-cms-tasks-ddb-es" import.
    insertImportToSourceFile({
        source,
        name: ["createHcmsTasks"],
        moduleSpecifier: "@webiny/api-headless-cms-tasks-ddb-es",
        after: "@webiny/api-headless-cms-ddb-es"
    });

    // Update GraphQL package.json file removing "@webiny/api-headless-cms-tasks".
    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-headless-cms-tasks": null
    });

    // Update GraphQL package.json file adding "@webiny/api-headless-cms-tasks-ddb-es".
    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-headless-cms-tasks-ddb-es": context.version
    });

    // Update GraphQL types.ts file fixing "HcmsTasksContext".
    const graphQlTypesFile = files.byName("api/graphql/types");
    const graphQlTypesSource = project.getSourceFile(graphQlTypesFile.path);

    // Update GraphQL types.ts file removing "@webiny/api-headless-cms-tasks/types" import.
    removeImportFromSourceFile(graphQlTypesSource, "@webiny/api-headless-cms-tasks/types");

    // Update GraphQL package.json file adding "@webiny/api-headless-cms-tasks-ddb-es/types".
    insertImportToSourceFile({
        source: graphQlTypesSource,
        name: ["HcmsTasksContext"],
        moduleSpecifier: "@webiny/api-headless-cms-tasks-ddb-es/types",
        after: "@webiny/api-headless-cms"
    });

    context.log.success("New GraphQL API / Headless CMS - DDB-ES Tasks imports added.");
});

import path from "path";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    extendInterface,
    insertImportToSourceFile
} from "../utils";

export const updateForHcmsAco = createProcessor(async params => {
    const { project, files, context } = params;

    const indexFile = files.byName("api/graphql/index");
    const source = project.getSourceFile(indexFile.path);

    context.log.info(`Adding new GraphQL API / Headless CMS - ACO plugins (%s)...`, indexFile.path);

    // Update theme package's package.json.
    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    const packageJson = await import(apiPackageJsonPath);
    if (packageJson.dependencies["@webiny/api-headless-cms-aco"]) {
        context.log.warning(
            "Looks like you already have the latest GraphQL API / Headless CMS - ACO plugins set up. Skipping..."
        );
        return;
    }

    // Update GraphQL index.ts file adding both "createAcoHcmsContext" plugin.
    insertImportToSourceFile({
        source,
        name: ["createAcoHcmsContext"],
        moduleSpecifier: "@webiny/api-headless-cms-aco",
        after: "@webiny/api-headless-cms"
    });

    addPluginToCreateHandler({
        source,
        value: "createAcoHcmsContext()",
        before: "scaffoldsPlugins",
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createAcoHcmsContext") === null;
            });
        }
    });

    // Update GraphQL package.json file adding "@webiny/api-headless-cms-aco".
    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-headless-cms-aco": context.version
    });

    // Update GraphQL types.ts file adding "HcmsAcoContext".
    const graphQlTypesFile = files.byName("api/graphql/types");
    const graphQlTypesSource = project.getSourceFile(graphQlTypesFile.path);

    insertImportToSourceFile({
        source: graphQlTypesSource,
        name: ["HcmsAcoContext"],
        moduleSpecifier: "@webiny/api-headless-cms-aco/types",
        after: "@webiny/api-headless-cms"
    });

    extendInterface({
        source: graphQlTypesSource,
        target: "Context",
        add: "HcmsAcoContext"
    });

    context.log.success("New GraphQL API / Headless CMS - ACO plugins added.");
});

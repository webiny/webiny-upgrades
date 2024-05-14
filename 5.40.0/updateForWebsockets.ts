import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    extendInterface,
    insertImportToSourceFile
} from "../utils";
import path from "path";

export const updateForWebsockets = createProcessor(async params => {
    const { context, project, files } = params;

    const file = files.byName("api/graphql/index");
    const source = project.getSourceFile(file.path);

    context.log.info(`Adding new GraphQL API / Websockets plugins (%s)...`, file.path);

    const apiPackageJsonPath = path.join(
        context.project.root,
        "apps",
        "api",
        "graphql",
        "package.json"
    );

    addPackagesToDependencies(context, apiPackageJsonPath, {
        "@webiny/api-websockets": context.version
    });

    insertImportToSourceFile({
        source,
        name: ["createWebsockets"],
        moduleSpecifier: "@webiny/api-websockets",
        before: "@webiny/api-headless-cms"
    });

    addPluginToCreateHandler({
        source,
        value: "createWebsockets()",
        before: "createHeadlessCmsContext",
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createWebsockets") === null;
            });
        }
    });

    // Update GraphQL types.ts file adding "WebsocketsContext".
    const graphQlTypesFile = files.byName("api/graphql/types");
    const graphQlTypesSource = project.getSourceFile(graphQlTypesFile.path);

    insertImportToSourceFile({
        source: graphQlTypesSource,
        name: {
            Context: "WebsocketsContext"
        },
        moduleSpecifier: "@webiny/api-websockets/types",
        after: "@webiny/api-headless-cms-tasks"
    });

    extendInterface({
        source: graphQlTypesSource,
        target: "Context",
        add: "WebsocketsContext"
    });
});

import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    createProcessor,
    extendInterface,
    insertImportToSourceFile
} from "../utils";

export const updatesForLogger = createProcessor(async ({ context, files, project }) => {
    const packageJson = files.byName("api/package.json");

    addPackagesToDependencies(context, packageJson.path, {
        "@webiny/api-log": context.version
    });

    context.log.info(`Added "@webiny/api-log" package to dependencies.`);

    const graphqlIndex = files.byName("api/graphql/index");
    const graphqlIndexSource = project.getSourceFile(graphqlIndex.path);

    insertImportToSourceFile({
        source: graphqlIndexSource,
        after: "createRecordLocking",
        name: ["createLogger"],
        moduleSpecifier: "@webiny/api-log"
    });

    addPluginToCreateHandler({
        source: graphqlIndexSource,
        before: "tenantManager",
        value: "createLogger({documentClient})",
        validate: node => {
            return node.getElements().every(element => {
                return element.getText().match("createLogger") === null;
            });
        }
    });

    context.log.info(`Added createLogger() plugin to the API handler.`);

    const graphqlTypes = files.byName("api/graphql/types");
    const graphqlTypesSource = project.getSourceFile(graphqlTypes.path);
    insertImportToSourceFile({
        source: graphqlTypesSource,
        name: { Context: "LoggerContext" },
        moduleSpecifier: "@webiny/api-log"
    });

    extendInterface({
        source: graphqlTypesSource,
        add: ["LoggerContext"],
        target: "Context"
    });
    context.log.info(`Extended "Context" interface with "LoggerContext".`);
});

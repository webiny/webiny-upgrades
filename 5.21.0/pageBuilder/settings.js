const tsMorph = require("ts-morph");

const {
    removeImportFromSourceFile,
    log,
    insertImportToSourceFile,
    removePluginFromCreateHandler,
    addDynamoDbDocumentClient,
    addElasticsearchClient,
    addPluginToCreateHandler,
    addPackagesToDependencies
} = require("../../utils");
/**
 *
 * @param files {Record<string, string>}
 * @param source {tsMorph.SourceFile}
 * @param file {String}
 * @param context {CliContext}
 * @param project {tsMorph.Project}
 */
const upgradeElasticsearchUpdateSettings = ({ context, source, file }) => {
    if (!source) {
        log.debug(`Skipping "${file}", because source is not found.`);
        return;
    }
    /**
     * Remove unnecessary imports
     */
    removeImportFromSourceFile(source, "@webiny/handler-db");
    removeImportFromSourceFile(source, "@webiny/@webiny/db-dynamodb");
    removeImportFromSourceFile(source, "@webiny/api-page-builder-so-ddb-es");
    /**
     * Add new one
     */
    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createPageBuilderStorageOperations"
        },
        moduleSpecifier: "@webiny/api-page-builder-so-ddb-es"
    });

    removePluginFromCreateHandler(source, "handler", "updateSettingsPlugins");
    removePluginFromCreateHandler(source, "handler", "dbPlugins(");
    removePluginFromCreateHandler(source, "handler", "pageBuilderDynamoDbElasticsearchPlugins()");

    addPackagesToDependencies(context, files.apiUpdateSettingsPackageJson, {
        "@webiny/db-dynamodb": null,
        "@webiny/handler-db": null,
        "@webiny/api-elasticsearch": context.WEBINY_VERSION
    });
    /**
     * Add client definitions
     */
    addDynamoDbDocumentClient(source);
    addElasticsearchClient(source);

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: "updateSettingsPlugins({storageOperations: createPageBuilderStorageOperations({documentClient,elasticsearchClient})})",
        after: new RegExp("logsPlugins")
    });
};

/**
 *
 * @param files {Record<string, string>}
 * @param source {tsMorph.SourceFile}
 * @param file {String}
 * @param context {CliContext}
 * @param project {tsMorph.Project}
 */
const upgradeUpdateSettings = ({ source, file }) => {
    if (!source) {
        log.debug(`Skipping "${file}", because source is not found.`);
        return;
    }
    /**
     * Remove unnecessary imports
     */
    removeImportFromSourceFile(source, "@webiny/handler-db");
    removeImportFromSourceFile(source, "@webiny/db-dynamodb");
    removeImportFromSourceFile(source, "@webiny/db-dynamodb/plugins");
    removeImportFromSourceFile(source, "@webiny/api-page-builder-so-ddb");
    /**
     * Add new one
     */
    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createPageBuilderStorageOperations"
        },
        moduleSpecifier: "@webiny/api-page-builder-so-ddb"
    });

    removePluginFromCreateHandler(source, "handler", "updateSettingsPlugins");
    removePluginFromCreateHandler(source, "handler", "dbPlugins(");
    removePluginFromCreateHandler(source, "handler", "dynamoDbPlugins()");
    removePluginFromCreateHandler(source, "handler", "pageBuilderDynamoDbPlugins()");

    addPackagesToDependencies(context, files.apiUpdateSettingsPackageJson, {
        "@webiny/db-dynamodb": null,
        "@webiny/handler-db": null
    });
    /**
     * Add client definitions
     */
    addDynamoDbDocumentClient(source);

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: "updateSettingsPlugins({storageOperations: createPageBuilderStorageOperations({documentClient})})",
        after: new RegExp("logsPlugins")
    });
};

module.exports = {
    upgradeElasticsearchUpdateSettings,
    upgradeUpdateSettings
};

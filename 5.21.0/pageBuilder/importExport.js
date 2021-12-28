const tsMorph = require("ts-morph");

const {
    insertImportToSourceFile,
    log,
    removePluginFromCreateHandler,
    addPluginToCreateHandler,
    addElasticsearchClient
} = require("../../utils");

const {
    removePageBuilderDynamoDbImports,
    removePageBuilderElasticsearchImports,
    addPageBuilderElasticsearchImports,
    addPageBuilderDynamoDbImports
} = require("./helpers");

/**
 *
 * @param file {String}
 * @param files {Record<string, string>}
 * @param source {tsMorph.SourceFile}
 */
const upgradeElasticsearchImportExport = ({ file, source }) => {
    if (!source) {
        log.debug(`Skipping "${file}", because source is not found.`);
        return;
    }
    /**
     * Remove old imports
     */
    removePageBuilderElasticsearchImports(source);
    /**
     * Add new ones
     */
    addPageBuilderElasticsearchImports(source);

    /**
     * Modify existing page builder import/export storage operations.
     */
    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createPageBuilderImportExportStorageOperations"
        },
        moduleSpecifier: "@webiny/api-page-builder-import-export-so-ddb"
    });
    /**
     * Remove old plugin initializations.
     */
    removePluginFromCreateHandler(source, "handler", "pageBuilderPlugins()");
    removePluginFromCreateHandler(source, "handler", "pageBuilderDynamoDbElasticsearchPlugins()");
    removePluginFromCreateHandler(source, "handler", "pageBuilderImportExportPlugins(");
    removePluginFromCreateHandler(source, "handler", "elasticSearch(");

    /**
     * Add elasticsearch client if not existing
     */
    addElasticsearchClient(source);

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: "elasticSearch(elasticsearchClient)",
        after: new RegExp("logsPlugins")
    });
    /**
     * And add the new ones.
     */
    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `createPageBuilderContext({
            storageOperations: createPageBuilderStorageOperations({
                documentClient,
                elasticsearch: elasticsearchClient
            })
        })`,
        after: new RegExp("i18nContentPlugins")
    });

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `createPageBuilderGraphQL()`,
        after: new RegExp("createPageBuilderContext")
    });

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `pageBuilderImportExportPlugins({
            storageOperations: createPageBuilderImportExportStorageOperations({
                documentClient
            })
        })`,
        after: new RegExp("createPageBuilderGraphQL")
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
const upgradeImportExport = ({ file, source }) => {
    if (!source) {
        log.debug(`Skipping "${file}", because source is not found.`);
        return;
    }
    /**
     * Remove old imports
     */
    removePageBuilderDynamoDbImports(source);
    /**
     * Add new ones
     */
    addPageBuilderDynamoDbImports(source);
    /**
     * Modify existing page builder import/export storage operations.
     */
    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createPageBuilderImportExportStorageOperations"
        },
        moduleSpecifier: "@webiny/api-page-builder-import-export-so-ddb"
    });
    /**
     * Remove old plugin initializations.
     */
    removePluginFromCreateHandler(source, "handler", "pageBuilderPlugins()");
    removePluginFromCreateHandler(source, "handler", "pageBuilderDynamoDbPlugins()");
    removePluginFromCreateHandler(source, "handler", "pageBuilderImportExportPlugins");
    /**
     * And add the new ones.
     */
    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `createPageBuilderContext({
            storageOperations: createPageBuilderStorageOperations({
                documentClient
            })
        })`,
        after: new RegExp("i18nContentPlugins")
    });

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `createPageBuilderGraphQL()`,
        after: new RegExp("createPageBuilderContext")
    });

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `pageBuilderImportExportPlugins({
            storageOperations: createPageBuilderImportExportStorageOperations({
                documentClient
            })
        })`,
        after: new RegExp("createPageBuilderGraphQL")
    });
};

module.exports = {
    upgradeElasticsearchImportExport,
    upgradeImportExport
};

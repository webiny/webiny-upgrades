const tsMorph = require("ts-morph");

const {
    insertImportToSourceFile,
    log,
    removePluginFromCreateHandler,
    addPluginToCreateHandler
} = require("../../utils");

const {
    removePageBuilderDynamoDbImports,
    removePageBuilderElasticsearchImports,
    addPageBuilderElasticsearchImports,
    addPageBuilderDynamoDbImports
} = require("./helpers");

/**
 *
 * @param files {Record<string, string>}
 * @param source {tsMorph.SourceFile}
 */
const upgradeElasticsearchExportCombine = ({ files, source }) => {
    if (!source) {
        log.debug(`Skipping "${files.apiExportCombineIndex}", because source is not found.`);
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
     * Remove old plugin initializations.
     */
    removePluginFromCreateHandler(source, "handler", "pageBuilderPlugins()");
    removePluginFromCreateHandler(source, "handler", "pageBuilderDynamoDbElasticsearchPlugins()");
    removePluginFromCreateHandler(source, "handler", "pageBuilderImportExportPlugins(");
    removePluginFromCreateHandler(source, "handler", "elasticSearch(");

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
 */
const upgradeExportCombine = ({ files, source }) => {
    if (!source) {
        log.debug(`Skipping "${files.apiExportCombineIndex}", because source is not found.`);
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
    upgradeElasticsearchExportCombine,
    upgradeExportCombine
};

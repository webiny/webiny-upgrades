const tsMorph = require("ts-morph");

const { log, removePluginFromCreateHandler, addPluginToCreateHandler } = require("../../utils");

const {
    addPageBuilderDynamoDbImports,
    addPageBuilderElasticsearchImports,
    removePageBuilderDynamoDbImports,
    removePageBuilderElasticsearchImports
} = require("./helpers");

/**
 *
 * @param file {String}
 * @param files {Record<string, string>}
 * @param source {tsMorph.SourceFile}
 */
const upgradeElasticsearchGraphQL = ({ file, source }) => {
    if (!source) {
        log.debug(`Skipping "${file}", because source is not found.`);
        return;
    }
    /**
     * Remove old imports.
     */
    removePageBuilderElasticsearchImports(source);

    /**
     * And insert the new ones.
     */
    addPageBuilderElasticsearchImports(source);
    /**
     * Remove old plugin initializations.
     */
    removePluginFromCreateHandler(source, "handler", "pageBuilderPlugins()");
    removePluginFromCreateHandler(source, "handler", "pageBuilderDynamoDbElasticsearchPlugins()");
    /**
     * And add the new ones.
     */
    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `createPageBuilderContext({
            storageOperations: createPageBuilderStorageOperations({
                documentClient,
                elasticsearch: elasticsearchClient,
                plugins: [elasticsearchDataGzipCompression()]
            })
        }),`,
        after: new RegExp("prerenderingServicePlugins")
    });

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `createPageBuilderGraphQL()`,
        after: new RegExp("createPageBuilderContext")
    });
};

/**
 *
 * @param file {String}
 * @param files {Record<string, string>}
 * @param source {tsMorph.SourceFile}
 */
const upgradeGraphQL = ({ file, source }) => {
    if (!source) {
        log.debug(`Skipping "${file}", because source is not found.`);
        return;
    }
    /**
     * Remove old imports.
     */
    removePageBuilderDynamoDbImports(source);

    /**
     * And insert the new ones.
     */
    addPageBuilderDynamoDbImports(source);
    /**
     * Remove old plugin initializations.
     */
    removePluginFromCreateHandler(source, "handler", "pageBuilderPlugins()");
    removePluginFromCreateHandler(source, "handler", "pageBuilderDynamoDbPlugins()");
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
        }),`,
        after: new RegExp("prerenderingServicePlugins")
    });

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: `createPageBuilderGraphQL()`,
        after: new RegExp("createPageBuilderContext")
    });
};

module.exports = {
    upgradeElasticsearchGraphQL,
    upgradeGraphQL
};

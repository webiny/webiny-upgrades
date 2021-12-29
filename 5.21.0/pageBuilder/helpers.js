const { removeImportFromSourceFile, insertImportToSourceFile } = require("../../utils");

/**
 * @internal
 */
const addCommonPageBuilderImports = source => {
    insertImportToSourceFile({
        source,
        name: ["createPageBuilderGraphQL", "createPageBuilderContext"],
        moduleSpecifier: "@webiny/api-page-builder/graphql",
        after: "@webiny/api-i18n-content/plugins"
    });
    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createPageBuilderImportExportStorageOperations"
        },
        moduleSpecifier: "@webiny/api-page-builder-import-export-so-ddb",
        after: "@webiny/api-page-builder-import-export/graphql"
    });
};

const removePageBuilderDynamoDbImports = source => {
    removeImportFromSourceFile(source, "@webiny/api-page-builder/graphql");
    removeImportFromSourceFile(source, "@webiny/api-page-builder-so-ddb");
    removeImportFromSourceFile(source, "@webiny/api-page-builder-import-export-so-ddb");
};

const addPageBuilderDynamoDbImports = source => {
    addCommonPageBuilderImports(source);
    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createPageBuilderStorageOperations"
        },
        moduleSpecifier: "@webiny/api-page-builder-so-ddb",
        after: "@webiny/api-page-builder/graphql"
    });
};

const removePageBuilderElasticsearchImports = source => {
    removeImportFromSourceFile(source, "@webiny/api-page-builder/graphql");
    removeImportFromSourceFile(source, "@webiny/api-page-builder-so-ddb-es");
    removeImportFromSourceFile(source, "@webiny/api-page-builder-import-export-so-ddb");
};

const addPageBuilderElasticsearchImports = source => {
    addCommonPageBuilderImports(source);
    insertImportToSourceFile({
        source,
        name: {
            createStorageOperations: "createPageBuilderStorageOperations"
        },
        moduleSpecifier: "@webiny/api-page-builder-so-ddb-es",
        after: "@webiny/api-page-builder/graphql"
    });
};

module.exports = {
    removePageBuilderDynamoDbImports,
    addPageBuilderDynamoDbImports,
    removePageBuilderElasticsearchImports,
    addPageBuilderElasticsearchImports
};

const {
    removeImportFromSourceFile,
    removeExtendsFromInterface,
    insertImportToSourceFile,
    getExistingFiles,
    getSourceFile,
    addPackagesToDependencies
} = require("../utils");

const upgradePaths = {
    apiGraphQL: "api/code/graphql"
};

const upgradeFiles = {
    apiGraphQLTypes: `${upgradePaths.apiGraphQL}/src/types.ts`,
    packageJson: `${upgradePaths.apiGraphQL}/package.json`
};

const upgradeProject = (context, project) => {
    const source = getSourceFile(project, upgradeFiles.apiGraphQLTypes);
    if (!source) {
        return;
    }
    /**
     * Remove unnecessary HandlerContext
     */
    removeImportFromSourceFile(source, "@webiny/handler/types");
    removeExtendsFromInterface(source, "Context", "HandlerContext");
    addPackagesToDependencies(context, upgradeFiles.packageJson, {
        "@webiny/handler": null
    });
    /**
     * Remove old @webiny/api-i18n-content/types
     */
    removeImportFromSourceFile(source, "@webiny/api-i18n-content/types");
    insertImportToSourceFile({
        source,
        name: ["I18NContentContext"],
        moduleSpecifier: "@webiny/api-i18n-content/types",
        after: "@webiny/api-i18n/types"
    });
};

module.exports = {
    getFiles: context => getExistingFiles(context, upgradeFiles),
    upgradeProject
};

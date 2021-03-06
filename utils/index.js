/*
 * Note: imports and exports sorted alphabetically.
 */
const addPluginToCreateHandler = require("./addPluginToCreateHandler");
const addResolutionToRootPackageJson = require("./addResolutionToRootPackageJson");
const addWorkspaceToRootPackageJson = require("./addWorkspaceToRootPackageJson");
const createMorphProject = require("./createMorphProject");
const createNamedExports = require("./createNamedExports");
const createNamedImports = require("./createNamedImports");
const getCreateHandlerExpressions = require("./getCreateHandlerExpressions");
const insertImportToSourceFile = require("./insertImportToSourceFile");
const log = require("./log");
const prettierFormat = require("./prettierFormat");
const removeImportFromSourceFile = require("./removeImportFromSourceFile");
const removePluginFromCreateHandler = require("./removePluginFromCreateHandler");
const removeWorkspaceToRootPackageJson = require("./removeWorkspaceToRootPackageJson");
const yarnInstall = require("./yarnInstall");
const yarnUp = require("./yarnUp");
const removePulumiCache = require("./removePulumiCache");
const addDynamoDbDocumentClient = require("./addDynamoDbDocumentClient");
const addElasticsearchClient = require("./addElasticsearchClient");
const {
    addPackagesToDependencies,
    addPackagesToDevDependencies,
    addPackagesToPeerDependencies
} = require("./dependencies");

const getIsElasticsearchProject = require("./isElasticsearchProject");
const upgradeCreateHandlerToPlugins = require("./upgradeCreateHandlerToPlugins");
const removeExtendsFromInterface = require("./removeExtendsFromInterface");

const { getSourceFile, getExistingFiles } = require("./files");
const addToExportDefaultArray = require("./addToExportDefaultArray");
const getRequireFromSourceFile = require("./getRequireFromSourceFile");
const { isPre529Project } = require("./isPre529Project");

module.exports = {
    addPluginToCreateHandler,
    addResolutionToRootPackageJson,
    addWorkspaceToRootPackageJson,
    createMorphProject,
    createNamedExports,
    createNamedImports,
    getCreateHandlerExpressions,
    insertImportToSourceFile,
    log,
    prettierFormat,
    removePluginFromCreateHandler,
    removeImportFromSourceFile,
    removeWorkspaceToRootPackageJson,
    yarnInstall,
    yarnUp,
    removePulumiCache,
    addDynamoDbDocumentClient,
    addElasticsearchClient,
    addPackagesToDependencies,
    addPackagesToDevDependencies,
    addPackagesToPeerDependencies,
    getIsElasticsearchProject,
    upgradeCreateHandlerToPlugins,
    removeExtendsFromInterface,
    getSourceFile,
    getExistingFiles,
    addToExportDefaultArray,
    getRequireFromSourceFile,
    isPre529Project
};

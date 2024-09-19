/*
 * Note: imports and exports sorted alphabetically.
 */
import { addPluginToCreateHandler } from "./addPluginToCreateHandler";
import { addResolutionToRootPackageJson } from "./addResolutionToRootPackageJson";
import { addWorkspaceToRootPackageJson } from "./addWorkspaceToRootPackageJson";
import { createMorphProject } from "./createMorphProject";
import { createNamedExports } from "./createNamedExports";
import { createNamedImports } from "./createNamedImports";
import { getCreateHandlerExpressions } from "./getCreateHandlerExpressions";
import { insertImportToSourceFile } from "./insertImportToSourceFile";
import log from "./log";
import { prettierFormat } from "./prettierFormat";
import { removeImportFromSourceFile } from "./removeImportFromSourceFile";
import { removePluginFromCreateHandler } from "./removePluginFromCreateHandler";
import { removeWorkspaceFromRootPackageJson } from "./removeWorkspaceFromRootPackageJson";
import { yarnInstall } from "./yarnInstall";
import { removePulumiCache } from "./removePulumiCache";
import { addDynamoDbDocumentClient } from "./addDynamoDbDocumentClient";
import { addElasticsearchClient } from "./addElasticsearchClient";

import { getIsElasticsearchProject } from "./isElasticsearchProject";
import { getIsOpensearchProject } from "./isOpensearchProject";
import { upgradeCreateHandlerToPlugins } from "./upgradeCreateHandlerToPlugins";
import { removeExtendsFromInterface } from "./removeExtendsFromInterface";
import { getExistingFiles, getSourceFile } from "./files";
import { addToExportDefaultArray } from "./addToExportDefaultArray";
import { getRequireFromSourceFile } from "./getRequireFromSourceFile";
import { copyPasteFiles } from "./copyPasteFiles";
import { moveFiles } from "./moveFiles";
import { getIsPre529Project, isPre529Project } from "./isPre529Project";
import { findVersion } from "./findVersion";
import {
    createFilePath,
    getAdminPath,
    getDynamoDbToElasticsearchPath,
    getFileManagerPath,
    getGraphQLPath,
    getHeadlessCMSPath,
    getPageBuilderPath,
    getPrerenderingServicePath,
    getWebsitePath
} from "./paths";

export * from "./yarnUp";

export { removeFromExportDefaultArray } from "./removeFromExportDefaultArray";
export { movePlugin } from "./movePlugin";

export * from "./classes/Files";
export * from "./classes/FileDefinition";

export * from "./findInPath";
export * from "./replaceInPath";
export * from "./getDocsLink";
export * from "./usesLatestPbRenderingEngine";
export * from "./breakingChangesWarning";

export * from "./variables";

export * from "./packageJson";

export * from "./extendInterface";

export * from "./dependencies";

export * from "./modifyPackageJson";

export {
    addPluginToCreateHandler,
    addResolutionToRootPackageJson,
    addWorkspaceToRootPackageJson,
    createFilePath,
    createMorphProject,
    createNamedExports,
    createNamedImports,
    getAdminPath,
    getCreateHandlerExpressions,
    getDynamoDbToElasticsearchPath,
    getFileManagerPath,
    getGraphQLPath,
    getHeadlessCMSPath,
    getPageBuilderPath,
    getPrerenderingServicePath,
    getWebsitePath,
    insertImportToSourceFile,
    log,
    prettierFormat,
    removePluginFromCreateHandler,
    removeImportFromSourceFile,
    removeWorkspaceFromRootPackageJson,
    yarnInstall,
    removePulumiCache,
    addDynamoDbDocumentClient,
    addElasticsearchClient,
    getIsElasticsearchProject,
    getIsOpensearchProject,
    upgradeCreateHandlerToPlugins,
    removeExtendsFromInterface,
    getSourceFile,
    getExistingFiles,
    addToExportDefaultArray,
    getRequireFromSourceFile,
    copyPasteFiles,
    moveFiles,
    isPre529Project,
    getIsPre529Project,
    findVersion
};

export * from "./processors";

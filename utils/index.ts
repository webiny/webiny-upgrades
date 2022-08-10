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
import { removeWorkspaceToRootPackageJson } from "./removeWorkspaceToRootPackageJson";
import { yarnInstall } from "./yarnInstall";
import { yarnUp } from "./yarnUp";
import { removePulumiCache } from "./removePulumiCache";
import { addDynamoDbDocumentClient } from "./addDynamoDbDocumentClient";
import { addElasticsearchClient } from "./addElasticsearchClient";
import {
    addPackagesToDependencies,
    addPackagesToDevDependencies,
    addPackagesToPeerDependencies
} from "./dependencies";

import { getIsElasticsearchProject } from "./isElasticsearchProject";
import { upgradeCreateHandlerToPlugins } from "./upgradeCreateHandlerToPlugins";
import { removeExtendsFromInterface } from "./removeExtendsFromInterface";

import { getSourceFile, getExistingFiles } from "./files";
import { addToExportDefaultArray } from "./addToExportDefaultArray";
import { getRequireFromSourceFile } from "./getRequireFromSourceFile";
import { isPre529Project, getIsPre529Project } from "./isPre529Project";

export {
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
    isPre529Project,
    getIsPre529Project
};

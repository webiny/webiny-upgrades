const path = require("path");
const fs = require("fs");
const { log, getIsElasticsearchProject } = require("../utils");

const { upgradeElasticsearchGraphQL, upgradeGraphQL } = require("./pageBuilder/graphQl");
const {
    upgradeElasticsearchImportExport,
    upgradeImportExport
} = require("./pageBuilder/importExport");
const {
    upgradeElasticsearchUpdateSettings,
    upgradeUpdateSettings
} = require("./pageBuilder/settings");

const upgradePaths = {
    apiGraphQL: "api/code/graphql",
    apiExportCombine: "api/code/pageBuilder/exportPages/combine",
    apiExportProcess: "api/code/pageBuilder/exportPages/process",
    apiImportCreate: "api/code/pageBuilder/importPages/create",
    apiImportProcess: "api/code/pageBuilder/importPages/process",
    apiUpdateSettings: "api/code/pageBuilder/updateSettings"
};

const upgradeFiles = {
    apiGraphQLIndex: `${upgradePaths.apiGraphQL}/src/index.ts`,
    apiExportCombineIndex: `${upgradePaths.apiExportCombine}/src/index.ts`,
    apiExportProcessIndex: `${upgradePaths.apiExportProcess}/src/index.ts`,
    apiImportCreateIndex: `${upgradePaths.apiImportCreate}/src/index.ts`,
    apiImportProcessIndex: `${upgradePaths.apiImportProcess}/src/index.ts`,
    apiUpdateSettingsIndex: `${upgradePaths.apiUpdateSettings}/src/index.ts`,
    apiUpdateSettingsPackageJson: `${upgradePaths.apiUpdateSettings}/package.json`
};
/**
 *
 * @param context {Object}
 *
 * @return {Record<string, string>}
 */
const getFiles = context => {
    const output = {};
    for (const key in upgradeFiles) {
        if (upgradeFiles.hasOwnProperty(key) === false) {
            continue;
        }
        const file = upgradeFiles[key];
        /**
         * Skip json files.
         */
        if (file.match(".json") !== null) {
            continue;
        }
        /**
         * Check for existence of files.
         */
        const target = path.join(context.project.root, file);
        if (fs.existsSync(target) === false) {
            log.debug(`No file "${file}". Skipping...`);
            continue;
        }
        output[key] = file;
    }
    return output;
};

const getSource = (project, file) => {
    if (!file) {
        log.debug("File variable not sent.");
        return null;
    }
    let source = null;
    try {
        source = project.getSourceFile(file);
        if (source) {
            return source;
        }
    } catch (ex) {
        log.debug(ex.message);
    }
    log.debug("Skipping file, cannot find it.");
    return null;
};

const upgradeProject = (context, project) => {
    const isElasticsearchProject = getIsElasticsearchProject(context, upgradePaths.apiGraphQL);

    /**
     *
     */

    if (isElasticsearchProject) {
        upgradeElasticsearchGraphQL({
            context,
            project,
            files: upgradeFiles,
            file: upgradeFiles.apiGraphQLIndex,
            source: getSource(project, upgradeFiles.apiGraphQLIndex)
        });
        upgradeElasticsearchImportExport({
            context,
            project,
            files: upgradeFiles,
            file: upgradeFiles.apiExportCombineIndex,
            source: getSource(project, upgradeFiles.apiExportCombineIndex)
        });
        upgradeElasticsearchImportExport({
            context,
            project,
            files: upgradeFiles,
            file: upgradeFiles.apiExportProcessIndex,
            source: getSource(project, upgradeFiles.apiExportProcessIndex)
        });
        upgradeElasticsearchImportExport({
            context,
            project,
            files: upgradeFiles,
            file: upgradeFiles.apiImportCreateIndex,
            source: getSource(project, upgradeFiles.apiImportCreateIndex)
        });
        upgradeElasticsearchImportExport({
            context,
            project,
            files: upgradeFiles,
            file: upgradeFiles.apiImportProcessIndex,
            source: getSource(project, upgradeFiles.apiImportProcessIndex)
        });
        upgradeElasticsearchUpdateSettings({
            context,
            project,
            files: upgradeFiles,
            file: upgradeFiles.apiUpdateSettingsIndex,
            source: getSource(project, upgradeFiles.apiUpdateSettingsIndex)
        });
        return;
    }

    /**
     *
     */
    upgradeGraphQL({
        context,
        project,
        files: upgradeFiles,
        file: upgradeFiles.apiGraphQLIndex,
        source: getSource(project, upgradeFiles.apiGraphQLIndex)
    });
    upgradeImportExport({
        context,
        project,
        files: upgradeFiles,
        file: upgradeFiles.apiExportCombineIndex,
        source: getSource(project, upgradeFiles.apiExportCombineIndex)
    });
    upgradeImportExport({
        context,
        project,
        files: upgradeFiles,
        file: upgradeFiles.apiExportProcessIndex,
        source: getSource(project, upgradeFiles.apiExportProcessIndex)
    });
    upgradeImportExport({
        context,
        project,
        files: upgradeFiles,
        file: upgradeFiles.apiImportCreateIndex,
        source: getSource(project, upgradeFiles.apiImportCreateIndex)
    });
    upgradeImportExport({
        context,
        project,
        files: upgradeFiles,
        file: upgradeFiles.apiImportProcessIndex,
        source: getSource(project, upgradeFiles.apiImportProcessIndex)
    });
    upgradeUpdateSettings({
        context,
        project,
        files: upgradeFiles,
        file: upgradeFiles.apiUpdateSettingsIndex,
        source: getSource(project, upgradeFiles.apiUpdateSettingsIndex)
    });
};

module.exports = {
    getFiles,
    upgradeProject
};

const path = require("path");
const fs = require("fs");
const { log } = require("../utils");

const { upgradeElasticsearchGraphQL, upgradeGraphQL } = require("./pageBuilder/graphQl");
const {
    upgradeElasticsearchExportCombine,
    upgradeExportCombine
} = require("./pageBuilder/exportCombine");
const {
    upgradeElasticsearchExportProcess,
    upgradeExportProcess
} = require("./pageBuilder/exportProcess");
const {
    upgradeElasticsearchImportCreate,
    upgradeImportCreate
} = require("./pageBuilder/importCreate");
const {
    upgradeElasticsearchImportProcess,
    upgradeImportProcess
} = require("./pageBuilder/importProcess");
const {
    upgradeElasticsearchUpdateSettings,
    upgradeUpdateSettings
} = require("./pageBuilder/updateSettings");
const {
    upgradeElasticsearchUpdateSettingsPackages,
    upgradeUpdateSettingsPackages
} = require("./pageBuilder/updateSettingsPackages");

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
        output[key] = target;
    }
    return output;
};

const getSource = (project, file) => {
    if (!file) {
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
    log.debug("Skipping GraphQL index file, cannot find it.");
    return null;
};

const getIsElasticsearchProject = context => {};

const upgradeProject = (context, project, files) => {
    const isElasticsearchProject = getIsElasticsearchProject(context);

    /**
     *
     */

    if (isElasticsearchProject) {
        upgradeElasticsearchGraphQL({
            context,
            project,
            files: upgradeFiles,
            source: getSource(project, files.apiGraphQLIndex)
        });
        upgradeElasticsearchExportCombine({
            context,
            project,
            files: upgradeFiles,
            source: getSource(project, files.apiExportCombineIndex)
        });
        upgradeElasticsearchExportProcess({
            context,
            project,
            files: upgradeFiles,
            source: getSource(project, files.apiExportProcessIndex)
        });
        upgradeElasticsearchImportCreate({
            context,
            project,
            files: upgradeFiles,
            source: getSource(project, files.apiImportCreateIndex)
        });
        upgradeElasticsearchImportProcess({
            context,
            project,
            files: upgradeFiles,
            source: getSource(project, files.apiImportProcessIndex)
        });
        upgradeElasticsearchUpdateSettings({
            context,
            project,
            files: upgradeFiles,
            source: getSource(project, files.apiUpdateSettingsIndex)
        });
        upgradeElasticsearchUpdateSettingsPackages({
            context,
            project,
            files: upgradeFiles
        });
        return;
    }

    /**
     *
     */
    upgradeGraphQL({
        context,
        project,
        files
    });
    upgradeExportCombine({
        context,
        project,
        files
    });
    upgradeExportProcess({
        context,
        project,
        files
    });
    upgradeImportCreate({
        context,
        project,
        files
    });
    upgradeImportProcess({
        context,
        project,
        files
    });
    upgradeUpdateSettings({
        context,
        project,
        files
    });
    upgradeUpdateSettingsPackages({
        context,
        project,
        files
    });
};

module.exports = {
    getFiles
};

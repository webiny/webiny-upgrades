const {
    insertImportToSourceFile,
    getSourceFile,
    getExistingFiles,
    addToExportDefaultArray
} = require("../utils");

const upgradePaths = {
    appHeadlessCms: "apps/admin/code"
};

const upgradeFiles = {
    appHeadlessCms: `${upgradePaths.appHeadlessCms}/src/plugins/headlessCms.ts`
};

const upgradeProject = (context, project) => {
    const source = getSourceFile(project, upgradeFiles.appHeadlessCms);
    if (!source) {
        return;
    }

    insertImportToSourceFile({
        source,
        after: "@webiny/app-headless-cms/admin/plugins/validators/timeLte",
        name: "uniqueFieldValidator",
        moduleSpecifier: "@webiny/app-headless-cms/admin/plugins/validators/unique"
    });
    insertImportToSourceFile({
        source,
        after: "@webiny/app-headless-cms/admin/plugins/fieldValidators/patternPlugins/upperCaseSpace",
        name: "editorUniqueFieldValidator",
        moduleSpecifier: "@webiny/app-headless-cms/admin/plugins/fieldValidators/unique"
    });

    addToExportDefaultArray({
        source,
        target: "uniqueFieldValidator",
        after: "objectFieldRenderer"
    });
};

module.exports = {
    getFiles: context => getExistingFiles(context, upgradeFiles),
    upgradeProject
};

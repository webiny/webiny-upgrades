const { getExistingFiles, addPackagesToDependencies } = require("../utils");

const upgradeFiles = {
    appsTheme: `apps/theme/package.json`,
    appsWebsite: `apps/website/package.json`
};

const upgradeProject = (context) => {
    addPackagesToDependencies(context, upgradeFiles.appsTheme, {
        graphql: "^15.8.0",
        "graphql-tag": "^2.12.6"
    });

    addPackagesToDependencies(context, upgradeFiles.appsWebsite, {
        graphql: "^15.8.0",
        "graphql-tag": "^2.12.6"
    });
};

module.exports = {
    getFiles: context => getExistingFiles(context, upgradeFiles),
    upgradeProject
};

const { getExistingFiles, addPackagesToDevDependencies } = require("../utils");

const upgradeFiles = {
    packageJson: `package.json`
};

const upgradeProject = context => {
    addPackagesToDevDependencies(context, "package.json", {
        "@typescript-eslint/eslint-plugin": "^5.5.0",
        "@typescript-eslint/parser": "^5.5.0",
        "babel-plugin-named-asset-import": null,
        eslint: "^8.4.1",
        "eslint-plugin-jest": "^25.3.0",
        "eslint-plugin-promise": "^5.2.0"
    });
};

module.exports = {
    getFiles: context => getExistingFiles(context, upgradeFiles),
    upgradeProject
};

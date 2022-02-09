const path = require("path");
const {
    getExistingFiles,
    addPackagesToDevDependencies,
    addResolutionToRootPackageJson
} = require("../utils");

const upgradeFiles = {
    packageJson: `package.json`
};

const upgradeProject = async context => {
    addPackagesToDevDependencies(context, "package.json", {
        "@typescript-eslint/eslint-plugin": "^5.5.0",
        "@typescript-eslint/parser": "^5.5.0",
        "babel-plugin-named-asset-import": null,
        eslint: "^8.4.1",
        "eslint-plugin-import": "^2.25.4",
        "eslint-plugin-jest": "^25.3.0",
        "eslint-plugin-promise": "^5.2.0"
    });

    await addResolutionToRootPackageJson(path.join(process.cwd(), "package.json"), {
        "@types/eslint": "8.2.1"
    });
};

module.exports = {
    getFiles: context => getExistingFiles(context, upgradeFiles),
    upgradeProject
};

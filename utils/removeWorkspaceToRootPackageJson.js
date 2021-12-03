const loadJson = require("load-json-file");
const writeJson = require("write-json-file");

/**
 * @param packageJsonPath {String}
 * @param pathsToRemove {String[]}
 */
module.exports = async (packageJsonPath, pathsToRemove) => {
    const rootPackageJson = await loadJson(packageJsonPath);

    pathsToRemove.forEach(pathToRemove => {
        // Remove it from workspaces packages if present
        const index = rootPackageJson.workspaces.packages.indexOf(pathToRemove);
        if (index !== -1) {
            rootPackageJson.workspaces.packages.splice(index, 1);
        }
    });

    await writeJson(packageJsonPath, rootPackageJson);
};

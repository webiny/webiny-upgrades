const loadJson = require("load-json-file");
const writeJson = require("write-json-file");

/**
 * @param packageJsonPath {String}
 * @param pathsToAdd {String[]}
 */
module.exports = async (packageJsonPath, pathsToAdd) => {
    const rootPackageJson = await loadJson(packageJsonPath);

    pathsToAdd.forEach(pathToAdd => {
        // Ensure forward slashes are used.
        pathToAdd = pathToAdd.replace(/\\/g, "/");
        // Add it to workspaces packages if not already
        if (!rootPackageJson.workspaces.packages.includes(pathToAdd)) {
            rootPackageJson.workspaces.packages.push(pathToAdd);
        }
    });

    await writeJson(packageJsonPath, rootPackageJson);
};

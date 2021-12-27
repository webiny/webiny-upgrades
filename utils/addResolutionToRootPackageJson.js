const loadJson = require("load-json-file");
const writeJson = require("write-json-file");

/**
 * @param packageJsonPath
 * @param packagesToAdd
 */
module.exports = async (packageJsonPath, packagesToAdd) => {
    const rootPackageJson = await loadJson(packageJsonPath);

    for (const name in packagesToAdd) {
        // Ensure forward slashes are used.
        const version = packagesToAdd[name];
        const escapedName = name.replace(/\\/g, "/");
        // Add it to resolutions packages if not already
        if (!rootPackageJson.resolutions[escapedName]) {
            rootPackageJson.resolutions[escapedName] = version;
        }
    }

    await writeJson(packageJsonPath, rootPackageJson);
};

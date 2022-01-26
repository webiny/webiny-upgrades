const semverCoerce = require("semver/functions/coerce");
const loadJson = require("load-json-file");
const writeJson = require("write-json-file");
const fs = require("fs");
const log = require("./log");
/**
 *
 * @param pkg {string}
 * @param version {string}
 *
 * @return {boolean}
 */
const validateVersion = (pkg, version) => {
    if (version === "latest") {
        return true;
    }
    const coerced = semverCoerce(version);
    return !!coerced;
};

/**
 *
 * @param context {CliContext}
 * @param targetPath {string}
 * @param packages {object}
 */
const addPackagesToDependencies = (context, targetPath, packages) => {
    addPackagesToDeps("dependencies", context, targetPath, packages);
};
/**
 * @param context {CliContext}
 * @param targetPath {string}
 * @param packages {object}
 */
const addPackagesToDevDependencies = (context, targetPath, packages) => {
    addPackagesToDeps("devDependencies", context, targetPath, packages);
};
/**
 * @param context {CliContext}
 * @param targetPath {string}
 * @param packages {object}
 */
const addPackagesToPeerDependencies = (context, targetPath, packages) => {
    addPackagesToDeps("peerDependencies", context, targetPath, packages);
};
/**
 *
 * @param type {string}
 * @param context {CliContext}
 * @param targetPath {string}
 * @param packages {object}
 */
const allowedPackageDependencyTypes = ["dependencies", "devDependencies", "peerDependencies"];
const addPackagesToDeps = (type, context, targetPath, packages) => {
    if (!allowedPackageDependencyTypes.includes(type)) {
        log.error(`Package dependency type "${type}" is not valid.`);
        return;
    }

    const file =
        targetPath.endsWith("package.json") === null ? `${targetPath}/package.json` : targetPath;
    if (!fs.existsSync(file)) {
        log.error(`There is no package.json file at path "${file}".`);
        return;
    }
    const json = loadJson.sync(file);
    if (!json) {
        log.error(`There is no package.json file "${file}"`);
        return;
    }
    const dependencies = json[type] || {};
    for (const pkg in packages) {
        if (!packages.hasOwnProperty(pkg)) {
            continue;
        }
        const version = packages[pkg];

        if (version === null) {
            // Remove package from deps
            delete dependencies[pkg];
            continue;
        }
        if (!validateVersion(pkg, version)) {
            log.error(`Package "${pkg}" version is not a valid semver version: "${version}".`);
            continue;
        }
        dependencies[pkg] = version;
    }
    json[type] = dependencies;

    writeJson.sync(file, json);
};

module.exports = {
    addPackagesToDependencies,
    addPackagesToDevDependencies,
    addPackagesToPeerDependencies
};

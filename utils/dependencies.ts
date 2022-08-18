import { Context, Packages } from "../types";

import semverCoerce from "semver/functions/coerce";
import loadJson from "load-json-file";
import writeJson from "write-json-file";
import fs from "fs";
import log from "./log";

const validateVersion = (version: string) => {
    if (version === "latest") {
        return true;
    }
    const coerced = semverCoerce(version);
    return !!coerced;
};

export const addPackagesToDependencies = (
    context: Context,
    targetPath: string,
    packages: Packages
) => {
    addPackagesToDeps("dependencies", context, targetPath, packages);
};

export const addPackagesToDevDependencies = (
    context: Context,
    targetPath: string,
    packages: Packages
) => {
    addPackagesToDeps("devDependencies", context, targetPath, packages);
};

export const addPackagesToPeerDependencies = (
    context: Context,
    targetPath: string,
    packages: Packages
) => {
    addPackagesToDeps("peerDependencies", context, targetPath, packages);
};

export const addPackagesToResolutions = (
    context: Context,
    targetPath: string,
    packages: Packages
) => {
    addPackagesToDeps("resolutions", context, targetPath, packages);
};

const allowedPackageDependencyTypes: string[] = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "resolutions"
];
const addPackagesToDeps = (
    type: string,
    context: Context,
    targetPath: string,
    packages: Packages
) => {
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
        if (!validateVersion(version)) {
            log.error(`Package "${pkg}" version is not a valid semver version: "${version}".`);
            continue;
        }
        dependencies[pkg] = version;
    }
    json[type] = dependencies;

    writeJson.sync(file, json);
};

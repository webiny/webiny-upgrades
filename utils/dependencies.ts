import { Context, Packages } from "../types";
import semverCoerce from "semver/functions/coerce";
import loadJson from "load-json-file";
import writeJson from "write-json-file";
import fs from "fs";
import log from "./log";

const validateVersion = (version: string) => {
    if (["latest", "unstable", "local-npm"].includes(version)) {
        return true;
    }
    const coerced = semverCoerce(version);
    return !!coerced;
};

export interface IAddPackages {
    context: Context;
    targetPath: string;
    packages: Packages;
}

export interface IRemovePackages {
    context: Context;
    targetPath: string;
    packages: string[];
}

export const addPackagesToDependencies = (
    context: Context,
    targetPath: string,
    packages: Packages
) => {
    return addPackagesToDeps({
        type: "dependencies",
        context,
        targetPath,
        packages
    });
};

export const addPackagesToDevDependencies = (
    context: Context,
    targetPath: string,
    packages: Packages
) => {
    return addPackagesToDeps({
        type: "devDependencies",
        context,
        targetPath,
        packages
    });
};

export const addPackagesToPeerDependencies = (
    context: Context,
    targetPath: string,
    packages: Packages
) => {
    return addPackagesToDeps({
        type: "peerDependencies",
        context,
        targetPath,
        packages
    });
};

export const addPackagesToResolutions = (params: IAddPackages) => {
    return addPackagesToDeps({
        ...params,
        type: "resolutions"
    });
};

export const removePackagesFromResolutions = (params: IRemovePackages) => {
    return addPackagesToDeps({
        ...params,
        type: "resolutions",
        packages: Object.keys(params.packages).reduce((acc, pkg) => {
            acc[pkg] = null;
            return acc;
        }, {})
    });
};

const allowedPackageDependencyTypes: string[] = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "resolutions"
];

export interface IAddPackagesToDeps {
    type: string;
    context: Context;
    targetPath: string;
    packages: Packages;
}

const addPackagesToDeps = (params: IAddPackagesToDeps) => {
    const { type, targetPath, packages } = params;
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

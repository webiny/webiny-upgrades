import fs from "fs";
import loadJsonFile from "load-json-file";
import { PackageJson } from "../types";

export enum IFindPackageInPackageJsonResultWhere {
    DEPENDENCIES = "dependencies",
    DEV_DEPENDENCIES = "devDependencies",
    PEER_DEPENDENCIES = "peerDependencies",
    RESOLUTIONS = "resolutions"
}

const types = [
    IFindPackageInPackageJsonResultWhere.DEPENDENCIES,
    IFindPackageInPackageJsonResultWhere.DEV_DEPENDENCIES,
    IFindPackageInPackageJsonResultWhere.PEER_DEPENDENCIES,
    IFindPackageInPackageJsonResultWhere.RESOLUTIONS
];

export interface IFindPackageInPackageJsonResult {
    version: string;
    name: string;
    where: IFindPackageInPackageJsonResultWhere;
}

export interface IFindPackageInPackageJsonParams {
    file: string;
    name: string;
}

export const findPackageInPackageJson = (
    params: IFindPackageInPackageJsonParams
): IFindPackageInPackageJsonResult => {
    const { file, name } = params;

    if (fs.existsSync(file) === false) {
        return null;
    }

    let json: PackageJson;
    try {
        json = loadJsonFile.sync(file);
    } catch {
        return null;
    }

    for (const type of types) {
        if (!json[type]) {
            continue;
        } else if (!json[type][name]) {
            continue;
        }

        return {
            version: json[type][name],
            name,
            where: type
        };
    }
    return null;
};

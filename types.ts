import { PackageJson as BasePackageJson } from "type-fest";

export interface Context {
    version: string;
    project: {
        root: string;
    };
}

export interface Packages {
    [key: string]: string;
}

export interface PackageJson extends BasePackageJson {
    workspaces: {
        packages: string[];
    };
}

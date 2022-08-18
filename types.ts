import { PackageJson as BasePackageJson } from "type-fest";

export interface Context {
    version: string;
    project: {
        root: string;
    };
    log: {
        info: (...args: any) => void;
        success: (...args: any) => void;
        debug: (...args: any) => void;
        warning: (...args: any) => void;
        error: (...args: any) => void;
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

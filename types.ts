import { PackageJson as BasePackageJson } from "type-fest";
import { Project } from "ts-morph";
import type { ConsoleLogger } from "./utils/log";

export type { ConsoleLogger };

export interface Context {
    version: string;
    project: {
        root: string;
        getPackageJsonPath: () => string;
        getFilePath: (target: string | string[]) => string;
        getWorkspaces: () => string[];
    };
    log: ConsoleLogger;
}

export interface Packages {
    [key: string]: string | null;
}

export interface PackageJson extends BasePackageJson {
    workspaces: {
        packages: string[];
    };
}

export type FileDefinitionTag =
    | "root"
    | "fm"
    | "pb"
    | "cms"
    | "gql"
    | "ps"
    | "ddb2es"
    | "extensions"
    | "theme"
    | "website"
    | "admin"
    | "core"
    | "security"
    | "package.json";

export interface IFileDefinition {
    path: string;
    elasticsearch: boolean;
    pre529: boolean;
    tag: FileDefinitionTag;
    name: string;
}

export interface IFilesFilterCb {
    (file: IFileDefinition): boolean;
}

export interface IFiles {
    byName(name: string): IFileDefinition | null;

    byTag(tag: FileDefinitionTag): IFiles;

    filter(cb: IFilesFilterCb): IFiles;

    all(): string[];

    relevant: () => IFiles;

    paths(): string[];
}

export interface IProcessorParams {
    files: IFiles;
    project: Project;
    context: Context;
}

export type IProcessorResult<T> = { skipped?: boolean } & T;

export interface IProcessor<T = any> {
    (params: IProcessorParams): IProcessorResult<T> | void | Promise<IProcessorResult<T> | void>;
}

import { PackageJson as BasePackageJson } from "type-fest";
import { Project } from "ts-morph";

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

export type FileDefinitionTag =
    | "fm"
    | "pb"
    | "cms"
    | "gql"
    | "ps"
    | "ddb2es"
    | "theme"
    | "website"
    | "admin"
    | "core";

export interface IFileDefinition {
    path: string;
    elasticsearch: boolean;
    pre529: boolean;
    tag: FileDefinitionTag;
    name: string;
}

export interface IFiles {
    byName(name: string): IFileDefinition | null;
    byTag(tag: FileDefinitionTag): IFiles;
    filter(cb: (file: IFileDefinition) => boolean): IFiles;
    relevant();
    paths(): string[];
}

export interface IProcessorParams {
    files: IFiles;
    project: Project;
    context: Context;
}

export type IProcessorResult<T> = { skipped?: boolean } & T;

export interface IProcessor<T = Record<string, any>> {
    (params: IProcessorParams): Promise<IProcessorResult<T> | void>;
}

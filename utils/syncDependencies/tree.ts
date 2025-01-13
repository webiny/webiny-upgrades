import { Context } from "../../types";
import { DependencyTree } from "./DependencyTree";
import loadJsonFile from "load-json-file";
import { PackageJson } from "type-fest";
import { IDependencyTree } from "./types";

export interface ICreateDependencyTreeParams {
    context: Context;
    files: string[];
}

export const createDependencyTree = (params: ICreateDependencyTreeParams): IDependencyTree => {
    const { context, files } = params;
    const basePath = context.project.root;
    const tree = new DependencyTree();
    for (const file of files) {
        try {
            const json = loadJsonFile.sync<PackageJson>(file);
            if (!json?.name) {
                continue;
            }
            tree.push({
                file: file.replace(basePath, ""),
                json,
                ignoreVersion: /WEBINY_VERSION|latest/
            });
        } catch {
            console.log(`Failed to load "${file}".`);
        }
    }

    const invalid = tree.invalid();

    if (invalid.length === 0) {
        return tree;
    }
    context.log.info(
        "There are some invalid Semver version. They do not affect our upgrade process, but you should fix them:"
    );
    for (const item of invalid) {
        const { version, file, name } = item;
        console.log(`${version} is not a valid SemVer value in ${file}, package ${name}.`);
    }

    console.log("");

    return tree;
};

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
        } catch (ex) {
            console.log(`Failed to load "${file}".`);
        }
    }
    return tree;
};

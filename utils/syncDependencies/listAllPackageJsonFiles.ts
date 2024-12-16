import { Context } from "../../types";
import fastGlob from "fast-glob";

const packageJsonFile = "package.json";
const defaultIgnore = ["**/node_modules/**", "**/dist/**", "**/build/**"];

export interface IListAllPackageJsonFilesParams {
    context: Context;
    workspaces: string[];
}

export const listAllPackageJsonFiles = (params: IListAllPackageJsonFilesParams): string[] => {
    const { context, workspaces } = params;

    return workspaces.reduce(
        (collection, workspace) => {
            const files = fastGlob.sync(`${workspace}/**/**/${packageJsonFile}`, {
                ignore: defaultIgnore
            });
            collection.push(...files);

            return collection;
        },
        [context.project.getFilePath(packageJsonFile)]
    );
};

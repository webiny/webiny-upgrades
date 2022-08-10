import loadJson from "load-json-file";
import { PackageJson } from "../types";
import writeJson from "write-json-file";

export const addWorkspaceToRootPackageJson = async (
    packageJsonPath: string,
    pathsToAdd: string[]
): Promise<void> => {
    const rootPackageJson = await loadJson<PackageJson>(packageJsonPath);

    pathsToAdd.forEach(pathToAdd => {
        // Ensure forward slashes are used.
        pathToAdd = pathToAdd.replace(/\\/g, "/");
        // Add it to workspaces packages if not already
        if (!rootPackageJson.workspaces.packages.includes(pathToAdd)) {
            rootPackageJson.workspaces.packages.push(pathToAdd);
        }
    });

    await writeJson(packageJsonPath, rootPackageJson);
};

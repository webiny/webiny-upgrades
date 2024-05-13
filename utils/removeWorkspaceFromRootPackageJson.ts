import loadJson from "load-json-file";
import { PackageJson } from "../types";
import writeJson from "write-json-file";

export const removeWorkspaceFromRootPackageJson = async (pathsToRemove: string[]): Promise<void> => {
    const packageJsonPath = "package.json";
    const rootPackageJson = await loadJson<PackageJson>(packageJsonPath);

    pathsToRemove.forEach(pathToRemove => {
        // Remove it from workspaces packages if present
        const index = rootPackageJson.workspaces.packages.indexOf(pathToRemove);
        if (index !== -1) {
            rootPackageJson.workspaces.packages.splice(index, 1);
        }
    });

    await writeJson(packageJsonPath, rootPackageJson);
};

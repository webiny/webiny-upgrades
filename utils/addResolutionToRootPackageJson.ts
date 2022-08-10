import loadJson from "load-json-file";
import writeJson from "write-json-file";

interface PackagesToAdd {
    [key: string]: string | null;
}
export const addResolutionToRootPackageJson = async (
    packageJsonPath: string,
    packagesToAdd: PackagesToAdd
): Promise<void> => {
    const rootPackageJson = await loadJson<Record<string, any>>(packageJsonPath);

    for (const name in packagesToAdd) {
        // Ensure forward slashes are used.
        const version = packagesToAdd[name];
        const escapedName = name.replace(/\\/g, "/");
        // Add it to resolutions packages if not already
        if (!rootPackageJson.resolutions[escapedName]) {
            rootPackageJson.resolutions[escapedName] = version;
        }
    }

    await writeJson(packageJsonPath, rootPackageJson);
};

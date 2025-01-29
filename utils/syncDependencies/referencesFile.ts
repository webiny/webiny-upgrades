import loadJsonFile from "load-json-file";
import fs from "fs";
import { IReferencesJson } from "./types";
import { Context } from "../../types";
import { createReferencesValidation } from "./validation";
import semVer from "semver";

export interface ILoadReferencesFileParams {
    context: Context;
}

const referencesFile = "node_modules/@webiny/cli/files/references.json";

let loadedReferencesFileData: IReferencesJson | null = null;

export const loadReferencesFile = async (
    params: ILoadReferencesFileParams
): Promise<IReferencesJson> => {
    if (loadedReferencesFileData) {
        return loadedReferencesFileData;
    }
    const { context } = params;

    const file = context.project.getFilePath(referencesFile);
    if (!fs.existsSync(file)) {
        const message = `File "${file}" does not exist. Cannot proceed with syncing the dependencies.`;
        context.log.error(message);
        throw new Error(message);
    }
    const references = loadJsonFile.sync<IReferencesJson | null>(file);
    if (!references) {
        const message = `File "${file}" is empty. Cannot proceed with syncing the dependencies.`;
        context.log.error(message);
        throw new Error(message);
    }

    const validated = createReferencesValidation().safeParse(references);
    if (!validated.success) {
        const message = "Invalid references file. Cannot continue with syncing the dependencies.";
        context.log.error(message);
        context.log.info(JSON.stringify(validated.error, null, 2));
        throw new Error(message);
    }
    /**
     * For some strange reason, the validated.data contains optional properties, which is not correct.
     */
    return (loadedReferencesFileData = validated.data as unknown as IReferencesJson);
};

export interface IReadPackageVersionsFromReferencesFileParams {
    packages: IReferencePackages;
    context: Context;
}

export interface IReferencePackages {
    /**
     * name: defaultVersion
     */
    [name: string]: string;
}

export const readPackageVersionsFromReferencesFile = async (
    params: IReadPackageVersionsFromReferencesFileParams
): Promise<IReferencePackages> => {
    const data = await loadReferencesFile(params);

    const results: IReferencePackages = {};
    for (const pkg in params.packages) {
        const defaultVersion = semVer.coerce(params.packages[pkg]);

        const value = data.references.find(item => item.name === pkg);
        if (!value) {
            results[pkg] = defaultVersion.raw;
            continue;
        }
        const version = semVer.coerce(value.versions[0].version);
        if (version.compare(defaultVersion) === -1) {
            results[pkg] = defaultVersion.raw;
            continue;
        }
        results[pkg] = version.raw;
    }
    return results;
};

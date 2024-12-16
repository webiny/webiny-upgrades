import { IReferencesJson } from "./types";
import { Context } from "../../types";
import loadJsonFile from "load-json-file";
import fs from "fs";
import { createReferencesValidation } from "./validation";

export interface ILoadReferencesFileParams {
    context: Context;
}

const referencesFile = "node_modules/@webiny/cli/files/references.json";

export const loadReferencesFile = async (
    params: ILoadReferencesFileParams
): Promise<IReferencesJson> => {
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
    return validated.data as unknown as IReferencesJson;
};

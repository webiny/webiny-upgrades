import { createProcessor } from "../processors";
import { loadReferencesFile } from "./file";

export const syncDependenciesProcessor = createProcessor(async params => {
    const { context } = params;

    const referencesFile = await loadReferencesFile(params);

    return {
        context,
        referencesFile
    };
});

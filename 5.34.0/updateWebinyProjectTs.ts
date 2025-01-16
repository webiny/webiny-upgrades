import { Project } from "ts-morph";
import { Context, IFiles } from "../types";

import { setFeatureFlags } from "./updateWebinyProjectTs/setFeatureFlags";
import { setAppAliases } from "./updateWebinyProjectTs/setAppAliases";

interface Params {
    files: IFiles;
    project: Project;
    context: Context;
}

export const updateWebinyProjectTs = async (params: Params): Promise<void> => {
    await setFeatureFlags(params);
    await setAppAliases(params);

    params.context.log.success(
        `Added %s and set the %s feature flag in %s.`,
        "application aliases",
        "pbLegacyRenderingEngine",
        "webiny.project.ts"
    );
};

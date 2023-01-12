import { Project } from "ts-morph";
import { Context } from "../types";
import { Files } from "../utils";

import { setFeatureFlags } from "./updateWebinyProjectTs/setFeatureFlags";
import { setAppAliases } from "./updateWebinyProjectTs/setAppAliases";

interface Params {
    files: Files;
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

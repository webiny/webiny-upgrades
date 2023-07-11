import { Files } from "../utils";
import { Project } from "ts-morph";
import { Context } from "../types";
import { isFeatureFlagExist } from "../utils/isFeatureFlagExist";
import { addFeatureFlag } from "../utils/addFeatureFlag";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const upgradeLegacyRteToCmsFeatureFlag = async (params: Params) => {
    const { project, files, context } = params;

    context.log.info(
        "Adding feature flag for legacy Rich Text editor support in the Headless CMS app."
    );

    const webinyProjectFile = files.byName("webiny.project.ts");
    const source = project.getSourceFile(webinyProjectFile.path);

    const FEATURE_FLAG_NAME = "allowCmsLegacyRteInput";

    if (isFeatureFlagExist(source, FEATURE_FLAG_NAME)) {
        context.log.success("Feature flag is already added.");
        return;
    }

    try {
        addFeatureFlag(source, FEATURE_FLAG_NAME, true);
    } catch (e) {
        context.log.warning(e.message);
        return;
    }

    context.log.success("Feature flag is successfully added.");
};

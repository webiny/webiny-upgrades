import { Files } from "../utils";
import { Project } from "ts-morph";
import { Context } from "../types";
import { FeatureFlagExist } from "../utils/featureFlagExist";
import { addFeatureFlag } from "../utils/addFeatureFlag";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}
const FEATURE_FLAG_NAME = "allowCmsLegacyRichTextInput";

export const upgradeLegacyRteToCmsFeatureFlag = async (params: Params) => {
    const { project, files, context } = params;

    context.log.info(
        "Adding feature flag %s for legacy Rich Text editor support in the Headless CMS app. For more info please check %s",
        "allowCmsLegacyRichTextInput",
        "https://webiny.link/hcms-legacy-rte-support"
    );

    const webinyProjectFile = files.byName("webiny.project.ts");
    const source = project.getSourceFile(webinyProjectFile.path);

    if (FeatureFlagExist(source, FEATURE_FLAG_NAME)) {
        context.log.success("Feature flag %s is already added.", "allowCmsLegacyRichTextInput");
        return;
    }

    try {
        addFeatureFlag(source, FEATURE_FLAG_NAME, true);
    } catch (e) {
        context.log.warning(e.message);
        return;
    }
};

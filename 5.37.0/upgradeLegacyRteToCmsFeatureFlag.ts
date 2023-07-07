import { Files } from "../utils";
import { Project } from "ts-morph";
import { Context } from "../types";
import { featureFlagExist } from "../utils/featureFlagExist";
import { addFeatureFlag } from "../utils/addFeatureFlag";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const upgradeLegacyRteToCmsFeatureFlag = async (params: Params) => {
    const { project, files, context } = params;

    context.log.info(
        "Start migrating feature flag for legacy Rich Text editor support in the Headless CMS app."
    );

    const webinyProjectFile = files.byName("./webiny.project.ts");
    const source = project.getSourceFile(webinyProjectFile.path);

    const FEATURE_FLAG_NAME = "allowCmsLegacyRteInput";

    if (!source) {
        context.log.error(
            "Feature flag migration is canceled, file 'webiny.project.ts' can be found."
        );
        return;
    }

    const featureFlagExistResult = featureFlagExist(source, FEATURE_FLAG_NAME);
    if (featureFlagExistResult.hasError) {
        context.log.error(
            "Feature flag migration is canceled, object was not found in the source file webiny.project.ts"
        );
    }

    if (!featureFlagExistResult.hasError && featureFlagExistResult.exist) {
        context.log.success("Feature flag for the legacy rich text editor is already migrated.");
        return;
    }

    // Add the feature flag
    const result = addFeatureFlag(source, FEATURE_FLAG_NAME, true);
    if (result.hasError) {
        context.log.warning(
            "Feature flag migration is canceled, please check the featureFlag object structure in 'webiny.project.ts' file."
        );
        return;
    }

    context.log.success(
        "Feature flag for legacy Rich Text editor support in the Headless CMS app is successfully added."
    );
};

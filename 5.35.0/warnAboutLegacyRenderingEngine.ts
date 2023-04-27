import { Context } from "../types";
import { getDocsLink } from "../utils";

interface Params {
    context: Context;
}

export const warnAboutLegacyRenderingEngine = async (params: Params) => {
    const doc = getDocsLink("/5.35.0/page-builder-rendering-upgrade");
    params.context.log.warning(
        `Some of the theme-related upgrades were not applied because you are using an older version of the Page Builder rendering engine. Please upgrade to the latest version of the Page Builder rendering engine to apply all theme-related upgrades. For more information, please visit: ${doc}.`
    );
};

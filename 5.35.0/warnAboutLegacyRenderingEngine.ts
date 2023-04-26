import { Context } from "../types";

interface Params {
    context: Context;
}

export const warnAboutLegacyRenderingEngine = async (params: Params) => {
    params.context.log.warning("nemere");
};

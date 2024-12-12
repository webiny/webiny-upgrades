import { Project } from "ts-morph";
import { log } from "../utils";
import { Context, IFiles } from "../types";
import path from "path";
import fs from "fs";
import util from "util";
import ncpBase from "ncp";

const ncp = util.promisify(ncpBase.ncp);

interface Params {
    files: IFiles;
    project: Project;
    context: Context;
}

export const updateDefaultFormLayout = async (params: Params) => {
    const { context } = params;

    context.log.info(
        "Migrating form layouts located in the %s folder.",
        "apps/theme/layouts/forms"
    );

    const from = path.join(__dirname, "updateDefaultFormLayout");
    const to = path.join(context.project.root, "apps", "theme", "layouts", "forms");

    if (!fs.existsSync(to)) {
        log.warning(
            "Cannot perform migration because the %s folder doesn't exist. This could be because the %s wasn't performed. To learn more, visit https://www.webiny.com/docs/release-notes/5.34.0/page-builder-pe-rendering-engine-migration.",
            "apps/theme/layouts/forms",
            "Page Builder - Page Rendering Engine Migration"
        );

        return;
    }

    context.log.info(
        "Generating latest code in the form layouts folder (%s).",
        "apps/theme/layouts/forms"
    );
    await ncp(from, to);
};

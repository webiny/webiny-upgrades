import { Project } from "ts-morph";
import { Files, log } from "../utils";
import { Context } from "../types";
import path from "path";
import fs from "fs";
import util from "util";
import ncpBase from "ncp";

const ncp = util.promisify(ncpBase.ncp);

interface Params {
    files: Files;
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
        "Creating a backup of the form layouts folder (%s → %s).",
        "apps/theme/layouts/forms",
        "apps/theme/layouts/_backup_forms"
    );

    const toBackup = path.join(context.project.root, "apps", "theme", "layouts", "_backup_forms");

    let backupDone = false;
    if (fs.existsSync(toBackup)) {
        log.warning(
            "Cannot create a backup of the %s folder, %s folder already exists.",
            "apps/theme/layouts/forms",
            "apps/theme/layouts/_backup_forms"
        );
    } else {
        fs.renameSync(to, toBackup);
        backupDone = true;
    }

    if (backupDone) {
        context.log.info(
            "Generating latest code in the form layouts folder (%s).",
            "apps/theme/layouts/forms"
        );
        await ncp(from, to);
    }

    context.log.success("Form layouts migration completed.");
};

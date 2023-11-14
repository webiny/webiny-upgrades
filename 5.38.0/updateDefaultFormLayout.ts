import { createProcessor, log } from "../utils";
import path from "path";
import fs from "fs";
import util from "util";
import ncpBase from "ncp";

const ncp = util.promisify(ncpBase.ncp);

export const updateDefaultFormLayout = createProcessor(async params => {
    const { context } = params;

    context.log.info("Upgrading form layouts located in %s folder...", "apps/theme/layouts/forms");

    log.info("Backing up %s folder...", "apps/theme");

    const fromBackup = path.join(params.context.project.root, "apps", "theme", "layouts", "forms");
    const toBackup = path.join(
        params.context.project.root,
        "apps",
        "theme",
        "layouts",
        "_forms_backup"
    );

    if (fs.existsSync(toBackup)) {
        log.warning(
            "%s folder already exists, cannot create backup of the %s folder. Skipping form layouts upgrade...",
            toBackup,
            "theme"
        );
        return;
    }

    fs.mkdirSync(toBackup);
    await ncp(fromBackup, toBackup);

    const newCodeFrom = path.join(__dirname, "updateDefaultFormLayout");
    const newCodeTo = path.join(context.project.root, "apps", "theme", "layouts", "forms");

    if (!fs.existsSync(newCodeTo)) {
        log.warning(
            "Cannot perform upgrade because the %s folder doesn't exist. This could be because the %s wasn't performed. To learn more, visit https://www.webiny.com/docs/release-notes/5.34.0/page-builder-pe-rendering-engine-migration.",
            "apps/theme/layouts/forms",
            "Page Builder - Page Rendering Engine Migration"
        );

        return;
    }

    context.log.info(
        "Generating latest code in the form layouts folder (%s).",
        "apps/theme/layouts/forms"
    );
    await ncp(newCodeFrom, newCodeTo);

    log.success("Form layouts upgrade completed successfully.");
});

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
        "Creating a backup of the existing default form layout code (%s → %s).",
        "apps/theme/layouts/forms",
        "apps/theme/layouts/_backup_forms"
    );

    const from = path.join(__dirname, "updateDefaultFormLayout");
    const to = path.join(context.project.root, "apps", "theme", "layouts", "forms");

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

        context.log.success("A backup of the existing default form layout code has been created.");
    }

    if (backupDone) {
        context.log.info(
            "Generating latest default form layout code (%s).",
            "apps/theme/layouts/forms"
        );
        await ncp(from, to);
        context.log.success("Latest default form layout code has been generated.");
    }
};

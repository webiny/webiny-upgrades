import { Context } from "../types";
import { Files, log } from "../utils";
import path from "path";
import fs from "fs";
import ncpBase from "ncp";
import util from "util";
import { Project } from "ts-morph";

const ncp = util.promisify(ncpBase.ncp);

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export type ThemeBackupResult = {
    isSuccessful: boolean;
    info?: string;
};

export const backupFormLayoutsFolder = async (params: Params): Promise<ThemeBackupResult> => {
    log.info("Backing up %s folder.", "apps/theme");

    let isSuccessful = false;

    const from = path.join(params.context.project.root, "apps", "theme", "layouts", "forms");
    const toBackup = path.join(params.context.project.root, "apps", "theme", "layouts", "_forms_backup");

    if (fs.existsSync(toBackup)) {
        log.warning(
            "%s folder already exists, cannot create backup of the %s folder.",
            toBackup,
            "theme"
        );
    } else {
        fs.mkdirSync(toBackup);
        await ncp(from, toBackup);
        isSuccessful = true;
    }

    return { isSuccessful };
};

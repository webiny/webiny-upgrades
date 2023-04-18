import { Context } from "../../types";
import { log } from "../../utils";
import path from "path";
import fs from "fs";
import ncpBase from "ncp";
import util from "util";

const ncp = util.promisify(ncpBase.ncp);

export type ThemeBackupResult = {
    isSuccessful: boolean;
    info?: string;
};

export const createThemeUpgradeBackup = async (context: Context): Promise<ThemeBackupResult> => {
    log.info("Backing up %s app theme folder and generating latest code.", "apps/theme");

    const results = [false];

    {
        const from = path.join(context.project.root, "apps", "theme");
        const toBackup = path.join(context.project.root, "apps", "_theme_backup");
        if (fs.existsSync(toBackup)) {
            log.warning(
                "%s folder already exists, cannot create backup of the %s folder.",
                toBackup,
                "theme"
            );
        } else {
            fs.mkdirSync(toBackup);
            await ncp(from, toBackup);
            results[0] = true;
        }
    }

    if (!results.includes(false)) {
        return {
            isSuccessful: true
        };
    }

    return {
        isSuccessful: false
    };
};

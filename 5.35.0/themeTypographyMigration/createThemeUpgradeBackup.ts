import { Context } from "../../types";
import { findVersion, log } from "../../utils";
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
    const currentProjectVersion = findVersion(path.join(context.project.root, "package.json"));

    log.info("Backing up %s app theme folder and generating latest code...", "apps/theme");

    const results = [false];

    {
        const from = path.join(context.project.root, "apps", "theme");
        const to = path.join(context.project.root, "apps", "theme");

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

            const packageJsonPath = path.join(to, "package.json");
            const packageJson = fs.readFileSync(packageJsonPath, "utf8");

            fs.writeFileSync(
                packageJsonPath,
                packageJson.replace(/"\^latest"/g, `"${currentProjectVersion}"`)
            );
        }
    }

    if (!results.includes(false)) {
        log.success("%s app theme folder successfully backed up and moved to app/_theme_backup");
        return {
            isSuccessful: true
        };
    }

    return {
        isSuccessful: false
    };
};

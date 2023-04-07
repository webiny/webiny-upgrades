import {Context} from "../../types";
import {findVersion, log} from "../../utils";
import path from "path";
import fs from "fs";
import ncpBase from "ncp";
import util from "util";

const ncp = util.promisify(ncpBase.ncp);

export type ThemeBackupResult = {
    isSuccessful: boolean;
    info?: string;
};

/*
 *TODO: Create backup of the files and theme for the user.
 * Creates folder named 'legacy_theme_backup'
 * */
export const createThemeUpgradeBackup = async (context: Context): Promise<ThemeBackupResult> => {

    const currentProjectVersion = findVersion(path.join(context.project.root, "package.json"));

    log.info(
        "Backing up %s app and %s folder and generating latest code...",
        "apps/website",
        "apps/theme"
    );

    const results = [false, false];

    {
        const from = path.join(__dirname, "apps", "theme");
        const to = path.join(context.project.root, "apps", "theme");

        const toBackup = path.join(context.project.root, "apps", "_backup_theme");
        if (fs.existsSync(toBackup)) {
            log.warning(
                "%s folder already exists, cannot create backup of the %s folder.",
                toBackup,
                "theme"
            );
        } else {
            fs.renameSync(to, toBackup);
            await ncp(from, to);
            results[0] = true;

            const packageJsonPath = path.join(to, "package.json");
            const packageJson = fs.readFileSync(packageJsonPath, "utf8");

            fs.writeFileSync(
                packageJsonPath,
                packageJson.replace(/"\^latest"/g, `"${currentProjectVersion}"`)
            );
        }
    }

    {
        const from = path.join(__dirname, "apps", "website");
        const to = path.join(context.project.root, "apps", "website");

        const toBackup = path.join(context.project.root, "apps", "_backup_website");
        if (fs.existsSync(toBackup)) {
            log.warning(
                "%s folder already exists, cannot create backup of the %s app.",
                toBackup,
                "website"
            );
        } else {
            fs.renameSync(to, toBackup);
            await ncp(from, to);
            results[1] = true;

            const packageJsonPath = path.join(to, "package.json");
            const packageJson = fs.readFileSync(packageJsonPath, "utf8");

            fs.writeFileSync(
                packageJsonPath,
                packageJson.replace(/"latest"/g, `"${currentProjectVersion}"`)
            );
        }
    }

    if (!results.includes(false)) {
        log.success(
            "%s app and %s folder successfully backed up (moved to %s and %s folders). Latest code was generated successfully.",
            "apps/website",
            "apps/theme",
            "apps/_backup_website",
            "apps/_backup_theme"
        );
    } else {
        if (results.includes(true)) {
            log.warning("Apps partially backed up.");
        }
    }

    return {
        isSuccessful: true
    };
};

import fs from "fs";
import path from "path";
import { getDocsLink } from "./utils";
import log from "./utils/log";
import semver from "semver";
import { PackageJson } from "./types";
import { argv } from "yargs";
import { createBaseContext } from "./helpers/createBaseContext";

const response = (data: Record<string, any> | string): void => {
    console.log(JSON.stringify(data));
    process.exit(0);
};

const forcePatchVersion = (version: string): string => {
    const value = semver.coerce(version);
    if (!value) {
        return version;
    }
    return `${value.major}.${value.minor}.0`;
};

export const run = async (): Promise<void> => {
    const start = new Date().getTime();
    const [version] = argv._;

    let cliVersion: string = version;
    try {
        const packageJsonPath = path.join(
            process.cwd(),
            "node_modules",
            "@webiny/cli/package.json"
        );
        const pkgJson: PackageJson = await import(packageJsonPath);
        cliVersion = pkgJson.version;
    } catch {
        // Use the version passed through args.
    }

    try {
        if (!version) {
            throw new Error(`Missing positional "version" argument!`);
        }

        const forcedVersion = forcePatchVersion(version);

        const scriptsPath = path.join(__dirname, forcedVersion, `index`);

        const scriptsJsPath = `${scriptsPath}.js`;
        const scriptsTsPath = `${scriptsPath}.ts`;
        if (!fs.existsSync(scriptsJsPath) && !fs.existsSync(scriptsTsPath)) {
            response({
                type: "error",
                message: "Script does not exist.",
                code: "SCRIPT_DOES_NOT_EXIST",
                data: {
                    version,
                    forcedVersion,
                    scriptsJsPath,
                    scriptsTsPath
                }
            });
        }

        log.setDebug(argv.debug ?? false);
        /**
         * There is a possibility that input version is not same as cli version.
         * Let's log that so users know that we are running upgrade script for the "0" patch version.
         *
         * Debugging purposes only.
         */
        if (forcedVersion !== cliVersion) {
            log.debug(
                `We are running upgrade with "${forcedVersion}" version, which is different than CLI version ${cliVersion}.`
            );
            log.debug(
                `This is intentional, as we always want to run upgrade script for the "0" patch version.`
            );
        }

        const context = createBaseContext({
            root: argv.cwd || process.cwd(),
            version,
            log
        });

        const runner = await import(scriptsPath);

        await runner.default(context);

        const duration = (new Date().getTime() - start) / 1000;
        log.success(`Upgrade completed in %ss.`, duration);

        console.log();

        log.info("For more information about the upgrade, check out the following article:");
        log.info(getDocsLink(`/release-notes/${version}/upgrade-guide/`));

        response({ type: "success", message: "", error: null });
    } catch (e) {
        console.log(e);
        const duration = (new Date().getTime() - start) / 1000;
        log.error(`Upgrade completed in %ss.`, duration);

        const [version] = argv._;
        if (version) {
            console.log();

            log.info("For more information about the upgrade, check out the following article:");
            log.info(getDocsLink(`/release-notes/${version}/upgrade-guide/`));
        }

        response({
            type: "error",
            message: e.message,
            code: "ERROR",
            data: {
                stack: e.stack
            }
        });
    }
};

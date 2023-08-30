#!/usr/bin/env node
/**
 * This upgrade uses ts-node, but it's local only to this upgrade.
 */
process.env.NODE_PATH = process.cwd();
require("ts-node").register({
    dir: __dirname
});

const fs = require("fs");
const path = require("path");
const { getDocsLink } = require("./utils");
const log = require("./utils/log").default;
const semver = require("semver");

const response = data => {
    console.log(JSON.stringify(data));
    process.exit(0);
};

const forcePatchVersion = version => {
    const value = semver.coerce(version);
    if (!value) {
        return version;
    }
    return `${value.major}.${value.minor}.0`;
};

(async () => {
    const start = new Date();
    const { argv } = require("yargs");
    const [version] = argv._;

    let cliVersion = version;
    try {
        const pkgJson = require(path.join(
            process.cwd(),
            "node_modules",
            "@webiny/cli/package.json"
        ));
        cliVersion = pkgJson.version;
    } catch (e) {
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
                code: "SCRIPT_DOES_NOT_EXIST"
            });
        }

        log.setDebug(argv.debug ?? false);
        /**
         * There is a possibility that input version is not same as cli version.
         * Let's log that so users know that we are running upgrade script for the "0" patch version.
         */
        if (forcedVersion !== cliVersion) {
            log.debug(
                `We are running upgrade with "${forcedVersion}" version, which is different than cli version ${cliVersion}.`
            );
            log.debug(
                `This is intentional, as we always want to run upgrade script for the "0" patch version.`
            );
        }

        const context = {
            project: {
                root: argv.cwd || process.cwd()
            },
            version: cliVersion,
            log: log
        };

        await require(scriptsPath)(context);

        const duration = (new Date() - start) / 1000;
        log.success(`Upgrade completed in %ss.`, duration);

        console.log();

        log.info("For more information about the upgrade, check out the following article:");
        log.info(getDocsLink(`/release-notes/${version}/upgrade-guide/`));

        response({ type: "success", message: "", error: null });
    } catch (e) {
        console.log(e);
        const duration = (new Date() - start) / 1000;
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
})();

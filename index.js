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
const log = require("./utils/log").default;

const response = data => {
    console.log(JSON.stringify(data));
    process.exit(0);
};

(async () => {
    const start = new Date();
    const { argv } = require("yargs");

    try {
        const [version] = argv._;
        if (!version) {
            throw new Error(`Missing positional "version" argument!`);
        }

        const scriptsPath = path.join(__dirname, version, `index`);

        const scriptsJsPath = `${scriptsPath}.js`;
        const scriptsTsPath = `${scriptsPath}.ts`;
        if (!fs.existsSync(scriptsJsPath) && !fs.existsSync(scriptsTsPath)) {
            response({
                type: "error",
                message: "Script does not exist.",
                code: "SCRIPT_DOES_NOT_EXIST"
            });
        }

        const context = {
            project: {
                root: argv.cwd || process.cwd()
            },
            version,
            log: log
        };

        await require(scriptsPath)(context);

        const duration = (new Date() - start) / 1000;
        log.success(`Upgrade completed in %ss.`, duration);

        console.log();

        log.info("For more information about the upgrade, check out the following article:");
        log.info(`https://www.webiny.com/docs/release-notes/${version}/upgrade-guide/`);

        response({ type: "success", message: "", error: null });
    } catch (e) {
        console.log(e);
        const duration = (new Date() - start) / 1000;
        log.error(`Upgrade completed in %ss.`, duration);

        const [version] = argv._;
        if (version) {
            console.log();

            log.info("For more information about the upgrade, check out the following article:");
            log.info(`https://www.webiny.com/docs/release-notes/${version}/upgrade-guide/`);
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

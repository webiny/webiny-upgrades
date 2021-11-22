#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { log } = require("./utils");

const response = data => {
    console.log(JSON.stringify(data));
    process.exit(0);
};

(async () => {
    const start = new Date();

    try {
        const { argv } = require("yargs");

        const [version] = argv._;
        if (!version) {
            throw new Error('--version argument missing. Please specify it.')
        }

        const scriptsPath = path.join(__dirname, version, `index.js`);
        if (!fs.existsSync(scriptsPath)) {
            response({
                type: "error",
                message: "Script does not exist.",
                code: "SCRIPT_DOES_NOT_EXIST"
            });
        }

        await require(scriptsPath)(JSON.parse(argv.context));

        const duration = (new Date() - start) / 1000;
        log.success(`Upgrade completed in ${log.success.hl(duration)}s.`);

        response({ type: "success", message: "", error: null });
    } catch (e) {
        const duration = (new Date() - start) / 1000;
        log.error(`Upgrade completed in ${log.error.hl(duration)}s.`);

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

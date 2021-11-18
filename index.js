#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const response = data => {
    console.log(JSON.stringify(data));
    process.exit(0);
};

(async () => {
    try {
        const { argv } = require("yargs");

        const [version] = argv._;
        const scriptsPath = path.join(__dirname, version, `index.js`);
        if (!fs.existsSync(scriptsPath)) {
            response({
                type: "error",
                message: "Script does not exist.",
                code: "SCRIPT_DOES_NOT_EXIST"
            });
        }

        await require(scriptsPath)(argv.context);
        response({ type: "success", message: "", error: null });
    } catch (e) {
        console.log({
            type: "error",
            message: e.message,
            code: "ERROR",
            data: {
                stack: e.stack
            }
        });
    }
})();

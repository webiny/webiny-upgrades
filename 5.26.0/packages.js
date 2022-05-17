const path = require("path");
const fs = require("fs");
const { log } = require("../utils");
const json5 = require("json5");

const file = `tsconfig.build.json`;

const logSkip = () => {
    log.info(`Skipping ${file} upgrade. Please upgrade it manually, if possible.`);
};

/**
 *
 * @param context {Object}
 * @return {Promise<void>}
 */
const removeLibDom = async context => {
    const tsconfigFilePath = path.join(context.project.root, `${file}`);
    if (fs.existsSync(tsconfigFilePath) === false) {
        log.error(`Missing ${tsconfigFilePath}.`);
        logSkip();
        return;
    }
    let tsconfig;
    try {
        tsconfig = fs.readFileSync(tsconfigFilePath).toString();
    } catch (ex) {
        log.error(`Could not read ${tsconfigFilePath}.`);
        log.info(ex.message);
        logSkip();
        return;
    }

    let parsed = {};
    try {
        parsed = json5.parse(tsconfig);
    } catch (ex) {
        log.error(`Could not parse ${tsconfigFilePath}.`);
        log.info(ex.message);
        logSkip();
        return;
    }

    if (!parsed.compilerOptions) {
        log.error(`Missing compilerOptions in ${tsconfigFilePath}.`);
        logSkip();
        return;
    }
    log.info("Updating tsconfig...");

    parsed.compilerOptions.target = "esnext";
    parsed.compilerOptions.module = "esnext";
    parsed.compilerOptions.lib = ["esnext"];

    const stringified = json5.stringify(parsed);

    try {
        fs.writeFileSync(tsconfigFilePath, stringified);
    } catch (ex) {
        log.error(`Could not save ${tsconfigFilePath}`);
        log.info(ex.message);
        logSkip();
    }
    log.info("...done");
};

module.exports = {
    getFiles: () => {
        return [file];
    },
    removeLibDom
};

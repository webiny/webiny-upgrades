const path = require("path");
const fs = require("fs");
const { log } = require("../utils");

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

    log.info("Updating tsconfig...");
    tsconfig = tsconfig.replace(`"lib": ["dom", "dom.iterable"]`, `"lib": ["esnext"]`);
    log.info("...done");

    try {
        fs.writeFileSync(tsconfigFilePath, tsconfig);
    } catch (ex) {
        log.error(`Could not save ${tsconfigFilePath}`);
        log.info(ex.message);
        logSkip();
    }
};

module.exports = {
    getFiles: () => {
        return [file];
    },
    removeLibDom
};

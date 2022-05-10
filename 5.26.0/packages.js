const path = require("path");
const fs = require("fs");
const { log } = require("../utils");
const glob = require("fast-glob");

const file = `tsconfig.build.json`;

const logSkip = () => {
    log.info(`Skipping ${file} upgrade. Please upgrade it manually, if possible.`);
};

/**
 *
 * @param context {Object}
 * @return {Promise<string[]>}
 */
const getFiles = async context => {
    if (!context || !context.project || !context.project.root) {
        log.error("Missing project root on the context.");
        return [];
    }
    return glob(
        [file].map(target => {
            return path.join(context.project.root, target);
        })
    );
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
        tsconfig = JSON.parse(fs.readFileSync(tsconfigFilePath).toString());
    } catch (ex) {
        log.error(`Could not read ${tsconfigFilePath}.`);
        log.info(ex.message);
        logSkip();
        return;
    }
    if (!tsconfig || Object.keys(tsconfig).length === 0) {
        log.error(`No data in ${tsconfigFilePath}.`);
        logSkip();
        return;
    } else if (!tsconfig.compilerOptions) {
        log.error(`No compilerOptions in ${tsconfigFilePath}.`);
        logSkip();
        return;
    } else if (
        !tsconfig.compilerOptions.lib ||
        Array.isArray(tsconfig.compilerOptions.lib) === false
    ) {
        log.error(`Missing compilerOptions.lib in ${tsconfigFilePath}`);
        logSkip();
        return;
    }
    tsconfig.compilerOptions.lib = ["esnext"];

    try {
        fs.writeFileSync(tsconfigFilePath, JSON.stringify(tsconfig));
    } catch (ex) {
        log.error(`Could not save ${tsconfigFilePath}`);
        log.info(ex.message);
        logSkip();
    }
};

module.exports = {
    getFiles,
    removeLibDom
};

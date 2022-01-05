const tsMorph = require("ts-morph");

const path = require("path");
const fs = require("fs");
const { log } = require("./log");
/**
 *
 * @param context {Object}
 * @param files {Record<string, string>}
 *
 * @return {Record<string, string>}
 */
const getExistingFiles = (context, files) => {
    const output = {};
    for (const key in files) {
        if (files.hasOwnProperty(key) === false) {
            continue;
        }
        const file = files[key];
        /**
         * Skip json files.
         */
        if (file.match(".json") !== null) {
            continue;
        }
        /**
         * Check for existence of files.
         */
        const target = path.join(context.project.root, file);
        if (fs.existsSync(target) === false) {
            log.debug(`No file "${file}". Skipping...`);
            continue;
        }
        output[key] = file;
    }
    return output;
};
/**
 *
 * @param project {tsMorph.Project}
 * @param file {String}
 * @return {tsMorph.SourceFile|null}
 */
const getSourceFile = (project, file) => {
    if (!file) {
        log.debug("File variable not sent.");
        return null;
    }
    let source = null;
    try {
        source = project.getSourceFile(file);
        if (source) {
            return source;
        }
    } catch (ex) {
        log.debug(ex.message);
    }
    log.debug(`Skipping file "${file}", cannot find it.`);
    return null;
};

module.exports = {
    getSourceFile,
    getExistingFiles
};

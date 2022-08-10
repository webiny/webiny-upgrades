import { Project, SourceFile } from "ts-morph";

import path from "path";
import fs from "fs";
import log from "./log";
import { Context } from "../types";

interface Files {
    [key: string]: string;
}

export const getExistingFiles = (context: Context, files: Files): Files => {
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

export const getSourceFile = (project: Project, file: string): SourceFile | null => {
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

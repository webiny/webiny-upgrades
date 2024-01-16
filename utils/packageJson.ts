import { PackageJson } from "../types";
import fs from "fs";
import log from "./log";
import loadJson from "load-json-file";
import writeJson from "write-json-file";
import lodashMerge from "lodash/merge";

export const mergePackageJson = (target: string, config: Partial<PackageJson>) => {
    const file = target.endsWith("package.json") === null ? `${target}/package.json` : target;
    if (!fs.existsSync(file)) {
        log.error(`There is no package.json file at path "${file}".`);
        return;
    }
    const json = loadJson.sync(file);
    if (!json) {
        log.error(`There is no package.json file "${file}"`);
        return;
    }

    const newJson = lodashMerge(json, config);

    writeJson.sync(file, newJson);
};

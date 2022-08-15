import path from "path";
import fs from "fs";
import log from "./log";
import loadJson from "load-json-file";
import { Context } from "../types";
/**
 * We will determine if GraphQL package.json file has elasticsearch package. If it does, it is elasticsearch project.
 */
export const getIsElasticsearchProject = (context: Context, apiGraphQLPath: string): boolean => {
    const file = path.join(context.project.root, apiGraphQLPath, "package.json");
    if (fs.existsSync(file) === false) {
        log.debug(`Missing file "${file}" to determine if project contains Elasticsearch.`);
        process.exit(1);
    }
    let contents = null;
    try {
        contents = loadJson.sync(file);
    } catch (ex) {
        log.error(ex.message);
    }

    const { dependencies } = contents || {};
    if (!dependencies || typeof dependencies !== "object") {
        log.info("Could not determine if project contains Elasticsearch.");
        process.exit(1);
    }
    return !!dependencies["@webiny/api-elasticsearch"];
};

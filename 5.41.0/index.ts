import {
    breakingChangesWarning,
    createProcessorRunner,
    prettierFormat,
    yarnInstall
} from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updatesForTypescript } from "./updatesForTypescript";
import { updatesForNode } from "./updatesForNode";
import { updateForEsHcmsTasks } from "./updateForEsHcmsTasks";
import { robotsTxtUpdates } from "./robotsTxtUpdates";
import { updatesForExtensions } from "./updatesForExtensions";

module.exports = async (context: Context) => {
    const files = setupFiles(context);
    const processorsRunner = createProcessorRunner({
        files,
        context
    });
    const processors = [
        /**
         * Display a warning about breaking changes.
         */
        breakingChangesWarning({ version: "5.41.0" }),
        /**
         * Update for TS 4.9.5
         * https://github.com/webiny/webiny-js/pull/4229
         */
        updatesForTypescript,
        /**
         * Update for Node ^20.0.0
         * https://github.com/webiny/webiny-js/pull/4257
         */
        updatesForNode,
        /**
         * Add api-headless-cms-tasks-ddb-es packages
         * https://github.com/webiny/webiny-js/pull/4283
         */
        updateForEsHcmsTasks,

        /**
         * Add robots.txt files for Admin and Website project applications
         * https://github.com/webiny/webiny-js/pull/4329
         */
        robotsTxtUpdates,

        /**
         * Preparations for PB Element Extension
         * https://github.com/webiny/webiny-js/pull/4336
         */
        updatesForExtensions
    ];

    await processorsRunner.execute(processors);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

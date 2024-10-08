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
import { updateForReact } from "./updateForReact";

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
         * Update for React 18 and related packages
         * https://github.com/webiny/webiny-js/pull/4264
         */
        updateForReact
    ];

    await processorsRunner.execute(processors);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

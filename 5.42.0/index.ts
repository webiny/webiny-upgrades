import {
    breakingChangesWarning,
    createProcessorRunner,
    prettierFormat,
    yarnInstall
} from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updatesForNode } from "./updatesForNode";
import { updatesForYarn } from "./updatesForYarn";
import { updatesForLogger } from "./updatesForLogger";
import { syncDependenciesProcessor } from "../utils/syncDependencies";
import { updatesForResolutions } from "./updatesForResolutions";

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
        breakingChangesWarning({ version: "5.42.0" }),
        /**
         * Yarn v4.6.0
         */
        updatesForYarn,
        /**
         * Make sure resolutions don't have some excess packages.
         */
        updatesForResolutions,
        /**
         * Sync dependencies processor.
         */
        syncDependenciesProcessor,
        /**
         * Node v20 latest types
         */
        updatesForNode,
        /**
         * Logger
         * https://github.com/webiny/webiny-js/pull/4366
         */
        updatesForLogger
    ];

    await processorsRunner.execute(processors);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

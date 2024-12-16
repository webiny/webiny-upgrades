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

module.exports = async (context: Context) => {
    const files = setupFiles(context);
    const processorsRunner = createProcessorRunner({
        files,
        context
    });
    const processors = [
        /**
         * Sync dependencies processor. Must always be first.
         */
        syncDependenciesProcessor,
        /**
         * Display a warning about breaking changes.
         */
        breakingChangesWarning({ version: "5.42.0" }),
        /**
         * Updates for Node v22
         */
        updatesForNode,
        /**
         * Updates for Yarn v4.5.3
         */
        updatesForYarn,
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

import {
    breakingChangesWarning,
    createProcessorRunner,
    prettierFormat,
    yarnInstall
} from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updatesForLogger } from "./updatesForLogger";
import { syncDependenciesProcessor } from "../utils/syncDependencies";
import { updatesForResolutions } from "./updatesForResolutions";
import { removeTsExpectError } from "./removeTsExpectError";

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
         * Make sure resolutions don't have some excess packages.
         */
        updatesForResolutions,
        /**
         * Sync dependencies processor.
         */
        syncDependenciesProcessor,
        /**
         * Logger
         * https://github.com/webiny/webiny-js/pull/4366
         */
        updatesForLogger,
        /**
         * Remove // @ts-expect-error from the codebase.
         */
        removeTsExpectError
    ];

    await processorsRunner.execute(processors);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

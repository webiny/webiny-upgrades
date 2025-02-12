import {
    breakingChangesWarning,
    createProcessorRunner,
    prettierFormat,
    yarnInstall
} from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { syncDependenciesProcessor } from "../utils/syncDependencies";
import { removeHandlerLogs } from "./removeHandlerLogs";

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
        breakingChangesWarning({ version: "5.43.0" }),
        /**
         * Sync dependencies processor.
         */
        syncDependenciesProcessor,
        /**
         * Remove handler-logs package usage.
         * https://github.com/webiny/webiny-js/pull/4523
         */
        removeHandlerLogs
    ];

    await processorsRunner.execute(processors);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

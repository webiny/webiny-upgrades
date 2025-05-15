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
import { upgradeTypescript } from "./upgradeTypescript";
import { updateCreateAco } from "./updateCreateAco";
import { removeGzipCompression } from "./removeGzipCompression";

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
         * Remove handler-logs package usage.
         * https://github.com/webiny/webiny-js/pull/4523
         */
        removeHandlerLogs,
        /**
         * Remove gzip compression from the handler.
         * https://github.com/webiny/webiny-js/pull/4622
         */
        removeGzipCompression,
        /**
         * Upgrade to Typescript 5.3.3
         * https://github.com/webiny/webiny-js/pull/4464
         */
        upgradeTypescript,
        /**
         * Sync dependencies processor.
         */
        syncDependenciesProcessor,
        /**
         * Pass DDB Document Client to createAco
         * https://github.com/webiny/webiny-js/pull/4615
         */
        updateCreateAco
    ];

    await processorsRunner.execute(processors);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

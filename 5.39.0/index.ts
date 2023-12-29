import { prettierFormat, runProcessors, yarnInstall } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateForNode18 } from "./updateForNode18";
import { updateForHandlers } from "./updateForHandlers";
import { updateForBackgroundTasks } from "./updateForBackgroundTasks";

module.exports = async (context: Context) => {
    const processors = [
        /**
         * Node 18 Update must be first.
         */
        updateForNode18,
        /**
         * Update to always use the @webiny/handler-aws createHandler method, not specific handlers.
         */
        updateForHandlers,
        /**
         * Add background tasks.
         */
        updateForBackgroundTasks
    ];

    const files = setupFiles(context);

    await runProcessors(files, processors, context);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

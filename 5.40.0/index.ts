import { prettierFormat, runProcessors, yarnInstall } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateForHcmsAco } from "./updateForHcmsAco";
import { updateForAwsSdk } from "./updateForAwsSdk";
import { updateForHcmsTasks } from "./updateForHcmsTasks";
import { updateForLockingMechanism } from "./updateForLockingMechanism";

module.exports = async (context: Context) => {
    const processors = [
        /**
         * Headless CMS - ACO.
         */
        updateForHcmsAco,
        /**
         * Headless CMS - Tasks.
         */
        updateForHcmsTasks,
        /**
         * A PR with the update of @aws-sdk was merged, and it required a change of the types.
         * https://github.com/webiny/webiny-js/pull/4063
         */
        updateForAwsSdk,
        /**
         * https://github.com/webiny/webiny-js/pull/4065
         */
        updateForLockingMechanism
    ];

    const files = setupFiles(context);

    await runProcessors(files, processors, context);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

import { createProcessorRunner, prettierFormat, yarnInstall } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateForHcmsAco } from "./updateForHcmsAco";
import { updateForAwsSdk } from "./updateForAwsSdk";
import { updateForHcmsTasks } from "./updateForHcmsTasks";
import { updateForLockingMechanism } from "./updateForLockingMechanism";
import { updateForReact } from "./updateForReact";

module.exports = async (context: Context) => {
    const files = setupFiles(context);
    const processorsRunner = createProcessorRunner({
        files,
        context
    });
    const processors = [
        /**
         * React 18 and related packages
         * https://github.com/webiny/webiny-js/pull/3771
         */
        updateForReact,
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

    await processorsRunner.execute(processors);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

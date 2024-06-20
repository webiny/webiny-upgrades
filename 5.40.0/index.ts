import {
    breakingChangesWarning,
    createProcessorRunner,
    prettierFormat,
    yarnInstall
} from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateForHcmsAco } from "./updateForHcmsAco";
import { updateForAwsSdk } from "./updateForAwsSdk";
import { updateForHcmsTasks } from "./updateForHcmsTasks";
import { updateForRecordLocking } from "./updateForRecordLocking";
import { updateForReact } from "./updateForReact";
import { updateForWebsockets } from "./updateForWebsockets";
import { updatesForExtensions } from "./updatesForExtensions";
import { updatesForPbTheme } from "./updatesForPbTheme";

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
        breakingChangesWarning({ version: "5.40.0" }),
        /**
         * React 18 and related packages
         * https://github.com/webiny/webiny-js/pull/3771
         */
        updateForReact,
        /**
         * https://github.com/webiny/webiny-js/pull/3877
         */
        updateForWebsockets,
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
        updateForRecordLocking,

        /**
         * https://github.com/webiny/webiny-js/pull/4111
         */
        updatesForExtensions,

        /**
         * https://github.com/webiny/webiny-js/pull/4138
         */
        updatesForPbTheme
    ];

    await processorsRunner.execute(processors);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

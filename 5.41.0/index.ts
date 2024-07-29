import {
    breakingChangesWarning,
    createProcessorRunner,
    prettierFormat,
    yarnInstall
} from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateForHcmsBulkActions } from "./updateForHcmsBulkActions";

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
         * CMS Bulk Actions via Background Tasks
         * https://github.com/webiny/webiny-js/pull/4112
         */
        updateForHcmsBulkActions
    ];

    await processorsRunner.execute(processors);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

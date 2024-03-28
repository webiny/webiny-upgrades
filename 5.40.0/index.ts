import { prettierFormat, runProcessors, yarnInstall } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateForHcmsAco } from "./updateForHcmsAco";

module.exports = async (context: Context) => {
    const processors = [
        /**
         * Headless CMS - ACO.
         */
        updateForHcmsAco
    ];

    const files = setupFiles(context);

    await runProcessors(files, processors, context);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

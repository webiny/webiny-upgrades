import { prettierFormat, runProcessors } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateForNode18 } from "./updateForNode18";

module.exports = async (context: Context) => {
    const processors = [
        /**
         * Node 18 Update must be first.
         */
        updateForNode18
    ];

    const files = setupFiles(context);

    await runProcessors(files, processors, context);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    // await yarnInstall();
};

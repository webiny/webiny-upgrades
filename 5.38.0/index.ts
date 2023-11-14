import { prettierFormat, runProcessors, yarnInstall } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateApiSecurityPlugins } from "./updateApiSecurityPlugins";
import { backupFormLayoutsFolder } from "./backupFormLayoutsFolder";
import { updateDefaultFormLayout } from "./updateDefaultFormLayout";
import { updateApiGraphQl } from "./updateApiGraphQl";

module.exports = async (context: Context) => {
    const processors = [
        updateApiSecurityPlugins,
        backupFormLayoutsFolder,
        updateDefaultFormLayout,
        updateApiGraphQl
    ];

    const files = setupFiles(context);

    await runProcessors(files, processors, context);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

import { prettierFormat, runProcessors, yarnInstall } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateApiSecurityPlugins } from "./updateApiSecurityPlugins";
import { updateDefaultFormLayout } from "./updateDefaultFormLayout";
import { updateApiGraphQl } from "./updateApiGraphQl";

module.exports = async (context: Context) => {
    const processors = [updateApiGraphQl, updateApiSecurityPlugins, updateDefaultFormLayout];

    const files = setupFiles(context);

    await runProcessors(files, processors, context);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateApiSecurityPlugins } from "./updateApiSecurityPlugins";
import { backupFormLayoutsFolder } from "./backupFormLayoutsFolder";
import { updateDefaultFormLayout } from "./updateDefaultFormLayout";

module.exports = async (context: Context) => {
    const processors = [updateApiSecurityPlugins, backupFormLayoutsFolder, updateDefaultFormLayout];

    const files = setupFiles(context);

    await runProcessors(files, processors, context);

    // Format files.
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

// Run processors in sequence.
const runProcessors = async (files, processors, context) => {
    for (let i = 0; i < processors.length; i++) {
        const processor = processors[i];

        const rawFiles = files.paths();
        const project = createMorphProject(rawFiles);

        const result = await processor({
            context,
            project,
            files
        });

        if (result?.skipped !== true) {
            console.log();
        }

        // Save file changes.
        await project.save();
    }
};

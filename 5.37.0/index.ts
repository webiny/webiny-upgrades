import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updatePbPlugins } from "./updatePbPlugins";
import { updateFbPlugins } from "./updateFbPlugins";
import { updateApiSecurityPlugins } from "./updateApiSecurityPlugins";

module.exports = async (context: Context) => {
    const processors = [updateApiSecurityPlugins, updatePbPlugins, updateFbPlugins];

    await runProcessors(processors, context);

    console.log();

    // Format files.
    const files = setupFiles(context);
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

// Run processors in sequence.
const runProcessors = async (processors, context) => {
    for (let i = 0; i < processors.length; i++) {
        const processor = processors[i];

        const files = setupFiles(context);
        const rawFiles = files.paths();
        const project = createMorphProject(rawFiles);

        await processor({
            context,
            project,
            files
        });

        console.log();

        // Save file changes.
        await project.save();
    }
};

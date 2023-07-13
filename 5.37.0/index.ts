import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateApiIndexPlugins } from "./updateApiIndexPlugins";
import { updateApiSecurityPlugins } from "./updateApiSecurityPlugins";
import { updatePbPlugins } from "./updatePbPlugins";
import { updateFbPlugins } from "./updateFbPlugins";
import { upgradeLegacyRteToCmsFeatureFlag } from "./upgradeLegacyRteToCmsFeatureFlag";
import { deleteCmsFolder } from "./deleteCmsFolder";

module.exports = async (context: Context) => {
    const processors = [
        updateApiIndexPlugins,
        updateApiSecurityPlugins,
        updatePbPlugins,
        updateFbPlugins,
        upgradeLegacyRteToCmsFeatureFlag,
        deleteCmsFolder
    ];

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

import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { updateGraphQL } from "./updateGraphQL";
import { updateToEmotion11 } from "./updateToEmotion11";
import { updateAdminApp } from "./updateAdminApp";
import { updateDefaultFormLayout } from "./updateDefaultFormLayout";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";

module.exports = async (context: Context) => {
    const files = setupFiles(context);
    const rawFiles = files.paths();
    const project = createMorphProject(rawFiles);

    const processors = [updateGraphQL, updateAdminApp, updateToEmotion11, updateDefaultFormLayout];

    for (let i = 0; i < processors.length; i++) {
        const processor = processors[i];
        await processor({
            context,
            project,
            files
        });

        // Let's have an empty line between chunks of logs produced by processors.
        console.log();
    }

    // Save file changes.
    await project.save();

    await prettierFormat(rawFiles);

    await yarnInstall();
};

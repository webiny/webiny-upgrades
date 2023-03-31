import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { updateGraphQL } from "./updateGraphQL";
import { updateToEmotion11 } from "./updateToEmotion11";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";

module.exports = async (context: Context) => {
    const files = setupFiles(context);
    const rawFiles = files.paths();
    const project = createMorphProject(rawFiles);

    await [updateGraphQL, updateToEmotion11].reduce(async (_, processor) => {
        return await processor({
            context,
            project,
            files
        });
    }, Promise.resolve());

    // Save file changes.
    await project.save();

    await prettierFormat(rawFiles);

    await yarnInstall();
};

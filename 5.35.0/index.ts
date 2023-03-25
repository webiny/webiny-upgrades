import { createMorphProject, prettierFormat } from "../utils";
import { updateGraphQL } from "./updateGraphQL";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";

module.exports = async (context: Context) => {
    const files = setupFiles(context);
    const rawFiles = files.paths();
    const project = createMorphProject(rawFiles);

    await [updateGraphQL].reduce(async (_, processor) => {
        return await processor({
            context,
            project,
            files
        });
    }, Promise.resolve());

    // Save file changes.
    await project.save();

    await prettierFormat(rawFiles);
};

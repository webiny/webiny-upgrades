import { Context } from "../types";
import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { getAllFiles } from "./files";
import { updateFileManager } from "./updateFileManager";

module.exports = async (context: Context) => {
    const files = getAllFiles(context);
    const rawFiles = files.all();
    const project = createMorphProject(rawFiles);

    /**
     * File Manager
     */
    await updateFileManager({
        context,
        project,
        files
    });

    // Save file changes.
    await project.save();

    // Format updated files.
    await prettierFormat(rawFiles);

    // Install dependencies.
    await yarnInstall();
};

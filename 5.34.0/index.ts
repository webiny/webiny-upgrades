import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { updateGraphQL } from "./updateGraphQL";
import { getAllFiles } from "./files";
import { Context } from "../types";

module.exports = async (context: Context) => {
    const files = getAllFiles(context);
    const rawFiles = files.all();
    const project = createMorphProject(rawFiles);

    // GraphQL
    await updateGraphQL({
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
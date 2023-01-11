import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { updateGraphQL } from "./updateGraphQL";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { updateAdminApp } from "./updateAdminApp";
import { updateWebsite } from "./updateWebsite";

module.exports = async (context: Context) => {
    const files = setupFiles(context);
    const rawFiles = files.paths();
    const project = createMorphProject(rawFiles);

    await [updateGraphQL, updateAdminApp, updateWebsite].reduce(async (_, processor) => {
        return await processor({
            context,
            project,
            files
        });
    }, Promise.resolve());

    // Save file changes.
    await project.save();

    await prettierFormat(rawFiles);

    // await yarnInstall();
};

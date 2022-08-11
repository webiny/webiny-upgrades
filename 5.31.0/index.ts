import { Context } from "../types";
import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { getAllFiles } from "./files";
import { upgradePackages } from "./packages";
import { updateFileManager } from "./updateFileManager";
import { updateGraphQL } from "./updateGraphQL";

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

    /**
     * GraphQL
     */
    await updateGraphQL({
        context,
        project,
        files
    });

    // Save file changes.
    await project.save();

    // Upgrade packages.
    upgradePackages(context);

    // Format updated files.
    await prettierFormat(rawFiles);

    // Install dependencies.
    await yarnInstall();
};

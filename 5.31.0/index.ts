import { Context } from "../types";
import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { getAllFiles } from "./files";
import { upgradePackages } from "./packages";
import { updateFileManager } from "./updateFileManager";
import { updateGraphQL } from "./updateGraphQL";
import { updateHeadlessCms } from "./updateHeadlessCms";
import { updatePageBuilder } from "./updatePageBuilder";

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
    /**
     * Headless CMS
     */
    await updateHeadlessCms({
        context,
        project,
        files
    });
    /**
     * Page Builder
     */
    await updatePageBuilder({
        context,
        project,
        files
    });

    /**
     * React 17 upgrades
     */
    upgradePackages(context);

    // Save file changes.
    await project.save();

    // Format updated files.
    await prettierFormat(rawFiles);

    // Install dependencies.
    await yarnInstall();
};

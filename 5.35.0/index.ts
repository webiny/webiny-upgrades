import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { updateGraphQL } from "./updateGraphQL";
import { updateToEmotion11 } from "./updateToEmotion11";
import { updateAdminApp } from "./updateAdminApp";
import { updateDefaultFormLayout } from "./updateDefaultFormLayout";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { migrateThemeTypography } from "./migrateThemeTypography";
import { backupThemeFolder } from "./backupThemeFolder";

module.exports = async (context: Context) => {
    const files = setupFiles(context);
    const rawFiles = files.paths();
    const project = createMorphProject(rawFiles);

    const processors = [
/*        updateGraphQL,
        updateAdminApp,*/
        backupThemeFolder,
        migrateThemeTypography,
        updateDefaultFormLayout
    ];

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

    // Let's have an empty line between chunks of logs produced by processors.
    console.log();

    // Needed to put these here because this step is doing file modifications outside the TS morph tool
    await updateToEmotion11({
        context,
        project,
        files
    });

    await prettierFormat(rawFiles);

    await yarnInstall();
};

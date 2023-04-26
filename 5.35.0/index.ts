import { createMorphProject, prettierFormat, yarnInstall } from "../utils";
import { updateGraphQL } from "./updateGraphQL";
import { updateAdminApp } from "./updateAdminApp";
import { updateToEmotion11 } from "./updateToEmotion11";
import { updateDefaultFormLayout } from "./updateDefaultFormLayout";
import { setupFiles } from "./setupFiles";
import { Context } from "../types";
import { migrateThemeTypography } from "./migrateThemeTypography";
import { backupThemeFolder } from "./backupThemeFolder";
import { addNewFormBuilderPlugins } from "./addNewFormBuilderPlugins";

const SEPARATE = () => console.log();

module.exports = async (context: Context) => {
    await runProcessors(
        [
            // TODO: add some logs here.
            updateGraphQL,
            updateAdminApp,
            SEPARATE,

            migrateThemeTypography.start,
            backupThemeFolder,
            migrateThemeTypography.main,
            migrateThemeTypography.manualTypographyMigration,
            migrateThemeTypography.removeThemeImports,
            updateDefaultFormLayout,
            migrateThemeTypography.finalize,

            SEPARATE,
            updateToEmotion11,

            SEPARATE,
            addNewFormBuilderPlugins,
        ],
        context
    );

    SEPARATE();

    // Format files.
    const files = setupFiles(context);
    await prettierFormat(files.paths());

    // Install dependencies.
    await yarnInstall();
};

// Run processors in sequence.
const runProcessors = async (processors, context) => {
    for (let i = 0; i < processors.length; i++) {
        const processor = processors[i];

        const files = setupFiles(context);
        const rawFiles = files.paths();
        const project = createMorphProject(rawFiles);

        await processor({
            context,
            project,
            files
        });

        // Save file changes.
        await project.save();
    }
};

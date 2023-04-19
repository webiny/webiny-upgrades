import { Project } from "ts-morph";
import { Context } from "../types";
import { Files } from "../utils";
import {
    getAppThemeSourceFile,
    getTypographyVariableDeclaration,
    legacyTypographyCanBeMigrated,
    mapToNewTypographyStyles,
    typographyIsAlreadyMigrated
} from "./themeTypographyMigration/themeMigration";
import { themeMigrationFilesSetup } from "./themeTypographyMigration/themeMigrationFilesSetup";
import { migrateFile } from "./themeTypographyMigration/migrateFile";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const migrateThemeTypography = async (params: Params): Promise<void> => {
    const { context, project } = params;

    context.log.info(
        `Migrating existing typography styles in the theme object (%s).`,
        "apps/theme/theme.ts"
    );

    // Get the theme file and typography object
    const themeSourceFile = getAppThemeSourceFile(context, project);

    if (!themeSourceFile) {
        context.log.warning(
            "Theme typography styles migration canceled. Cannot find %s file.",
            "apps/theme/theme.ts"
        );
        return;
    }

    const typographyVariable = getTypographyVariableDeclaration(themeSourceFile);
    if (!typographyVariable) {
        context.log.warning(
            `Theme's typography styles can't be found in apps/theme/theme.ts file.`
        );
        return;
    }
    context.log.debug(`Legacy typography object is found, proceed with migration...`);

    context.log.debug("Check if theme is already migrated...");
    const alreadyMigratedResult = typographyIsAlreadyMigrated(typographyVariable);

    if (!alreadyMigratedResult) {
        context.log.warning("Fail to check if typography styles are already migrated...");
        context.log.warning("Type of the typography variable need to be object.");
        return;
    }

    if (alreadyMigratedResult.isFullyMigrated) {
        context.log.info(alreadyMigratedResult.info);
        return;
    }

    //We can't proceed with the migration to not mess the object
    if (alreadyMigratedResult.isPartlyMigrated) {
        context.log.info(alreadyMigratedResult.info);
        return;
    }

    context.log.debug("Migrated typography styles not found, proceed with migration process...");
    const result = legacyTypographyCanBeMigrated(typographyVariable);
    if (!result.isReadyForMigration) {
        context.log.info(result.info);
        return;
    }

    context.log.debug("Theme's typography styles are ready to be migrated...");

    /*
     * MIGRATE THE THEME OBJECT
     */
    context.log.debug(`Map legacy typography object to new structure...`);
    const typographyMappingResult = mapToNewTypographyStyles(typographyVariable, context);

    if (!typographyMappingResult.isSuccessfullyMapped) {
        context.log.warning(typographyMappingResult.info);
        return;
    }

    /*
     * MIGRATE THE REST OF SOLUTION THAT HAVE ACCESS TO THE THEME
     */

    // This map will help to determinate the typography type (headings, paragraphs...)
    // for user's custom style keys

    const styleIdToTypographyTypeMap = typographyMappingResult.styleIdTopographyType;
    context.log.debug(`Migrate solution files...`);
    const migrationDefinitions = themeMigrationFilesSetup(context);
    for (const definition of migrationDefinitions) {
        migrateFile(definition, styleIdToTypographyTypeMap, project, context);
    }

    context.log.success(`Typography styles migrated.`);
};

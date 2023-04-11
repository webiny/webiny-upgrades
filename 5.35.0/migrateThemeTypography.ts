import { Project } from "ts-morph";
import { Context } from "../types";
import { Files } from "../utils";
import {
    createStyleIdToTypographyTypeMap,
    getAppThemeSourceFile,
    getTypographyObject,
    legacyTypographyCanBeMigrated,
    mapToNewTypographyStyles,
    setMigratedTypographyInSourceFile,
    typographyIsAlreadyMigrated
} from "./themeTypographyMigration/themeMigration";
import { themeMigrationSetupFiles } from "./themeTypographyMigration/themeMigrationSetupFiles";
import { migrateFile } from "./themeTypographyMigration/migrateFile";
import { createThemeUpgradeBackup } from "./themeTypographyMigration/createThemeUpgradeBackup";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const migrateThemeTypography = async (params: Params): Promise<void> => {
    const { context, project } = params;

    context.log.info(`Upgrading Webiny theme to new typography styles...`);

    context.log.debug(`Checking the legacy theme object...`);
    // Get the theme file and typography object
    const themeSourceFile = getAppThemeSourceFile(context, project);
    const legacyTypography = getTypographyObject(themeSourceFile);

    /*
     * CHECK AND VALIDATE THE LEGACY THEME BEFORE MIGRATION
     */
    if (!legacyTypography) {
        context.log.info(
            `Constant with name 'typography', can't be found in App/Theme/theme.ts file.`
        );
        return;
    }

    if (typographyIsAlreadyMigrated(legacyTypography)) {
        context.log.info(`Theme's typography styles are already migrated.`);
        return;
    }

    if (!legacyTypographyCanBeMigrated(legacyTypography)) {
        context.log.info(
            `Current theme typography can't be migrated, detected custom object structure.`
        );
        return;
    }

    context.log.debug(`Back up legacy theme files...`);
    const backupResult = await createThemeUpgradeBackup(context);
    if (backupResult.isSuccessful) {
        context.log.info(
            `Theme backup for the legacy typography styles successfully created. 
            Backup folder path: /apps/_theme_typography_backup`
        );
        return;
    } else {
        context.log.info(`Theme migrations is canceled, can't create backup fot the legacy theme`);
        return;
    }

    /*
     * MIGRATE THE THEME OBJECT
     */
    context.log.debug(`Map legacy typography object to new structure...`);
    const typographyMappingResult = mapToNewTypographyStyles(legacyTypography, context);

    if (!typographyMappingResult.isSuccessfullyMapped) {
        context.log.info(typographyMappingResult.info);
        return;
    }
    context.log.debug(`Legacy typography object is successfully mapped.`);

    /*
    /* ---- SET THE MAPPED OBJECT IN SOURCE FILE ----
     */

    const migratedTypography = typographyMappingResult.typography;

    const setInSourceResult = setMigratedTypographyInSourceFile(
        themeSourceFile,
        migratedTypography
    );

    if (!setInSourceResult.isSuccessful) {
        context.log.info(setInSourceResult.info);
        return;
    }

    context.log.debug(
        "Mapped typography styles object successfully set in App/theme/theme.ts file."
    );

    /*
     * MIGRATE THE REST OF SOLUTION THAT HAVE ACCESS TO THE THEME
     */

    // This map will help to determinate the typography type (headings, paragraphs...)
    // for user's custom style keys
    const styleIdToTypographyTypeMap = createStyleIdToTypographyTypeMap(migratedTypography);

    context.log.debug(`Migrate the legacy typography statements, imports and interfaces...`);
    const migrationDefinitions = themeMigrationSetupFiles(context);
    for (const definition of migrationDefinitions) {
        const result = migrateFile(definition, styleIdToTypographyTypeMap, project, context);
        // log message if file is not successfully migrated
        if (result.skipped || !result.isSuccessfullyMigrated) {
            context.log.info(result.info);
            return;
        }
    }

    context.log.success(`Cheers! You have successfully upgraded to new Webiny typography styles.`);
};

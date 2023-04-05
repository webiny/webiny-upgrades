import { Project } from "ts-morph";
import { Context } from "../types";
import { Files } from "../utils";
import {
    getAppThemeSourceFile,
    getTypographyObject,
    legacyTypographyCanBeMigrated,
    mapToNewTypographyStyles, setMigratedTypographyInSourceFile,
    typographyIsAlreadyMigrated
} from "./themeTypographyMigration/themeMigration";
import { migrationFileDefinitions } from "./themeTypographyMigration/migrationFileDefinitions";
import { migrateFile } from "./themeTypographyMigration/migrateFile";
import * as console from "console";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateThemeTypography = async (params: Params): Promise<void> => {
    const { context, project } = params;

    context.log.info(`Upgrading Webiny theme to new typography styles.`);
    context.log.info(`Checking the legacy theme object...`);

    // Get the theme file and typography object
    const themeSourceFile = getAppThemeSourceFile(context, project);
    const legacyTypography = getTypographyObject(themeSourceFile);

    /*
     * CHECK AND VALIDATE THE LEGACY THEME BEFORE MIGRATION
     */
    if (!legacyTypography) {
        context.log.error(
            `Constant with name 'typography', can't be found in App/Theme/theme.ts file.`
        );
        return;
    }

    if (typographyIsAlreadyMigrated(legacyTypography)) {
        context.log.error(`Theme's typography styles are already migrated.`);
        return;
    }

    if (!legacyTypographyCanBeMigrated(legacyTypography)) {
        context.log.error(
            `Current theme typography can't be migrated, detected custom object structure.`
        );
        return;
    }

    context.log.info(`Legacy typography object structure can be migrated.`);

    /*
     * MIGRATE THE THEME OBJECT
     */
    context.log.info(`Map legacy typography object to new structure...`);
    const typographyMappingResult = mapToNewTypographyStyles(legacyTypography);

    if(!typographyMappingResult.isSuccessfullyMapped){
        context.log.info(typographyMappingResult.info);
        return;
    }
    context.log.info(`Legacy typography object is successfully mapped.`);

    // SET IN SOURCE CODE
    const migratedTypography = typographyMappingResult.typography;
    const setInSourceResult = setMigratedTypographyInSourceFile(themeSourceFile, migratedTypography);
    context.log.info(setInSourceResult.info);
    if(!setInSourceResult.isSuccessful){
        return;
    }


    /*
     * MIGRATE THE REST OF SOLUTION THAT HAVE ACCESS TO THE THEME
     */
    context.log.info(
        `Migrate the typography style expressions, imports and interfaces in the solution...`
    );
    const migrationDefinitions = migrationFileDefinitions(context);
    migrationDefinitions.forEach(definition => {
        const result = migrateFile(definition, project);
        // log message if file is not successfully migrated
        if (result.skipped || !result.isSuccessfullyMigrated) {
            context.log.info(result.info);
        }
    });

    context.log.success(`Cheers! You have successfully upgraded to new Webiny typography styles.`);
};

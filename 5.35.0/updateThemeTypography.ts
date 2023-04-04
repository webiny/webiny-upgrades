import { Project } from "ts-morph";
import { Context } from "../types";
import { Files } from "../utils";
import {
    getAppThemeSourceFile,
    getTypographyObject,
    legacyTypographyCanBeMigrated, typographyIsAlreadyMigrated
} from "./themeTypographyMigration/themeMigration";
import {migrationFileDefinitions} from "./themeTypographyMigration/migrationFileDefinitions";
import {migrateFile} from "./themeTypographyMigration/migrateFile";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateThemeTypography = async (params: Params): Promise<void> => {
    const { context, project, files } = params;

    context.log.info(`Upgrading Webiny theme to new typography styles.`);
    context.log.info(`Check if current theme can be migrated`);

    // Get the theme file and typography object
    const themeSourceFile = getAppThemeSourceFile(context, project);
    const typographyObject = getTypographyObject(themeSourceFile);

    /*
    * CHECK AND VALIDATE THE LEGACY THEME BEFORE MIGRATION
    */
    if(!typographyObject){
        context.log.error(`Constant with name 'typography', can't be found in App/Theme/theme.ts file.`);
        return;
    }

    if(typographyIsAlreadyMigrated(typographyObject)) {
        context.log.error(`Theme's typography styles are already migrated.`);
        return;
    }

    const canBeMigrated = legacyTypographyCanBeMigrated(typographyObject);
    if(!canBeMigrated) {
        context.log.error(`Current theme can't be migrated, typography has no defined styles.`);
        return;
    }

    /*
    * MIGRATE THE SOLUTION
    */
    context.log.info(`Start theme migration...`);
    const migrationDefinitions = migrationFileDefinitions(context);
    migrationDefinitions.forEach(fileDefinition => {
        const result = migrateFile(fileDefinition, project);
        // log message if file is not successfully migrated
        if(result.skipped || !result.isSuccessfullyMigrated) {
            context.log.info(result.info);
        }
    });



    // Check if exist and take the legacy theme object
    context.log.warning(`Can't find the legacy "theme" object in Admin/App/theme file.`);
    // Check if typography object exist or users implemented custom theme object.




    // everything is upgraded with success - remove legacy object from the theme
    context.log.info(`Legacy "theme" object is removed from Admin/App/theme file.`);

    context.log.success(`Successfully upgraded to new Webiny theme typography object structure`);
};

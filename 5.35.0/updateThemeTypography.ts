import { Project } from "ts-morph";
import { Context } from "../types";
import { Files } from "../utils";
import {
    getAppThemeSourceFile,
    getThemeObject,
    legacyThemeCanBeMigrated
} from "./themeTypographyMigration/themeMigration";
import {migrationFileDefinitions} from "./themeTypographyMigration/migrationFileDefinitions";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateThemeTypography = async (params: Params): Promise<void> => {
    const { context, project, files } = params;

    context.log.info(`Upgrading Webiny theme to new typography styles.`);
    context.log.info(`Check if current theme can be migrated`);

    const themeSourceFile = getAppThemeSourceFile(context, project);
    const theme = getThemeObject(themeSourceFile);
    if(!theme){
        context.log.error(`Constant with name 'theme', can't be found in App/Theme/theme.ts file.`);
    }
    const canBeMigrated = legacyThemeCanBeMigrated(theme);
    if(!canBeMigrated) {
        context.log.error(`Current theme can't be migrated, typography has no defined styles.`);
    }


    // Migration of the solution
    context.log.info(`Start theme migration`);
    const fileDefinitions = migrationFileDefinitions(context);
    for (let i = 0; i < fileDefinitions.length - 1; i++) {
        
    }
    

    // * check th theme -
    // 1. if typography exist
    // 2. Check if you can access to legacy styles

    // * Map the theme to new structure
    // 1. For the same key copy the existing style of the user
    //  - if the key does not contain the default names try to find the heading, paragraph in the name
    // by default create paragraph styles
    //

    // Check if exist and take the legacy theme object
    context.log.warning(`Can't find the legacy "theme" object in Admin/App/theme file.`);
    // Check if typography object exist or users implemented custom theme object.



    context.log.error("`Can't find the \"typography\" property from createTheme factory.`");
    const isTypography = false;
    if(!isTypography) {
        context.log.info(`Do you have custom implementation for the Webiny theme?`);
        context.log.info(`Webiny upgrade for the theme typography styles is canceled, 
        please check the changelog for the new theme before upgrading to version 5.35`);
        return;
    }

    // Take typography keys from the legacy theme and store in the memory

    // Match the legacy theme.styles.typography["heading1"]
    context.log.info(`Detected cutom typograpy key`);

    // everything is upgraded with success - remove legacy object from the theme
    context.log.info(`Legacy "theme" object is removed from Admin/App/theme file.`);

    context.log.success(`Successfully upgraded to new Webiny theme typography object structure`);
};

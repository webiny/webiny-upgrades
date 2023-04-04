import {Context} from "../../types";
import {Project, SourceFile, ts} from "ts-morph";
import {createFilePath, FileDefinition, getSourceFile} from "../../utils";

const APP_THEME_FILE_PATH = "${theme}/theme.ts";

/*
* ----- SOURCE FILE SETUP FOR THEME ----- ß
*/

export const getAppThemeSourceFile = (context: Context, project: Project): SourceFile => {
    const file = new FileDefinition(
        {
            path: createFilePath(context, APP_THEME_FILE_PATH),
            tag: "theme",
            "name": "/theme.ts"
        }
    );
    return getSourceFile(project, file.path);
}


// Extract theme object from the source file
/*
* Get theme object from theme file
**/
export const getTypographyObject = (appThemeSourceFile: SourceFile): Record<string, any> | undefined => {
    if(!appThemeSourceFile) {
        return undefined;
    }
    const variable = appThemeSourceFile.getVariableDeclarationOrThrow("typography");
    if(!variable) { return undefined; }
    const themeObject = variable.getInitializerIfKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression);
    return themeObject.getProperties();
}

const updateSourceFileWithMigratedTheme = (sourceFile: SourceFile, theme: Record<string, any>) => {

}

/*
* ----- MANIPULATION WITH THEME OBJECT ----
*/

/*
* @desc Check if user have the theme and typography prop
* */
export const hasTypographyProp = (themeObject: Record<string, any>): boolean => {
    return themeObject?.styles?.typography !== undefined;
}

/*
* @desc Check if legacy typography object has at least one key for migration
* */
export const legacyThemeCanBeMigrated = (themeObject: Record<string, any>): boolean => {
    if(!hasTypographyProp(themeObject)) {
        return false;
    }
    const typography = themeObject.styles.typography;
    // check if typography has at least one key
    return !!Object.keys(typography).length
}

export type TypographyObjectMigrationResult = {
    typography: Record<string, any>,
    hasCustomStylesDetected: boolean;
    isSuccessfullyMigrated: boolean
}

const migrateToNewTheme = (typography: Record<string, any>): TypographyObjectMigrationResult => {
    if(!typography) {
        return {
            typography,
            hasCustomStylesDetected: false,
            isSuccessfullyMigrated: false
        };
    }
}

export const typographyIsAlreadyMigrated = (typography: Record<string, any>): boolean => {

    if(!typography) {
        return false;
    }

    const headings = typography?.headings;
    const paragraphs = typography?.paragraphs;
    const lists = typography?.lists;
    const quotes = typography?.qotes;

    // if at least one of the new typography styles is present and arrray is detected
    // in that case the theme is already
    if(!!(headings && Array.isArray(headings)) ||
        !!(paragraphs && Array.isArray(paragraphs)) ||
        !!(lists && Array.isArray(lists)) ||
        !!(quotes && Array.isArray(quotes))) {
        return true;
    }

    return false;
}









import {Context} from "../../types";
import {Project, SourceFile} from "ts-morph";
import {createFilePath, FileDefinition, getSourceFile} from "../../utils";

const APP_THEME_FILE_PATH = "${theme}/theme";

/*
* ----- SOURCE FILE SETUP FOR THEME ----- ß
*/

type TypographyStyle = {
    id: string;
    name: string; // display name for the user
    tag: string
    css: Record<string, any>
}

export const getAppThemeSourceFile = (context: Context, project: Project): SourceFile => {
    const file = new FileDefinition(
        {
            path: createFilePath(context, APP_THEME_FILE_PATH),
            tag: "theme",
            "name": "/theme"
        }
    );
    return getSourceFile(project, file.path);
}


// Extract theme object from the source file
/*
* Get theme object from theme file
**/
export const getThemeObject = (appThemeSourceFile: SourceFile): Record<string, any> | undefined => {
    if(!appThemeSourceFile) {
        return undefined;
    }
    const variable = appThemeSourceFile.getVariableDeclaration("theme");
    if(!variable) { return undefined; }
    const themeObject = variable.getStructure();
    return themeObject;
}

const updateSourceFileWithMigratedTheme = () => {

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

const migrateToNewTheme = (theme: Record<string, any>): Record<string, any> => {
    if(!theme) {
        return theme;
    }
}











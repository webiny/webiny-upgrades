import { Context } from "../../types";
import { Project, SourceFile, ts } from "ts-morph";
import { createFilePath, FileDefinition, getSourceFile } from "../../utils";
import {Typography, typographyKeyToHtmlTagMapping, TypographyStyle} from "./definitions";

const APP_THEME_FILE_PATH = "${theme}/theme.ts";

/*
 * ----- SOURCE FILE SETUP FOR THEME ----- ß
 */

export const getAppThemeSourceFile = (context: Context, project: Project): SourceFile => {
    const file = new FileDefinition({
        path: createFilePath(context, APP_THEME_FILE_PATH),
        tag: "theme",
        name: "/theme.ts"
    });
    return getSourceFile(project, file.path);
};

// Extract theme object from the source file
/*
 * Get theme object from theme file
 **/
export const getTypographyObject = (
    appThemeSourceFile: SourceFile
): Record<string, any> | undefined => {
    if (!appThemeSourceFile) {
        return undefined;
    }
    const variable = appThemeSourceFile.getVariableDeclarationOrThrow("typography");
    if (!variable) {
        return undefined;
    }
    const themeObject = variable.getInitializerIfKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression);
    return themeObject.getProperties();
};

const updateSourceFileWithMigratedTheme = (
    sourceFile: SourceFile,
    theme: Record<string, any>
) => {};

/*
 * ----- MANIPULATION WITH THEME OBJECT ----
 */

/*
 * @desc Check if user have the theme and typography prop
 * */
export const hasTypographyProp = (typography: Record<string, any>): boolean => {
    return typography !== undefined;
};

/*
 * @desc Check if legacy typography object has at least one key for migration
 * */
export const legacyTypographyCanBeMigrated = (typography: Record<string, any>): boolean => {
    if (!hasTypographyProp(typography)) {
        return false;
    }

    // check if typography has at least one key
    if (!!Object.keys(typography).length) {
        for (const key in typography) {
            const typographyObject = typography[key];
            // Must be object and not array
            if (!(typeof typographyObject === "object" && !Array.isArray(typographyObject))) {
                return false;
            }
            // Must be object and not an iteration object lie Set, Map...
            if (!(typeof typographyObject === "object" && !(Symbol.iterator in typographyObject))) {
                return false;
            }
        }
        return true;
    }
    return false;
};

export type TypographyObjectMigrationResult = {
    /*
     * @desc: New migrated typography object
     */
    typography: Record<string, any>;
    hasCustomStylesDetected: boolean;
    isSuccessfullyMigrated: boolean;
};

export const mapToNewTypographyStyle = (legacyKey: string, css: Record<string, any>): TypographyStyle | undefined => {

    if(!legacyKey) { return undefined; }
    if(!css) { return undefined; }

    return {
        id: legacyKey,
        name: legacyKey,
        tag: typographyKeyToHtmlTagMapping[legacyKey] || "p", // if key is not found by default will be paragraph tag
        css
    }
}

export const migrateToNewTheme = (legacyTypography: Record<string, any>): TypographyObjectMigrationResult => {
    if (!legacyTypography) {
        return {
            typography: legacyTypography,
            hasCustomStylesDetected: false,
            isSuccessfullyMigrated: false
        };
    }

    let newTypography: Typography = {
        headings: [],
        paragraphs: [],
        lists: [],
        quotes: []
    }

    for (const key in legacyTypography) {
        const css = legacyTypography[key];
        let newTypography = mapToNewTypographyStyle(key, css);
    }
};

export const typographyIsAlreadyMigrated = (typography: Record<string, any>): boolean => {
    if (!typography) {
        return false;
    }

    // check if typography has at least one key
    if (!!Object.keys(typography).length) {
        for (const key in typography) {
            const typographyStyle = typography[key];
            // Must be object and not array
            if (Array.isArray(typographyStyle) && typographyStyle?.length > 0) {
                for (let i = 0; i < typographyStyle.length - 1; i++) {
                    const style = typographyStyle[i];
                    // check the current
                    if (
                        !(
                            style.hasOwnProperty("id") &&
                            style.hasOwnProperty("name") &&
                            style.hasOwnProperty("tag") &&
                            style.hasOwnProperty("css")
                        )
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    return false;
};

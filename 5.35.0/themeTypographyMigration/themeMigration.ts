import { Context } from "../../types";
import { Project, SourceFile, ts } from "ts-morph";
import { createFilePath, FileDefinition, getSourceFile } from "../../utils";
import {
    htmlTagToTypographyTypeMapping,
    Typography,
    typographyKeyToHtmlTagMapping,
    TypographyStyle
} from "./definitions";

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

    const typographyVariable = variable.getInitializerIfKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression);

    // Parse the typography object
    let typographyObject;
    try {
        typographyObject = JSON.parse(typographyVariable?.getFullText()) ?? undefined;
    } catch(e) {
        typographyObject = undefined;
    }
    return typographyObject;
};


export type SetMigratedTypographyResult = {
    isSuccessful: boolean,
    info?: string;
}

export const setMigratedTypographyInSourceFile = (
    appThemeSourceFile: SourceFile,
    migratedTypography: Record<string, any>
): SetMigratedTypographyResult => {

    if(!migratedTypography) {
        return { isSuccessful: false, info: "Migrated typography object can't be set in source file, 'migratedTypography' is undefined." }
    }
    if (!appThemeSourceFile) {
        return undefined;
    }
    // take the variable
    const variable = appThemeSourceFile.getVariableDeclarationOrThrow("typography");
    if (!variable) {
        return { isSuccessful: false, info: "Migrated typography object can't be set in source file, variable 'typography' is not found." }
    }
    // set new objet

    try {
        const typography = JSON.stringify(migratedTypography);
        variable.set({ initializer: typography });
    } catch (e) {
        return { isSuccessful: false, info: "Migrated typography is not set in source file. Can't be parsed and set to the variable." }
    }
    return { isSuccessful: true, info: "Migrated typography successfully set in source file." }
};

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

export const mapToNewTypographyStyle = (
    legacyKey: string,
    css: Record<string, any>
): TypographyStyle | undefined => {
    if (!legacyKey) {
        return undefined;
    }
    if (!css) {
        return undefined;
    }

    // Webiny default defined keys and tags
    let tag = typographyKeyToHtmlTagMapping[legacyKey];

    // If tag is not present the key is custom name set by the user
    if (!tag) {
        // try to find a proper tag by checking if the key includes names like heading, list...
        // example for custom name. ZyxHeading, ZyXList
        const customKey = legacyKey.toLowerCase();
        if (customKey.includes("heading")) {
            tag = typographyKeyToHtmlTagMapping["heading1"];
        }
        if (customKey.includes("paragraph")) {
            tag = typographyKeyToHtmlTagMapping["paragraph1"];
        }
        if (customKey.includes("list")) {
            tag = typographyKeyToHtmlTagMapping["list"];
        }
        if (customKey.includes("quote")) {
            tag = typographyKeyToHtmlTagMapping["quote"];
        }
    }

    return {
        id: legacyKey,
        name: legacyKey,
        tag: tag || "p", // if key is not found by default will be paragraph tag
        css
    };
};

export type TypographyObjectMigrationResult = {
    /*
     * @desc: New migrated typography object
     */
    typography: Record<string, any>;
    isSuccessfullyMigrated: boolean;
    info?: string;
};

export const migrateToNewTypographyStyles = (
    legacyTypography: Record<string, any>
): TypographyObjectMigrationResult => {
    if (!legacyTypography) {
        return {
            typography: legacyTypography,
            isSuccessfullyMigrated: false,
            info: "Legacy typography object is undefined, migration is canceled"
        };
    }

    const newTypography: Typography = {
        headings: [],
        paragraphs: [],
        lists: [],
        quotes: []
    };

    // map all legacy styles
    for (const key in legacyTypography) {
        const css = legacyTypography[key];
        const style = mapToNewTypographyStyle(key, css);
        const typographyType = htmlTagToTypographyTypeMapping[style.tag];
        newTypography[typographyType].push(style);
    }

    return {
        typography: newTypography,
        isSuccessfullyMigrated: true
    };
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

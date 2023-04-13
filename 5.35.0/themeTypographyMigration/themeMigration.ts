import {Context} from "../../types";
import {
    ArrayLiteralExpression,
    ObjectLiteralExpression,
    Project,
    PropertyAssignment,
    SourceFile,
    SyntaxKind,
    VariableDeclaration
} from "ts-morph";
import {
    htmlTagToTypographyTypeMapping,
    StyleIdToTypographyTypeMap,
    Typography,
    typographyKeyToHtmlTagMapping,
    TypographyStyle,
    TypographyType
} from "./migrationTypes";
import {getObjectLiteralExpressionValue} from "./propertyAsigment/getObjectLiteralExpressionValue";
import {validate} from "json-schema";

/*
 * ----- SOURCE FILE SETUP FOR THEME ----- ß
 */

export const getAppThemeSourceFile = (context: Context, project: Project): SourceFile => {
    return project.getSourceFile("theme.ts");
};

// Extract theme object from the source file
/*
 * Get theme object from theme file
 **/
export const getTypographyVariableDeclaration = (
    appThemeSourceFile: SourceFile
): VariableDeclaration | undefined => {
    if (!appThemeSourceFile) {
        return undefined;
    }

    const variable = appThemeSourceFile.getVariableDeclaration("typography");
    if (!variable) {
        return undefined;
    }
    return variable;
    //TODO: check one more place as inline declaration inside the createTheme factory function
};

export const mapLegacyTypographyObject = (
    variable: VariableDeclaration,
    context: Context
): Record<string, ObjectLiteralExpression> => {
    const typographyObject: Record<string, any> = {};
    const typographyObjetExpression = variable.getInitializerIfKind(
        SyntaxKind.ObjectLiteralExpression
    );

    if (!typographyObjetExpression) {
        context.log.info(
            "Typography styles upgrade is canceled, typography object has custom data structure."
        );
        return undefined;
    }
    const props = typographyObjetExpression.getProperties();

    // map the first level props to object literal property,
    // with that we can manipulate the object
    for (const objectProp of props) {
        if (objectProp.getKind() === SyntaxKind.PropertyAssignment) {
            const propAssigment = objectProp as PropertyAssignment;
            const propName = propAssigment.getSymbol().getName();
            const propInitializer = propAssigment.getInitializer();

            if (propInitializer) {
                const propInitializerKind = propInitializer.getKind();
                if (propName && propInitializerKind === SyntaxKind.ObjectLiteralExpression) {
                    typographyObject[propName] = objectProp;
                }
            }
        }
    }

    // create the
    return typographyObject;
};

export type SetMigratedTypographyResult = {
    isSuccessful: boolean;
    info?: string;
};

export const setMigratedTypographyInSourceFile = (
    appThemeSourceFile: SourceFile,
    migratedTypography: Record<string, any>
): SetMigratedTypographyResult => {
    if (!migratedTypography) {
        return {
            isSuccessful: false,
            info: "New typography object can't be set in source file, 'migratedTypography' is undefined."
        };
    }
    if (!appThemeSourceFile) {
        return undefined;
    }
    // take the variable
    const variable = appThemeSourceFile.getVariableDeclaration("typography");
    if (!variable) {
        return {
            isSuccessful: false,
            info: "New typography object can't be set in source file, variable 'typography' is not found."
        };
    }

    // set new objet
    try {
        const typography = JSON.stringify(migratedTypography);
        variable.set({ initializer: typography });
    } catch (e) {
        return {
            isSuccessful: false,
            info: "New typography is not set in source file. Can't be parsed and set to the variable."
        };
    }
    return { isSuccessful: true };
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


export type legacyTypographyCanBeMigratedResult = {
    isReadyForMigration: boolean
    info?: string;
}

/*
 * @desc Check if legacy typography object has at least one key for migration
 * */
export const legacyTypographyCanBeMigrated = (typography: VariableDeclaration): legacyTypographyCanBeMigratedResult => {

    if (!typography) {
        return {
            isReadyForMigration: false,
            info: "Theme's typography migration is canceled, legacy typography variable not found."
        };
    }

    const typographyObjetExpression = typography.getInitializerIfKind(
        SyntaxKind.ObjectLiteralExpression
    );

    if(!typographyObjetExpression){
        return {
            isReadyForMigration: false,
            info: "Theme's typography migration is canceled, typography variable does not contain the legacy typography object structure."
        };
    }

    const props = typographyObjetExpression.getProperties();

    if(props.length === 0){
        return {
            isReadyForMigration: false,
            info: "Theme's typography migration is canceled, typography variable does not contain style properties."
        };
    }

    // Keeps the names of the properties with custom objects that not match the
    // migration policy
    const customStructureProps = [];

    /*
    * To match the legacy object we need to have property with object value
    * other that we will consider as custom implementation of the typography styles
    */
    for (const objectProp of props) {
        if (objectProp.getKind() === SyntaxKind.PropertyAssignment) {
            const propAssigment = objectProp as PropertyAssignment;
            const propName = propAssigment.getSymbol().getName();
            // Check if that property have array as value
            const propertyInitializer = propAssigment.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
            if(!propertyInitializer) {
                customStructureProps.push(propName);
            }
        }
    }

    const isReadyForMigration = customStructureProps.length === 0;

    return {
        isReadyForMigration,
        info: isReadyForMigration ? "" : `Theme's typography migration is canceled, detected
         custom implementation for following properties: ${customStructureProps.join(", ")}`
    };
};

export const mapToNewTypographyStyle = (
    legacyKey: string,
    css: Record<string, any>,
    context: Context
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
        switch (true) {
            case customKey.includes("heading"):
                tag = typographyKeyToHtmlTagMapping["heading1"];
            case customKey.includes("paragraph"):
                tag = typographyKeyToHtmlTagMapping["paragraph1"];
            case customKey.includes("list"):
                tag = typographyKeyToHtmlTagMapping["list"];
            case customKey.includes("quote"):
                tag = typographyKeyToHtmlTagMapping["quote"];
            default:
                context.log.warning(
                    `We couldn't map your custom key ${customKey} to the new structure, please add manually.`
                );
        }
    }

    return {
        id: legacyKey,
        name: legacyKey,
        tag: tag || "p", // if key is not found by default will be paragraph tag
        css
    };
};

export type TypographyObjectMapResult = {
    /*
     * @desc: New migrated typography object
     */
    typography?: Typography;
    isSuccessfullyMapped: boolean;
    info?: string;
};

export const mapToNewTypographyStyles = (
    legacyTypography: Record<string, any>,
    context: Context
): TypographyObjectMapResult => {
    if (!legacyTypography) {
        return {
            isSuccessfullyMapped: false,
            info: "Legacy typography object is undefined, migration is canceled."
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
        const style = mapToNewTypographyStyle(key, css, context);
        if (style) {
            const typographyType = htmlTagToTypographyTypeMapping[style.tag];
            newTypography[typographyType].push(style);
        }
    }

    return {
        typography: newTypography,
        isSuccessfullyMapped: true
    };
};

type AlreadyMigratedResult = {
    isFullyMigrated: boolean,
    isPartlyMigrated: boolean,
    isNotMigrated: boolean;
    info?: string;
}

export const typographyIsAlreadyMigrated = (typography: VariableDeclaration): AlreadyMigratedResult | undefined => {

    if (!typography) {
        return undefined;
    }

    const typographyObjetExpression = typography.getInitializerIfKind(
        SyntaxKind.ObjectLiteralExpression
    );

    const newThemePropNames = [
        "headings",
        "paragraphs",
        "lists",
        "quotes"
    ];

    const partialMigration: string[] = [];
    const fullMigration: string[] = [];


    const props = typographyObjetExpression.getProperties();

    // map the first level props to object literal property,
    // with that we can manipulate the object
    for (const objectProp of props) {

        if (objectProp.getKind() === SyntaxKind.PropertyAssignment) {

            const propAssigment = objectProp as PropertyAssignment;
            const propName = propAssigment.getSymbol().getName();

            // if the name is not part of the new property name styles
            // continue with the next prop
            if(!newThemePropNames.includes(propName)) {
                continue;
            }

            // Check if that property have array as value
            const arrayLiteralExpression = propAssigment.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);

            // headings and other props are arrays in the new mapped type
            if(arrayLiteralExpression) {

                const elements = arrayLiteralExpression.getElements();
                if(elements.length === 0) {
                    // for empty array we consider full migration
                    fullMigration.push(propName);
                    continue;
                }

                    let allStylesAreMigrated = true;
                    let hasAtLeastOneStyleMatch = false;
                    for (const element of elements) {
                        if(element.getKind() === SyntaxKind.ObjectLiteralExpression) {
                            const style = getObjectLiteralExpressionValue(element as ObjectLiteralExpression, true);
                            if (!(
                                    style.hasOwnProperty("id") &&
                                    style.hasOwnProperty("name") &&
                                    style.hasOwnProperty("tag") &&
                                    style.hasOwnProperty("css")

                            )) {
                                if(allStylesAreMigrated) {
                                    allStylesAreMigrated = false;
                                }
                            } else {
                                hasAtLeastOneStyleMatch = true;
                            }
                        }
                    }

                    if(allStylesAreMigrated) {
                        fullMigration.push(propName);
                    }

                    if(!allStylesAreMigrated && hasAtLeastOneStyleMatch){
                        partialMigration.push(propName);
                    }
            }
        }
    }

    const isFullyMigrated = fullMigration.length >= newThemePropNames.length;
    const isPartlyMigrated = (fullMigration.length > 0 && partialMigration.length >= 0 || partialMigration.length > 0);

    let info = "";
    if(isPartlyMigrated) {
        info = `Theme's typography style upgrade canceled. Typography styles are partially migrated, 
        following properties match the new styles: ${fullMigration.concat(partialMigration).join(", ")}`
    }

    if(isFullyMigrated) {
        info = "Theme's typography styles are already migrated";
    }

    return {
        isFullyMigrated,
        isPartlyMigrated,
        isNotMigrated: !isFullyMigrated && !isPartlyMigrated,
        info
    };
};

/*
 * Map style id to typography type
 * Example { heading1: "headings" }
 * */
export const createStyleIdToTypographyTypeMap = (
    migratedTypography: Typography
): StyleIdToTypographyTypeMap | undefined => {
    if (!migratedTypography) {
        return undefined;
    }

    const map: StyleIdToTypographyTypeMap = {};
    for (const key in migratedTypography) {
        const styles = migratedTypography[key];
        styles.forEach(style => {
            map[style.id] = key as TypographyType;
        });
    }

    return map;
};

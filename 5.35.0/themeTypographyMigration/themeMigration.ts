import {Context} from "../../types";
import {
    ObjectLiteralExpression, ObjectLiteralExpressionPropertyStructures,
    Project,
    PropertyAssignment, PropertyAssignmentStructure,
    SourceFile,
    SyntaxKind,
    VariableDeclaration
} from "ts-morph";
import {
    htmlTagToTypographyTypeMapping,
    StyleIdToTypographyTypeMap,
    Typography,
    typographyKeyToHtmlTagMapping,
    TypographyType
} from "./migrationTypes";
import {getObjectLiteralExpressionValue} from "./propertyAsigment/getObjectLiteralExpressionValue";

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


/*
* Creates new Property assigment object
* */
export const mapToTypographyStructure = (
    assigment: PropertyAssignment,
    context: Context
): {
    stricture: string,
    typographyType: string,
    isCustom: boolean,
    propName:string
} | undefined => {

    const legacyKey = assigment.getStructure().name;
    if (!legacyKey) {
        return undefined;
    }
    if (!assigment) {
        return undefined;
    }

    let isCustom = false;

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
                break;
            case customKey.includes("paragraph"):
                tag = typographyKeyToHtmlTagMapping["paragraph1"];
                break;
            case customKey.includes("list"):
                tag = typographyKeyToHtmlTagMapping["list"];
                break;
            case customKey.includes("quote"):
                tag = typographyKeyToHtmlTagMapping["quote"];
                break;
            default:
                context.log.warning(
                    `We couldn't map your custom key ${customKey} to the new structure, please add manually.`
                );
                isCustom = true;
                tag = "p" // default
        }
    }

    return {
        stricture: `{ id: "${legacyKey}", name: "${legacyKey}", tag: "${tag || "p"}", css: ${assigment.getStructure().initializer} }`,
        typographyType: htmlTagToTypographyTypeMapping[tag],
        isCustom,
        propName: legacyKey
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


export type MapToNewTypographyStylesResult = {
    isSuccessfullyMapped: boolean
    typographyVariable?: VariableDeclaration,
    customPropNames?: string[],
    info?: string;
}
export const mapToNewTypographyStyles = (
    typographyVar: VariableDeclaration,
    context: Context
): MapToNewTypographyStylesResult => {

    const newTypography = {
        headings: [],
        paragraphs: [],
        lists: [],
        quotes: []
    };

    const typographyObjetExpression = typographyVar.getInitializerIfKind(
        SyntaxKind.ObjectLiteralExpression
    );

    if(!typographyObjetExpression){
        return {
            isSuccessfullyMapped: false,
            info: "Mapping process of the typography styles is canceled, typography variable does not contain the legacy typography object structure."
        };
    }

    const propertyAssignments = typographyObjetExpression.getProperties()
        .map(prop => prop.asKind(SyntaxKind.PropertyAssignment));

    if(propertyAssignments.length === 0){
        return {
            isSuccessfullyMapped: false,
            info: "Mapping process of the typography styles is canceled, typography variable does not contain style properties."
        };
    }

    // Keeps the names of the properties with custom objects that not match the
    // migration policy
    const customPropNames = [];

    /*
    * To match the legacy object we need to have property with object value
    * other that we will consider as custom implementation of the typography styles
    */
    for (const propAssignment of propertyAssignments) {
        const newObject = mapToTypographyStructure(propAssignment, context);
        if(newObject) {
            newTypography[newObject.typographyType].push(newObject.stricture);
            if(newObject.isCustom){
                customPropNames.push(newObject.propName);
            }
        }
        // remove the current assigment
        propAssignment.remove();
    }

    // add the new mapped typography types

    typographyObjetExpression.addPropertyAssignments([
        {
            name: "headings",
            initializer: `[${newTypography.headings}]`
        },
        {
            name: "paragraphs",
            initializer: `[${newTypography.paragraphs}]`
        },
        {
            name: "lists",
            initializer: `[${newTypography.lists}]`
        },
        {
            name: "quotes",
            initializer: `[${newTypography.quotes}]`
        }
    ]);

    return {
        typographyVariable: typographyVar,
        isSuccessfullyMapped: true,
        customPropNames
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

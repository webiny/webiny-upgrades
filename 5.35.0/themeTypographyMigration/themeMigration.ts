import { Context } from "../../types";
import {
    AsExpression,
    ObjectLiteralExpression,
    Project,
    PropertyAssignment,
    PropertyAssignmentStructure,
    SourceFile,
    SyntaxKind,
    VariableDeclaration
} from "ts-morph";
import {
    htmlTagToTypographyTypeMapping,
    StyleIdToTypographyTypeMap,
    typographyKeyToHtmlTagMapping,
    TypographyType
} from "./migrationTypes";
import { getObjectLiteralExpressionValue } from "./getObjectLiteralExpressionValue";

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
};

const getObjectLiteralFromVariable = (
    variable: VariableDeclaration
): ObjectLiteralExpression | undefined => {
    if (!variable) {
        return undefined;
    }

    const variableInitializer = variable.getInitializer();
    const variableInitializerKind = variableInitializer.getKind();

    if (variableInitializerKind === SyntaxKind.AsExpression) {
        return (variableInitializer as AsExpression).getExpression() as ObjectLiteralExpression;
    }

    if (variableInitializerKind === SyntaxKind.ObjectLiteralExpression) {
        return variableInitializer as ObjectLiteralExpression;
    }

    return undefined;
};

/*
 * ----- MANIPULATION WITH THEME OBJECT ----
 */

export type legacyTypographyCanBeMigratedResult = {
    isReadyForMigration: boolean;
    info?: string;
};

/*
 * @desc Check if legacy typography object has at least one key for migration
 * */
export const legacyTypographyCanBeMigrated = (
    typography: VariableDeclaration
): legacyTypographyCanBeMigratedResult => {
    if (!typography) {
        return {
            isReadyForMigration: false,
            info: "Theme's typography migration is canceled, legacy typography variable not found."
        };
    }

    const typographyObjetExpression = getObjectLiteralFromVariable(typography);

    if (!typographyObjetExpression) {
        return {
            isReadyForMigration: false,
            info: "Theme's typography migration is canceled, typography variable does not contain the legacy typography object structure."
        };
    }

    // get the property objects heading1, heading2....
    const props = typographyObjetExpression.getProperties();

    if (props.length === 0) {
        return {
            isReadyForMigration: false,
            info: "Theme's typography migration is canceled, typography variable does not contain style properties."
        };
    }

    // Keeps the names of the properties with custom objects that not match the
    // webiny default keys/objects
    const customStructureProps = [];

    // in order theme object to be ready for mitgration all properties need
    // to have object as a value
    for (const objectProp of props) {
        if (objectProp.getKind() === SyntaxKind.PropertyAssignment) {
            const propAssigment = objectProp as PropertyAssignment;
            const propName = propAssigment.getSymbol().getName();

            // Property value like 'heading1' must be object like { fontSize: 23 } for example
            const propertyInitializer = propAssigment.getInitializerIfKind(
                SyntaxKind.ObjectLiteralExpression
            );

            // if initializer or value of the property is not object (maybe Array, Set, Map...)
            // this is considered as a custom implementation. We don't know how to parse custom types
            if (!propertyInitializer) {
                customStructureProps.push(propName);
            }
        }
    }

    const isReadyForMigration = customStructureProps.length === 0;

    return {
        isReadyForMigration,
        info: isReadyForMigration
            ? ""
            : `Theme's typography migration is canceled, detected
         custom implementation for following properties: ${customStructureProps.join(", ")}`
    };
};

/*
 * Creates new Property assigment object for the new style.
 * it's creating a single style object
 * example: headings: [{ id, name, tag, styles } -> example of the style object]
 * */
export const mapToTypographyStyle = (
    assigment: PropertyAssignment,
    context: Context
):
    | {
          structure: string;
          typographyType: string;
          isCustom: boolean;
          structureAsObject: {
              id: string;
              name: string;
              tag: string;
              styles: PropertyAssignmentStructure;
          };
      }
    | undefined => {
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
                tag = "p"; // default
        }
    }

    return {
        structure: `{ id: "${legacyKey}", name: "${legacyKey}", tag: "${tag || "p"}", styles: ${
            assigment.getStructure().initializer
        } }`,
        typographyType: htmlTagToTypographyTypeMapping[tag],
        isCustom,
        structureAsObject: { id: legacyKey, name: legacyKey, tag, styles: assigment.getStructure() }
    };
};

export const mapToNewTypographyStyles = (
    typographyVar: VariableDeclaration,
    context: Context
): {
    typographyVariable?: VariableDeclaration;
    isSuccessfullyMapped: boolean;
    info?: string;
    styleIdTopographyType?: StyleIdToTypographyTypeMap;
} => {
    const newTypography = {
        headings: [],
        paragraphs: [],
        lists: [],
        quotes: []
    };

    const typographyObjectExpression = getObjectLiteralFromVariable(typographyVar);

    if (!typographyObjectExpression) {
        return {
            isSuccessfullyMapped: false,
            info: "Mapping process of the typography styles is canceled, typography variable does not contain the legacy typography object structure."
        };
    }

    const propertyAssignments = typographyObjectExpression
        .getProperties()
        .map(prop => prop.asKind(SyntaxKind.PropertyAssignment));

    if (propertyAssignments.length === 0) {
        return {
            isSuccessfullyMapped: false,
            info: "Mapping process of the typography styles is canceled, typography variable does not contain style properties."
        };
    }

    // Keeps the names of the properties with custom objects that not match the
    // migration policy
    const styleIdToTypographyType: StyleIdToTypographyTypeMap = {};

    /*
     * To match the legacy object we need to have property with object value
     * other that we will consider as custom implementation of the typography styles
     */
    for (const propAssignment of propertyAssignments) {
        const style = mapToTypographyStyle(propAssignment, context);
        if (style) {
            newTypography[style.typographyType].push(style.structure);
            const styleObject = style.structureAsObject;
            styleIdToTypographyType[styleObject.id] = style.typographyType as TypographyType;
        }
        // remove the current assigment
        propAssignment.remove();
    }

    // add the new mapped typography types

    typographyObjectExpression.addPropertyAssignments([
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
        styleIdTopographyType: styleIdToTypographyType
    };
};

type AlreadyMigratedResult = {
    isFullyMigrated: boolean;
    isPartlyMigrated: boolean;
    isNotMigrated: boolean;
    info?: string;
};

export const typographyIsAlreadyMigrated = (
    typography: VariableDeclaration
): AlreadyMigratedResult | undefined => {
    if (!typography) {
        return undefined;
    }

    const typographyObjetExpression = getObjectLiteralFromVariable(typography);

    if (!typographyObjetExpression) {
        return undefined;
    }

    const newThemePropNames = ["headings", "paragraphs", "lists", "quotes"];

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
            if (!newThemePropNames.includes(propName)) {
                continue;
            }

            // Check if that property have array as value
            const arrayLiteralExpression = propAssigment.getInitializerIfKind(
                SyntaxKind.ArrayLiteralExpression
            );

            // headings and other props are arrays in the new mapped type
            if (arrayLiteralExpression) {
                const elements = arrayLiteralExpression.getElements();
                if (elements.length === 0) {
                    // for empty array we consider full migration
                    fullMigration.push(propName);
                    continue;
                }

                let allStylesAreMigrated = true;
                let hasAtLeastOneStyleMatch = false;
                for (const element of elements) {
                    if (element.getKind() === SyntaxKind.ObjectLiteralExpression) {
                        const style = getObjectLiteralExpressionValue(
                            element as ObjectLiteralExpression,
                            true
                        );
                        if (
                            !(
                                style.hasOwnProperty("id") &&
                                style.hasOwnProperty("name") &&
                                style.hasOwnProperty("tag") &&
                                style.hasOwnProperty("styles")
                            )
                        ) {
                            if (allStylesAreMigrated) {
                                allStylesAreMigrated = false;
                            }
                        } else {
                            hasAtLeastOneStyleMatch = true;
                        }
                    }
                }

                if (allStylesAreMigrated) {
                    fullMigration.push(propName);
                }

                if (!allStylesAreMigrated && hasAtLeastOneStyleMatch) {
                    partialMigration.push(propName);
                }
            }
        }
    }

    const isFullyMigrated = fullMigration.length >= newThemePropNames.length;
    const isPartlyMigrated =
        (fullMigration.length > 0 && partialMigration.length >= 0) || partialMigration.length > 0;

    let info = "";
    if (isPartlyMigrated) {
        info = `Theme's typography style upgrade canceled. Typography styles are partially migrated, 
        following properties match the new styles: ${fullMigration
            .concat(partialMigration)
            .join(", ")}`;
    }

    if (isFullyMigrated) {
        info = "Theme's typography styles are already migrated.";
    }

    return {
        isFullyMigrated,
        isPartlyMigrated,
        isNotMigrated: !isFullyMigrated && !isPartlyMigrated,
        info
    };
};

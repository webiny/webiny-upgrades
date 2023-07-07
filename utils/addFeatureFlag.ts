import { ObjectLiteralExpression, PropertyAssignment, SourceFile, SyntaxKind } from "ts-morph";
import { addPropertyToObject } from "./tsMorph/addPropertyToObject";
import { getDefaultExportedObject } from "./tsMorph/getDefaultExportedObject";

export type AddFeatureFlagResult = {
    success: boolean;
    hasError: boolean;
};

const FEATURE_FLAGS_PROP_NAME = "featureFlags";

/*
 * Add feature flag property to existing featureFlags object. In case featureFlags property
 * doesn't exist, the property and object will be created and feature flag will be set.
 * */
export const addFeatureFlag = (
    source: SourceFile,
    name: string,
    value: Record<string, any> | string | boolean
): AddFeatureFlagResult => {
    if (!source) {
        return {
            success: false,
            hasError: true
        };
    }

    const exportedObject = getDefaultExportedObject(source);
    if (!exportedObject) {
        return {
            success: false,
            hasError: true
        };
    }

    const propertyAssigment = exportedObject.getProperty(FEATURE_FLAGS_PROP_NAME);
    // Add object featureFlags with the specified flag name if not exist
    if (!propertyAssigment) {
        addPropertyToObject(exportedObject, FEATURE_FLAGS_PROP_NAME, { [name]: value });
        return {
            success: true,
            hasError: false
        };
    }

    // Validate if object has the correct structure and type before migration
    const isPropertyAssigment = propertyAssigment.getKind() === SyntaxKind.PropertyAssignment;
    // Property exist but not expected type assigment
    if (!isPropertyAssigment) {
        return {
            success: false,
            hasError: true
        };
    }

    const featureFlagObject = (propertyAssigment as PropertyAssignment).getInitializer();
    const isObjectLiteral = featureFlagObject.getKind() === SyntaxKind.ObjectLiteralExpression;
    // Property exist but not expected object structure
    if (!isObjectLiteral) {
        return {
            success: false,
            hasError: true
        };
    }

    // Add feature flag property to exiting props in the featureFlags object
    addPropertyToObject(featureFlagObject as ObjectLiteralExpression, name, value);

    return {
        success: true,
        hasError: false
    };
};

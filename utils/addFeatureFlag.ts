import { ObjectLiteralExpression, PropertyAssignment, SourceFile, SyntaxKind } from "ts-morph";
import { addPropertyToObject } from "./tsMorph/addPropertyToObject";
import { getDefaultExportedObject } from "./tsMorph/getDefaultExportedObject";

const FEATURE_FLAGS_PROP_NAME = "featureFlags";

/*
 * Add feature flag property to existing featureFlags object. In case featureFlags property
 * doesn't exist, the property and object will be created and feature flag will be set.
 * */
export const addFeatureFlag = (
    source: SourceFile,
    name: string,
    value: Record<string, any> | string | boolean
) => {
    const exportedObject = getDefaultExportedObject(source);
    if (!exportedObject) {
        throw new Error(`Can't add feature flag, default exported object not found.`);
    }

    const propertyAssigment = exportedObject.getProperty(FEATURE_FLAGS_PROP_NAME);
    // Add object featureFlags with the specified flag name if not exist
    if (!propertyAssigment) {
        addPropertyToObject(exportedObject, FEATURE_FLAGS_PROP_NAME, { [name]: value });
        return;
    }

    // Validate if object has the correct structure and type before migration
    const isPropertyAssigment = propertyAssigment.getKind() === SyntaxKind.PropertyAssignment;
    if (!isPropertyAssigment) {
        throw new Error(
            `Can't add feature flag, '${FEATURE_FLAGS_PROP_NAME}' exist, but not as property assigment.`
        );
    }

    const featureFlagObject = (propertyAssigment as PropertyAssignment).getInitializer();
    const isObjectLiteral = featureFlagObject.getKind() === SyntaxKind.ObjectLiteralExpression;
    // Property exist but not expected object structure
    if (!isObjectLiteral) {
        throw new Error(
            `Can't add feature flag, property '${FEATURE_FLAGS_PROP_NAME}' exist, but is not expected object structure.`
        );
    }

    // Add feature flag property to exiting props in the featureFlags object
    addPropertyToObject(featureFlagObject as ObjectLiteralExpression, name, value);
};

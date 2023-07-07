import { SourceFile } from "ts-morph";
import { getDefaultExportedObject } from "./tsMorph/getDefaultExportedObject";
import { toObjectValue } from "./tsMorph/toObjectValue";

type FeatureFlagExistResult = {
    exist: boolean;
    hasError: boolean;
};

/*
 * Check if feature flag exist in the featureFlag object
 */
export const featureFlagExist = (source: SourceFile, name: string): FeatureFlagExistResult => {
    const projectObjectLiteral = getDefaultExportedObject(source);

    if (!projectObjectLiteral) {
        return {
            exist: false,
            hasError: true
        };
    }

    const projectObject = toObjectValue(projectObjectLiteral);
    if (projectObject?.featureFlags?.[name]) {
        return {
            exist: true,
            hasError: false
        };
    }

    return {
        exist: false,
        hasError: false
    };
};

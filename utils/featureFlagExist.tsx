import { SourceFile } from "ts-morph";
import { getDefaultExportedObject } from "./tsMorph/getDefaultExportedObject";
import { toObjectValue } from "./tsMorph/toObjectValue";

/*
 * Checks if feature flag property exist in the featureFlag object
 */
export const FeatureFlagExist = (source: SourceFile, name: string): boolean => {
    const projectObjectLiteral = getDefaultExportedObject(source);

    if (!projectObjectLiteral) {
        return false;
    }

    const projectObject = toObjectValue(projectObjectLiteral);
    return typeof projectObject.featureFlags?.[name] !== "undefined";
};

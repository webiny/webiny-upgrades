import { SourceFile } from "ts-morph";
import { getDefaultExportedObject } from "./tsMorph/getDefaultExportedObject";
import { toObjectValue } from "./tsMorph/toObjectValue";

/*
 * Checks if feature flag property exist in the featureFlag object
 */
export const isFeatureFlagExist = (source: SourceFile, name: string): boolean => {
    const projectObjectLiteral = getDefaultExportedObject(source);

    if (!projectObjectLiteral) {
        return false;
    }

    const projectObject = toObjectValue(projectObjectLiteral);
    return !!projectObject.featureFlags?.[name];
};

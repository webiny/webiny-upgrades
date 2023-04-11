
/*
 * Checks if the function type has all instruction param names
 */
import {FunctionTypeNode, SyntaxKind} from "ts-morph";

export const shouldFunctionTypeBeMigrated = (
    functionTypeNode: FunctionTypeNode,
    migrationParamNames: string[]
): boolean => {
    if (!functionTypeNode) {
        return false;
    }

    if (functionTypeNode.getKind() !== SyntaxKind.FunctionType) {
        return false;
    }

    if (!migrationParamNames?.length) {
        return false;
    }

    // Check if function params includes the migration param names
    const functionNodeParamNames = functionTypeNode?.getTypeParameters().map(x => x.getName());

    for (const paramName in migrationParamNames) {
        if (!functionNodeParamNames.includes(paramName)) {
            return false;
        }
    }

    return true;
};

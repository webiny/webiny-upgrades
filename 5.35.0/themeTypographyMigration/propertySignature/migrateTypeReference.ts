import {SyntaxKind, TypeReferenceNode} from "ts-morph";
import {TypeReferenceInstruction} from "../migrationTypes";

export const migrateTypeReference = (
    typeReferenceNode: TypeReferenceNode,
    typeInstruction: TypeReferenceInstruction
): void => {
    if (typeInstruction.syntaxKind !== SyntaxKind.TypeReference) {
        return;
    }

    if (typeReferenceNode.getKind() !== SyntaxKind.TypeReference) {
        return;
    }
    // type reference node keeps the name of the parameter type
    // example:
    typeReferenceNode.replaceWithText(typeInstruction.updateToTypeName);
};

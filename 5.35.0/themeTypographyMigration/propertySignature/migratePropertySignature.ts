import {
    FunctionTypeNode,
    PropertySignature,
    SyntaxKind,
    TypeReferenceNode,
    UnionTypeNode
} from "ts-morph";
import { PropertySignatureInstruction } from "../migrationTypes";
import { Context } from "../../../types";
import { migrateUnionType } from "./migrateUnionType";
import { migrateFunctionType } from "./migrateFunctionType";
import { migrateTypeReference } from "./migrateTypeReference";

export const migratePropertySignature = (
    propSignature: PropertySignature,
    propSignatureInstruction: PropertySignatureInstruction,
    context: Context
): void => {
    if (!propSignature) {
        return;
    }

    if (propSignature.getKind() !== SyntaxKind.PropertySignature) {
        return;
    }

    if (!propSignatureInstruction) {
        return;
    }

    let updateTypeNode = propSignature.getTypeNode();

    // for parenthesized type we need to make a correction and take the type node
    // and the syntax kind to get the parameter type
    if (updateTypeNode.getKind() === SyntaxKind.ParenthesizedType) {
        updateTypeNode = propSignature.getTypeNode();
    }

    const updateTypeNodeKind = updateTypeNode.getKind();

    switch (propSignatureInstruction.typeInstruction.syntaxKind) {
        case SyntaxKind.TypeReference:
            if (updateTypeNodeKind === SyntaxKind.TypeReference) {
                migrateTypeReference(
                    updateTypeNode as TypeReferenceNode,
                    propSignatureInstruction.typeInstruction
                );
            }
            break;
        case SyntaxKind.UnionType:
            if (updateTypeNodeKind === SyntaxKind.UnionType) {
                migrateUnionType(
                    updateTypeNode as UnionTypeNode,
                    propSignatureInstruction.typeInstruction,
                    context
                );
            }
            break;
        case SyntaxKind.FunctionType:
            if (updateTypeNodeKind === SyntaxKind.FunctionType) {
                migrateFunctionType(
                    updateTypeNode as FunctionTypeNode,
                    propSignatureInstruction.typeInstruction,
                    context
                );
            }
        default:
            context.log.debug(
                `Interface member ${propSignature.getName()} was not updated, type was not found.`
            );
    }
};

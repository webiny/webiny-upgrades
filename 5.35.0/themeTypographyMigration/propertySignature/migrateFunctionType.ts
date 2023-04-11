import {FunctionTypeNode, ParenthesizedTypeNode, SyntaxKind, TypeLiteralNode, TypeReferenceNode} from "ts-morph";
import {FunctionTypeInstruction} from "../migrationTypes";
import {Context} from "../../../types";
import {migrateTypeReference} from "./migrateTypeReference";
import {migrateLiteralType} from "./migrateLiteralType";

export const migrateFunctionType = (
    functionTypeNode: FunctionTypeNode,
    functionInstruction: FunctionTypeInstruction,
    context: Context
): void => {
    if (!functionTypeNode) {
        return;
    }

    if (functionInstruction.syntaxKind !== SyntaxKind.FunctionType) {
        return;
    }

    const params = functionTypeNode.getParameters();

    // update parameters
    for (const param of params) {
        let typeNode = param.getTypeNode();

        //export type GetStyles = (
        //     styles: StylesObject | ((theme: DecoratedTheme) => StylesObject)
        // ) => CSSObject;
        // in this example the second type is ParenthesizedType. We need to go and take his type(child node)
        // to get to the Function type
        if (typeNode.getKind() === SyntaxKind.ParenthesizedType) {
            typeNode = (typeNode as ParenthesizedTypeNode).getTypeNode();
        }
        const typeNodeKind = typeNode.getKind();

        const foundInstruction = functionInstruction.params.find(p => p.name === param.getName());
        const typeInstructionKind = foundInstruction.typeInstruction.syntaxKind;

        if (foundInstruction) {
            if (
                typeNodeKind === SyntaxKind.TypeReference &&
                typeInstructionKind === SyntaxKind.TypeReference
            ) {
                migrateTypeReference(
                    typeNode as TypeReferenceNode,
                    foundInstruction.typeInstruction
                );
            }
        }

        if (
            typeNodeKind === SyntaxKind.TypeLiteral &&
            typeInstructionKind === SyntaxKind.TypeLiteral
        ) {
            migrateLiteralType(
                typeNode as TypeLiteralNode,
                foundInstruction.typeInstruction,
                context
            );
        }
    }
};

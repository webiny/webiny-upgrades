import {ParenthesizedTypeNode, SyntaxKind, TypeNode} from "ts-morph";
import {FunctionTypeInstruction, TypeReferenceInstruction, UnionTypeInstruction} from "../migrationTypes";
import {shouldFunctionTypeBeMigrated} from "./shouldFunctionTypeBeMigrated";

export const findTypeInstructionInUnion = (
    unionTypeNode: TypeNode,
    unionInstruction: UnionTypeInstruction
): TypeReferenceInstruction | FunctionTypeInstruction | undefined => {
    const typeNodeKind = unionTypeNode.getKind();
    const typeNodeName = unionTypeNode.getText();

    return unionInstruction.unionTypes.find(typeInstruction => {
        // type reference
        if (
            typeInstruction.syntaxKind === SyntaxKind.TypeReference &&
            typeInstruction.syntaxKind === typeNodeKind &&
            typeInstruction.typeName == typeNodeName
        ) {
            return true;
        }

        // Check if node is function type and match the instructions
        if (typeInstruction.syntaxKind === SyntaxKind.FunctionType) {
            // Extract the type from parenthesized declaration
            /*interface SetStylesCallbackParams extends PageElementsProviderProps {
                styles: StylesObject | ((theme: DecoratedTheme) => StylesObject);
            }*/
            let parenthesizedChildType = null;
            if (typeNodeKind === SyntaxKind.ParenthesizedType) {
                // we need to get to the type inside the ParenthesizedType
                const parenthesizedTypeNode = unionTypeNode as ParenthesizedTypeNode;
                parenthesizedChildType = parenthesizedTypeNode.getTypeNode();
            }

            // if type is function proceed with additional checks for the params
            if (
                unionTypeNode.getKind() === SyntaxKind.FunctionType ||
                parenthesizedChildType === SyntaxKind.FunctionType
            ) {
                const functionNode = parenthesizedChildType ?? unionTypeNode;

                // check for the params in the function type
                if (functionNode.getKind() === SyntaxKind.FunctionType) {
                    return shouldFunctionTypeBeMigrated(
                        functionNode,
                        typeInstruction.params.map(p => p.name)
                    );
                }
            }
        }
    });
};

import {FunctionTypeNode, SyntaxKind, TypeReferenceNode, UnionTypeNode} from "ts-morph";
import {UnionTypeInstruction} from "../migrationTypes";
import {Context} from "../../../types";
import {migrateFunctionType, migrateTypeReference} from "../migrateInterfaces";
import {findTypeInstructionInUnion} from "./findTypeInstructionInUnion";

/*
 * @desc Union type contains multiple types that can be migrated
 * */
export const migrateUnionType = (
    unionTypeNode: UnionTypeNode,
    unionInstruction: UnionTypeInstruction,
    context: Context
): void => {
    if (unionTypeNode.getKind() !== SyntaxKind.UnionType) {
        return;
    }

    // migrate types specified by the migration instructions
    for (const typeNode of unionTypeNode.getTypeNodes()) {
        // find the type that need to be migrated
        const typeInstruction = findTypeInstructionInUnion(typeNode, unionInstruction);

        if (typeInstruction) {
            if (typeInstruction.syntaxKind === SyntaxKind.TypeReference) {
                migrateTypeReference(typeNode as TypeReferenceNode, typeInstruction);
            }

            if (typeInstruction.syntaxKind === SyntaxKind.FunctionType) {
                migrateFunctionType(typeNode as FunctionTypeNode, typeInstruction, context);
            }
        }
    }
};

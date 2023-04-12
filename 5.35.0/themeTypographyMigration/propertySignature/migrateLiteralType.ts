import { PropertySignature, SyntaxKind, TypeLiteralNode } from "ts-morph";
import { TypeLiteralInstruction } from "../migrationTypes";
import { Context } from "../../../types";
import { migratePropertySignature } from "./migratePropertySignature";

export const migrateLiteralType = (
    typeLiteralNode: TypeLiteralNode,
    instruction: TypeLiteralInstruction,
    context: Context
): void => {
    if (!typeLiteralNode) {
        return;
    }

    if (!typeLiteralNode?.getMembers()?.length) {
        return;
    }

    if (!instruction) {
        return;
    }

    if (!instruction?.members?.length) {
        return;
    }

    for (const memberNode of typeLiteralNode.getMembers()) {
        if (memberNode.getKind() === SyntaxKind.PropertySignature) {
            const propertySignature = memberNode as PropertySignature;
            const propertyInstruction = instruction.members.find(
                i => i.name === propertySignature.getName()
            );
            if (
                propertyInstruction &&
                propertyInstruction.syntaxKind === SyntaxKind.PropertySignature
            ) {
                migratePropertySignature(propertySignature, propertyInstruction, context);
            }
        }
    }
};

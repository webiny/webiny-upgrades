import {
    FunctionTypeInstruction,
    migrateFunctionType,
    TypeReferenceInstruction
} from "./migrateInterface";
import {FunctionTypeNode, SourceFile, SyntaxKind} from "ts-morph";
import { Context } from "../../types";

export type TypeAliasMigrationDefinition = {
    name: string;
    typeInstruction: FunctionTypeInstruction | TypeReferenceInstruction;
};

export const migrateTypes = (
    sourceCode: SourceFile,
    migrationInstructions: TypeAliasMigrationDefinition[],
    context: Context
) => {

    const typeAliasDeclarations = sourceCode.getTypeAliases();

    for (const typeAliasDeclaration of typeAliasDeclarations) {

        const foundTypeAliasInstruction = migrationInstructions.find(i => i.name === typeAliasDeclaration.getName());

        if(foundTypeAliasInstruction) {
            const migrateTypeNode = typeAliasDeclaration.getTypeNode();
            const instructionKind = foundTypeAliasInstruction.typeInstruction.syntaxKind

            if (
                migrateTypeNode.getKind() === SyntaxKind.FunctionType &&
                instructionKind === SyntaxKind.FunctionType
            ) {
                migrateFunctionType(
                    migrateTypeNode as FunctionTypeNode,
                    foundTypeAliasInstruction.typeInstruction,
                    context
                );
            }
        }
    }
};

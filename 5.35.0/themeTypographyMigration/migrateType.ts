import {FunctionTypeInstruction, migrateFunctionType, TypeReferenceInstruction} from "./migrateInterface";
import {FunctionTypeNode, SyntaxKind, TypeAliasDeclaration} from "ts-morph";
import {Context} from "../../types";

export type TypeAliasMigrationDefinition = {
    name: string;
    typeInstruction: FunctionTypeInstruction | TypeReferenceInstruction;
};


const migrateTypeAlias = (typeAliasDeclaration: TypeAliasDeclaration,
                          migrationInstruction: TypeAliasMigrationDefinition,
                          context: Context) => {

    if(!typeAliasDeclaration) {
        return;
    }

    const migrateTypeNode = typeAliasDeclaration.getTypeNode();

    if(migrateTypeNode.getKind() === SyntaxKind.FunctionType &&
        migrationInstruction.typeInstruction.syntaxKind === SyntaxKind.FunctionType) {
        migrateFunctionType(migrateTypeNode as FunctionTypeNode, migrationInstruction.typeInstruction);
    }
}

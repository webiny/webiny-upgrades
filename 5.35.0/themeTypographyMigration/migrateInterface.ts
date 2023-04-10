import {InterfaceDeclaration, PropertySignature, SyntaxKind, ts, TypeReferenceNode, UnionTypeNode} from "ts-morph";
import {Context} from "../../types";

export type TypeReferenceInstruction = {
    syntaxKind: SyntaxKind.TypeReference;
    typeName: string;
    updateTypeNameTo?: string;
};

export type UnionTypeInstruction = {
    syntaxKind: SyntaxKind.UnionType;
    unionTypes: (TypeReferenceInstruction | FunctionTypeInstruction)[];
};

export type FunctionTypeInstruction = {
    syntaxKind: SyntaxKind.FunctionType;
    params: { name: string; typeInstruction: TypeReferenceInstruction };
};

export type PropertySignatureInstruction = {
    name: string;

    typeInstruction: TypeReferenceInstruction | UnionTypeInstruction;
};

export type InterfaceMigrationDefinition = {
    name: string;
    members: PropertySignatureInstruction[];
};

export const migrateInterface = (
    interfaceDeclaration: InterfaceDeclaration,
    migrationInstruction: InterfaceMigrationDefinition,
    context: Context
) => {
    if (!migrationInstruction) {
        context.log.debug("Interface migration instruction was not found.");
        return;
    }

    if (!migrationInstruction?.members) {
        context.log.debug("Interface migration object's property 'propertySignatures' missing.");
        return;
    }

    if (!interfaceDeclaration) {
        context.log.debug("Interface declaration not found");
        return;
    }

    const propertySignatures = interfaceDeclaration.getProperties();
    for (const propSignature of propertySignatures) {

        const propSignatureInstruction = findInterfaceInstructionByMemberName(
            propSignature,
            migrationInstruction
        );

        if (propSignatureInstruction) {
            updateInterfaceMemberType(propSignature, propSignatureInstruction,
                context);
        }
    }
};

export const updateInterfaceMemberType = (
    propSignature: PropertySignature,
    propSignatureInstruction: PropertySignatureInstruction,
    context: Context
): void => {
    if (!propSignatureInstruction) {
        return;
    }
    switch (propSignatureInstruction.typeInstruction.syntaxKind) {
        case ts.SyntaxKind.TypeReference:
            migrateTypeReference(propSignature, propSignatureInstruction.typeInstruction);
            break;
        case ts.SyntaxKind.UnionType:
            migrateUnionType(propSignature, propSignatureInstruction.typeInstruction);
            break;
        default:
            context.log.debug(
                `Interface member ${propSignature.getName()} was not updated, type was not found.`
            );
    }
};

const findInterfaceInstructionByMemberName = (
    propSignature: PropertySignature,
    instruction: InterfaceMigrationDefinition
): PropertySignatureInstruction | undefined => {
    if (!propSignature) {
        return undefined;
    }

    return instruction?.members?.find(p => p.name === propSignature.getName());
};

/*
* ---------- TYPE MIGRATION METHODS -----------
* */

/*
* @desc Union type contains multiple types that can be migrated
* */
export const migrateUnionType = (
    propertySignature: PropertySignature,
    unionInstruction: UnionTypeInstruction
): void => {
    const node = propertySignature.getTypeNode();

    if (node.getKind() !== SyntaxKind.UnionType) {
        return;
    }
    
    if(propertySignature.getTypeNode().getKind() !== SyntaxKind.UnionType){
        return;
    }

    // Get the union type
    const union = propertySignature.getTypeNode() as UnionTypeNode;

    // migrate types specified by the migration instructions
    for (const typeNode of union.getTypeNodes()) {
        // find the type that need to be imgrated
        const typeInstruction =  unionInstruction.unionTypes.find(typeNode => {
            typeNode.syntaxKind === typeNode.getKind()
        })

        if(typeNode.getKind() === SyntaxKind.TypeReference) {
            typeNode.getText()
            migrateTypeReference(typeNode as TypeReferenceNode);
        }

    }
};

const ginfTypeForMigration =

export const migrateTypeReference = (
    propSignature: PropertySignature,
    typeInstruction: TypeReferenceInstruction
): void => {
    if (typeInstruction.getKind() !== SyntaxKind.TypeReference) {
        return;
    }
};

export const migrateFunctionType = (
    propSignature: PropertySignature,
    typeInstruction: UnionTypeInstruction
): void => {};


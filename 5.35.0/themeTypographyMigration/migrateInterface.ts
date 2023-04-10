import {
    FunctionTypeNode,
    InterfaceDeclaration,
    ParenthesizedTypeNode,
    PropertySignature,
    SyntaxKind,
    TypeLiteralNode,
    TypeNode,
    TypeReferenceNode,
    UnionTypeNode
} from "ts-morph";
import {Context} from "../../types";

export type TypeReferenceInstruction = {
    syntaxKind: SyntaxKind.TypeReference;
    typeName: string;
    updateToTypeName?: string;
};

export type UnionTypeInstruction = {
    syntaxKind: SyntaxKind.UnionType;
    unionTypes: (TypeReferenceInstruction | FunctionTypeInstruction)[];
};

export type FunctionTypeInstruction = {
    syntaxKind: SyntaxKind.FunctionType;
    params: {
        name: string;
        typeInstruction: TypeReferenceInstruction | UnionTypeInstruction | TypeLiteralInstruction;
    }[];
};

export type PropertySignatureInstruction = {
    syntaxKind: SyntaxKind.PropertySignature;
    name: string;
    typeInstruction: TypeReferenceInstruction | UnionTypeInstruction | FunctionTypeInstruction;
};

export type InterfaceMigrationDefinition = {
    name: string;
    members: PropertySignatureInstruction[];
};

export type TypeLiteralInstruction = {
    syntaxKind: SyntaxKind.TypeLiteral;
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
            migratePropertySignature(propSignature, propSignatureInstruction, context);
        }
    }
};

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

const getParenthesizedTypeNode = (node: ParenthesizedTypeNode): TypeNode => {
    return node.getTypeNode();
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

const findTypeInstructionInUnion = (
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

/*
 * Checks if the function type has all instruction param names
 */
const shouldFunctionTypeBeMigrated = (
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

/*
 * ---------- TYPE MIGRATION METHODS -----------
 * */

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
        if(typeNode.getKind() === SyntaxKind.ParenthesizedType) {
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

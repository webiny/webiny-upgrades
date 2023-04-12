import { InterfaceDeclaration } from "ts-morph";
import { InterfaceMigrationDefinition } from "./migrationTypes";
import { Context } from "../../types";
import { findInterfaceInstructionByMemberName } from "./propertySignature/findInterfaceInstructionByMemberName";
import { migratePropertySignature } from "./propertySignature/migratePropertySignature";

export const migrateInterfaceDeclaration = (
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

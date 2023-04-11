import {PropertySignature} from "ts-morph";
import {InterfaceMigrationDefinition, PropertySignatureInstruction} from "../migrationTypes";

export const findInterfaceInstructionByMemberName = (
    propSignature: PropertySignature,
    instruction: InterfaceMigrationDefinition
): PropertySignatureInstruction | undefined => {
    if (!propSignature) {
        return undefined;
    }

    return instruction?.members?.find(p => p.name === propSignature.getName());
};

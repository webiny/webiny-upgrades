import {
    SourceFile
} from "ts-morph";
import { Context } from "../../types";
import {
    InterfaceMigrationDefinition,
} from "./migrationTypes";
import {ThemeFileMigrationDefinition} from "./migrationFileDefinitions";
import {migrateInterfaceDeclaration} from "./migrateInterfaceDeclaration";


export const migrateInterfaces = (
    source: SourceFile,
    migrationDefinition: ThemeFileMigrationDefinition,
    context: Context
): void => {
    if (!source) {
        context.log.debug("Source file for interfaces migration was not found.");
        return;
    }

    const instructions = migrationDefinition.migrationInstructions
        ?.interfaces as InterfaceMigrationDefinition[];
    if (!instructions?.length) {
        context.log.debug("No interface migration instructions found.");
        return;
    }

    // create a copy for array manipulation
    const instructionsCopy = [...instructions];

    // get all interfaces
    const interfaces = source.getInterfaces();

    if (!interfaces?.length) {
        context.log.debug("The file does not contain any interface declaration");
        return;
    }

    for (const interfaceDeclaration of interfaces) {
        const instructionIndex = instructionsCopy.findIndex(
            i => i.name === interfaceDeclaration.getName()
        );
        if (instructionIndex >= 0) {
            // Migrate only the interfaces that have instruction
            const instruction = instructionsCopy[instructionIndex];
            if (instruction) {
                migrateInterfaceDeclaration(interfaceDeclaration, instruction, context);
            }

            // remove the instructions for the migrated interface
            instructionsCopy.splice(instructionIndex, 1);
        }
    }

    // output for none migrated interfaces
    if (instructionsCopy.length > 0) {
        context.log.debug(`Following interfaces was not found in the file for migration: 
        ${instructionsCopy.map(i => i.name).join(", ")}`);
    }
};

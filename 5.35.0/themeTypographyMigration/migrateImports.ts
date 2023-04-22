import { SourceFile } from "ts-morph";

import { Context } from "../../types";
import { ImportDeclarationDefinition, ThemeFileMigrationDefinition } from "./migrationTypes";

export const migrateImports = (
    sourceFile: SourceFile,
    migrationDefinition: ThemeFileMigrationDefinition,
    context: Context
): void => {
    const instructions = migrationDefinition.migrationInstructions?.imports;

    // Variable declaration
    // example: Heading = styled.div(theme.styles.typography["heading1"])
    if (!!instructions?.length) {
        for (const importInstruction of instructions as ImportDeclarationDefinition[]) {
            const importDeclaration = sourceFile.getImportDeclaration(
                i => i.getModuleSpecifierValue() === importInstruction.moduleSpecifier
            );

            if (!importDeclaration) {
                context.log.warning(
                    `Theme import can't be found. File: ${migrationDefinition.file.path}`
                );
                return;
            }

            if (importInstruction?.remove) {
                importDeclaration.remove();
                return;
            }

            if (importInstruction?.insertDefaultImport) {
                importDeclaration.setDefaultImport(importInstruction.insertDefaultImport);
            }

            if (importInstruction?.removeNamedImports) {
                // Get all imports that are not present in the remove list
                const filteredNamedImports = importDeclaration
                    .getNamedImports()
                    .filter(
                        namedImport =>
                            !importInstruction.removeNamedImports.includes(namedImport.getName())
                    );

                // Remove all
                importDeclaration.removeNamedImports();

                // Add all named imports. Example of named imports:
                // import defaultImport, { namedImport1, namedImport2 } from "../../../theme";
                if (!!filteredNamedImports?.length) {
                    importDeclaration.addNamedImports(filteredNamedImports.map(i => i.getName));
                }
            }

            if (importInstruction?.addNamedImports) {
                importDeclaration.addNamedImports(importInstruction.addNamedImports);
            }
        }
    }
};

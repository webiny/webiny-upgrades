import { SourceFile } from "ts-morph";
import {
    ImportDeclarationDefinition,
    ThemeFileMigrationDefinition
} from "./themeMigrationSetupFiles";
import { StyleIdToTypographyTypeMap } from "./definitions";
import { Context } from "../../types";

export const migrateImports = (
    sourceFile: SourceFile,
    migrationDefinition: ThemeFileMigrationDefinition,
    map: StyleIdToTypographyTypeMap,
    context: Context
): void => {
    const instructions = migrationDefinition.migrationInstructions?.imports;

    // Variable declaration
    // example: Heading = styled.div(theme.styles.typography["heading1"])
    if (!!instructions?.declarations?.length) {
        for (const importInstruction of instructions?.declarations as ImportDeclarationDefinition[]) {
            const importDeclaration = sourceFile.getImportDeclaration(
                i => i.getModuleSpecifierValue() === importInstruction.moduleSpecifier
            );
            if (!importDeclaration) {
                context.log.warning(
                    `Theme import module can't be found. File: ${migrationDefinition.file.path}`
                );
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

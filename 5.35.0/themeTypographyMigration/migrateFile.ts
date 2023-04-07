import { Project, SourceFile, SyntaxKind } from "ts-morph";
import { ThemeFileMigrationDefinition } from "./migrationFileDefinitions";
import { getSourceFile } from "../../utils";
import { StyleIdToTypographyTypeMap } from "./definitions";
import { Context } from "../../types";
import { updatePropertyAssigment } from "./tsmorhHelpers";

const migrateStatements = (
    sourceFile: SourceFile,
    migrationDefinition: ThemeFileMigrationDefinition,
    map: StyleIdToTypographyTypeMap,
    context: Context
): void => {
    const instructions = migrationDefinition.migrationInstructions?.statements;
    // Variable declaration
    // example: Heading = styled.div(theme.styles.typography["heading1"])
    if (!!instructions?.variables?.length) {
        for (const varInstruction of instructions?.variables) {
            const statement = sourceFile.getVariableStatement(varInstruction.name);

            let styleKey = undefined;
            let typographyType = undefined;

            if (varInstruction.syntaxKind === SyntaxKind.PropertyAssignment) {
                updatePropertyAssigment(
                    statement,
                    instructions,
                    map,
                    context,
                    migrationDefinition.file.path
                );
            }

            // Element access expression. Example: theme.styles.typography["heading1"]
            if (varInstruction.syntaxKind === SyntaxKind.ElementAccessExpression) {
                // Filter all children that have element access expression and access to typography
                const allExpressions = statement
                    .forEachChildAsArray()
                    .filter(
                        child =>
                            child.asKind(SyntaxKind.ElementAccessExpression) &&
                            child.getText().includes("typography")
                    );

                // Go to all element expressions in the variable declaration and update
                if (allExpressions) {
                    for (const expression of allExpressions) {
                        const elementAccess = expression.asKind(SyntaxKind.ElementAccessExpression);

                        // Success to the typography key like, heading1, heading2....
                        const styleKeyLiteral = elementAccess
                            .getArgumentExpression()
                            .asKind(SyntaxKind.StringLiteral);
                        styleKey = styleKeyLiteral.getText();

                        // Typography type like headings, paragraphs...
                        typographyType = map[styleKey];
                        if (!typographyType) {
                            context.log
                                .warning(`Expression can't be updated, style key '${styleKey}' doesn't exist. /n 
                            File: ${
                                migrationDefinition.file.path
                            }, line: ${elementAccess.getStartLineNumber()}.`);
                        }
                        if (typographyType && styleKey) {
                            elementAccess.setExpression(
                                `theme.styles.typography.${elementAccess}.cssById("${styleKey}")`
                            );
                        }
                    }
                }
            }

            // For styled templates and property access expression.
            // example: const Wrapper = styled.div`${theme.styles.typography.paragraph2}`;
            if (varInstruction.syntaxKind === SyntaxKind.TemplateSpan) {
                const allTemplateSpans = statement
                    .forEachChildAsArray()
                    .filter(
                        child =>
                            child.asKind(SyntaxKind.TemplateSpan) &&
                            child.getText().includes("typography")
                    );

                if (allTemplateSpans) {
                    for (const templateSpan of allTemplateSpans) {
                        const expression = templateSpan.asKind(SyntaxKind.TemplateSpan);
                        // Success to the typography key like, heading1, heading2....
                        styleKey = expression.getExpression().getKindName();
                        // Typography type like headings, paragraphs...
                        typographyType = map[styleKey];
                        if (!typographyType) {
                            context.log
                                .warning(`Expression can't be updated, style key '${styleKey}' doesn't exist. /n 
                            File: ${
                                migrationDefinition.file.path
                            }, line: ${expression.getStartLineNumber()}.`);
                            return;
                        }
                        if (typographyType && styleKey) {
                            expression.setExpression(
                                `theme.styles.typography.${typographyType}.byId("${styleKey}")`
                            );
                        }
                    }
                }
            }
        }
    }
};

const migrateImports = (
    sourceFile: SourceFile,
    migrationDefinition: ThemeFileMigrationDefinition,
    map: StyleIdToTypographyTypeMap,
    context: Context
): void => {
    const instructions = migrationDefinition.migrationInstructions?.imports;

    // Variable declaration
    // example: Heading = styled.div(theme.styles.typography["heading1"])
    if (!!instructions?.declarations?.length) {
        for (const importInstruction of instructions?.declarations) {
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
        }
    }
};

const migrateInterfaces = (source: SourceFile): void => {};

const migrateTypes = (source: SourceFile): void => {};

export type ThemeFileMigrationResult = {
    isSuccessfullyMigrated: boolean;
    skipped: boolean;
    info?: string;
};
export const migrateFile = (
    migrateDefinition: ThemeFileMigrationDefinition,
    typographyMap: StyleIdToTypographyTypeMap,
    project: Project,
    context: Context
): ThemeFileMigrationResult => {
    const source = getSourceFile(project, migrateDefinition.file.path);

    if (!source) {
        return {
            isSuccessfullyMigrated: false,
            skipped: true,
            info: `File does not exist. Path: ${migrateDefinition.file.path}`
        };
    }

    if (migrateDefinition.migrationInstructions?.imports) {
        migrateImports(source, migrateDefinition, typographyMap, context);
    }

    if (migrateDefinition.migrationInstructions?.interfaces) {
        migrateInterfaces(source);
    }

    if (migrateDefinition.migrationInstructions?.types) {
        migrateTypes(source);
    }

    if (migrateDefinition.migrationInstructions?.statements) {
        migrateStatements(source, migrateDefinition, typographyMap, context);
    }

    return {
        skipped: false,
        isSuccessfullyMigrated: true
    };
};

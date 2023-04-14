import { SourceFile, SyntaxKind } from "ts-morph";
import {StyleIdToTypographyTypeMap, ThemeFileMigrationDefinition} from "./migrationTypes";
import { Context } from "../../types";
import { migrateVariableStatement } from "./migrateVariableStatement";

export const migrateStatements = (
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
                migrateVariableStatement(
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
                                `props => props.theme.styles.typography.${elementAccess}.cssById("${styleKey}")`
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

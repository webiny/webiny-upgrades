import {
    PropertyAccessExpression,
    SourceFile,
    SyntaxKind,
    TaggedTemplateExpression,
    TemplateExpression,
    TemplateSpan,
    VariableDeclaration
} from "ts-morph";
import { StyleIdToTypographyTypeMap, ThemeFileMigrationDefinition } from "./migrationTypes";
import { Context } from "../../types";

export const migrateStatements = (
    sourceFile: SourceFile,
    migrationDefinition: ThemeFileMigrationDefinition,
    map: StyleIdToTypographyTypeMap,
    context: Context
): void => {
    const variableStatements = sourceFile.getVariableStatements();

    if (variableStatements.length === 0) {
        context.log.debug(
            "Migration for this file is canceled. There is no variable statements found."
        );
        return;
    }

    // get all variable declarations in the file
    let variables: VariableDeclaration[] = [];
    for (const statement of variableStatements) {
        variables = variables.concat(statement.getDeclarations());
    }

    if (variables.length === 0) {
        context.log.debug(
            "Migration for this file is canceled. There is no variable declarations found."
        );
        return;
    }

    // Variable declaration
    // example: Heading = styled.div(theme.styles.typography["heading1"])
    // template spans
    let taggedTemplateExpressionsCount = 0;
    let migratedExpressionCount = 0;
    for (const variableDeclaration of variables) {
        const taggedTemplateExpressions = variableDeclaration
            .forEachChildAsArray()
            .filter(
                node =>
                    node.getText().includes("typography") &&
                    node.asKind(SyntaxKind.TaggedTemplateExpression)
            ) as TaggedTemplateExpression[];

        taggedTemplateExpressionsCount = taggedTemplateExpressions.length;
        if (taggedTemplateExpressionsCount === 0) {
            continue;
        }

        for (const templateExpression of taggedTemplateExpressions) {
            const template = templateExpression.getTemplate();
            let templateSpans: TemplateSpan[] = [];

            // extract template expression
            if (template.getKind() === SyntaxKind.TemplateExpression) {
                templateSpans = (template as TemplateExpression).getTemplateSpans();
            }

            if (templateSpans.length === 0) {
                context.log.debug(
                    "File migration skipped. There is no template expressions found."
                );
                return;
            }

            for (const templateSpan of templateSpans) {
                // Success to the typography key like, heading1, heading2....
                const paExpression = templateSpan.getExpression() as PropertyAccessExpression;
                const styleKey = paExpression.getName();

                // Typography type like headings, paragraphs...
                const typographyType = map[styleKey];
                if (!typographyType) {
                    context.log
                        .debug(`Style key '${styleKey}' doesn't exist in typography styles. 
                        line: ${paExpression.getStartLineNumber()}.`);
                    continue;
                }

                templateSpan.setExpression(
                    `props => props.theme.styles.typography.${typographyType}.cssById("${styleKey}")`
                );

                migratedExpressionCount++;
            }
        }
    }
    context.log.debug(
        "Expressions for migration found: ",
        taggedTemplateExpressionsCount
    );
    context.log.debug("Expressions migrated: ", migratedExpressionCount);
};

import {
    Identifier,
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
    for (const variableDeclaration of variables) {
        const taggedTemplateExpressions = variableDeclaration
            .forEachChildAsArray()
            .filter(node =>
                node.asKind(SyntaxKind.TaggedTemplateExpression)
            ) as TaggedTemplateExpression[];

        // If no templates expression is found for this variable continue with the next
        if (taggedTemplateExpressions.length === 0) {
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
                context.log.debug("File migration skipped. There is no template spans found.");
                continue;
            }

            for (const templateSpan of templateSpans) {
                // Success to the typography key like, heading1, heading2....
                const paExpression = templateSpan.getExpression();

                if (paExpression.getKind() === SyntaxKind.PropertyAccessExpression) {
                    const lastPropertyAccessKey = (
                        paExpression as PropertyAccessExpression
                    ).getName();

                    if (paExpression.getText().includes("typography")) {
                        updateTypographyExpression(
                            templateSpan,
                            lastPropertyAccessKey,
                            map,
                            context
                        );
                        continue;
                    }

                    if (paExpression.getText().includes("colors")) {
                        updateColorExpression(templateSpan, lastPropertyAccessKey);
                        continue;
                    }

                    if (paExpression.getText().includes("breakpoints")) {
                        updateBreakpointsExpression(templateSpan, lastPropertyAccessKey);
                        continue;
                    }

                    if (paExpression.getText().includes("fonts")) {
                        updateFontsExpression(templateSpan, lastPropertyAccessKey);
                        continue;
                    }
                }

                // cover cases for single access like ${borderRadius} or ${breakpoints} for example
                if (templateSpan.getExpression().getKind() === SyntaxKind.Identifier) {
                    updateStringLiteralExpression(
                        templateSpan,
                        (templateSpan.getExpression() as Identifier).getText()
                    );
                }
            }
        }
    }
};

const updateTypographyExpression = (
    templateSpan: TemplateSpan,
    styleKey: string,
    map: StyleIdToTypographyTypeMap,
    context: Context
): void => {
    // Typography type like headings, paragraphs...
    const typographyType = map[styleKey];
    if (!typographyType) {
        context.log.debug(`Key '${styleKey}' can't be found in typography styles.
         expression is not migrated. Line: ${templateSpan.getStartLineNumber()}`);
    } else {
        templateSpan.setExpression(
            `props => props.theme.styles.typography.${typographyType}.cssById("${styleKey}")`
        );
    }
};

const updateColorExpression = (templateSpan: TemplateSpan, colorName: string) => {
    templateSpan.setExpression(`props => props.theme.styles.colors["${colorName}"]`);
};

const updateBreakpointsExpression = (templateSpan: TemplateSpan, breakPointAccessName: string) => {
    templateSpan.setExpression(`props => props.theme.breakpoints["${breakPointAccessName}"]`);
};

const updateFontsExpression = (templateSpan: TemplateSpan, fontName: string) => {
    templateSpan.setExpression(`props => props.theme.fonts["${fontName}"]`);
};

/*
 * Cover cases for single access like ${borderRadius} or ${breakpoints} for example
 * */
const updateStringLiteralExpression = (templateSpan: TemplateSpan, literalName: string) => {
    templateSpan.setExpression(`props => props.theme.${literalName}`);
};

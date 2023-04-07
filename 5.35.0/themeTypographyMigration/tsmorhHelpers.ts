import { SyntaxKind, VariableStatement } from "ts-morph";
import { Context } from "../../types";
import { StyleIdToTypographyTypeMap } from "./definitions";

/*
 * Update property assigment that as a children have property access expression.
 * For example we want to update property assigment like this example: 'h3: theme.styles.typography.heading3'
 * Escaped name or prop name of the property assigment is 'h3'
 * Property access expression: theme.styles.typography.heading3
 * */
export const updatePropertyAssigment = (
    statement: VariableStatement,
    instructions: Record<string, any>,
    map: StyleIdToTypographyTypeMap,
    context: Context,
    filePath: string
): void => {
    if (!statement) {
        return;
    }

    if (instructions?.child) {
        const { updatePropsNames } = instructions?.child;
        const propertyAssignments = statement.getChildrenOfKind(SyntaxKind.PropertyAssignment);

        for (const assignment of propertyAssignments) {
            // Check if this assigment contains property access expression
            // theme.styles.typography.heading3
            const initializer = assignment.getInitializerIfKind(
                SyntaxKind.PropertyAccessExpression
            );
            if (!initializer) {
                return;
            }

            // Escaped name is the prop name h3 from this example: 'h3: theme.styles.typography.heading3'
            const propName = assignment?.getSymbol()?.getEscapedName();

            // Check if that prop need to be updated
            if (propName && updatePropsNames.includes(propName)) {
                // Initializer will get the last prop from the access chain expression
                const styleKey = initializer.getName();

                /// check if this key is included in the map
                // and get the typography ty[e
                const typographyType = map[styleKey];
                // Typography type like headings, paragraphs...
                if (!typographyType) {
                    context.log
                        .warning(`Expression can't be updated, style key '${styleKey}' doesn't exist. /n 
                            File: ${filePath}, line: ${assignment.getStartLineNumber()}.`);
                    return;
                }

                // to update the full expression we need to get the first childa
                const accessExpressionToUpdate = assignment.getFirstChildByKind(
                    SyntaxKind.PropertyAccessExpression
                );
                if (accessExpressionToUpdate) {
                    accessExpressionToUpdate.setExpression(
                        `theme.styles.typography.${typographyType}.cssById(${styleKey})`
                    );
                }
            }
        }
    }
};

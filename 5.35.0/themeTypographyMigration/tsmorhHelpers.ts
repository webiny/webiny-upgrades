import {Node, PropertyAssignment, SpreadAssignment, SyntaxKind, VariableStatement} from "ts-morph";
import {Context} from "../../types";
import {StyleIdToTypographyTypeMap} from "./definitions";

/*
 * Update all props and assignments in the declared variable object.
   // Example: CSSObject variable
 * For example we want to update property assigment like this example: 'h3: theme.styles.typography.heading3'
 * Escaped name or prop name of the property assigment is 'h3'
 * Property access expression: theme.styles.typography.heading3
 * */
export const migrateVariableStatement = (
    statement: VariableStatement,
    instructions: Record<string, any>,
    map: StyleIdToTypographyTypeMap,
    context: Context,
    filePath: string
): void => {
    if (!statement) {
        return;
    }

    if (instructions?.nodesUpdates) {

        const nodesForUpdate = takeAllNodesForMigration(statement, instructions?.nodesUpdates);

        for (const node of nodesForUpdate) {
            const nodeKind = node.getKind();

            if (nodeKind === SyntaxKind.PropertyAssignment) {
                const propertyAssignment = node as PropertyAssignment;

                // child node is PropertyAccessExpression, that means the access of the properties is
                // property chained access with dot. like. "theme.styles.typography.paragraph1"
                if (
                    propertyAssignment.getInitializer().getKind() ===
                    SyntaxKind.PropertyAccessExpression
                ) {
                    updatePropertyAccessExpression(propertyAssignment, map, context, filePath);
                }
            }

            if (nodeKind === SyntaxKind.SpreadAssignment) {
                const spreadAssignment = node as SpreadAssignment;
                updateSpreadAssignment(spreadAssignment, map, context, filePath);
            }

        }
    }
};

export const takeAllNodesForMigration = (
    varStatement: VariableStatement,
    nodeUpdates: Record<string, any>
): Node[] => {
    return varStatement.forEachChildAsArray().filter(node => isNodeToUpdate(node, nodeUpdates));
};

/*
 * Check id node need to be updated
 */
export const isNodeToUpdate = (node: Node, nodeUpdates: Record<string, any>): boolean => {
    // check the spec for the node

    switch (node.getKind()) {
        case SyntaxKind.SpreadAssignment:
            const spreadNode = node as SpreadAssignment;
            const spreadNodeInstructions = nodeUpdates.filter(
                instruction => instruction.syntaxKind === SyntaxKind.SpreadAssignment
            );

            // Check the instruction if this node is available for migration
            for (const instruction of spreadNodeInstructions) {
                // check the expression type
                if (
                    spreadNode.getExpression().getKind() === instruction.syntaxKind &&
                    spreadNode.getFullText().includes(instruction.matchText)
                ) {
                    return true;
                }
            }
            return false;

        case SyntaxKind.PropertyAssignment:
            const propertyAssignmentNode = node as PropertyAssignment;
            const propertyAssignmentInstructions = nodeUpdates.filter(
                instruction => instruction.syntaxKind === SyntaxKind.PropertyAssignment
            );

            // Check the instruction if this node is available for migration
            for (const instruction of propertyAssignmentInstructions) {
                // check if this is the property name that we want to update
                if (
                    !(
                        propertyAssignmentNode.getSymbol().getEscapedName() ==
                        instruction.symbolEscapedName
                    )
                ) {
                    return false;
                }
                // check initializer type
                if (
                    !(
                        propertyAssignmentNode.getInitializer().getKind() ===
                        instruction.initializerKind
                    )
                ) {
                    return false;
                }
                // check the expression text
                if (!propertyAssignmentNode.getText().includes(instruction.matchText)) {
                    return false;
                }
                return true;
            }

        default:
            return false;
    }
    return false;
};

export const updatePropertyAccessExpression = (
    assigment: PropertyAssignment,
    map: StyleIdToTypographyTypeMap,
    context: Context,
    filePath: string
): void => {
    const initializer = assigment.getInitializerIfKind(SyntaxKind.PropertyAccessExpression);

    if (!initializer) {
        return;
    }

    // Initializer will get the last prop from the access chain expression
    const styleKey = initializer.getName();

    /// check if this key is included in the map
    // and get the typography type
    const typographyType = map[styleKey];
    // Typography type like headings, paragraphs...
    if (!typographyType) {
        context.log.warning(`Expression can't be updated, style key '${styleKey}' doesn't exist. /n 
                            File: ${filePath}, line: ${assigment.getStartLineNumber()}.`);
        return;
    }

    // to update the full expression we need to get the first child
    const accessExpressionToUpdate = assigment.getFirstChildByKind(
        SyntaxKind.PropertyAccessExpression
    );

    if (accessExpressionToUpdate) {
        accessExpressionToUpdate.setExpression(
            `theme.styles.typography.${typographyType}.cssById(${styleKey})`
        );
    }
};

export const updateSpreadAssignment = (assigment: SpreadAssignment, map: StyleIdToTypographyTypeMap, context, filePath): void => {
    if(!assigment) {
        return;
    }

    const identifier = assigment.getFirstChildByKind(SyntaxKind.Identifier);
    const styleKey = identifier.getText();

    /// check if this key is included in the map
    // and get the typography type
    const typographyType = map[styleKey];
    // Typography type like headings, paragraphs...
    if (!typographyType) {
        context.log.warning(`Expression can't be updated, style key '${styleKey}' doesn't exist. /n 
                            File: ${filePath}, line: ${assigment.getStartLineNumber()}.`);
        return;
    }
    assigment.setExpression(`...theme.styles.typography.${typographyType}.cssBy("${styleKey}")`);
};

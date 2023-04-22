import {
    ArrayLiteralExpression,
    NumericLiteral,
    ObjectLiteralExpression,
    PropertyAssignment,
    SpreadAssignment,
    StringLiteral,
    SyntaxKind
} from "ts-morph";

/*
 * Get js object value from object literal
 * */
export const getObjectLiteralExpressionValue = (
    objectLiteralExpression: ObjectLiteralExpression,
    includeAllNodes = false
): Record<string, any> => {
    let objectValue: Record<string, any> = {};

    if (!objectLiteralExpression) {
        return objectValue;
    }

    if (objectLiteralExpression.getKind() !== SyntaxKind.ObjectLiteralExpression) {
        return objectValue;
    }

    const props = objectLiteralExpression.getProperties();

    for (const prop of props) {
        if (prop.getKind() === SyntaxKind.PropertyAssignment) {
            const propAssigment = prop as PropertyAssignment;
            const propInitializer = propAssigment.getInitializer();

            if (propInitializer) {
                const propInitializerKind = propInitializer.getKind();
                const propName = propAssigment.getSymbol().getName();

                if (includeAllNodes && propInitializerKind === SyntaxKind.ObjectLiteralExpression) {
                    objectValue[propName] = getObjectLiteralExpressionValue(
                        propInitializer as ObjectLiteralExpression
                    );
                }

                if (propInitializerKind === SyntaxKind.StringLiteral) {
                    const stringLiteral = propInitializer as StringLiteral;
                    objectValue[propName] = stringLiteral.getText().trim();
                }

                if (propInitializerKind === SyntaxKind.NumericLiteral) {
                    const numericalLiteral = propInitializer as NumericLiteral;
                    objectValue[propName] = numericalLiteral.getLiteralValue();
                }

                if (propInitializerKind === SyntaxKind.ArrayLiteralExpression) {
                    const numericalLiteral = propInitializer as ArrayLiteralExpression;
                    const elements = numericalLiteral.getElements();
                    for (const element of elements) {
                        if (element.getKind() === SyntaxKind.ObjectLiteralExpression) {
                            objectValue[propName] = getObjectLiteralExpressionValue(
                                propInitializer as ObjectLiteralExpression
                            );
                        }
                    }
                }
            }
        }

        if (prop.getKind() === SyntaxKind.SpreadAssignment) {
            const propSpreadAssigment = prop as SpreadAssignment;
            const spreadExpression = propSpreadAssigment.getText();
            objectValue = Object.assign({}, objectValue, spreadExpression);
        }
    }

    return objectValue;
};

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
 * Get js object value from ts-morph object literal expression
 * */
export const toObjectValue = (
    objectLiteralExpression: ObjectLiteralExpression,
    includeAllPropTree = true
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

                if (propInitializerKind === SyntaxKind.ObjectLiteralExpression) {
                    if (includeAllPropTree) {
                        objectValue[propName] = toObjectValue(
                            propInitializer as ObjectLiteralExpression
                        );
                    }
                }

                if (propInitializerKind === SyntaxKind.StringLiteral) {
                    const stringLiteral = propInitializer as StringLiteral;
                    objectValue[propName] = stringLiteral.getText();
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
                            objectValue[propName] = toObjectValue(
                                propInitializer as ObjectLiteralExpression
                            );
                        } else {
                            if (Array.isArray(objectValue[propName])) {
                                objectValue[propName].push(element.getText());
                                continue;
                            }
                            objectValue[propName] = [element.getText()];
                        }
                    }
                }

                if (propInitializerKind === SyntaxKind.TrueKeyword) {
                    objectValue[propName] = true;
                }

                if (propInitializerKind === SyntaxKind.FalseKeyword) {
                    objectValue[propName] = false;
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

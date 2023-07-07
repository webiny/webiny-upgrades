import { ExportAssignment, ObjectLiteralExpression, SourceFile, SyntaxKind } from "ts-morph";
/*
 * Returns the object if it's exported as default object in the file or undefined.
 * example: export default { myProp: someValue }
 * */
export const getDefaultExportedObject = (
    source: SourceFile
): ObjectLiteralExpression | undefined => {
    if (!source) {
        return undefined;
    }

    // find default export
    const exportAssigment = source.getExportAssignment(
        assignment => assignment.getExpression().getKind() === SyntaxKind.ObjectLiteralExpression
    );
    if (!exportAssigment) {
        return undefined;
    }

    const assigment = exportAssigment as ExportAssignment;
    const expression = assigment.getExpression();
    if (expression.getKind() === SyntaxKind.ObjectLiteralExpression) {
        return expression as ObjectLiteralExpression;
    }
    return undefined;
};

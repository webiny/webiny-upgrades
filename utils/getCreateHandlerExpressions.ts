import {
    SourceFile,
    VariableDeclaration,
    CallExpression,
    PropertyAssignment,
    ArrayLiteralExpression,
    Node
} from "ts-morph";

interface ReturnType {
    handlerDeclaration: VariableDeclaration | null;
    createHandlerExpression: CallExpression | null;
    plugins: PropertyAssignment | null;
    arrayExpression: ArrayLiteralExpression | null;
}
export const getCreateHandlerExpressions = (source: SourceFile, handler: string): ReturnType => {
    /**
     * First, we need to find handler declaration to check if it actually is ok.
     */
    const handlerDeclaration = source.getVariableDeclaration(handler);
    if (!handlerDeclaration) {
        console.log(`Missing handler expression "${handler}".`);
        return {
            handlerDeclaration: null,
            createHandlerExpression: null,
            plugins: null,
            arrayExpression: null
        };
    }
    /**
     * Then we need the handler expression "createHandler" to check if it has plugins defined.
     *
     * @type {Node}
     */
    const createHandlerExpression = handlerDeclaration.getFirstDescendant<CallExpression>(
        (node =>
            Node.isCallExpression(node) &&
            node.getExpression().getText() === "createHandler") as any
    );
    if (!createHandlerExpression) {
        console.log(`Missing "createHandler" expression in the handler declaration "${handler}".`);
        return {
            handlerDeclaration,
            createHandlerExpression: null,
            plugins: null,
            arrayExpression: null
        };
    }
    /**
     * And third check step is to determine if we need to upgrade the "createHandler".
     */
    const plugins = createHandlerExpression.getFirstDescendant<PropertyAssignment>(
        (node => Node.isPropertyAssignment(node) && node.getName() === "plugins") as any
    );
    if (!plugins) {
        return {
            handlerDeclaration,
            createHandlerExpression,
            plugins,
            arrayExpression: null
        };
    }
    const arrayExpression = plugins.getFirstDescendant<ArrayLiteralExpression>((node =>
        Node.isArrayLiteralExpression(node)) as any);
    return {
        handlerDeclaration,
        createHandlerExpression,
        plugins,
        arrayExpression
    };
};

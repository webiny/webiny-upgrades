const tsMorph = require("ts-morph");

/**
 *
 * @param source {tsMorph.SourceFile}
 * @param handler {String}
 * @return {{handlerDeclaration: VariableDeclaration, createHandlerExpression: tsMorph.Node, plugins: tsMorph.Node, arrayExpression: tsMorph.ArrayLiteralExpression}}
 */
const getCreateHandlerExpressions = (source, handler) => {
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
    const createHandlerExpression = handlerDeclaration.getFirstDescendant(
        node =>
            tsMorph.Node.isCallExpression(node) &&
            node.getExpression().getText() === "createHandler"
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
    const plugins = createHandlerExpression.getFirstDescendant(
        node => tsMorph.Node.isPropertyAssignment(node) && node.getName() === "plugins"
    );
    if (!plugins) {
        return {
            handlerDeclaration,
            createHandlerExpression,
            plugins,
            arrayExpression: null
        };
    }
    const arrayExpression = plugins.getFirstDescendant(node =>
        tsMorph.Node.isArrayLiteralExpression(node)
    );
    return {
        handlerDeclaration,
        createHandlerExpression,
        plugins,
        arrayExpression
    };
};

module.exports = getCreateHandlerExpressions;

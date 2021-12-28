const tsMorph = require("ts-morph");

const createNamedImports = require("./createNamedImports");
const getCreateHandlerExpressions = require("./getCreateHandlerExpressions");

/**
 *
 * @param source {tsMorph.SourceFile}
 * @param handler {string}
 * @param targetPlugin {RegExp|string}
 */
const removePluginFromCreateHandler = (source, handler, targetPlugin) => {
    const { plugins, arrayExpression } = getCreateHandlerExpressions(source, handler);

    if (!plugins) {
        console.log(`Missing plugins in "createHandler" expression "${handler}".`);
        return;
    }
    if (!arrayExpression) {
        console.log(`Missing array literal expression in handler "${handler}".`);
        return;
    }

    const elements = arrayExpression.getElements();
    const removeIndexes = elements
        .map((element, index) => {
            if (element.getText().match(targetPlugin) === null) {
                return null;
            }
            return index;
        })
        .reverse()
        .filter(index => {
            return index !== null;
        });
    for (const index of removeIndexes) {
        arrayExpression.removeElement(index);
    }
};

module.exports = removePluginFromCreateHandler;

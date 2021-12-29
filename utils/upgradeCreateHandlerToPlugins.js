const tsMorph = require("ts-morph");
const getCreateHandlerExpressions = require("./getCreateHandlerExpressions");
/**
 *
 * @param source {tsMorph.SourceFile}
 * @param handler {string}
 */
module.exports = (source, handler) => {
    const { createHandlerExpression, plugins } = getCreateHandlerExpressions(source, "handler");

    if (plugins) {
        return;
    }

    const args = createHandlerExpression.getArguments().map(a => a.getText());
    if (args.length === 0) {
        console.log(`Missing arguments in handler expression "${handler}".`);
        return;
    }
    /**
     * We need  to remove existing arguments.
     */
    args.forEach(() => createHandlerExpression.removeArgument(0));
    /**
     * And then add the new ones.
     */
    createHandlerExpression.addArgument(
        `{plugins: [${args.join(",")}], http: {debug: process.env.DEBUG === "true"}}`
    );
};

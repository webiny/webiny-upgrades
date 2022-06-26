const tsMorph = require("ts-morph");

/**
 * @param source {tsMorph.SourceFile}
 * @param target {string}
 */
const getRequireFromSourceFile = (source, target, cb) => {
    const requireStatement = source.getVariableStatement(node => {
        return !!node.getFirstDescendant(node => {
            const isCallExp = tsMorph.Node.isCallExpression(node);
            if (isCallExp) {
                return (
                    node.getExpression().getText() === "require" &&
                    node.getArguments()[0].getText() === `"${target}"`
                );
            }

            return false;
        });
    });

    if (!requireStatement) {
        return;
    }

    cb(requireStatement);
};

module.exports = getRequireFromSourceFile;

const { getExistingFiles, getSourceFile, log } = require("../utils");
const tsMorph = require("ts-morph");

const upgradeFiles = {
    babelReact: ".babel.react.js"
};

const requiredMatch = /babel\-plugin\-named\-asset\-import/;

const upgradeBabelReact = async (context, project) => {
    const source = getSourceFile(project, upgradeFiles.babelReact);
    if (!source) {
        return;
    }
    /**
     * We try to find the array which contains required value in code.
     * @type {tsMorph.ArrayLiteralExpression}
     */
    const plugins = source.getFirstDescendant(node => {
        if (tsMorph.Node.isArrayLiteralExpression(node) === false) {
            return false;
        }
        const parent = node.getParent();
        if (tsMorph.Node.isPropertyAssignment(parent) === false) {
            return false;
        }
        return parent.getText().match(requiredMatch) !== null;
    });
    /**
     * If no node was found, just log error and exit.
     */
    if (!plugins) {
        log.info(
            `Look like you've already removed the "babel-plugin-named-asset-import" from your config. Skipping.`
        );
        return;
    }

    const index = plugins.forEachChildAsArray().findIndex(node => {
        return node.getText().match(requiredMatch) !== null;
    });
    if (index < 0) {
        return;
    }
    plugins.removeElement(index);
};

module.exports = {
    getFiles: context => getExistingFiles(context, upgradeFiles),
    upgradeBabelReact
};

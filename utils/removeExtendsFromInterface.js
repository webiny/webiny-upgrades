const tsMorph = require("ts-morph");

/**
 * @param source {tsMorph.SourceFile}
 * @param interfaceName {String}
 * @param target {String}
 */
const removeExtendsFromInterface = (source, interfaceName, target) => {
    if (!source) {
        return;
    }
    const interfaceNode = source.getInterface(interfaceName);
    if (!interfaceNode) {
        return;
    }
    const extendsInterfaces = interfaceNode.getExtends();

    const index = extendsInterfaces.findIndex(e => {
        return e.getText() === target;
    });
    if (index < 0) {
        return;
    }
    interfaceNode.removeExtends(index);
};

module.exports = removeExtendsFromInterface;

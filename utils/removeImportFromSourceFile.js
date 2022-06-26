const tsMorph = require("ts-morph");

/**
 * @param source {tsMorph.SourceFile}
 * @param target {string}
 * @param options
 */
const removeImportFromSourceFile = (source, target, options = {}) => {
    const importDeclaration = source.getImportDeclaration(target);
    if (!importDeclaration) {
        if (!options.quiet) {
            console.log(`No import declaration with target path "${target}".`);
        }
        return;
    }
    importDeclaration.remove();
};

module.exports = removeImportFromSourceFile;

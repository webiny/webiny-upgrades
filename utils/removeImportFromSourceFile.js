/**
 * @param source {tsMorph.SourceFile}
 * @param target {string}
 */
const removeImportFromSourceFile = (source, target) => {
    const importDeclaration = source.getImportDeclaration(target);
    if (!importDeclaration) {
        console.log(`No import declaration with target path "${target}".`);
        return;
    }
    importDeclaration.remove();
};

module.exports = removeImportFromSourceFile;

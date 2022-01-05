const tsMorph = require("ts-morph");
/**
 *
 * @param source {tsMorph.SourceFile}
 * @param target {String}
 * @param after {String}
 */
const addToExportDefaultArray = ({ source, target, after }) => {
    if (!source) {
        return;
    }

    const defaultExport = source.getDefaultExportSymbol();

    //console.log(defaultExport);

    const exports = defaultExport.getExports();
    console.log(exports);
};

module.exports = addToExportDefaultArray;

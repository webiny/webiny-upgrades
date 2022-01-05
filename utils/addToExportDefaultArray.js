const tsMorph = require("ts-morph");
const log = require("./log");
/**
 *
 * @param source {tsMorph.SourceFile}
 * @param target {String}
 */
const addToExportDefaultArray = ({ source, target }) => {
    if (!source) {
        return;
    }

    const assignments = source.getExportAssignments();
    if (assignments.length === 0) {
        log.debug(`Missing export assignments in file "${source.getFilePath()}".`);
        return;
    }

    for (const item of assignments) {
        if (item.isExportEquals() === true) {
            continue;
        }
        const arrayLiteralExpression = item.getFirstDescendant(node =>
            tsMorph.Node.isArrayLiteralExpression(node)
        );
        if (!arrayLiteralExpression) {
            continue;
        }
        const elements = arrayLiteralExpression.getElements();
        const exists = elements.some(el => el.getText() === target);
        if (exists) {
            continue;
        }
        arrayLiteralExpression.addElement(target);
    }
};

module.exports = addToExportDefaultArray;

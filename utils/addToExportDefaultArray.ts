import tsMorph, { ArrayLiteralExpression, SourceFile } from "ts-morph";
import log from "./log";

interface Params {
    source: SourceFile;
    target: string;
}

export const addToExportDefaultArray = ({ source, target }: Params): void => {
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
        const arrayLiteralExpression = item.getFirstDescendant<ArrayLiteralExpression>((node =>
            tsMorph.Node.isArrayLiteralExpression(node)) as any);
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

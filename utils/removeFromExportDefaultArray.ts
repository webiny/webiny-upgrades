import { ArrayLiteralExpression, SourceFile, Node } from "ts-morph";
import log from "./log";

interface Params {
    source: SourceFile;
    target: string;
}

interface Options {
    quiet?: boolean;
}

export const removeFromExportDefaultArray = (
    { source, target }: Params,
    options: Options = {}
): void => {
    if (!source) {
        return;
    }

    const assignments = source.getExportAssignments();
    if (assignments.length === 0) {
        if (!options.quiet) {
            log.debug(`Missing export assignments in file "${source.getFilePath()}".`);
            return;
        }
    }

    for (const item of assignments) {
        // `isExportEquals === true` means it's a named export.
        if (item.isExportEquals() === true) {
            continue;
        }
        const arrayLiteralExpression = item.getFirstDescendant<ArrayLiteralExpression>((node =>
            Node.isArrayLiteralExpression(node)) as any);
        if (!arrayLiteralExpression) {
            continue;
        }
        const elements = arrayLiteralExpression.getElements();
        const index = elements.findIndex(
            el => el.getText() === target || el.getText().startsWith(`${target}(`)
        );

        if (index >= 0) {
            arrayLiteralExpression.removeElement(index);
        }
    }
};

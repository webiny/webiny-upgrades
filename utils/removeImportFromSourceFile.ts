import { SourceFile } from "ts-morph";

interface Options {
    quiet?: boolean;
}
export const removeImportFromSourceFile = (
    source: SourceFile,
    target: string,
    options: Options = {}
): void => {
    const importDeclaration = source.getImportDeclaration(target);
    if (!importDeclaration) {
        if (!options.quiet) {
            console.log(`No import declaration with target path "${target}".`);
        }
        return;
    }
    importDeclaration.remove();
};

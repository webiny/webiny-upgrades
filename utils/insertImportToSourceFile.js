const createNamedImports = require("./createNamedImports");

/**
 * It is possible to send:
 * - string - will produce default import
 * - string[] - will produce named imports
 * - Record<string, string> - will produce named imports with aliases
 *
 * @param source {tsMorph.SourceFile}
 * @param name {string|string[]|Record<string, string>}
 * @param moduleSpecifier {string}
 * @param after {string|null}
 */
const insertImportToSourceFile = ({ source, name, moduleSpecifier, after = null }) => {
    const namedImports = createNamedImports(name);
    const defaultImport = namedImports === undefined ? name : undefined;

    const declaration = source.getImportDeclaration(moduleSpecifier);

    if (declaration) {
        if (defaultImport) {
            declaration.setDefaultImport(defaultImport);
            return;
        }

        /**
         * We check the existing imports, so we don't add the same one.
         */
        const existingNamedImports = declaration.getNamedImports().map(ni => {
            return ni.getText();
        });

        // Create [name, alias] tuples
        const existingImports = existingNamedImports.map(imp => imp.split(" as "));

        const newImports = namedImports.filter(ni => {
            // Make sure not a single existing import matches the new named import.
            return existingImports.every(([name, alias]) => {
                if (ni.alias) {
                    return ni.name !== name && ni.alias !== alias;
                }

                return ni.name !== name;
            });
        });

        declaration.addNamedImports(newImports);
        return;
    }
    /**
     * If we want to add this import after some other import...
     */
    if (after) {
        const afterDeclaration = source.getImportDeclaration(after);
        /**
         * If there is no target import, we will just add it at the end.
         */
        if (afterDeclaration) {
            source.insertImportDeclaration(afterDeclaration.getChildIndex() + 1, {
                defaultImport,
                namedImports,
                moduleSpecifier
            });
            return;
        }
    }

    source.addImportDeclaration({
        defaultImport,
        namedImports,
        moduleSpecifier
    });
};

module.exports = insertImportToSourceFile;

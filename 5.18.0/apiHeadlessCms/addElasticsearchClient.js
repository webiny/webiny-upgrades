const tsMorph = require("ts-morph");
const { createNamedImports } = require("../../utils");

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
         * We check the existing imports so we dont add the same one.
         */
        const existingNamedImports = declaration.getNamedImports().map(ni => {
            return ni.getText();
        });
        declaration.addNamedImports(
            namedImports.filter(ni => {
                return existingNamedImports.includes(ni.name) === false;
            })
        );
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

/**
 * @param source {tsMorph.SourceFile}
 */
const addElasticsearchClient = source => {
    /**
     * If there is elasticsearchClient declaration, no need to proceed further.
     */
    const elasticsearchClient = source.getFirstDescendant(node => {
        return tsMorph.Node.isVariableDeclaration(node) && node.getName() === "elasticsearchClient";
    });
    if (elasticsearchClient) {
        return;
    }

    const createElasticsearchClientImport = source.getImportDeclaration(node => {
        return node.getModuleSpecifierValue() === "@webiny/api-elasticsearch/client";
    });
    if (!createElasticsearchClientImport) {
        insertImportToSourceFile({
            source,
            name: ["createElasticsearchClient"],
            moduleSpecifier: "@webiny/api-elasticsearch/client"
        });
    }

    const importDeclarations = source.getImportDeclarations();
    const lastImportDeclaration = importDeclarations[importDeclarations.length - 1];
    const last = lastImportDeclaration.getEndLineNumber();

    source.insertVariableStatement(last, {
        declarationKind: tsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: "elasticsearchClient",
                initializer:
                    "createElasticsearchClient({endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`})"
            }
        ]
    });
};

module.exports = addElasticsearchClient;

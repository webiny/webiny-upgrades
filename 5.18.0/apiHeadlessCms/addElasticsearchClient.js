const tsMorph = require("ts-morph");
const { createNamedImports, getCreateHandlerExpressions } = require("../../utils");

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
 *
 * @param source {tsMorph.SourceFile}
 * @param handler {string}
 * @param targetPlugin {RegExp|string}
 */
const removePluginFromCreateHandler = (source, handler, targetPlugin) => {
    const { plugins, arrayExpression } = getCreateHandlerExpressions(source, handler);

    if (!plugins) {
        console.log(`Missing plugins in "createHandler" expression "${handler}".`);
        return;
    }
    if (!arrayExpression) {
        console.log(`Missing array literal expression in handler "${handler}".`);
        return;
    }

    const elements = arrayExpression.getElements();
    const removeIndexes = elements
        .map((element, index) => {
            if (element.getText().match(targetPlugin) === null) {
                return null;
            }
            return index;
        })
        .reverse()
        .filter(index => {
            return index !== null;
        });
    for (const index of removeIndexes) {
        arrayExpression.removeElement(index);
    }
};

/**
 * @param params {{source: tsMorph.SourceFile, handler: string, plugin: string, after: string|undefined|null}}
 */
const addPluginToCreateHandler = params => {
    const { source, handler, value, after } = params;
    const { plugins, arrayExpression } = getCreateHandlerExpressions(source, handler);

    if (!plugins) {
        console.log(`Missing plugins in "createHandler" expression "${handler}".`);
        return;
    }
    if (!arrayExpression) {
        console.log(`Missing array literal expression in handler "${handler}".`);
        return;
    }
    /**
     * @type tsMorph.Expression[]
     */
    const elements = arrayExpression.getElements();
    let index = elements.length;
    if (after) {
        const re = after instanceof RegExp ? after : new RegExp(after);
        for (const i in elements) {
            const element = elements[i];
            if (element.getText().match(re) === null) {
                continue;
            }
            index = Number(i) + 1;
            break;
        }
    }
    arrayExpression.insertElement(index, value);
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

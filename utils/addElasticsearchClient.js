const tsMorph = require("ts-morph");

const insertImportToSourceFile = require("./insertImportToSourceFile");

const declarationName = "elasticsearchClient";
/**
 * @param source {tsMorph.SourceFile}
 */
module.exports = source => {
    /**
     * If there is elasticsearch client declaration, no need to proceed further.
     */
    const elasticsearchClient = source.getFirstDescendant(node => {
        return tsMorph.Node.isVariableDeclaration(node) && node.getName() === declarationName;
    });
    if (elasticsearchClient) {
        return;
    }

    insertImportToSourceFile({
        source,
        name: ["createElasticsearchClient"],
        moduleSpecifier: "@webiny/api-elasticsearch/client"
    });

    const importDeclarations = source.getImportDeclarations();
    const lastImportDeclaration = importDeclarations[importDeclarations.length - 1];
    const last = lastImportDeclaration.getEndLineNumber();

    source.insertVariableStatement(last, {
        declarationKind: tsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: declarationName,
                initializer:
                    "createElasticsearchClient({endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`})"
            }
        ]
    });
};

const tsMorph = require("ts-morph");
/**
 * @param source {tsMorph.SourceFile}
 */
module.exports = source => {
    /**
     * If there is document client declaration, no need to proceed further.
     */
    const documentClient = source.getFirstDescendant(node => {
        return tsMorph.Node.isVariableDeclaration(node) && node.getName() === "documentClient";
    });
    if (documentClient) {
        return;
    }

    const importDeclarations = source.getImportDeclarations();
    const lastImportDeclaration = importDeclarations[importDeclarations.length - 1];
    const last = lastImportDeclaration.getEndLineNumber();

    source.insertVariableStatement(last, {
        declarationKind: tsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: "documentClient",
                initializer:
                    "new DocumentClient({convertEmptyValues: true,region: process.env.AWS_REGION})"
            }
        ]
    });
};

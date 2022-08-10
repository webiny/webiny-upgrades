import { SourceFile, Node, VariableDeclarationKind } from "ts-morph";

const declarationName = "documentClient";

export const addDynamoDbDocumentClient = (source: SourceFile): void => {
    /**
     * If there is document client declaration, no need to proceed further.
     */
    const documentClient = source.getFirstDescendant(node => {
        return Node.isVariableDeclaration(node) && node.getName() === declarationName;
    });
    if (documentClient) {
        return;
    }

    const importDeclarations = source.getImportDeclarations();
    const lastImportDeclaration = importDeclarations[importDeclarations.length - 1];
    const last = lastImportDeclaration.getEndLineNumber();

    source.insertVariableStatement(last, {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: declarationName,
                initializer:
                    "new DocumentClient({convertEmptyValues: true,region: process.env.AWS_REGION})"
            }
        ]
    });
};

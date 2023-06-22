import { Node, ObjectLiteralExpression, Project, SyntaxKind } from "ts-morph";
import {
    addPluginToCreateHandler,
    Files,
    insertImportToSourceFile,
    removeImportFromSourceFile
} from "../utils";
import { Context } from "../types";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateApiSecurityPlugins = async (params: Params) => {
    const { project, files, context } = params;

    const securityFile = files.byName("api/graphql/security");
    const source = project.getSourceFile(securityFile.path);

    context.log.info(`Adding new Security plugins in the API app plugins (%s)`, securityFile.path);

    removeImportFromSourceFile(source, "@webiny/api-security/plugins/groupAuthorization");
    removeImportFromSourceFile(
        source,
        "@webiny/api-security/plugins/parentTenantGroupAuthorization"
    );

    insertImportToSourceFile({
        source,
        name: "tenantLinkAuthorization",
        moduleSpecifier: "@webiny/api-security/plugins/tenantLinkAuthorization",
        after: "@webiny/api-security/plugins/apiKeyAuthorization"
    });

    const descendantIdentifiers = source.getDescendantsOfKind(SyntaxKind.Identifier);
    for (let i = 0; i < descendantIdentifiers.length; i++) {
        const descendantIdentifier = descendantIdentifiers[i];
        if (descendantIdentifier.getText() === "groupAuthorization") {
            descendantIdentifier.replaceWithText("tenantLinkAuthorization");
        }
        if (descendantIdentifier.getText() === "parentTenantGroupAuthorization") {
            descendantIdentifier.replaceWithText("tenantLinkAuthorization");
            descendantIdentifier.getParent().getFirstDescendant(node => {
                if (node.getKind() === SyntaxKind.ObjectLiteralExpression) {
                    const objectLiteralExpression = node as ObjectLiteralExpression;
                    objectLiteralExpression.addPropertyAssignment({
                        name: "parent",
                        initializer: "true"
                    });
                }
                return false;
            });
        }
    }

    context.log.info("New Security plugins added.");
};
